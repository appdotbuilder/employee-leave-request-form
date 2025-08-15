import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { type EmployeeLeaveRequest } from '../schema';
import { desc } from 'drizzle-orm';

export const getEmployeeLeaveRequests = async (): Promise<EmployeeLeaveRequest[]> => {
  try {
    // Fetch all employee leave requests, ordered by creation date (newest first)
    const results = await db.select()
      .from(employeeLeaveRequestsTable)
      .orderBy(desc(employeeLeaveRequestsTable.created_at))
      .execute();

    // Return the results with proper date coercion
    return results.map(request => ({
      ...request,
      leave_date: new Date(request.leave_date),
      created_at: new Date(request.created_at),
      updated_at: new Date(request.updated_at)
    }));
  } catch (error) {
    console.error('Failed to fetch employee leave requests:', error);
    throw error;
  }
};