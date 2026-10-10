import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, category } = req.query;
    const filter: any = {};

    if (type && ['INCOME', 'EXPENSE'].includes(type as string)) {
      filter.type = type;
    }

    if (category) {
      filter.category = String(category);
    }

    const transactions = await prisma.transaction.findMany({
      where: filter,
      orderBy: { date: 'desc' },
    });

    return res.status(200).json({ transactions });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, amount, category, description, reference, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Type, amount, and category are required' });
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        category,
        description,
        reference,
        date: date ? new Date(date) : new Date(),
      },
    });

    return res.status(201).json({ transaction });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFinancialSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany();

    let totalIncome = 0;
    let totalExpense = 0;

    const categoryBreakdown: { [key: string]: number } = {};

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }

      // Track categories
      if (!categoryBreakdown[tx.category]) {
        categoryBreakdown[tx.category] = 0;
      }
      categoryBreakdown[tx.category] += tx.type === 'INCOME' ? tx.amount : -tx.amount;
    });

    const netProfit = totalIncome - totalExpense;

    return res.status(200).json({
      totalIncome,
      totalExpense,
      netProfit,
      transactionCount: transactions.length,
      categoryBreakdown,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
