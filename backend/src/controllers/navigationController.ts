import { Response } from 'express';
import { db } from '../db/index.js';
import { navigations } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

export class NavigationController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const results = db.select().from(navigations)
        .where(eq(navigations.userId, req.user.userId))
        .orderBy(navigations.category, navigations.order)
        .all();

      res.json({ success: true, data: results.map(n => ({ ...n, _id: n.id })) });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { category, name, url, icon } = req.body;

      if (!category || !name || !url) {
        return res.status(400).json({ success: false, message: 'Category, name, and url are required' });
      }

      // 获取最大 order
      const maxOrderResult = db.select({ order: navigations.order }).from(navigations)
        .where(and(eq(navigations.userId, req.user.userId), eq(navigations.category, category)))
        .orderBy(desc(navigations.order))
        .limit(1)
        .get();

      const id = randomUUID();
      const now = new Date().toISOString();

      db.insert(navigations).values({
        id,
        userId: req.user.userId,
        category,
        name,
        url,
        icon: icon || '',
        order: (maxOrderResult?.order || 0) + 1,
        createdAt: now,
        updatedAt: now,
      }).run();

      const nav = db.select().from(navigations).where(eq(navigations.id, id)).get();

      res.status(201).json({ success: true, data: { ...nav, _id: id } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const existing = db.select().from(navigations)
        .where(and(eq(navigations.id, req.params.id), eq(navigations.userId, req.user.userId)))
        .get();

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Navigation item not found' });
      }

      const updates: any = { updatedAt: new Date().toISOString() };
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.url !== undefined) updates.url = req.body.url;
      if (req.body.icon !== undefined) updates.icon = req.body.icon;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.order !== undefined) updates.order = req.body.order;

      db.update(navigations).set(updates).where(eq(navigations.id, req.params.id)).run();

      const nav = db.select().from(navigations).where(eq(navigations.id, req.params.id)).get();

      res.json({ success: true, data: { ...nav, _id: nav?.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const existing = db.select().from(navigations)
        .where(and(eq(navigations.id, req.params.id), eq(navigations.userId, req.user.userId)))
        .get();

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Navigation item not found' });
      }

      db.delete(navigations).where(eq(navigations.id, req.params.id)).run();

      res.json({ success: true, message: 'Navigation item deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async reorder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Items array is required' });
      }

      items.forEach((item: any, index: number) => {
        db.update(navigations).set({ order: index }).where(
          and(eq(navigations.id, item._id || item.id), eq(navigations.userId, req.user!.userId))
        ).run();
      });

      res.json({ success: true, message: 'Navigation items reordered' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
