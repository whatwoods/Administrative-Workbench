import { Request, Response } from 'express';
import axios from 'axios';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  sunset: string;
  location: string;
}

interface Forecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

interface SolarTerm {
  name: string;
  date: string;
  daysUntil: number;
  description: string;
}

// 农历二十四节气数据
const SOLAR_TERMS_2024 = [
  { name: '立春', date: '2024-02-04', description: '春季开始' },
  { name: '雨水', date: '2024-02-19', description: '雨水增加' },
  { name: '惊蛰', date: '2024-03-05', description: '春雷惊蛰' },
  { name: '春分', date: '2024-03-20', description: '昼夜平分' },
  { name: '清明', date: '2024-04-04', description: '清明时节' },
  { name: '谷雨', date: '2024-04-20', description: '谷雨润物' },
  { name: '立夏', date: '2024-05-05', description: '夏季开始' },
  { name: '小满', date: '2024-05-20', description: '小满小满，麦粒渐满' },
  { name: '芒种', date: '2024-06-05', description: '有芒麦种' },
  { name: '夏至', date: '2024-06-21', description: '夏至日长' },
  { name: '小暑', date: '2024-07-06', description: '小暑炎蒸' },
  { name: '大暑', date: '2024-07-23', description: '大暑似火' },
  { name: '立秋', date: '2024-08-07', description: '秋季开始' },
  { name: '处暑', date: '2024-08-23', description: '处暑炎消' },
  { name: '白露', date: '2024-09-07', description: '白露秋分' },
  { name: '秋分', date: '2024-09-23', description: '昼夜平分' },
  { name: '寒露', date: '2024-10-08', description: '寒露冷空' },
  { name: '霜降', date: '2024-10-23', description: '霜降霜秋' },
  { name: '立冬', date: '2024-11-07', description: '冬季开始' },
  { name: '小雪', date: '2024-11-22', description: '小雪晶莹' },
  { name: '大雪', date: '2024-12-07', description: '大雪纷飞' },
  { name: '冬至', date: '2024-12-21', description: '冬至日短' },
];

// 模拟天气数据生成
const generateMockWeather = (): WeatherData => {
  const conditions = ['晴朗', '多云', '阴天', '小雨', '中雨', '大雨'];
  return {
    temp: Math.floor(Math.random() * 30) + 5,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    humidity: Math.floor(Math.random() * 100),
    windSpeed: Math.floor(Math.random() * 25),
    sunset: '18:30',
    location: '北京',
  };
};

// 生成天气预报
const generateForecast = (days: number): Forecast[] => {
  const conditions = ['晴朗', '多云', '阴天', '小雨', '中雨'];
  const forecast: Forecast[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    forecast.push({
      date: date.toISOString().split('T')[0],
      high: Math.floor(Math.random() * 15) + 15,
      low: Math.floor(Math.random() * 10) + 5,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      precipitation: Math.floor(Math.random() * 100),
    });
  }

  return forecast;
};

// 计算距离节气的天数
const calculateDaysUntil = (solarTermDate: string): number => {
  const today = new Date();
  const termDate = new Date(solarTermDate);
  const diffTime = termDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const weatherController = {
  // 获取当前天气
  getCurrent: (req: Request, res: Response) => {
    try {
      const weatherData = generateMockWeather();
      res.json({
        success: true,
        data: weatherData,
        timestamp: new Date().toISOString(),
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
  getForecast: (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 5;

      if (days < 1 || days > 15) {
        return res.status(400).json({
          success: false,
          message: '预报天数应在 1-15 天之间',
        });
      }

      const forecast = generateForecast(days);
      res.json({
        success: true,
        data: forecast,
        count: forecast.length,
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
      const solarTerms: SolarTerm[] = SOLAR_TERMS_2024.map((term) => ({
        name: term.name,
        date: term.date,
        daysUntil: calculateDaysUntil(term.date),
        description: term.description,
      })).filter(term => term.daysUntil >= -30 && term.daysUntil <= 365)
        .sort((a, b) => a.daysUntil - b.daysUntil);

      res.json({
        success: true,
        data: solarTerms,
        count: solarTerms.length,
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
  getAirQuality: (req: Request, res: Response) => {
    try {
      const aqiLevels = [
        { level: '优', aqi: Math.floor(Math.random() * 50), color: '#00e400' },
        { level: '良', aqi: 50 + Math.floor(Math.random() * 50), color: '#ffff00' },
        { level: '轻度污染', aqi: 100 + Math.floor(Math.random() * 50), color: '#ff7e00' },
        { level: '中度污染', aqi: 150 + Math.floor(Math.random() * 50), color: '#ff0000' },
      ];

      const quality = aqiLevels[Math.floor(Math.random() * aqiLevels.length)];

      res.json({
        success: true,
        data: {
          ...quality,
          timestamp: new Date().toISOString(),
          location: '北京',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取空气质量失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // 获取健康指数（日光、穿衣、洗车等）
  getHealthIndex: (req: Request, res: Response) => {
    try {
      const indices = [
        { index: '日光', level: '强', description: '阳光充足，紫外线较强' },
        { index: '穿衣', level: '舒适', description: '建议穿着短袖或轻薄衣物' },
        { index: '洗车', level: '适宜', description: '天气较好，适合洗车' },
        { index: '运动', level: '适宜', description: '天气良好，适合户外运动' },
        { index: '感冒', level: '低', description: '温度适宜，感冒指数低' },
      ];

      res.json({
        success: true,
        data: indices,
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
