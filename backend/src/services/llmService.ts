import axios from 'axios';

// LLM 提供商类型
type LLMProvider = 'tencent' | 'siliconflow';

// 消息格式
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// LLM 响应格式
interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// 提供商配置
const providerConfigs: Record<LLMProvider, { baseUrl: string; defaultModel: string }> = {
    tencent: {
        baseUrl: 'https://cloud1-2g6qhjm0439405a7.api.tcloudbasegateway.com/v1/ai/deepseek',
        defaultModel: 'deepseek-v3.2',
    },
    siliconflow: {
        baseUrl: 'https://api.siliconflow.cn/v1',
        defaultModel: 'deepseek-ai/DeepSeek-V3.2',
    },
};

// 获取当前配置
const getConfig = () => {
    const provider = (process.env.LLM_PROVIDER || 'tencent') as LLMProvider;
    const apiKey = process.env.LLM_API_KEY || '';
    const model = process.env.LLM_MODEL || providerConfigs[provider].defaultModel;
    const baseUrl = providerConfigs[provider].baseUrl;

    return { provider, apiKey, model, baseUrl };
};

// 系统提示词
const SYSTEM_PROMPT = `你是 Administrative Workbench 的智能助手，专门帮助用户管理任务、追踪费用、记录笔记和查询天气。

你的能力包括：
- 任务管理：帮助用户创建、编辑和分析任务
- 费用追踪：帮助记录和分析支出
- 笔记管理：帮助创建和组织笔记
- 天气查询：提供天气预报和健康建议
- 数据分析：生成统计报告

请用简洁、友好的中文回答用户问题。如果用户的请求涉及具体操作，请明确告诉用户你可以帮助他们完成什么。`;

/**
 * LLM 服务类
 */
export class LLMService {
    /**
     * 发送聊天请求
     */
    static async chat(messages: ChatMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<LLMResponse> {
        const config = getConfig();

        if (!config.apiKey) {
            // 无 API Key 时返回模拟响应
            return this.getMockResponse(messages);
        }

        const allMessages: ChatMessage[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
        ];

        try {
            const response = await axios.post(
                `${config.baseUrl}/chat/completions`,
                {
                    model: config.model,
                    messages: allMessages,
                    max_tokens: options?.maxTokens || 1024,
                    temperature: options?.temperature || 0.7,
                    stream: false,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${config.apiKey}`,
                    },
                    timeout: 30000,
                }
            );

            const choice = response.data.choices?.[0];
            const usage = response.data.usage;

            return {
                content: choice?.message?.content || '抱歉，我无法生成回复。',
                usage: usage ? {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens,
                } : undefined,
            };
        } catch (error: any) {
            console.error('LLM API Error:', error.response?.data || error.message);

            // 发生错误时返回友好的错误消息
            throw new Error(`AI 服务暂时不可用: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * 简单对话（单条用户消息）
     */
    static async ask(userMessage: string): Promise<LLMResponse> {
        return this.chat([{ role: 'user', content: userMessage }]);
    }

    /**
     * 获取文本向量 (Embeddings)
     */
    static async getEmbeddings(texts: string[]): Promise<number[][]> {
        const config = getConfig();

        if (!config.apiKey || config.provider !== 'siliconflow') {
            // 目前仅 SiliconFlow 支持向量 API，或者模拟返回空向量
            console.warn('Embedding API only supported on SiliconFlow or API key missing.');
            return texts.map(() => []);
        }

        try {
            const response = await axios.post(
                `${config.baseUrl}/embeddings`,
                {
                    model: 'BAAI/bge-m3', // 固定使用 BGE-M3
                    input: texts,
                    encoding_format: 'float'
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${config.apiKey}`,
                    },
                    timeout: 30000,
                }
            );

            return response.data.data.map((item: any) => item.embedding);
        } catch (error: any) {
            console.error('Embedding API Error:', error.response?.data || error.message);
            throw new Error(`Embedding 服务暂时不可用: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * 重排序 (Rerank)
     */
    static async rerank(query: string, documents: string[], topN: number = 5): Promise<{ index: number; relevance_score: number }[]> {
        const config = getConfig();

        if (!config.apiKey || config.provider !== 'siliconflow') {
            console.warn('Rerank API only supported on SiliconFlow or API key missing.');
            return documents.map((_, index) => ({ index, relevance_score: 0 })).slice(0, topN);
        }

        try {
            const response = await axios.post(
                `${config.baseUrl}/rerank`,
                {
                    model: 'BAAI/bge-reranker-v2-m3',
                    query: query,
                    documents: documents,
                    top_n: topN,
                    return_documents: false
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${config.apiKey}`,
                    },
                    timeout: 30000,
                }
            );

            return response.data.results;
        } catch (error: any) {
            console.error('Rerank API Error:', error.response?.data || error.message);
            throw new Error(`Rerank 服务暂时不可用: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * 模拟响应（无 API Key 时使用）
     */
    private static getMockResponse(messages: ChatMessage[]): LLMResponse {
        const lastMessage = messages[messages.length - 1]?.content || '';
        const lowerMessage = lastMessage.toLowerCase();

        let content = '您好！我是 Administrative Workbench 的 AI 助手。';

        if (lowerMessage.includes('任务') || lowerMessage.includes('todo')) {
            content = '我可以帮您管理任务。您可以创建新任务、设置优先级、查看待办事项。请问具体需要什么帮助？';
        } else if (lowerMessage.includes('费用') || lowerMessage.includes('支出')) {
            content = '我可以帮您追踪费用。您可以记录新支出、查看统计数据、分析消费趋势。请问具体需要什么帮助？';
        } else if (lowerMessage.includes('笔记') || lowerMessage.includes('便签')) {
            content = '我可以帮您管理笔记。您可以创建新笔记、搜索内容、整理标签。请问具体需要什么帮助？';
        } else if (lowerMessage.includes('天气')) {
            content = '我可以为您查询天气信息，包括当前天气、7天预报和生活指数。请问您想了解哪个城市的天气？';
        }

        return {
            content: content + '\n\n*（注意：当前使用模拟响应，请配置 LLM_API_KEY 以启用真实 AI 服务）*',
        };
    }
}
