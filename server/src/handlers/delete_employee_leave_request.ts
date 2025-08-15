import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetEmployeeLeaveRequestInput } from '../schema';

export async function deleteEmployeeLeaveRequest(input: GetEmployeeLeaveRequestInput): Promise<{ success: boolean; message: string }> {
  try {
    // First check if the leave request exists
    const existingRequest = await db.select()
      .from(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, input.id))
      .execute();

    if (existingRequest.length === 0) {
      return {
        success: false,
        message: `Leave request with ID ${input.id} not found.`
      };
    }

    // Delete the leave request
    const result = await db.delete(employeeLeaveRequestsTable)
      .where(eq(employeeLeaveRequestsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return {
        success: false,
        message: `Failed to delete leave request with ID ${input.id}.`
      };
    }

    return {
      success: true,
      message: `Leave request with ID ${input.id} has been deleted successfully.`
    };
  } catch (error) {
    console.error('Leave request deletion failed:', error);
    throw error;
  }
}