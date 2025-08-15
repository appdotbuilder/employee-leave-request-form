import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { type CreateEmployeeLeaveRequestInput, type GetEmployeeLeaveRequestInput } from '../schema';
import { deleteEmployeeLeaveRequest } from '../handlers/delete_employee_leave_request';
import { eq } from 'drizzle-orm';

// Test input for creating a leave request to delete
const testCreateInput: CreateEmployeeLeaveRequestInput = {
  employee_name: 'John Doe',
  department_grade: 'G9',
  status: 'Pending',
  leave_date: new Date('2024-12-15'),
  location: 'Mambal',
  reason: 'Medical appointment',
  time_out: '09:00',
  time_back: '17:00'
};

describe('deleteEmployeeLeaveRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully delete an existing leave request', async () => {
    // First, create a leave request to delete
    const createResult = await db.insert(employeeLeaveRequestsTable)
      .values({
        id_share: 'TEST001',
        employee_name: testCreateInput.employee_name,
        department_grade: testCreateInput.department_grade,
        status: testCreateInput.status,
        leave_date: testCreateInput.leave_date.toISOString().split('T')[0],
        location: testCreateInput.location,
        reason: testCreateInput.reason,
        time_out: testCreateInput.time_out,
        time_back: testCreateInput.time_back
      })
      .returning()
      .execute();

    const createdRequest = createResult[0];
    const deleteInput: GetEmployeeLeaveRequestInput = {
      id: createdRequest.id
    };

    // Delete the leave request
    const result = await deleteEmployeeLeaveRequest(deleteInput);

    // Verify the response
    expect(result.success).toBe(true);
    expect(result.message).toEqual(`Leave request with ID ${createdRequest.id} has been deleted successfully.`);

    // Verify the request was actually deleted from the database
    const deletedRequest = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, createdRequest.id))
      .execute();

    expect(deletedRequest).toHaveLength(0);
  });

  it('should return failure when trying to delete non-existent leave request', async () => {
    const nonExistentId = 99999;
    const deleteInput: GetEmployeeLeaveRequestInput = {
      id: nonExistentId
    };

    const result = await deleteEmployeeLeaveRequest(deleteInput);

    // Verify the response indicates failure
    expect(result.success).toBe(false);
    expect(result.message).toEqual(`Leave request with ID ${nonExistentId} not found.`);
  });

  it('should not affect other leave requests when deleting one', async () => {
    // Create multiple leave requests
    const createResults = await db.insert(employeeLeaveRequestsTable)
      .values([
        {
          id_share: 'TEST001',
          employee_name: 'John Doe',
          department_grade: 'G9',
          status: 'Pending',
          leave_date: '2024-12-15',
          location: 'Mambal',
          reason: 'Medical appointment',
          time_out: '09:00',
          time_back: '17:00'
        },
        {
          id_share: 'TEST002',
          employee_name: 'Jane Smith',
          department_grade: 'G10',
          status: 'Approved',
          leave_date: '2024-12-16',
          location: 'Sembung G',
          reason: 'Personal leave',
          time_out: '10:00',
          time_back: '16:00'
        }
      ])
      .returning()
      .execute();

    const firstRequestId = createResults[0].id;
    const secondRequestId = createResults[1].id;

    // Delete only the first request
    const deleteInput: GetEmployeeLeaveRequestInput = {
      id: firstRequestId
    };

    const result = await deleteEmployeeLeaveRequest(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify only the first request was deleted
    const remainingRequests = await db.select()
      .from(employeeLeaveRequestsTable)
      .execute();

    expect(remainingRequests).toHaveLength(1);
    expect(remainingRequests[0].id).toBe(secondRequestId);
    expect(remainingRequests[0].employee_name).toEqual('Jane Smith');

    // Double-check the deleted request is gone
    const deletedRequest = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, firstRequestId))
      .execute();

    expect(deletedRequest).toHaveLength(0);
  });

  it('should handle deletion of requests with different statuses', async () => {
    // Create requests with different statuses
    const createResults = await db.insert(employeeLeaveRequestsTable)
      .values([
        {
          id_share: 'TEST_PENDING',
          employee_name: 'Pending User',
          department_grade: 'G8',
          status: 'Pending',
          leave_date: '2024-12-15',
          location: 'Mambal',
          reason: 'Medical appointment',
          time_out: '09:00',
          time_back: '17:00'
        },
        {
          id_share: 'TEST_APPROVED',
          employee_name: 'Approved User',
          department_grade: 'G9',
          status: 'Approved',
          leave_date: '2024-12-16',
          location: 'Sembung G',
          reason: 'Personal leave',
          time_out: '10:00',
          time_back: '16:00'
        },
        {
          id_share: 'TEST_REJECTED',
          employee_name: 'Rejected User',
          department_grade: 'G11',
          status: 'Rejected',
          leave_date: '2024-12-17',
          location: 'Mambal',
          reason: 'Vacation',
          time_out: '08:00',
          time_back: '18:00'
        }
      ])
      .returning()
      .execute();

    // Delete each request regardless of status
    for (const request of createResults) {
      const deleteInput: GetEmployeeLeaveRequestInput = {
        id: request.id
      };

      const result = await deleteEmployeeLeaveRequest(deleteInput);
      expect(result.success).toBe(true);
      expect(result.message).toEqual(`Leave request with ID ${request.id} has been deleted successfully.`);

      // Verify deletion
      const deletedRequest = await db.select()
        .from(employeeLeaveRequestsTable)
        .where(eq(employeeLeaveRequestsTable.id, request.id))
        .execute();

      expect(deletedRequest).toHaveLength(0);
    }

    // Verify all requests are deleted
    const allRequests = await db.select()
      .from(employeeLeaveRequestsTable)
      .execute();

    expect(allRequests).toHaveLength(0);
  });
});