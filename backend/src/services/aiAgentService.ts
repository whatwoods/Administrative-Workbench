import { LLMService } from './llmService.js';
import { TodoService } from './todoService.js';
import { ExpenseService } from './expenseService.js';
import { NoteService } from './noteService.js';
import { WeatherService } from './weatherService.js';

// =============================================================================
// 工具定义
// =============================================================================

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description?: string;
            enum?: string[];
        }>;
        required?: string[];
    };
}

export const AGENT_TOOLS: ToolDefinition[] = [
    {
        name: 'createTodo',
        description: '创建一个新的待办任务。当用户要求创建任务、添加待办事项、设置提醒时调用此工具。',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: '任务标题' },
                description: { type: 'string', description: '任务描述（可选）' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'], description: '优先级' },
                dueDate: { type: 'string', description: 'ISO 8601 日期格式，如 2026-01-16T15:00:00' },
                category: { type: 'string', enum: ['work', 'daily', 'study', 'other'], description: '分类' }
            },
            required: ['title']
        }
    },
    {
        name: 'createExpense',
        description: '记录一笔费用支出。当用户提到花钱、消费、支出、记账时调用此工具。',
        parameters: {
            type: 'object',
            properties: {
                amount: { type: 'number', description: '金额（元）' },
                category: { type: 'string', enum: ['food', 'transport', 'shopping', 'entertainment', 'utilities', 'other'], description: '费用分类' },
                description: { type: 'string', description: '费用描述' },
                date: { type: 'string', description: 'ISO 8601 日期格式' }
            },
            required: ['amount', 'category']
        }
    },
    {
        name: 'searchNotes',
        description: '在用户的笔记库中搜索相关内容。当用户询问之前记录的信息、查找笔记时调用。',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: '搜索关键词或问题' }
            },
            required: ['query']
        }
    },
    {
        name: 'createNote',
        description: '创建一条新笔记。当用户要求记录信息、保存内容时调用。',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: '笔记标题' },
                content: { type: 'string', description: '笔记内容（支持 Markdown）' },
                tags: { type: 'string', description: '标签，用逗号分隔' }
            },
            required: ['title', 'content']
        }
    },
    {
        name: 'getWeather',
        description: '查询天气信息。当用户询问天气、是否需要带伞等问题时调用。',
        parameters: {
            type: 'object',
            properties: {
                city: { type: 'string', description: '城市名称，如"杭州"' }
            },
            required: ['city']
        }
    },
    {
        name: 'getTodoList',
        description: '获取用户的待办任务列表。当用户询问有哪些任务、今天的任务等问题时调用。',
        parameters: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['pending', 'completed', 'all'], description: '任务状态筛选' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'], description: '优先级筛选' }
            },
            required: []
        }
    },
    {
        name: 'getExpenseStats',
        description: '获取用户的费用统计信息。当用户询问花了多少钱、支出统计时调用。',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'extractActionItems',
        description: '从一段文本中提取待办事项。当用户粘贴会议记录或长文本并要求整理任务时调用。',
        parameters: {
            type: 'object',
            properties: {
                text: { type: 'string', description: '需要分析的文本内容' }
            },
            required: ['text']
        }
    },
    {
        name: 'polishText',
        description: '润色和改写文本。当用户要求润色邮件、改写文案时调用。',
        parameters: {
            type: 'object',
            properties: {
                text: { type: 'string', description: '需要润色的原始文本' },
                style: { type: 'string', enum: ['formal', 'casual', 'business_email', 'report'], description: '目标风格' }
            },
            required: ['text']
        }
    },
    {
        name: 'batchPostponeTodos',
        description: '批量推迟任务。当用户说"把低优先级任务都推迟"、"推迟本周任务"时调用。',
        parameters: {
            type: 'object',
            properties: {
                priority: { type: 'string', enum: ['high', 'medium', 'low', 'all'], description: '要推迟的任务优先级筛选' },
                days: { type: 'number', description: '推迟天数' }
            },
            required: ['days']
        }
    },
    {
        name: 'getDailyBriefing',
        description: '生成每日简报。当用户询问"今日简报"、"今天有什么安排"时调用。',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'analyzeExpenseAnomalies',
        description: '分析支出异常。当用户询问"有没有异常消费"、"支出是否正常"时调用。',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'askKnowledgeBase',
        description: '基于笔记知识库回答问题。当用户问"我之前记的XXX是什么"、需要从笔记中查找信息时调用。',
        parameters: {
            type: 'object',
            properties: {
                question: { type: 'string', description: '用户的问题' }
            },
            required: ['question']
        }
    }
];

