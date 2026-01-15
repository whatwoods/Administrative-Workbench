import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { NoteService } from '../services/noteService.js';

export class NoteController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const data = await NoteService.getAll(req.user.userId);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = await NoteService.getById(req.params.id, req.user.userId);

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({ success: true, data: note });
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

      const note = await NoteService.create(req.user.userId, {
        title,
        content,
        type,
        tags
      });

      res.status(201).json({ success: true, data: note });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const note = await NoteService.update(req.params.id, req.user.userId, req.body);

      if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({ success: true, data: note });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const success = await NoteService.delete(req.params.id, req.user.userId);

      if (!success) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

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

      const versions = await NoteService.getVersions(req.params.id, req.user.userId);

      if (!versions) {
        return res.status(404).json({ success: false, message: 'Note not found' });
      }

      res.json({ success: true, data: versions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async search(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'Query string is required' });
      }

      const results = await NoteService.search(req.user.userId, query);

      res.json({ success: true, data: results });

    } catch (error: any) {
      console.error('Semantic search error:', error);
      res.status(500).json({ success: false, message: error.message || 'Search failed' });
    }
  }
}
