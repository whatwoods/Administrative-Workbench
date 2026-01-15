import apiClient from '@/shared/services/api';

export interface ChatResponse {
    assistantMessage: string;
    suggestions: string[];
    timestamp: string;
}

export interface ToolCallResult {
    toolName: string;
    result: {
        success: boolean;
        type: string;
        data?: any;
        message?: string;
    };
}

export interface AgentChatResponse {
    userMessage: string;
    assistantMessage: string;
    toolCalls?: ToolCallResult[];
    suggestions?: string[];
    timestamp: string;
}

export const aiService = {
    // 简单对话模式
    chat: (message: string, history?: Array<{ role: string; content: string }>) =>
        apiClient.post<ChatResponse>('/ai/chat', { message, history }),

    // Agent 模式（支持工具调用）
    agentChat: (message: string, history?: Array<{ role: string; content: string }>) =>
        apiClient.post<AgentChatResponse>('/ai/agent', { message, history }),

    // 获取建议
    getSuggestions: (context: string) =>
        apiClient.get<string[]>(`/ai/suggestions?context=${context}`),

    // 获取帮助信息
    getHelp: () =>
        apiClient.get<{
            capabilities: string[];
            commands: Array<{ command: string; description: string }>;
            tools: Array<{ name: string; description: string }>;
        }>('/ai/help'),
};

