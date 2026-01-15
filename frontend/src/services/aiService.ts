import apiClient from './api';

export interface AIChatRequest {
  message: string;
}

export interface AIChatResponse {
  userMessage: string;
  assistantMessage: string;
  suggestions?: string[];
  confidence?: number;
  timestamp: string;
}

export interface HelpData {
  capabilities: string[];
  commands: Array<{
    command: string;
    description: string;
  }>;
}

export const aiService = {
  // 获取 AI 响应
  chat: (message: string) =>
    apiClient.post<AIChatResponse>('/ai/chat', { message }),

  // 获取对话历史
  getHistory: () =>
    apiClient.get<any[]>('/ai/history'),

  // 获取智能建议
  getSuggestions: (context?: string) =>
    apiClient.get<string[]>('/ai/suggestions', { params: { context } }),

  // 获取帮助信息
  getHelp: () =>
    apiClient.get<HelpData>('/ai/help'),
};
