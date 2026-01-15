import { Response } from 'express';
import { db } from '../db/index.js';
import { expenses } from '../db/schema.js';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

export class ExpenseController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      let results = db.select().from(expenses)
        .where(eq(expenses.userId, req.user.userId))
        .orderBy(desc(expenses.date))
        .all();

      // 应用过滤
      const { category, status, startDate, endDate } = req.query;
      if (category) results = results.filter(e => e.category === category);
      if (status) results = results.filter(e => e.status === status);
      if (startDate) results = results.filter(e => e.date && e.date >= (startDate as string));
      if (endDate) results = results.filter(e => e.date && e.date <= (endDate as string));

      res.json({ success: true, data: results.map(e => ({ ...e, _id: e.id })) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const allExpenses = db.select().from(expenses)
        .where(and(
          eq(expenses.userId, req.user.userId),
          gte(expenses.date, startOfMonth)
        ))
        .all();

      // 计算分类统计
      const categoryMap = new Map<string, { total: number; count: number }>();
      let monthlyTotal = 0;

      allExpenses.forEach(exp => {
        monthlyTotal += exp.amount;
        const existing = categoryMap.get(exp.category) || { total: 0, count: 0 };
        existing.total += exp.amount;
        existing.count += 1;
        categoryMap.set(exp.category, existing);
      });

      const categoryStats = Array.from(categoryMap.entries()).map(([cat, stats]) => ({
        _id: cat,
        ...stats,
      }));

      res.json({
        success: true,
        data: { categoryStats, monthlyTotal },
      });
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

      const id = randomUUID();
      const now = new Date().toISOString();

      db.insert(expenses).values({
        id,
        userId: req.user.userId,
        amount,
        category,
        description: description || '',
        date: date || now,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }).run();

      const expense = db.select().from(expenses).where(eq(expenses.id, id)).get();

      res.status(201).json({ success: true, data: { ...expense, _id: id } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const existing = db.select().from(expenses)
        .where(and(eq(expenses.id, req.params.id), eq(expenses.userId, req.user.userId)))
        .get();

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }

      const updates: any = { updatedAt: new Date().toISOString() };
      if (req.body.amount !== undefined) updates.amount = req.body.amount;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.date !== undefined) updates.date = req.body.date;
      if (req.body.status !== undefined) updates.status = req.body.status;

      db.update(expenses).set(updates).where(eq(expenses.id, req.params.id)).run();

      const expense = db.select().from(expenses).where(eq(expenses.id, req.params.id)).get();

      res.json({ success: true, data: { ...expense, _id: expense?.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const existing = db.select().from(expenses)
        .where(and(eq(expenses.id, req.params.id), eq(expenses.userId, req.user.userId)))
        .get();

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }

      db.delete(expenses).where(eq(expenses.id, req.params.id)).run();

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

      const { expenses: expenseItems } = req.body;

      if (!Array.isArray(expenseItems)) {
        return res.status(400).json({ success: false, message: 'Expenses array is required' });
      }

      const now = new Date().toISOString();
      const created: any[] = [];

      expenseItems.forEach((exp: any) => {
        const id = randomUUID();
        db.insert(expenses).values({
          id,
          userId: req.user!.userId,
          amount: exp.amount,
          category: exp.category,
          description: exp.description || '',
          date: exp.date || now,
          status: exp.status || 'pending',
          createdAt: now,
          updatedAt: now,
        }).run();
        created.push({ ...exp, id, _id: id });
      });

      res.status(201).json({ success: true, data: { count: created.length, expenses: created } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
