import { Request, Response } from 'express';
import { LLMService } from '../services/llmService.js';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const aiController = {
  // 获取 AI 响应
  getResponse: async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: '请提供有效的消息内容',
        });
      }

      if (message.length > 2000) {
        return res.status(400).json({
          success: false,
          message: '消息过长，请保持在 2000 字符以内',
        });
      }

      // 构建对话历史
      const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

      // 添加历史消息（如果有）
      if (Array.isArray(history)) {
        for (const msg of history.slice(-10)) { // 最多保留最近 10 条
          if (msg.role && msg.content) {
            messages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }
        }
      }

      // 添加当前用户消息
      messages.push({ role: 'user', content: message });

      // 调用 LLM 服务
      const response = await LLMService.chat(messages);

      res.json({
        success: true,
        data: {
          userMessage: message,
          assistantMessage: response.content,
          usage: response.usage,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('AI Response Error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message || '获取 AI 响应失败',
      });
    }
  },

  // 获取对话历史（占位，实际应从数据库获取）
  getConversationHistory: (req: Request, res: Response) => {
    try {
      const mockHistory: ConversationMessage[] = [
        {
          role: 'assistant',
          content: '您好！我是您的 AI 助手，可以帮助您管理任务、追踪费用、记录笔记等。有什么我可以帮助您的吗？',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      res.json({
        success: true,
        data: mockHistory,
        count: mockHistory.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取对话历史失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // 获取智能建议
  getSuggestions: async (req: Request, res: Response) => {
    try {
      const { context } = req.query;

      // 根据上下文生成建议
      const suggestions: Record<string, string[]> = {
        task: [
          '根据优先级整理您的任务列表',
          '完成已逾期的任务',
          '为下周规划任务',
        ],
        expense: [
          '分析一下您的支出分类',
          '查看本月支出统计',
          '设置预算提醒',
        ],
        note: [
          '整理您的笔记标签',
          '创建一个知识库索引',
          '搜索最近的笔记',
        ],
        general: [
          '检查今天的日程',
          '查看您的数据统计',
          '整理您的导航项',
        ],
      };

      const response = suggestions[context as string] || suggestions.general;

      res.json({
        success: true,
        data: response,
        count: response.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取建议失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // 获取帮助信息
  getHelp: (req: Request, res: Response) => {
    try {
      const helpData = {
        capabilities: [
          '智能对话：基于 DeepSeek 大模型的自然语言交互',
          '任务管理：创建、编辑、分析您的任务',
          '费用追踪：记录和分析您的支出',
          '笔记管理：创建和组织笔记',
          '天气查询：获取天气预报和健康建议',
        ],
        commands: [
          { command: '创建任务', description: '帮助您创建新的任务' },
          { command: '查看统计', description: '显示各项数据的统计信息' },
          { command: '天气预报', description: '获取天气和节气信息' },
          { command: '分析支出', description: '分析费用和支出趋势' },
        ],
        provider: process.env.LLM_PROVIDER || 'tencent',
        model: process.env.LLM_MODEL || 'deepseek-v3.2',
      };

      res.json({
        success: true,
        data: helpData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取帮助失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};
