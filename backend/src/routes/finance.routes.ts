import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  getFinancialSummary,
} from '../controllers/finance.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);
router.use(requireRole(['ADMIN', 'MANAGER', 'FINANCE_STAFF']) as any);

router.get('/transactions', getTransactions as any);
router.post('/transactions', createTransaction as any);
router.get('/summary', getFinancialSummary as any);

export default router;
