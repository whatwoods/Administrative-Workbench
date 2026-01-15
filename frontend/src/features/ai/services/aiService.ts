import apiClient from '@/shared/services/api';

export interface ChatResponse {
    assistantMessage: string;
    suggestions: string[];
    timestamp: string;
}

export const aiService = {
    chat: (message: string) =>
        apiClient.post<ChatResponse>('/ai/chat', { message }),

    getSuggestions: (context: string) =>
        apiClient.get<string[]>(`/ai/suggestions?context=${context}`),
};