// =============================================================================
// 工具执行器
// =============================================================================

interface ToolResult {
    success: boolean;
    type: string;
    data?: any;
    message?: string;
}

const toolExecutors: Record<string, (params: any, userId: string) => Promise<ToolResult>> = {
    createTodo: async (params, userId) => {
        try {
            const todo = await TodoService.create(userId, {
                title: params.title,
                description: params.description,
                priority: params.priority || 'medium',
                dueDate: params.dueDate,
                category: params.category || 'daily'
            });
            return {
                success: true,
                type: 'todo_created',
                data: todo,
                message: `已创建任务: "${todo.title}"`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    createExpense: async (params, userId) => {
        try {
            const expense = await ExpenseService.create(userId, {
                amount: params.amount,
                category: params.category,
                description: params.description || '',
                date: params.date
            });
            return {
                success: true,
                type: 'expense_created',
                data: expense,
                message: `已记录费用: ¥${expense.amount} (${expense.category})`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    searchNotes: async (params, userId) => {
        try {
            const results = await NoteService.search(userId, params.query);
            return {
                success: true,
                type: 'notes_found',
                data: results,
                message: `找到 ${results.length} 条相关笔记`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    createNote: async (params, userId) => {
        try {
            const tags = params.tags ? params.tags.split(',').map((t: string) => t.trim()) : [];
            const note = await NoteService.create(userId, {
                title: params.title,
                content: params.content,
                tags
            });
            return {
                success: true,
                type: 'note_created',
                data: note,
                message: `已创建笔记: "${note.title}"`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    getWeather: async (params, _userId) => {
        try {
            const weather = await WeatherService.getWeatherByCity(params.city);
            return {
                success: true,
                type: 'weather_info',
                data: weather,
                message: `${params.city}天气信息已获取`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    getTodoList: async (params, userId) => {
        try {
            const filters: any = {};
            if (params.status && params.status !== 'all') {
                filters.status = params.status;
            }
            if (params.priority) {
                filters.priority = params.priority;
            }
            const todos = await TodoService.getAll(userId, filters);
            return {
                success: true,
                type: 'todo_list',
                data: todos,
                message: `共有 ${todos.length} 个任务`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    getExpenseStats: async (_params, userId) => {
        try {
            const stats = await ExpenseService.getStats(userId);
            return {
                success: true,
                type: 'expense_stats',
                data: stats,
                message: `本月支出: ¥${stats.monthlyTotal.toFixed(2)}`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    extractActionItems: async (params, _userId) => {
        try {
            const prompt = `请从以下文本中提取所有可执行的待办事项，每个任务单独一行，格式为 "- [ ] 任务内容"：

${params.text}

只输出任务列表，不要其他说明。`;
            const response = await LLMService.chat([{ role: 'user', content: prompt }]);
            return {
                success: true,
                type: 'action_items',
                data: { actionItems: response.content },
                message: '已提取待办事项'
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    polishText: async (params, _userId) => {
        try {
            const styleMap: Record<string, string> = {
                formal: '正式的书面语',
                casual: '轻松活泼的口语',
                business_email: '专业的商务邮件格式',
                report: '严谨的报告格式'
            };
            const styleDesc = styleMap[params.style] || '专业的';

            const prompt = `请将以下文本润色为${styleDesc}风格，保持原意不变：

${params.text}

只输出润色后的文本，不要其他说明。`;
            const response = await LLMService.chat([{ role: 'user', content: prompt }]);
            return {
                success: true,
                type: 'polished_text',
                data: { original: params.text, polished: response.content },
                message: '文本润色完成'
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    batchPostponeTodos: async (params, userId) => {
        try {
            const filters: any = { status: 'pending' };
            if (params.priority && params.priority !== 'all') {
                filters.priority = params.priority;
            }

            const todos = await TodoService.getAll(userId, filters);
            const days = params.days || 7;
            let postponedCount = 0;

            for (const todo of todos) {
                if (todo.dueDate) {
                    const oldDate = new Date(todo.dueDate);
                    const newDate = new Date(oldDate.getTime() + days * 24 * 60 * 60 * 1000);
                    await TodoService.update(todo.id || (todo as any)._id, userId, {
                        dueDate: newDate.toISOString()
                    });
                    postponedCount++;
                }
            }

            return {
                success: true,
                type: 'todos_postponed',
                data: { postponedCount, days },
                message: `已将 ${postponedCount} 个任务推迟 ${days} 天`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    getDailyBriefing: async (_params, userId) => {
        try {
            // 获取今日数据
            const todos = await TodoService.getAll(userId, { status: 'pending' });
            const expenseStats = await ExpenseService.getStats(userId);

            let weatherSummary = '';
            try {
                const weather = await WeatherService.getWeatherByCity('杭州'); // 默认城市
                weatherSummary = weather.summary;
            } catch (e) {
                weatherSummary = '天气信息获取失败';
            }

            // 统计任务
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const dueTodayTodos = todos.filter(t => t.dueDate?.startsWith(todayStr));
            const highPriorityTodos = todos.filter(t => t.priority === 'high');
            const overdueTodos = todos.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status === 'pending');

            // 生成简报
            const briefingPrompt = `请根据以下数据生成一份简洁友好的每日简报（3-5行）：

📋 待办任务: 共 ${todos.length} 个未完成
  - 今日截止: ${dueTodayTodos.length} 个
  - 高优先级: ${highPriorityTodos.length} 个
  - 已逾期: ${overdueTodos.length} 个

💰 本月支出: ¥${expenseStats.monthlyTotal.toFixed(2)}

🌤️ 天气: ${weatherSummary}

请用亲切的口吻总结，并给出1-2条建议。`;

            const response = await LLMService.chat([{ role: 'user', content: briefingPrompt }]);

            return {
                success: true,
                type: 'daily_briefing',
                data: {
                    todoCount: todos.length,
                    dueTodayCount: dueTodayTodos.length,
                    highPriorityCount: highPriorityTodos.length,
                    overdueCount: overdueTodos.length,
                    monthlyExpense: expenseStats.monthlyTotal,
                    weather: weatherSummary,
                    briefing: response.content
                },
                message: '今日简报已生成'
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    analyzeExpenseAnomalies: async (_params, userId) => {
        try {
            const stats = await ExpenseService.getStats(userId);
            const allExpenses = await ExpenseService.getAll(userId, {});

            // 计算各类别平均值
            const categoryAvg: Record<string, { avg: number; count: number }> = {};
            for (const stat of stats.categoryStats) {
                categoryAvg[stat._id] = {
                    avg: stat.total / stat.count,
                    count: stat.count
                };
            }

            // 找出异常（超过平均值2倍的单笔）
            const anomalies = allExpenses.filter(exp => {
                const catAvg = categoryAvg[exp.category]?.avg;
                return catAvg && exp.amount > catAvg * 2;
            }).slice(0, 5);

            // 使用 LLM 分析
            const analysisPrompt = `请分析以下消费情况，给出简洁的建议（2-3行）：

本月总支出: ¥${stats.monthlyTotal.toFixed(2)}
分类统计:
${stats.categoryStats.map((s: any) => `- ${s._id}: ¥${s.total.toFixed(2)} (${s.count}笔)`).join('\n')}

${anomalies.length > 0 ? `
可能的异常消费:
${anomalies.map(a => `- ¥${a.amount} ${a.category} ${a.description || ''}`).join('\n')}
` : '暂无明显异常消费。'}

请给出分析和建议。`;

            const response = await LLMService.chat([{ role: 'user', content: analysisPrompt }]);

            return {
                success: true,
                type: 'expense_analysis',
                data: {
                    monthlyTotal: stats.monthlyTotal,
                    categoryStats: stats.categoryStats,
                    anomalies,
                    analysis: response.content
                },
                message: anomalies.length > 0 ? `发现 ${anomalies.length} 笔可能的异常消费` : '消费情况正常'
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    },

    askKnowledgeBase: async (params, userId) => {
        try {
            // 语义搜索笔记
            const searchResults = await NoteService.search(userId, params.question);

            if (searchResults.length === 0) {
                return {
                    success: true,
                    type: 'knowledge_answer',
                    data: { answer: '抱歉，在您的笔记中没有找到相关信息。', sources: [] },
                    message: '未找到相关笔记'
                };
            }

            // 使用 RAG 回答
            const context = searchResults.slice(0, 3).map((note, i) =>
                `[笔记${i + 1}] ${note.title}\n${note.content}`
            ).join('\n\n---\n\n');

            const ragPrompt = `请根据以下笔记内容回答用户问题。如果笔记中没有相关信息，就说"笔记中没有相关记录"。

用户问题: ${params.question}

参考笔记:
${context}

请给出简洁准确的回答，并指出信息来源于哪条笔记。`;

            const response = await LLMService.chat([{ role: 'user', content: ragPrompt }]);

            return {
                success: true,
                type: 'knowledge_answer',
                data: {
                    answer: response.content,
                    sources: searchResults.slice(0, 3).map(n => ({ id: n.id, title: n.title }))
                },
                message: `基于 ${Math.min(3, searchResults.length)} 条笔记回答`
            };
        } catch (error: any) {
            return { success: false, type: 'error', message: error.message };
        }
    }
};

// =============================================================================
// AI Agent 服务
// =============================================================================

interface AgentResponse {
    message: string;
    toolCalls?: Array<{
        toolName: string;
        result: ToolResult;
    }>;
    suggestions?: string[];
    timestamp: string;
}

// Agent 系统提示词
const AGENT_SYSTEM_PROMPT = `你是 Administrative Workbench 的智能助手，可以帮助用户管理任务、追踪费用、记录笔记和查询天气。

你拥有以下工具能力：
${AGENT_TOOLS.map(t => `- ${t.name}: ${t.description}`).join('\n')}

当用户的请求需要执行具体操作时，你必须按照以下 JSON 格式回复，以便系统调用工具：
\`\`\`json
{
  "thinking": "你的思考过程",
  "tool_calls": [
    {
      "tool": "工具名称",
      "params": { 参数对象 }
    }
  ]
}
\`\`\`

如果用户的请求不需要调用工具（如闲聊、询问你的能力等），直接用自然语言回复即可，不要使用 JSON 格式。

注意事项：
1. 准确理解用户意图，选择合适的工具
2. 从用户的自然语言中提取正确的参数
3. 日期参数使用 ISO 8601 格式
4. 如果信息不足，可以先询问用户
5. 可以一次调用多个工具
6. 回复要简洁友好`;

export class AIAgentService {
    /**
     * 执行 Agent 对话
     */
    static async execute(
        userMessage: string,
        userId: string,
        history: Array<{ role: 'user' | 'assistant'; content: string }> = []
    ): Promise<AgentResponse> {
        const timestamp = new Date().toISOString();

        // 构建消息历史
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: AGENT_SYSTEM_PROMPT },
            ...history.slice(-10), // 保留最近 10 条
            { role: 'user', content: userMessage }
        ];

        try {
            // 调用 LLM
            const llmResponse = await LLMService.chat(messages, { temperature: 0.3 });
            const responseText = llmResponse.content;

            // 尝试解析工具调用
            const toolCalls = this.parseToolCalls(responseText);

            if (toolCalls.length > 0) {
                // 执行工具调用
                const results: Array<{ toolName: string; result: ToolResult }> = [];

                for (const call of toolCalls) {
                    const executor = toolExecutors[call.tool];
                    if (executor) {
                        const result = await executor(call.params, userId);
                        results.push({ toolName: call.tool, result });
                    } else {
                        results.push({
                            toolName: call.tool,
                            result: { success: false, type: 'error', message: `未知工具: ${call.tool}` }
                        });
                    }
                }

                // 生成最终回复
                const summaryPrompt = this.buildSummaryPrompt(userMessage, results);
                const summaryResponse = await LLMService.chat([
                    { role: 'system', content: '你是一个友好的助手，请根据工具执行结果给用户一个简洁的回复。' },
                    { role: 'user', content: summaryPrompt }
                ], { temperature: 0.7 });

                return {
                    message: summaryResponse.content,
                    toolCalls: results,
                    suggestions: this.generateSuggestions(results),
                    timestamp
                };
            } else {
                // 普通对话，直接返回 LLM 响应
                return {
                    message: responseText,
                    suggestions: ['创建任务', '记录费用', '查询天气'],
                    timestamp
                };
            }
        } catch (error: any) {
            console.error('Agent execution error:', error);
            return {
                message: `抱歉，处理您的请求时出现错误: ${error.message}`,
                timestamp
            };
        }
    }

    /**
     * 解析 LLM 响应中的工具调用
     */
    private static parseToolCalls(responseText: string): Array<{ tool: string; params: any }> {
        try {
            // 尝试提取 JSON 块
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
                    return parsed.tool_calls;
                }
            }

            // 尝试直接解析整个响应为 JSON
            if (responseText.trim().startsWith('{')) {
                const parsed = JSON.parse(responseText);
                if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
                    return parsed.tool_calls;
                }
            }
        } catch (e) {
            // 解析失败，说明是普通文本回复
        }

        return [];
    }

    /**
     * 构建工具执行结果的总结提示
     */
    private static buildSummaryPrompt(
        userMessage: string,
        results: Array<{ toolName: string; result: ToolResult }>
    ): string {
        const resultSummary = results.map(r => {
            if (r.result.success) {
                return `✅ ${r.toolName}: ${r.result.message}`;
            } else {
                return `❌ ${r.toolName}: ${r.result.message}`;
            }
        }).join('\n');

        return `用户请求: "${userMessage}"

执行结果:
${resultSummary}

请给用户一个简洁友好的回复，确认操作结果。如果有失败的操作，说明原因并提供建议。`;
    }

    /**
     * 根据工具执行结果生成建议
     */
    private static generateSuggestions(
        results: Array<{ toolName: string; result: ToolResult }>
    ): string[] {
        const suggestions: string[] = [];

        for (const r of results) {
            if (r.result.success) {
                switch (r.result.type) {
                    case 'todo_created':
                        suggestions.push('查看我的任务', '创建更多任务');
                        break;
                    case 'expense_created':
                        suggestions.push('查看支出统计', '记录更多费用');
                        break;
                    case 'note_created':
                        suggestions.push('搜索我的笔记', '创建更多笔记');
                        break;
                    case 'weather_info':
                        suggestions.push('查看其他城市天气', '今天需要带伞吗');
                        break;
                }
            }
        }

        return [...new Set(suggestions)].slice(0, 3);
    }
}
