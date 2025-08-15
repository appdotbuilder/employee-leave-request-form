import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { getEmployeeLeaveRequests } from '../handlers/get_employee_leave_requests';

// Test data for creating leave requests
const testLeaveRequest1 = {
  id_share: 'SHARE001',
  employee_name: 'John Doe',
  department_grade: 'G10' as const,
  status: 'Pending' as const,
  leave_date: '2024-01-15',
  location: 'Mambal' as const,
  reason: 'Medical appointment',
  time_out: '09:00',
  time_back: '17:00'
};

const testLeaveRequest2 = {
  id_share: 'SHARE002',
  employee_name: 'Jane Smith',
  department_grade: 'G11' as const,
  status: 'Approved' as const,
  leave_date: '2024-01-16',
  location: 'Sembung G' as const,
  reason: 'Personal business',
  time_out: '10:30',
  time_back: '15:00'
};

const testLeaveRequest3 = {
  id_share: 'SHARE003',
  employee_name: 'Bob Johnson',
  department_grade: 'G9' as const,
  status: 'Rejected' as const,
  leave_date: '2024-01-14',
  location: 'Mambal' as const,
  reason: 'Family emergency',
  time_out: '08:00',
  time_back: '16:00'
};

describe('getEmployeeLeaveRequests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no leave requests exist', async () => {
    const result = await getEmployeeLeaveRequests();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all leave requests when they exist', async () => {
    // Insert test data
    await db.insert(employeeLeaveRequestsTable)
      .values([testLeaveRequest1, testLeaveRequest2, testLeaveRequest3])
      .execute();

    const result = await getEmployeeLeaveRequests();

    expect(result).toHaveLength(3);

    // Verify all requests are returned
    const employeeNames = result.map(r => r.employee_name);
    expect(employeeNames).toContain('John Doe');
    expect(employeeNames).toContain('Jane Smith');
    expect(employeeNames).toContain('Bob Johnson');
  });

  it('should return leave requests with correct data types and fields', async () => {
    await db.insert(employeeLeaveRequestsTable)
      .values(testLeaveRequest1)
      .execute();

    const result = await getEmployeeLeaveRequests();

    expect(result).toHaveLength(1);
    const request = result[0];

    // Verify all required fields are present
    expect(request.id).toBeDefined();
    expect(typeof request.id).toBe('number');
    expect(request.id_share).toBe('SHARE001');
    expect(request.employee_name).toBe('John Doe');
    expect(request.department_grade).toBe('G10');
    expect(request.status).toBe('Pending');
    expect(request.location).toBe('Mambal');
    expect(request.reason).toBe('Medical appointment');
    expect(request.time_out).toBe('09:00');
    expect(request.time_back).toBe('17:00');

    // Verify date fields are properly converted to Date objects
    expect(request.leave_date).toBeInstanceOf(Date);
    expect(request.created_at).toBeInstanceOf(Date);
    expect(request.updated_at).toBeInstanceOf(Date);
  });

  it('should return requests ordered by creation date (newest first)', async () => {
    // Insert requests with slight delay to ensure different timestamps
    await db.insert(employeeLeaveRequestsTable)
      .values(testLeaveRequest1)
      .execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(employeeLeaveRequestsTable)
      .values(testLeaveRequest2)
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(employeeLeaveRequestsTable)
      .values(testLeaveRequest3)
      .execute();

    const result = await getEmployeeLeaveRequests();

    expect(result).toHaveLength(3);

    // Verify ordering - newest first
    expect(result[0].employee_name).toBe('Bob Johnson'); // Last inserted
    expect(result[1].employee_name).toBe('Jane Smith');  // Second inserted
    expect(result[2].employee_name).toBe('John Doe');    // First inserted

    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should handle different status values correctly', async () => {
    await db.insert(employeeLeaveRequestsTable)
      .values([testLeaveRequest1, testLeaveRequest2, testLeaveRequest3])
      .execute();

    const result = await getEmployeeLeaveRequests();

    const statuses = result.map(r => r.status);
    expect(statuses).toContain('Pending');
    expect(statuses).toContain('Approved');
    expect(statuses).toContain('Rejected');
  });

  it('should handle different department grades correctly', async () => {
    await db.insert(employeeLeaveRequestsTable)
      .values([testLeaveRequest1, testLeaveRequest2, testLeaveRequest3])
      .execute();

    const result = await getEmployeeLeaveRequests();

    const grades = result.map(r => r.department_grade);
    expect(grades).toContain('G9');
    expect(grades).toContain('G10');
    expect(grades).toContain('G11');
  });

  it('should handle different locations correctly', async () => {
    await db.insert(employeeLeaveRequestsTable)
      .values([testLeaveRequest1, testLeaveRequest2, testLeaveRequest3])
      .execute();

    const result = await getEmployeeLeaveRequests();

    const locations = result.map(r => r.location);
    expect(locations).toContain('Mambal');
    expect(locations).toContain('Sembung G');
  });

  it('should preserve time format correctly', async () => {
    await db.insert(employeeLeaveRequestsTable)
      .values(testLeaveRequest2) // Uses '10:30' and '15:00'
      .execute();

    const result = await getEmployeeLeaveRequests();

    expect(result).toHaveLength(1);
    expect(result[0].time_out).toBe('10:30');
    expect(result[0].time_back).toBe('15:00');
  });
});