import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ExpenseService } from '../services/expenseService.js';

export class ExpenseController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const filters = {
        category: req.query.category as string,
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const data = await ExpenseService.getAll(req.user.userId, filters);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const data = await ExpenseService.getStats(req.user.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { amount, category, description, date } = req.body;

      if (!amount || !category) {
        return res.status(400).json({ success: false, message: 'Amount and category are required' });
      }

      const expense = await ExpenseService.create(req.user.userId, {
        amount,
        category,
        description,
        date
      });

      res.status(201).json({ success: true, data: expense });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const expense = await ExpenseService.update(req.params.id, req.user.userId, req.body);

      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }

      res.json({ success: true, data: expense });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const success = await ExpenseService.delete(req.params.id, req.user.userId);

      if (!success) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }

      res.json({ success: true, message: 'Expense deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async bulkImport(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { expenses } = req.body;

      if (!Array.isArray(expenses)) {
        return res.status(400).json({ success: false, message: 'Expenses array is required' });
      }

      const data = await ExpenseService.bulkImport(req.user.userId, expenses);

      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
