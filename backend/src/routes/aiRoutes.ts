import express from 'express';
import { aiController } from '../controllers/aiController';

const router = express.Router();

// 获取 AI 响应
router.post('/chat', aiController.getResponse);

// 获取对话历史
router.get('/history', aiController.getConversationHistory);

// 获取智能建议
router.get('/suggestions', aiController.getSuggestions);

// 获取帮助信息
router.get('/help', aiController.getHelp);

export default router;
