import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { type CreateEmployeeLeaveRequestInput, type UpdateEmployeeLeaveRequestInput } from '../schema';
import { updateEmployeeLeaveRequest } from '../handlers/update_employee_leave_request';
import { eq } from 'drizzle-orm';

// Test data for creating initial records
const testCreateInput: CreateEmployeeLeaveRequestInput = {
  employee_name: 'John Doe',
  department_grade: 'G9',
  status: 'Pending',
  leave_date: new Date('2024-01-15'),
  location: 'Mambal',
  reason: 'Medical appointment',
  time_out: '09:30',
  time_back: '15:00'
};

describe('updateEmployeeLeaveRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of an employee leave request', async () => {
    // Create initial record
    const createResult = await db.insert(employeeLeaveRequestsTable)
      .values({
        id_share: `ELR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    const createdRecord = createResult[0];
    const originalUpdatedAt = createdRecord.updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateEmployeeLeaveRequestInput = {
      id: createdRecord.id,
      employee_name: 'Jane Smith',
      department_grade: 'G11',
      status: 'Approved',
      leave_date: new Date('2024-02-20'),
      location: 'Sembung G',
      reason: 'Personal leave',
      time_out: '10:00',
      time_back: '16:30'
    };

    const result = await updateEmployeeLeaveRequest(updateInput);

    // Verify all fields were updated
    expect(result.id).toEqual(createdRecord.id);
    expect(result.id_share).toEqual(createdRecord.id_share); // Should remain unchanged
    expect(result.employee_name).toEqual('Jane Smith');
    expect(result.department_grade).toEqual('G11');
    expect(result.status).toEqual('Approved');
    expect(result.leave_date).toEqual(new Date('2024-02-20'));
    expect(result.location).toEqual('Sembung G');
    expect(result.reason).toEqual('Personal leave');
    expect(result.time_out).toEqual('10:00');
    expect(result.time_back).toEqual('16:30');
    expect(result.created_at).toEqual(createdRecord.created_at); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should update only specified fields', async () => {
    // Create initial record
    const createResult = await db.insert(employeeLeaveRequestsTable)
      .values({
        id_share: `ELR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    const createdRecord = createResult[0];

    // Update only status and reason
    const updateInput: UpdateEmployeeLeaveRequestInput = {
      id: createdRecord.id,
      status: 'Rejected',
      reason: 'Insufficient staffing'
    };

    const result = await updateEmployeeLeaveRequest(updateInput);

    // Verify only specified fields were updated
    expect(result.employee_name).toEqual(testCreateInput.employee_name); // Unchanged
    expect(result.department_grade).toEqual(testCreateInput.department_grade); // Unchanged
    expect(result.status).toEqual('Rejected'); // Updated
    expect(result.leave_date).toEqual(testCreateInput.leave_date); // Unchanged
    expect(result.location).toEqual(testCreateInput.location); // Unchanged
    expect(result.reason).toEqual('Insufficient staffing'); // Updated
    expect(result.time_out).toEqual(testCreateInput.time_out); // Unchanged
    expect(result.time_back).toEqual(testCreateInput.time_back); // Unchanged
  });

  it('should update record in database', async () => {
    // Create initial record
    const createResult = await db.insert(employeeLeaveRequestsTable)
      .values({
        id_share: `ELR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    const createdRecord = createResult[0];

    const updateInput: UpdateEmployeeLeaveRequestInput = {
      id: createdRecord.id,
      employee_name: 'Updated Name',
      status: 'Approved'
    };

    await updateEmployeeLeaveRequest(updateInput);

    // Verify changes were persisted to database
    const updatedRecords = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, createdRecord.id))
      .execute();

    expect(updatedRecords).toHaveLength(1);
    expect(updatedRecords[0].employee_name).toEqual('Updated Name');
    expect(updatedRecords[0].status).toEqual('Approved');
    expect(updatedRecords[0].department_grade).toEqual(testCreateInput.department_grade); // Unchanged
  });

  it('should throw error when record does not exist', async () => {
    const updateInput: UpdateEmployeeLeaveRequestInput = {
      id: 99999, // Non-existent ID
      employee_name: 'Test Name'
    };

    await expect(updateEmployeeLeaveRequest(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle date updates correctly', async () => {
    // Create initial record
    const createResult = await db.insert(employeeLeaveRequestsTable)
      .values({
        id_share: `ELR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    const createdRecord = createResult[0];

    const newDate = new Date('2024-12-25');
    const updateInput: UpdateEmployeeLeaveRequestInput = {
      id: createdRecord.id,
      leave_date: newDate
    };

    const result = await updateEmployeeLeaveRequest(updateInput);

    expect(result.leave_date).toEqual(newDate);
    
    // Verify in database - database stores as string
    const dbRecord = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, createdRecord.id))
      .execute();

    expect(new Date(dbRecord[0].leave_date)).toEqual(newDate);
  });

  it('should handle time format updates correctly', async () => {
    // Create initial record
    const createResult = await db.insert(employeeLeaveRequestsTable)
      .values({
        id_share: `ELR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    const createdRecord = createResult[0];

    const updateInput: UpdateEmployeeLeaveRequestInput = {
      id: createdRecord.id,
      time_out: '08:15',
      time_back: '18:45'
    };

    const result = await updateEmployeeLeaveRequest(updateInput);

    expect(result.time_out).toEqual('08:15');
    expect(result.time_back).toEqual('18:45');
    
    // Verify in database
    const dbRecord = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, createdRecord.id))
      .execute();

    expect(dbRecord[0].time_out).toEqual('08:15');
    expect(dbRecord[0].time_back).toEqual('18:45');
  });
});