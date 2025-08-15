import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { type UpdateEmployeeLeaveRequestInput, type EmployeeLeaveRequest } from '../schema';
import { eq } from 'drizzle-orm';

export const updateEmployeeLeaveRequest = async (input: UpdateEmployeeLeaveRequestInput): Promise<EmployeeLeaveRequest> => {
  try {
    // Check if the record exists
    const existingRecord = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, input.id))
      .execute();

    if (existingRecord.length === 0) {
      throw new Error(`Employee leave request with ID ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof employeeLeaveRequestsTable.$inferInsert> = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.employee_name !== undefined) {
      updateData.employee_name = input.employee_name;
    }
    if (input.department_grade !== undefined) {
      updateData.department_grade = input.department_grade;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.leave_date !== undefined) {
      updateData.leave_date = input.leave_date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    }
    if (input.location !== undefined) {
      updateData.location = input.location;
    }
    if (input.reason !== undefined) {
      updateData.reason = input.reason;
    }
    if (input.time_out !== undefined) {
      updateData.time_out = input.time_out;
    }
    if (input.time_back !== undefined) {
      updateData.time_back = input.time_back;
    }

    // Update the record
    const result = await db.update(employeeLeaveRequestsTable)
      .set(updateData)
      .where(eq(employeeLeaveRequestsTable.id, input.id))
      .returning()
      .execute();

    // Convert date strings back to Date objects to match schema
    const updatedRecord = result[0];
    return {
      ...updatedRecord,
      leave_date: new Date(updatedRecord.leave_date),
      created_at: updatedRecord.created_at,
      updated_at: updatedRecord.updated_at
    };
  } catch (error) {
    console.error('Employee leave request update failed:', error);
    throw error;
  }
};