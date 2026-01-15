import express from 'express';
import { aiController } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 获取 AI 响应（简单模式，无需认证）
router.post('/chat', aiController.getResponse);

// Agent 模式对话（需要认证，支持工具调用）
router.post('/agent', authMiddleware, aiController.agentChat);

// 获取对话历史
router.get('/history', aiController.getConversationHistory);

// 获取智能建议
router.get('/suggestions', aiController.getSuggestions);

// 获取帮助信息
router.get('/help', aiController.getHelp);

export default router;

