import { Response } from 'express';
import { Todo } from '../models/Todo.js';
import { AuthRequest } from '../middleware/auth.js';

export class TodoController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { category, priority, status } = req.query;
      const filter: any = { userId: req.user.userId };

      if (category) filter.category = category;
      if (priority) filter.priority = priority;
      if (status) filter.status = status;

      const todos = await Todo.find(filter).sort({ order: 1 });

      res.json({
        success: true,
        data: todos,
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

      const todo = await Todo.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: 'Todo not found',
        });
      }

      res.json({
        success: true,
        data: todo,
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

      const { title, description, category, priority, dueDate } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required',
        });
      }

      const maxOrder = await Todo.findOne({ userId: req.user.userId })
        .sort({ order: -1 })
        .select('order');

      const todo = await Todo.create({
        userId: req.user.userId,
        title,
        description: description || '',
        category: category || 'daily',
        priority: priority || 'medium',
        dueDate,
        order: (maxOrder?.order || 0) + 1,
      });

      res.status(201).json({
        success: true,
        data: todo,
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

      const todo = await Todo.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: 'Todo not found',
        });
      }

      res.json({
        success: true,
        data: todo,
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

      const todo = await Todo.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!todo) {
        return res.status(404).json({
          success: false,
          message: 'Todo not found',
        });
      }

      res.json({
        success: true,
        message: 'Todo deleted',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async reorder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { todos } = req.body;
      if (!Array.isArray(todos)) {
        return res.status(400).json({
          success: false,
          message: 'Todos array is required',
        });
      }

      const updates = todos.map((todo: any, index: number) =>
        Todo.findOneAndUpdate(
          { _id: todo._id, userId: req.user?.userId },
          { order: index },
          { new: true }
        )
      );

      await Promise.all(updates);

      res.json({
        success: true,
        message: 'Todos reordered',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
