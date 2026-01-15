import { Response } from 'express';
import { db } from '../db/index.js';
import { notes } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

export class NoteController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const results = db.select().from(notes)
        .where(eq(notes.userId, req.user.userId))
        .orderBy(desc(notes.updatedAt))
        .all();

      // 解析 JSON 字段
      const parsed = results.map(n => ({
        ...n,
        _id: n.id,
        tags: n.tags ? JSON.parse(n.tags) : [],
        versions: n.versions ? JSON.parse(n.versions) : [],
      }));

      res.json({ success: true, data: parsed });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = db.select().from(notes)
        .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.user.userId)))
        .get();

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({
        success: true,
        data: {
          ...note,
          _id: note.id,
          tags: note.tags ? JSON.parse(note.tags) : [],
          versions: note.versions ? JSON.parse(note.versions) : [],
        },
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

      const { title, content, type, tags } = req.body;

      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required' });
      }

      const id = randomUUID();
      const now = new Date().toISOString();
      const versions = [{ content, timestamp: now }];

      db.insert(notes).values({
        id,
        userId: req.user.userId,
        title,
        content,
        type: type || 'text',
        tags: JSON.stringify(tags || []),
        versions: JSON.stringify(versions),
        createdAt: now,
        updatedAt: now,
      }).run();

      const note = db.select().from(notes).where(eq(notes.id, id)).get();

      res.status(201).json({
        success: true,
        data: {
          ...note,
          _id: id,
          tags: tags || [],
          versions,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = db.select().from(notes)
        .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.user.userId)))
        .get();

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      const now = new Date().toISOString();
      const updates: any = { updatedAt: now };

      // 解析现有 versions
      let versions = note.versions ? JSON.parse(note.versions) : [];

      // 如果 content 改变了，添加版本
      if (req.body.content && req.body.content !== note.content) {
        versions.push({ content: req.body.content, timestamp: now });
        updates.versions = JSON.stringify(versions);
        updates.content = req.body.content;
      }

      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.type !== undefined) updates.type = req.body.type;
      if (req.body.tags !== undefined) updates.tags = JSON.stringify(req.body.tags);

      db.update(notes).set(updates).where(eq(notes.id, req.params.id)).run();

      const updated = db.select().from(notes).where(eq(notes.id, req.params.id)).get();

      res.json({
        success: true,
        data: {
          ...updated,
          _id: updated?.id,
          tags: updated?.tags ? JSON.parse(updated.tags) : [],
          versions: updated?.versions ? JSON.parse(updated.versions) : [],
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = db.select().from(notes)
        .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.user.userId)))
        .get();

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      db.delete(notes).where(eq(notes.id, req.params.id)).run();

      res.json({ success: true, message: 'Note deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getVersions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = db.select().from(notes)
        .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.user.userId)))
        .get();

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({
        success: true,
        data: note.versions ? JSON.parse(note.versions) : [],
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
