import { Router } from 'express';
import {
  getCustomers,
  createCustomer,
  getSalesOrders,
  createSalesOrder,
  updateOrderStatus,
  getInvoices,
  payInvoice,
} from '../controllers/sales.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

// Customers
router.get('/customers', getCustomers as any);
router.post(
  '/customers',
  requireRole(['ADMIN', 'MANAGER', 'SALES_STAFF']) as any,
  createCustomer as any
);

// Sales Orders
router.get('/orders', getSalesOrders as any);
router.post(
  '/orders',
  requireRole(['ADMIN', 'MANAGER', 'SALES_STAFF']) as any,
  createSalesOrder as any
);
router.put(
  '/orders/:id/status',
  requireRole(['ADMIN', 'MANAGER', 'SALES_STAFF']) as any,
  updateOrderStatus as any
);

// Invoices
router.get('/invoices', getInvoices as any);
router.post(
  '/invoices/:id/pay',
  requireRole(['ADMIN', 'MANAGER', 'FINANCE_STAFF']) as any,
  payInvoice as any
);

export default router;
