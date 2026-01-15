import { Response } from 'express';
import { Note } from '../models/Note.js';
import { AuthRequest } from '../middleware/auth.js';

export class NoteController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const notes = await Note.find({ userId: req.user.userId }).sort({
        updatedAt: -1,
      });

      res.json({
        success: true,
        data: notes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found',
        });
      }

      res.json({
        success: true,
        data: note,
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

      const { title, content, type, tags } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required',
        });
      }

      const note = await Note.create({
        userId: req.user.userId,
        title,
        content,
        type: type || 'text',
        tags: tags || [],
        versions: [
          {
            content,
            timestamp: new Date(),
          },
        ],
      });

      res.status(201).json({
        success: true,
        data: note,
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

      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found',
        });
      }

      // Add to version history if content changed
      if (req.body.content && req.body.content !== note.content) {
        note.versions.push({
          content: req.body.content,
          timestamp: new Date(),
        });
      }

      // Update fields
      if (req.body.title) note.title = req.body.title;
      if (req.body.content) note.content = req.body.content;
      if (req.body.type) note.type = req.body.type;
      if (req.body.tags) note.tags = req.body.tags;

      await note.save();

      res.json({
        success: true,
        data: note,
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

      const note = await Note.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found',
        });
      }

      res.json({
        success: true,
        message: 'Note deleted',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getVersions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = await Note.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found',
        });
      }

      res.json({
        success: true,
        data: note.versions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
