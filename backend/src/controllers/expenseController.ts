import { Response } from 'express';
import { Expense } from '../models/Expense.js';
import { AuthRequest } from '../middleware/auth.js';

export class ExpenseController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { category, status, startDate, endDate } = req.query;
      const filter: any = { userId: req.user.userId };

      if (category) filter.category = category;
      if (status) filter.status = status;

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate as string);
        if (endDate) filter.date.$lte = new Date(endDate as string);
      }

      const expenses = await Expense.find(filter).sort({ date: -1 });

      res.json({
        success: true,
        data: expenses,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [categoryStats, monthlyTotal] = await Promise.all([
        Expense.aggregate([
          {
            $match: {
              userId: req.user.userId,
              date: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: '$category',
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ]),
        Expense.aggregate([
          {
            $match: {
              userId: req.user.userId,
              date: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]),
      ]);

      res.json({
        success: true,
        data: {
          categoryStats,
          monthlyTotal: monthlyTotal[0]?.total || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { amount, category, description } = req.body;

      if (!amount || !category) {
        return res.status(400).json({
          success: false,
          message: 'Amount and category are required',
        });
      }

      const expense = await Expense.create({
        userId: req.user.userId,
        amount,
        category,
        description: description || '',
      });

      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
        });
      }

      res.json({
        success: true,
        data: expense,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const expense = await Expense.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
        });
      }

      res.json({
        success: true,
        message: 'Expense deleted',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async bulkImport(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { expenses } = req.body;

      if (!Array.isArray(expenses)) {
        return res.status(400).json({
          success: false,
          message: 'Expenses array is required',
        });
      }

      const expensesWithUserId = expenses.map((exp: any) => ({
        ...exp,
        userId: req.user?.userId,
      }));

      const created = await Expense.insertMany(expensesWithUserId);

      res.status(201).json({
        success: true,
        data: {
          count: created.length,
          expenses: created,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
