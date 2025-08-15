import { db } from '../db';
import { employeeLeaveRequestsTable } from '../db/schema';
import { type CreateEmployeeLeaveRequestInput, type EmployeeLeaveRequest } from '../schema';

export const createEmployeeLeaveRequest = async (input: CreateEmployeeLeaveRequestInput | Omit<CreateEmployeeLeaveRequestInput, 'status'>): Promise<EmployeeLeaveRequest> => {
  try {
    // Generate a unique ID Share with format: ELR-YYYYMMDD-HHMMSS-RANDOM
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    const idShare = `ELR-${dateStr}-${timeStr}-${randomStr}`;

    // Insert employee leave request record
    const result = await db.insert(employeeLeaveRequestsTable)
      .values({
        id_share: idShare,
        employee_name: input.employee_name,
        department_grade: input.department_grade,
        status: ('status' in input && input.status) ? input.status : 'Pending', // Use input status or default to Pending
        leave_date: input.leave_date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
        location: input.location,
        reason: input.reason,
        time_out: input.time_out,
        time_back: input.time_back
      })
      .returning()
      .execute();

    const leaveRequest = result[0];
    
    // Convert the date string back to Date object for return
    return {
      ...leaveRequest,
      leave_date: new Date(leaveRequest.leave_date),
      created_at: leaveRequest.created_at,
      updated_at: leaveRequest.updated_at
    };
  } catch (error) {
    console.error('Employee leave request creation failed:', error);
    throw error;
  }
};