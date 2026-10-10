import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

// PRODUCTS
export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lowStock, category } = req.query;
    const filter: any = {};

    if (category) {
      filter.categoryId = String(category);
    }

    let products = await prisma.product.findMany({
      where: filter,
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lowStock === 'true') {
      products = products.filter((p) => p.quantity <= p.minStockLevel);
    }

    return res.status(200).json({ products });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, sku, description, price, cost, quantity, minStockLevel, categoryId, supplierId } = req.body;

    if (!name || !sku || !price || !cost || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        price: parseFloat(price),
        cost: parseFloat(cost),
        quantity: parseInt(quantity) || 0,
        minStockLevel: parseInt(minStockLevel) || 5,
        categoryId,
        supplierId: supplierId || null,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return res.status(201).json({ product });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, description, price, cost, quantity, minStockLevel, categoryId, supplierId } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingProduct.name,
        sku: sku !== undefined ? sku : existingProduct.sku,
        description: description !== undefined ? description : existingProduct.description,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        cost: cost !== undefined ? parseFloat(cost) : existingProduct.cost,
        quantity: quantity !== undefined ? parseInt(quantity) : existingProduct.quantity,
        minStockLevel: minStockLevel !== undefined ? parseInt(minStockLevel) : existingProduct.minStockLevel,
        categoryId: categoryId !== undefined ? categoryId : existingProduct.categoryId,
        supplierId: supplierId !== undefined ? supplierId : existingProduct.supplierId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return res.status(200).json({ product });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CATEGORIES
export const getCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
    return res.status(200).json({ categories });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await prisma.category.create({
      data: { name, description },
    });

    return res.status(201).json({ category });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SUPPLIERS
export const getSuppliers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    return res.status(200).json({ suppliers });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }

    const supplier = await prisma.supplier.create({
      data: { name, email, phone, address },
    });

    return res.status(201).json({ supplier });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
