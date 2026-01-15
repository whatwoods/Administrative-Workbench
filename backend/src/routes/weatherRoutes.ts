import express from 'express';
import { weatherController } from '../controllers/weatherController';

const router = express.Router();

// 获取当前天气
router.get('/current', weatherController.getCurrent);

// 获取天气预报（支持多日预报）
router.get('/forecast', weatherController.getForecast);

// 获取农历二十四节气信息
router.get('/solar-terms', weatherController.getSolarTerms);

// 获取空气质量指数
router.get('/air-quality', weatherController.getAirQuality);

// 获取健康指数（日光、穿衣、洗车、运动等）
router.get('/health-index', weatherController.getHealthIndex);

export default router;
