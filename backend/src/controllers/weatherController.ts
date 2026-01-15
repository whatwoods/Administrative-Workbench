import { Request, Response } from 'express';
import { WeatherService } from '../services/weatherService.js';

export const weatherController = {
  // 获取当前天气
  getCurrent: async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string);
      const data = await WeatherService.getCurrent(city);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取天气数据失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // 获取天气预报
  getForecast: async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string);
      const days = parseInt(req.query.days as string) || 7;
      const data = await WeatherService.getForecast(city, days);

      res.json({
        success: true,
        data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取天气预报失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // 获取节气信息
  getSolarTerms: (req: Request, res: Response) => {
    try {
      const data = WeatherService.getSolarTerms();

      res.json({
        success: true,
        data,
        count: data.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取节气信息失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // 获取空气质量指数
  getAirQuality: async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string);
      const data = await WeatherService.getAirQuality(city);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取空气质量失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // 获取健康指数
  getHealthIndex: async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string);
      const data = await WeatherService.getHealthIndex(city);

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取健康指数失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};
