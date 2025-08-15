import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { type GetEmployeeLeaveRequestInput, type EmployeeLeaveRequest } from '../schema';
import { eq } from 'drizzle-orm';

export const getEmployeeLeaveRequest = async (input: GetEmployeeLeaveRequestInput): Promise<EmployeeLeaveRequest | null> => {
  try {
    // Query the database for the leave request by ID
    const results = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, input.id))
      .execute();

    // Return the first result if found, otherwise null
    if (results.length === 0) {
      return null;
    }

    const leaveRequest = results[0];
    
    // Convert date field from string to Date object to match schema expectations
    return {
      ...leaveRequest,
      leave_date: new Date(leaveRequest.leave_date)
    };
  } catch (error) {
    console.error('Failed to get employee leave request:', error);
    throw error;
  }
};