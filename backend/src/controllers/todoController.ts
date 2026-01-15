import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { TodoService } from '../services/todoService.js';

export class TodoController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const filters = {
        category: req.query.category as string,
        priority: req.query.priority as string,
        status: req.query.status as string,
      };

      const data = await TodoService.getAll(req.user.userId, filters);
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

      const todo = await TodoService.getById(req.params.id, req.user.userId);

      if (!todo) {
        return res.status(404).json({ success: false, message: 'Todo not found' });
      }

      res.json({ success: true, data: todo });
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

      const todo = await TodoService.create(req.user.userId, {
        title,
        description,
        category,
        priority,
        dueDate
      });

      res.status(201).json({ success: true, data: todo });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const todo = await TodoService.update(req.params.id, req.user.userId, req.body);

      if (!todo) {
        return res.status(404).json({ success: false, message: 'Todo not found' });
      }

      res.json({ success: true, data: todo });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const success = await TodoService.delete(req.params.id, req.user.userId);

      if (!success) {
        return res.status(404).json({ success: false, message: 'Todo not found' });
      }

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

      const { todos } = req.body;
      if (!Array.isArray(todos)) {
        return res.status(400).json({ success: false, message: 'Todos array is required' });
      }

      await TodoService.reorder(req.user.userId, todos);

      res.json({ success: true, message: 'Todos reordered' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
