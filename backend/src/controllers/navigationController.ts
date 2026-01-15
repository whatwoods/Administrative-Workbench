import { Response } from 'express';
import { Navigation } from '../models/Navigation.js';
import { AuthRequest } from '../middleware/auth.js';

export class NavigationController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const navItems = await Navigation.find({ userId: req.user.userId }).sort({
        category: 1,
        order: 1,
      });

      res.json({
        success: true,
        data: navItems,
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

      const { category, title, url, icon } = req.body;

      if (!category || !title || !url) {
        return res.status(400).json({
          success: false,
          message: 'Category, title, and url are required',
        });
      }

      const maxOrder = await Navigation.findOne({
        userId: req.user.userId,
        category,
      })
        .sort({ order: -1 })
        .select('order');

      const navItem = await Navigation.create({
        userId: req.user.userId,
        category,
        title,
        url,
        icon: icon || '',
        order: (maxOrder?.order || 0) + 1,
      });

      res.status(201).json({
        success: true,
        data: navItem,
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

      const navItem = await Navigation.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!navItem) {
        return res.status(404).json({
          success: false,
          message: 'Navigation item not found',
        });
      }

      res.json({
        success: true,
        data: navItem,
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

      const navItem = await Navigation.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!navItem) {
        return res.status(404).json({
          success: false,
          message: 'Navigation item not found',
        });
      }

      res.json({
        success: true,
        message: 'Navigation item deleted',
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

      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required',
        });
      }

      const updates = items.map((item: any, index: number) =>
        Navigation.findOneAndUpdate(
          { _id: item._id, userId: req.user?.userId },
          { order: index },
          { new: true }
        )
      );

      await Promise.all(updates);

      res.json({
        success: true,
        message: 'Navigation items reordered',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
