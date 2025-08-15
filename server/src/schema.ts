import { z } from 'zod';

// Enum schemas for dropdown options
export const departmentGradeSchema = z.enum(['G8', 'G9', 'G10', 'G11']);
export type DepartmentGrade = z.infer<typeof departmentGradeSchema>;

export const statusSchema = z.enum(['Pending', 'Approved', 'Rejected']);
export type Status = z.infer<typeof statusSchema>;

export const locationSchema = z.enum(['Mambal', 'Sembung G']);
export type Location = z.infer<typeof locationSchema>;

// Employee Leave Request schema
export const employeeLeaveRequestSchema = z.object({
  id: z.number(),
  id_share: z.string(),
  employee_name: z.string(),
  department_grade: departmentGradeSchema,
  status: statusSchema,
  leave_date: z.coerce.date(),
  location: locationSchema,
  reason: z.string(),
  time_out: z.string(), // Time stored as string (HH:MM format)
  time_back: z.string(), // Time stored as string (HH:MM format)
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type EmployeeLeaveRequest = z.infer<typeof employeeLeaveRequestSchema>;

// Input schema for creating leave requests
export const createEmployeeLeaveRequestInputSchema = z.object({
  employee_name: z.string().min(1, 'Employee name is required'),
  department_grade: departmentGradeSchema,
  status: statusSchema.default('Pending'), // Default to Pending
  leave_date: z.coerce.date(),
  location: locationSchema,
  reason: z.string().min(1, 'Reason is required'),
  time_out: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  time_back: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format')
});

export type CreateEmployeeLeaveRequestInput = z.infer<typeof createEmployeeLeaveRequestInputSchema>;

// Input schema for updating leave requests
export const updateEmployeeLeaveRequestInputSchema = z.object({
  id: z.number(),
  employee_name: z.string().min(1, 'Employee name is required').optional(),
  department_grade: departmentGradeSchema.optional(),
  status: statusSchema.optional(),
  leave_date: z.coerce.date().optional(),
  location: locationSchema.optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
  time_out: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format').optional(),
  time_back: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format').optional()
});

export type UpdateEmployeeLeaveRequestInput = z.infer<typeof updateEmployeeLeaveRequestInputSchema>;

// Schema for getting leave request by ID
export const getEmployeeLeaveRequestInputSchema = z.object({
  id: z.number()
});

export type GetEmployeeLeaveRequestInput = z.infer<typeof getEmployeeLeaveRequestInputSchema>;