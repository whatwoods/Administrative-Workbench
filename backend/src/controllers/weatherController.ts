import { Request, Response } from 'express';
import axios from 'axios';

// WMO 天气代码对应中文描述
const WMO_CODE_MAP: Record<number, string> = {
  0: '晴朗',
  1: '主要晴朗',
  2: '部分多云',
  3: '阴天',
  45: '雾',
  48: '沉积雾',
  51: '轻微毛毛雨',
  53: '中等毛毛雨',
  55: '密集毛毛雨',
  56: '轻微冷毛毛雨',
  57: '密集冷毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '轻微冷雨',
  67: '强度冷雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '雪粒',
  80: '阵雨',
  81: '强阵雨',
  82: '极强阵雨',
  85: '阵雪',
  86: '强阵雪',
  95: '雷暴',
  96: '雷暴伴有小冰雹',
  99: '雷暴伴有大冰雹',
};

// 农历二十四节气数据
const SOLAR_TERMS_2026 = [
  { name: '立春', date: '2026-02-04', description: '春季开始' },
  { name: '雨水', date: '2026-02-18', description: '雨水增加' },
  { name: '惊蛰', date: '2026-03-05', description: '春雷惊蛰' },
  { name: '春分', date: '2026-03-20', description: '昼夜平分' },
  { name: '清明', date: '2026-04-04', description: '清明时节' },
  { name: '谷雨', date: '2026-04-20', description: '谷雨润物' },
  { name: '立夏', date: '2026-05-05', description: '夏季开始' },
  { name: '小满', date: '2026-05-21', description: '小满小满，麦粒渐满' },
  { name: '芒种', date: '2026-06-05', description: '有芒麦种' },
  { name: '夏至', date: '2026-06-21', description: '夏至日长' },
  { name: '小暑', date: '2026-07-07', description: '小暑炎蒸' },
  { name: '大暑', date: '2026-07-22', description: '大暑似火' },
  { name: '立秋', date: '2026-08-07', description: '秋季开始' },
  { name: '处暑', date: '2026-08-23', description: '处暑炎消' },
  { name: '白露', date: '2026-09-07', description: '白露秋分' },
  { name: '秋分', date: '2026-09-23', description: '昼夜平分' },
  { name: '寒露', date: '2026-10-08', description: '寒露冷空' },
  { name: '霜降', date: '2026-10-23', description: '霜降霜秋' },
  { name: '立冬', date: '2026-11-07', description: '冬季开始' },
  { name: '小雪', date: '2026-11-22', description: '小雪晶莹' },
  { name: '大雪', date: '2026-12-07', description: '大雪纷飞' },
  { name: '冬至', date: '2026-12-21', description: '冬至日短' },
];

// 默认坐标（芜湖）
const DEFAULT_LAT = 31.3333;
const DEFAULT_LON = 118.3833;
const DEFAULT_CITY = '芜湖';

/**
 * 获取地理坐标
 */
async function getCoordinates(city: string) {
  try {
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`);
    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return { lat: DEFAULT_LAT, lon: DEFAULT_LON, name: DEFAULT_CITY };
}

export const weatherController = {
  // 获取当前天气
  getCurrent: async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || DEFAULT_CITY;
      const { lat, lon, name } = await getCoordinates(city);

      const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);

      const current = response.data.current;

      res.json({
        success: true,
        data: {
          temp: Math.round(current.temperature_2m),
          condition: WMO_CODE_MAP[current.weather_code] || '未知',
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          location: name,
          timestamp: current.time,
        },
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
      const city = (req.query.city as string) || DEFAULT_CITY;
      const days = parseInt(req.query.days as string) || 7;
      const { lat, lon } = await getCoordinates(city);

      const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=${days}`);

      const daily = response.data.daily;
      const forecast = daily.time.map((date: string, index: number) => ({
        date,
        high: Math.round(daily.temperature_2m_max[index]),
        low: Math.round(daily.temperature_2m_min[index]),
        condition: WMO_CODE_MAP[daily.weather_code[index]] || '未知',
        precipitation: daily.precipitation_probability_max[index] || 0,
      }));

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
      const now = new Date();
      const solarTerms = SOLAR_TERMS_2026.map((term) => {
        const termDate = new Date(term.date);
        const diffTime = termDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...term,
          daysUntil: diffDays,
        };
      }).filter(term => term.daysUntil >= -5 && term.daysUntil <= 365)
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
  getAirQuality: async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || DEFAULT_CITY;
      const { lat, lon, name } = await getCoordinates(city);

      const response = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`);

      const aqi = response.data.current.us_aqi;
      let level = '优';
      let color = '#00e400';

      if (aqi > 50 && aqi <= 100) {
        level = '良';
        color = '#ffff00';
      } else if (aqi > 100 && aqi <= 150) {
        level = '轻度污染';
        color = '#ff7e00';
      } else if (aqi > 150) {
        level = '中度污染';
        color = '#ff0000';
      }

      res.json({
        success: true,
        data: {
          level,
          aqi,
          color,
          location: name,
          timestamp: new Date().toISOString(),
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

  // 获取健康指数
  getHealthIndex: async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || DEFAULT_CITY;
      const { lat, lon } = await getCoordinates(city);

      // 获取紫外线和天气状况
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max,weather_code&timezone=auto&forecast_days=1`);

      const uv = response.data.daily.uv_index_max[0];
      const code = response.data.daily.weather_code[0];

      const indices = [
        { index: '紫外线', level: uv > 6 ? '强' : uv > 3 ? '中等' : '弱', description: `当前紫外线指数为 ${uv}` },
        { index: '穿衣', level: '舒适', description: '建议参考气温变化穿着' },
        { index: '洗车', level: (code >= 51) ? '不宜' : '适宜', description: (code >= 51) ? '有雨，不建议洗车' : '天气良好，适合洗车' },
        { index: '运动', level: (code >= 51) ? '较不宜' : '适宜', description: (code >= 51) ? '天气欠佳，建议室内运动' : '天气良好，适合户外运动' },
        { index: '感冒', level: '低', description: '适时增减衣物，预防感冒' },
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
