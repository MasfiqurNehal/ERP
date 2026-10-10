import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getSuppliers,
  createSupplier,
} from '../controllers/inventory.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all inventory routes
router.use(authenticateToken as any);

// Products
router.get('/products', getProducts as any);
router.post(
  '/products',
  requireRole(['ADMIN', 'MANAGER', 'INVENTORY_STAFF']) as any,
  createProduct as any
);
router.put(
  '/products/:id',
  requireRole(['ADMIN', 'MANAGER', 'INVENTORY_STAFF']) as any,
  updateProduct as any
);
router.delete(
  '/products/:id',
  requireRole(['ADMIN', 'MANAGER', 'INVENTORY_STAFF']) as any,
  deleteProduct as any
);

// Categories
router.get('/categories', getCategories as any);
router.post(
  '/categories',
  requireRole(['ADMIN', 'MANAGER', 'INVENTORY_STAFF']) as any,
  createCategory as any
);

// Suppliers
router.get('/suppliers', getSuppliers as any);
router.post(
  '/suppliers',
  requireRole(['ADMIN', 'MANAGER', 'INVENTORY_STAFF']) as any,
  createSupplier as any
);

export default router;
