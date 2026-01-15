import { Response } from 'express';
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

export class TodoController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const results = db.select().from(todos)
        .where(eq(todos.userId, req.user.userId))
        .orderBy(todos.order)
        .all();

      // 应用过滤
      let filtered = results;
      const { category, priority, status } = req.query;
      if (category) filtered = filtered.filter(t => t.category === category);
      if (priority) filtered = filtered.filter(t => t.priority === priority);
      if (status) filtered = filtered.filter(t => t.status === status);

      res.json({ success: true, data: filtered });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const todo = db.select().from(todos)
        .where(and(eq(todos.id, req.params.id), eq(todos.userId, req.user.userId)))
        .get();

      if (!todo) {
        return res.status(404).json({ success: false, message: 'Todo not found' });
      }

      res.json({ success: true, data: { ...todo, _id: todo.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { title, description, category, priority, dueDate } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

      // 获取最大 order
      const maxOrderResult = db.select({ order: todos.order }).from(todos)
        .where(eq(todos.userId, req.user.userId))
        .orderBy(desc(todos.order))
        .limit(1)
        .get();

      const id = randomUUID();
      const now = new Date().toISOString();

      db.insert(todos).values({
        id,
        userId: req.user.userId,
        title,
        description: description || '',
        category: category || 'daily',
        priority: priority || 'medium',
        dueDate: dueDate || null,
        order: (maxOrderResult?.order || 0) + 1,
        createdAt: now,
        updatedAt: now,
      }).run();

      const todo = db.select().from(todos).where(eq(todos.id, id)).get();

      res.status(201).json({ success: true, data: { ...todo, _id: id } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const existing = db.select().from(todos)
        .where(and(eq(todos.id, req.params.id), eq(todos.userId, req.user.userId)))
        .get();

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Todo not found' });
      }

      const updates: any = { updatedAt: new Date().toISOString() };
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.priority !== undefined) updates.priority = req.body.priority;
      if (req.body.status !== undefined) updates.status = req.body.status;
      if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate;
      if (req.body.order !== undefined) updates.order = req.body.order;

      db.update(todos).set(updates).where(eq(todos.id, req.params.id)).run();

      const todo = db.select().from(todos).where(eq(todos.id, req.params.id)).get();

      res.json({ success: true, data: { ...todo, _id: todo?.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const existing = db.select().from(todos)
        .where(and(eq(todos.id, req.params.id), eq(todos.userId, req.user.userId)))
        .get();

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Todo not found' });
      }

      db.delete(todos).where(eq(todos.id, req.params.id)).run();

      res.json({ success: true, message: 'Todo deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async reorder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { todos: todoItems } = req.body;
      if (!Array.isArray(todoItems)) {
        return res.status(400).json({ success: false, message: 'Todos array is required' });
      }

      todoItems.forEach((todo: any, index: number) => {
        db.update(todos).set({ order: index }).where(
          and(eq(todos.id, todo._id || todo.id), eq(todos.userId, req.user!.userId))
        ).run();
      });

      res.json({ success: true, message: 'Todos reordered' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
