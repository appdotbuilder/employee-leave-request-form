import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { type CreateEmployeeLeaveRequestInput } from '../schema';
import { createEmployeeLeaveRequest } from '../handlers/create_employee_leave_request';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateEmployeeLeaveRequestInput = {
  employee_name: 'John Doe',
  department_grade: 'G10',
  status: 'Pending',
  leave_date: new Date('2024-01-15'),
  location: 'Mambal',
  reason: 'Medical appointment',
  time_out: '09:00',
  time_back: '17:00'
};

describe('createEmployeeLeaveRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an employee leave request with all fields', async () => {
    const result = await createEmployeeLeaveRequest(testInput);

    // Basic field validation
    expect(result.employee_name).toEqual('John Doe');
    expect(result.department_grade).toEqual('G10');
    expect(result.status).toEqual('Pending');
    expect(result.leave_date).toEqual(new Date('2024-01-15'));
    expect(result.location).toEqual('Mambal');
    expect(result.reason).toEqual('Medical appointment');
    expect(result.time_out).toEqual('09:00');
    expect(result.time_back).toEqual('17:00');
    expect(result.id).toBeDefined();
    expect(result.id_share).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should generate a unique ID share with correct format', async () => {
    const result = await createEmployeeLeaveRequest(testInput);

    // Verify ID share format: ELR-YYYYMMDD-HHMMSS-RANDOM
    expect(result.id_share).toMatch(/^ELR-\d{8}-\d{6}-[A-Z0-9]{6}$/);
    expect(result.id_share).toContain('ELR-');
  });

  it('should default status to Pending when not provided', async () => {
    const { status, ...inputWithoutStatus } = testInput;

    const result = await createEmployeeLeaveRequest(inputWithoutStatus);

    expect(result.status).toEqual('Pending');
  });

  it('should save employee leave request to database', async () => {
    const result = await createEmployeeLeaveRequest(testInput);

    // Query using proper drizzle syntax
    const leaveRequests = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, result.id))
      .execute();

    expect(leaveRequests).toHaveLength(1);
    const savedRequest = leaveRequests[0];
    
    expect(savedRequest.employee_name).toEqual('John Doe');
    expect(savedRequest.department_grade).toEqual('G10');
    expect(savedRequest.status).toEqual('Pending');
    expect(savedRequest.leave_date).toEqual('2024-01-15'); // Date stored as string in DB
    expect(savedRequest.location).toEqual('Mambal');
    expect(savedRequest.reason).toEqual('Medical appointment');
    expect(savedRequest.time_out).toEqual('09:00');
    expect(savedRequest.time_back).toEqual('17:00');
    expect(savedRequest.id_share).toEqual(result.id_share);
    expect(savedRequest.created_at).toBeInstanceOf(Date);
    expect(savedRequest.updated_at).toBeInstanceOf(Date);
  });

  it('should handle different department grades correctly', async () => {
    const testCases = ['G8', 'G9', 'G10', 'G11'] as const;

    for (const grade of testCases) {
      const input = {
        ...testInput,
        employee_name: `Employee ${grade}`,
        department_grade: grade
      };

      const result = await createEmployeeLeaveRequest(input);

      expect(result.department_grade).toEqual(grade);
      expect(result.employee_name).toEqual(`Employee ${grade}`);
    }
  });

  it('should handle different locations correctly', async () => {
    const testCases = ['Mambal', 'Sembung G'] as const;

    for (const location of testCases) {
      const input = {
        ...testInput,
        employee_name: `Employee at ${location}`,
        location: location
      };

      const result = await createEmployeeLeaveRequest(input);

      expect(result.location).toEqual(location);
      expect(result.employee_name).toEqual(`Employee at ${location}`);
    }
  });

  it('should handle different status values correctly', async () => {
    const testCases = ['Pending', 'Approved', 'Rejected'] as const;

    for (const status of testCases) {
      const input = {
        ...testInput,
        employee_name: `Employee ${status}`,
        status: status
      };

      const result = await createEmployeeLeaveRequest(input);

      expect(result.status).toEqual(status);
      expect(result.employee_name).toEqual(`Employee ${status}`);
    }
  });

  it('should create multiple unique leave requests', async () => {
    const request1 = await createEmployeeLeaveRequest({
      ...testInput,
      employee_name: 'Employee One'
    });

    // Small delay to ensure different timestamps in ID share
    await new Promise(resolve => setTimeout(resolve, 10));

    const request2 = await createEmployeeLeaveRequest({
      ...testInput,
      employee_name: 'Employee Two'
    });

    // Verify both requests were created with unique IDs and ID shares
    expect(request1.id).not.toEqual(request2.id);
    expect(request1.id_share).not.toEqual(request2.id_share);
    expect(request1.employee_name).toEqual('Employee One');
    expect(request2.employee_name).toEqual('Employee Two');

    // Verify both are in database
    const allRequests = await db.select().from(employeeLeaveRequestsTable).execute();
    expect(allRequests).toHaveLength(2);
  });

  it('should handle time formats correctly', async () => {
    const timeTestInput = {
      ...testInput,
      time_out: '08:30',
      time_back: '16:45'
    };

    const result = await createEmployeeLeaveRequest(timeTestInput);

    expect(result.time_out).toEqual('08:30');
    expect(result.time_back).toEqual('16:45');

    // Verify in database
    const savedRequest = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, result.id))
      .execute();

    expect(savedRequest[0].time_out).toEqual('08:30');
    expect(savedRequest[0].time_back).toEqual('16:45');
  });
});