import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { type GetEmployeeLeaveRequestInput } from '../schema';
import { getEmployeeLeaveRequest } from '../handlers/get_employee_leave_request';

// Test input for getting a leave request
const testGetInput: GetEmployeeLeaveRequestInput = {
  id: 1
};

// Test data for creating a leave request
const testLeaveRequestData = {
  id_share: 'SHARE123',
  employee_name: 'John Doe',
  department_grade: 'G9' as const,
  status: 'Pending' as const,
  leave_date: '2024-01-15',
  location: 'Mambal' as const,
  reason: 'Medical appointment',
  time_out: '09:00',
  time_back: '11:00'
};

describe('getEmployeeLeaveRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a leave request when ID exists', async () => {
    // First, create a leave request to retrieve
    const insertResult = await db.insert(employeeLeaveRequestsTable)
      .values(testLeaveRequestData)
      .returning()
      .execute();

    const createdRequest = insertResult[0];

    // Now get the leave request
    const result = await getEmployeeLeaveRequest({ id: createdRequest.id });

    // Validate the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdRequest.id);
    expect(result!.id_share).toEqual('SHARE123');
    expect(result!.employee_name).toEqual('John Doe');
    expect(result!.department_grade).toEqual('G9');
    expect(result!.status).toEqual('Pending');
    expect(result!.leave_date).toBeInstanceOf(Date);
    // Verify the actual date value
    const resultDateString = result!.leave_date.toISOString().split('T')[0];
    expect(resultDateString).toEqual('2024-01-15');
    expect(result!.location).toEqual('Mambal');
    expect(result!.reason).toEqual('Medical appointment');
    expect(result!.time_out).toEqual('09:00');
    expect(result!.time_back).toEqual('11:00');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when ID does not exist', async () => {
    // Try to get a non-existent leave request
    const result = await getEmployeeLeaveRequest({ id: 999 });

    // Should return null
    expect(result).toBeNull();
  });

  it('should handle different department grades correctly', async () => {
    // Create leave requests with different grades
    const gradeTestData = [
      { ...testLeaveRequestData, department_grade: 'G8' as const, employee_name: 'Employee G8' },
      { ...testLeaveRequestData, department_grade: 'G10' as const, employee_name: 'Employee G10' },
      { ...testLeaveRequestData, department_grade: 'G11' as const, employee_name: 'Employee G11' }
    ];

    // Insert all test data
    const insertResults = await db.insert(employeeLeaveRequestsTable)
      .values(gradeTestData)
      .returning()
      .execute();

    // Test each one
    for (let i = 0; i < insertResults.length; i++) {
      const createdRequest = insertResults[i];
      const result = await getEmployeeLeaveRequest({ id: createdRequest.id });

      expect(result).not.toBeNull();
      expect(result!.department_grade).toEqual(gradeTestData[i].department_grade);
      expect(result!.employee_name).toEqual(gradeTestData[i].employee_name);
    }
  });

  it('should handle different status values correctly', async () => {
    // Create leave requests with different statuses
    const statusTestData = [
      { ...testLeaveRequestData, status: 'Approved' as const, employee_name: 'Approved Employee' },
      { ...testLeaveRequestData, status: 'Rejected' as const, employee_name: 'Rejected Employee' }
    ];

    // Insert test data
    const insertResults = await db.insert(employeeLeaveRequestsTable)
      .values(statusTestData)
      .returning()
      .execute();

    // Test each status
    for (let i = 0; i < insertResults.length; i++) {
      const createdRequest = insertResults[i];
      const result = await getEmployeeLeaveRequest({ id: createdRequest.id });

      expect(result).not.toBeNull();
      expect(result!.status).toEqual(statusTestData[i].status);
      expect(result!.employee_name).toEqual(statusTestData[i].employee_name);
    }
  });

  it('should handle different locations correctly', async () => {
    // Create leave request with different location
    const locationTestData = {
      ...testLeaveRequestData,
      location: 'Sembung G' as const,
      employee_name: 'Sembung Employee'
    };

    const insertResult = await db.insert(employeeLeaveRequestsTable)
      .values(locationTestData)
      .returning()
      .execute();

    const createdRequest = insertResult[0];
    const result = await getEmployeeLeaveRequest({ id: createdRequest.id });

    expect(result).not.toBeNull();
    expect(result!.location).toEqual('Sembung G');
    expect(result!.employee_name).toEqual('Sembung Employee');
  });

  it('should return correct date and time formats', async () => {
    // Create a leave request with specific date and times
    const dateTimeTestData = {
      ...testLeaveRequestData,
      leave_date: '2024-12-25',
      time_out: '14:30',
      time_back: '16:45'
    };

    const insertResult = await db.insert(employeeLeaveRequestsTable)
      .values(dateTimeTestData)
      .returning()
      .execute();

    const createdRequest = insertResult[0];
    const result = await getEmployeeLeaveRequest({ id: createdRequest.id });

    expect(result).not.toBeNull();
    expect(result!.leave_date).toBeInstanceOf(Date);
    expect(result!.time_out).toEqual('14:30');
    expect(result!.time_back).toEqual('16:45');
    
    // Verify date value - compare date strings to avoid timezone issues
    const resultDateString = result!.leave_date.toISOString().split('T')[0];
    expect(resultDateString).toEqual('2024-12-25');
  });
});