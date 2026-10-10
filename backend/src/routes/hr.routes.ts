import { Router } from 'express';
import {
  getEmployees,
  createEmployee,
  getAttendance,
  logAttendance,
  getLeaves,
  requestLeave,
  updateLeaveStatus,
  getPayrolls,
  generatePayroll,
  payPayroll,
} from '../controllers/hr.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

// Restrict all employee directory actions to HR/Admin
router.get(
  '/employees',
  requireRole(['ADMIN', 'MANAGER', 'HR_STAFF']) as any,
  getEmployees as any
);
router.post(
  '/employees',
  requireRole(['ADMIN', 'MANAGER', 'HR_STAFF']) as any,
  createEmployee as any
);

// Attendance
router.get(
  '/attendance',
  requireRole(['ADMIN', 'MANAGER', 'HR_STAFF']) as any,
  getAttendance as any
);
router.post(
  '/attendance',
  requireRole(['ADMIN', 'MANAGER', 'HR_STAFF']) as any,
  logAttendance as any
);

// Leaves
router.get(
  '/leaves',
  requireRole(['ADMIN', 'MANAGER', 'HR_STAFF']) as any,
  getLeaves as any
);
router.post('/leaves/request', requestLeave as any); // Any employee can request a leave
router.put(
  '/leaves/:id/status',
  requireRole(['ADMIN', 'MANAGER', 'HR_STAFF']) as any,
  updateLeaveStatus as any
);

// Payroll
router.get(
  '/payroll',
  requireRole(['ADMIN', 'MANAGER', 'HR_STAFF', 'FINANCE_STAFF']) as any,
  getPayrolls as any
);
router.post(
  '/payroll/generate',
  requireRole(['ADMIN', 'MANAGER', 'HR_STAFF']) as any,
  generatePayroll as any
);
router.post(
  '/payroll/:id/pay',
  requireRole(['ADMIN', 'MANAGER', 'FINANCE_STAFF']) as any,
  payPayroll as any
);

export default router;
