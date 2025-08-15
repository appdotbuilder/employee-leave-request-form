import { serial, text, pgTable, timestamp, date, pgEnum } from 'drizzle-orm/pg-core';

// Define enums for the database
export const departmentGradeEnum = pgEnum('department_grade', ['G8', 'G9', 'G10', 'G11']);
export const statusEnum = pgEnum('status', ['Pending', 'Approved', 'Rejected']);
export const locationEnum = pgEnum('location', ['Mambal', 'Sembung G']);

// Employee Leave Request table
export const employeeLeaveRequestsTable = pgTable('employee_leave_requests', {
  id: serial('id').primaryKey(),
  id_share: text('id_share').notNull(), // Auto-generated read-only field
  employee_name: text('employee_name').notNull(),
  department_grade: departmentGradeEnum('department_grade').notNull(),
  status: statusEnum('status').notNull().default('Pending'),
  leave_date: date('leave_date').notNull(),
  location: locationEnum('location').notNull(),
  reason: text('reason').notNull(),
  time_out: text('time_out').notNull(), // Stored as HH:MM format
  time_back: text('time_back').notNull(), // Stored as HH:MM format
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type EmployeeLeaveRequest = typeof employeeLeaveRequestsTable.$inferSelect; // For SELECT operations
export type NewEmployeeLeaveRequest = typeof employeeLeaveRequestsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { 
  employeeLeaveRequests: employeeLeaveRequestsTable 
};