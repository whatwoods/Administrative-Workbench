import { Request, Response } from 'express';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  confidence?: number;
}

// 简单的 AI 响应生成器（实际应用中应使用真实的 AI 服务）
const generateAIResponse = (userMessage: string): AIResponse => {
  const lowerMessage = userMessage.toLowerCase();

  // 任务相关
  if (lowerMessage.includes('任务') || lowerMessage.includes('todo')) {
    return {
      message: '根据您的信息，我建议为您创建一个新的任务。您想为这个任务设置优先级吗？',
      suggestions: ['高优先级', '中等优先级', '低优先级', '不设置'],
      confidence: 0.85,
    };
  }

  // 费用相关
  if (lowerMessage.includes('费用') || lowerMessage.includes('支出') || lowerMessage.includes('expense')) {
    return {
      message: '我看到您提到了支出。我可以帮您记录、分类或分析支出。您需要什么帮助？',
      suggestions: ['记录新支出', '查看统计数据', '按类别分析', '设置预算'],
      confidence: 0.88,
    };
  }

  // 笔记相关
  if (lowerMessage.includes('笔记') || lowerMessage.includes('便签') || lowerMessage.includes('note')) {
    return {
      message: '我可以帮您创建、编辑或查找笔记。您想做什么？',
      suggestions: ['创建新笔记', '搜索笔记', '查看最近的笔记', '整理标签'],
      confidence: 0.80,
    };
  }

  // 天气相关
  if (lowerMessage.includes('天气') || lowerMessage.includes('weather')) {
    return {
      message: '我可以为您提供天气信息、预报和健康建议。您想了解什么？',
      suggestions: ['当前天气', '7天预报', '节气信息', '健康指数'],
      confidence: 0.82,
    };
  }

  // 统计/分析相关
  if (lowerMessage.includes('统计') || lowerMessage.includes('分析') || lowerMessage.includes('数据')) {
    return {
      message: '我可以帮您分析各种数据和趋势。您想分析什么方面的信息？',
      suggestions: ['费用分析', '任务完成率', '时间统计', '趋势分析'],
      confidence: 0.79,
    };
  }

  // 日程/计划相关
  if (lowerMessage.includes('日程') || lowerMessage.includes('计划') || lowerMessage.includes('安排')) {
    return {
      message: '我可以帮您规划日程和管理计划。您需要什么帮助？',
      suggestions: ['创建日程', '查看日程', '设置提醒', '规划周计划'],
      confidence: 0.81,
    };
  }

  // 提醒/通知相关
  if (lowerMessage.includes('提醒') || lowerMessage.includes('通知') || lowerMessage.includes('reminder')) {
    return {
      message: '我可以为您设置提醒和通知。您想设置什么提醒？',
      suggestions: ['任务提醒', '费用提醒', '日期提醒', '定期提醒'],
      confidence: 0.83,
    };
  }

  // 生产力/效率相关
  if (lowerMessage.includes('效率') || lowerMessage.includes('生产力') || lowerMessage.includes('productivity')) {
    return {
      message: '我可以帮您提高生产力和工作效率。以下是一些建议：',
      suggestions: ['优化任务管理', '减少时间浪费', '制定工作计划', '建立习惯'],
      confidence: 0.75,
    };
  }

  // 默认响应
  return {
    message: `感谢您的提问：「${userMessage}」。我是您的 AI 助手，可以帮助您管理任务、追踪费用、记录笔记等。有什么我可以帮助您的吗？`,
    suggestions: ['任务管理', '费用追踪', '笔记整理', '天气查询', '数据分析'],
    confidence: 0.70,
  };
};

export const aiController = {
  // 获取 AI 响应
  getResponse: (req: Request, res: Response) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: '请提供有效的消息内容',
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          message: '消息过长，请保持在 1000 字符以内',
        });
      }

      const response = generateAIResponse(message);

      res.json({
        success: true,
        data: {
          userMessage: message,
          assistantMessage: response.message,
          suggestions: response.suggestions,
          confidence: response.confidence,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取 AI 响应失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // 获取对话历史
  getConversationHistory: (req: Request, res: Response) => {
    try {
      // 这是一个演示实现，实际应用中应从数据库获取
      const mockHistory: ConversationMessage[] = [
        {
          role: 'assistant',
          content: '您好！我是您的 AI 助手。有什么我可以帮助您的吗？',
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
  getSuggestions: (req: Request, res: Response) => {
    try {
      const { context } = req.query;

      const suggestions = {
        task: [
          '根据优先级整理您的任务列表',
          '完成已逾期的任务',
          '为下周规划任务',
        ],
        expense: [
          '这个月的支出已经超过预算 20%',
          '分析一下您的支出分类',
          '考虑减少娱乐类支出',
        ],
        note: [
          '整理您的笔记标签',
          '查看最常使用的笔记类型',
          '创建一个知识库索引',
        ],
        general: [
          '检查今天的日程',
          '查看您的数据统计',
          '整理您的导航项',
          '更新您的个人设置',
        ],
      };

      const response = suggestions[context as keyof typeof suggestions] || suggestions.general;

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
          '任务管理：创建、编辑、分析您的任务',
          '费用追踪：记录和分析您的支出',
          '笔记管理：创建和组织笔记',
          '天气查询：获取天气预报和健康建议',
          '数据分析：生成统计报告和趋势分析',
          '日程规划：帮助您规划日程和时间',
        ],
        commands: [
          { command: '创建任务', description: '帮助您创建新的任务' },
          { command: '查看统计', description: '显示各项数据的统计信息' },
          { command: '天气预报', description: '获取天气和节气信息' },
          { command: '分析支出', description: '分析费用和支出趋势' },
          { command: '笔记搜索', description: '搜索和查找笔记' },
        ],
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
