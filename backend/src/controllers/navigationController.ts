import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { NavigationService } from '../services/navigationService.js';

export class NavigationController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const data = await NavigationService.getAll(req.user.userId);
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

      const { category, name, url, icon } = req.body;

      if (!category || !name || !url) {
        return res.status(400).json({ success: false, message: 'Category, name, and url are required' });
      }

      const nav = await NavigationService.create(req.user.userId, {
        category,
        name,
        url,
        icon
      });

      res.status(201).json({ success: true, data: nav });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const nav = await NavigationService.update(req.params.id, req.user.userId, req.body);

      if (!nav) {
        return res.status(404).json({ success: false, message: 'Navigation item not found' });
      }

      res.json({ success: true, data: nav });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const success = await NavigationService.delete(req.params.id, req.user.userId);

      if (!success) {
        return res.status(404).json({ success: false, message: 'Navigation item not found' });
      }

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

      await NavigationService.reorder(req.user.userId, items);

      res.json({ success: true, message: 'Navigation items reordered' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
