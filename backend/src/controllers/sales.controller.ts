import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

// CUSTOMERS
export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        salesOrders: true,
      },
    });
    return res.status(200).json({ customers });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const customer = await prisma.customer.create({
      data: { name, email, phone, address },
    });

    return res.status(201).json({ customer });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SALES ORDERS
export const getSalesOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ orders });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createSalesOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, items } = req.body; // items: Array<{ productId, quantity }>

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Customer and items are required' });
    }

    // Generate unique order number
    const orderNumber = `SO-${Date.now().toString().slice(-6)}`;

    // Resolve prices & quantities
    let totalAmount = 0;
    const orderItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });
    }

    // Run in transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create SalesOrder
      const createdOrder = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Adjust Product Quantities
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Create Draft Invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days due
      await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          orderId: createdOrder.id,
          amount: totalAmount,
          status: 'UNPAID',
          dueDate,
        },
      });

      return createdOrder;
    });

    return res.status(201).json({ order });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // DRAFT, CONFIRMED, COMPLETED, CANCELLED

    const order = await prisma.salesOrder.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({ order });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// INVOICES
export const getInvoices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ invoices });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const payInvoice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { order: { include: { customer: true } } },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    // Update status to PAID and create a Transaction record in a DB transaction
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: { status: 'PAID' },
      });

      // Update order to COMPLETED
      await tx.salesOrder.update({
        where: { id: invoice.orderId },
        data: { status: 'COMPLETED' },
      });

      // Create Finance Transaction
      await tx.transaction.create({
        data: {
          type: 'INCOME',
          amount: invoice.amount,
          category: 'Sales',
          description: `Payment received for Invoice ${invoice.invoiceNumber} (Customer: ${invoice.order.customer.name})`,
          reference: invoice.invoiceNumber,
        },
      });

      return updated;
    });

    return res.status(200).json({ invoice: updatedInvoice });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
