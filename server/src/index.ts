import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createEmployeeLeaveRequestInputSchema,
  updateEmployeeLeaveRequestInputSchema,
  getEmployeeLeaveRequestInputSchema
} from './schema';

// Import handlers
import { createEmployeeLeaveRequest } from './handlers/create_employee_leave_request';
import { getEmployeeLeaveRequests } from './handlers/get_employee_leave_requests';
import { getEmployeeLeaveRequest } from './handlers/get_employee_leave_request';
import { updateEmployeeLeaveRequest } from './handlers/update_employee_leave_request';
import { deleteEmployeeLeaveRequest } from './handlers/delete_employee_leave_request';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Employee Leave Request endpoints
  createEmployeeLeaveRequest: publicProcedure
    .input(createEmployeeLeaveRequestInputSchema)
    .mutation(({ input }) => createEmployeeLeaveRequest(input)),

  getEmployeeLeaveRequests: publicProcedure
    .query(() => getEmployeeLeaveRequests()),

  getEmployeeLeaveRequest: publicProcedure
    .input(getEmployeeLeaveRequestInputSchema)
    .query(({ input }) => getEmployeeLeaveRequest(input)),

  updateEmployeeLeaveRequest: publicProcedure
    .input(updateEmployeeLeaveRequestInputSchema)
    .mutation(({ input }) => updateEmployeeLeaveRequest(input)),

  deleteEmployeeLeaveRequest: publicProcedure
    .input(getEmployeeLeaveRequestInputSchema)
    .mutation(({ input }) => deleteEmployeeLeaveRequest(input))
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();