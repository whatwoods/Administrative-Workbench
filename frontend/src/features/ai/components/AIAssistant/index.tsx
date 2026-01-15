import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Trash2, Download, Zap, MessageSquare, CheckCircle, XCircle, Mic } from 'lucide-react';
import { aiService, ToolCallResult } from '../../services/aiService';
import './styles.css';

// =============================================================================
// Types
// =============================================================================

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    suggestions?: string[];
    toolCalls?: ToolCallResult[];
    timestamp: string;
}

// =============================================================================
// Tool Card Components
// =============================================================================

const TodoCard: React.FC<{ data: any }> = ({ data }) => (
    <div className="tool-card tool-card-todo">
        <div className="tool-card-header">
            <CheckCircle size={16} />
            <span>任务已创建</span>
        </div>
        <div className="tool-card-body">
            <h4>{data.title}</h4>
            {data.description && <p>{data.description}</p>}
            <div className="tool-card-meta">
                {data.priority && <span className={`priority priority-${data.priority}`}>{data.priority}</span>}
                {data.dueDate && <span className="due-date">📅 {new Date(data.dueDate).toLocaleDateString()}</span>}
            </div>
        </div>
    </div>
);

const ExpenseCard: React.FC<{ data: any }> = ({ data }) => (
    <div className="tool-card tool-card-expense">
        <div className="tool-card-header">
            <span>💰 费用已记录</span>
        </div>
        <div className="tool-card-body">
            <h4>¥{data.amount}</h4>
            <p>{data.category} {data.description && `- ${data.description}`}</p>
        </div>
    </div>
);

const WeatherCard: React.FC<{ data: any }> = ({ data }) => (
    <div className="tool-card tool-card-weather">
        <div className="tool-card-header">
            <span>🌤️ 天气信息</span>
        </div>
        <div className="tool-card-body">
            {data.current && (
                <div className="weather-current">
                    <h4>{data.current.location}</h4>
                    <p className="weather-temp">{data.current.temp}°C</p>
                    <p>{data.current.condition}</p>
                </div>
            )}
            {data.summary && <p className="weather-summary">{data.summary}</p>}
        </div>
    </div>
);

const StatsCard: React.FC<{ data: any }> = ({ data }) => (
    <div className="tool-card tool-card-stats">
        <div className="tool-card-header">
            <span>📊 统计信息</span>
        </div>
        <div className="tool-card-body">
            <h4>本月支出: ¥{data.monthlyTotal?.toFixed(2) || 0}</h4>
            {data.categoryStats && data.categoryStats.length > 0 && (
                <ul className="stats-list">
                    {data.categoryStats.slice(0, 5).map((stat: any, idx: number) => (
                        <li key={idx}>{stat._id}: ¥{stat.total.toFixed(2)} ({stat.count}笔)</li>
                    ))}
                </ul>
            )}
        </div>
    </div>
);

const NoteCard: React.FC<{ data: any }> = ({ data }) => (
    <div className="tool-card tool-card-note">
        <div className="tool-card-header">
            <span>📝 笔记已创建</span>
        </div>
        <div className="tool-card-body">
            <h4>{data.title}</h4>
            <p>{data.content?.slice(0, 100)}{data.content?.length > 100 ? '...' : ''}</p>
        </div>
    </div>
);

const SearchResultsCard: React.FC<{ data: any[] }> = ({ data }) => (
    <div className="tool-card tool-card-search">
        <div className="tool-card-header">
            <span>🔍 搜索结果</span>
        </div>
        <div className="tool-card-body">
            {data.length === 0 ? (
                <p>未找到相关笔记</p>
            ) : (
                <ul className="search-results">
                    {data.slice(0, 3).map((note: any, idx: number) => (
                        <li key={idx}>
                            <strong>{note.title}</strong>
                            <p>{note.content?.slice(0, 50)}...</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
);

const TodoListCard: React.FC<{ data: any[] }> = ({ data }) => (
    <div className="tool-card tool-card-todolist">
        <div className="tool-card-header">
            <span>📋 任务列表</span>
        </div>
        <div className="tool-card-body">
            {data.length === 0 ? (
                <p>暂无任务</p>
            ) : (
                <ul className="todo-list">
                    {data.slice(0, 5).map((todo: any, idx: number) => (
                        <li key={idx} className={`todo-item priority-${todo.priority}`}>
                            <span className={`status status-${todo.status}`}>
                                {todo.status === 'completed' ? '✓' : '○'}
                            </span>
                            {todo.title}
                        </li>
                    ))}
                    {data.length > 5 && <li className="more">...还有 {data.length - 5} 个任务</li>}
                </ul>
            )}
        </div>
    </div>
);

// Tool call result renderer
const ToolCallCard: React.FC<{ toolCall: ToolCallResult }> = ({ toolCall }) => {
    const { result } = toolCall;

    if (!result.success) {
        return (
            <div className="tool-card tool-card-error">
                <div className="tool-card-header">
                    <XCircle size={16} />
                    <span>操作失败</span>
                </div>
                <div className="tool-card-body">
                    <p>{result.message}</p>
                </div>
            </div>
        );
    }

    switch (result.type) {
        case 'todo_created':
            return <TodoCard data={result.data} />;
        case 'expense_created':
            return <ExpenseCard data={result.data} />;
        case 'weather_info':
            return <WeatherCard data={result.data} />;
        case 'expense_stats':
            return <StatsCard data={result.data} />;
        case 'note_created':
            return <NoteCard data={result.data} />;
        case 'notes_found':
            return <SearchResultsCard data={result.data} />;
        case 'todo_list':
            return <TodoListCard data={result.data} />;
        case 'todos_postponed':
            return (
                <div className="tool-card tool-card-todo">
                    <div className="tool-card-header">
                        <span>⏰ 任务已推迟</span>
                    </div>
                    <div className="tool-card-body">
                        <h4>{result.data.postponedCount} 个任务已推迟 {result.data.days} 天</h4>
                    </div>
                </div>
            );
        case 'daily_briefing':
            return (
                <div className="tool-card tool-card-briefing">
                    <div className="tool-card-header">
                        <span>📋 今日简报</span>
                    </div>
                    <div className="tool-card-body">
                        <div className="briefing-stats">
                            <span>📝 待办: {result.data.todoCount}</span>
                            <span>⚠️ 逾期: {result.data.overdueCount}</span>
                            <span>💰 本月: ¥{result.data.monthlyExpense?.toFixed(0)}</span>
                        </div>
                        <p style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{result.data.briefing}</p>
                    </div>
                </div>
            );
        case 'expense_analysis':
            return (
                <div className="tool-card tool-card-stats">
                    <div className="tool-card-header">
                        <span>📊 消费分析</span>
                    </div>
                    <div className="tool-card-body">
                        <h4>本月: ¥{result.data.monthlyTotal?.toFixed(2)}</h4>
                        {result.data.anomalies?.length > 0 && (
                            <div className="anomalies">
                                <p>⚠️ 可能异常:</p>
                                <ul>
                                    {result.data.anomalies.slice(0, 3).map((a: any, i: number) => (
                                        <li key={i}>¥{a.amount} {a.category}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{result.data.analysis}</p>
                    </div>
                </div>
            );
        case 'knowledge_answer':
            return (
                <div className="tool-card tool-card-search">
                    <div className="tool-card-header">
                        <span>📚 知识库回答</span>
                    </div>
                    <div className="tool-card-body">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{result.data.answer}</p>
                        {result.data.sources?.length > 0 && (
                            <div className="sources">
                                <small>来源: {result.data.sources.map((s: any) => s.title).join(', ')}</small>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'action_items':
        case 'polished_text':
            return null; // 这些直接显示在消息文本中
        default:
            return null;
    }
};

// =============================================================================
// Main Component
// =============================================================================

const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agentMode, setAgentMode] = useState(true); // 默认启用 Agent 模式
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const fetchInitialData = async () => {
        try {
            const res = await aiService.getSuggestions('general');
            const welcomeMessage: Message = {
                id: '0',
                role: 'assistant',
                content: '您好！👋 我是您的 AI 助手。我现在可以直接帮您创建任务、记录费用、搜索笔记和查询天气。试试说：\n\n• "帮我创建一个明天要交周报的任务"\n• "记一笔中午吃饭花了25元"\n• "杭州今天天气怎么样"',
                suggestions: res.data,
                timestamp: new Date().toISOString(),
            };
            setMessages([welcomeMessage]);
        } catch (err) {
            console.error('获取初始数据失败:', err);
            // 即使失败也显示欢迎消息
            setMessages([{
                id: '0',
                role: 'assistant',
                content: '您好！👋 我是您的 AI 助手，请问有什么可以帮助您的？',
                timestamp: new Date().toISOString(),
            }]);
        }
    };

    const buildHistory = useCallback(() => {
        return messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
        }));
    }, [messages]);

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const history = buildHistory();

            if (agentMode) {
                // Agent 模式 - 支持工具调用
                const response = await aiService.agentChat(textToSend, history);
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.data.assistantMessage,
                    suggestions: response.data.suggestions,
                    toolCalls: response.data.toolCalls,
                    timestamp: response.data.timestamp,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                // 简单模式
                const response = await aiService.chat(textToSend, history);
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.data.assistantMessage,
                    suggestions: response.data.suggestions,
                    timestamp: response.data.timestamp,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || '发送消息失败，请重试';
            setError(errorMsg);
            console.error('Chat error:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        if (window.confirm('确定要清除所有对话记录吗？')) {
            fetchInitialData();
        }
    };

    const exportChat = () => {
        const chatText = messages
            .map((m) => `[${m.role.toUpperCase()}] ${m.content}`)
            .join('\n\n');
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(chatText)}`);
        element.setAttribute('download', `ai-assistant-${Date.now()}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // 语音输入（如果浏览器支持）
    const startVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('您的浏览器不支持语音输入');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => {
            setIsListening(false);
            setError('语音识别失败，请重试');
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        recognition.start();
    };

    return (
        <div className="ai-assistant">
            <div className="ai-header">
                <h1>🤖 AI 助手</h1>
                <div className="ai-actions">
                    <button
                        onClick={() => setAgentMode(!agentMode)}
                        className={`icon-btn ${agentMode ? 'active' : ''}`}
                        title={agentMode ? 'Agent 模式（可执行操作）' : '简单模式（仅对话）'}
                    >
                        {agentMode ? <Zap size={18} /> : <MessageSquare size={18} />}
                    </button>
                    <button
                        onClick={exportChat}
                        className="icon-btn"
                        title="导出对话"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={clearHistory}
                        className="icon-btn"
                        title="清除历史"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {agentMode && (
                <div className="agent-mode-banner">
                    <Zap size={14} />
                    <span>Agent 模式已启用 - 可直接执行任务、记账、查天气等操作</span>
                </div>
            )}

            <div className="chat-container">
                <div className="messages">
                    {messages.map((message) => (
                        <div key={message.id} className={`message message-${message.role}`}>
                            <div className="message-avatar">
                                {message.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="message-content">
                                <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>

                                {/* 渲染工具调用结果卡片 */}
                                {message.toolCalls && message.toolCalls.length > 0 && (
                                    <div className="tool-calls">
                                        {message.toolCalls.map((tc, idx) => (
                                            <ToolCallCard key={idx} toolCall={tc} />
                                        ))}
                                    </div>
                                )}

                                {message.suggestions && message.suggestions.length > 0 && (
                                    <div className="message-suggestions">
                                        {message.suggestions.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                className="suggestion-btn"
                                                onClick={() => handleSendMessage(suggestion)}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <span className="message-time">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message message-assistant">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                <div className="input-area">
                    <button
                        onClick={startVoiceInput}
                        className={`voice-btn ${isListening ? 'listening' : ''}`}
                        title="语音输入"
                        disabled={loading}
                    >
                        <Mic size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={agentMode ? "输入指令，如：帮我创建一个任务..." : "输入您的问题..."}
                        className="message-input"
                        disabled={loading}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        className="send-btn"
                        disabled={loading || !input.trim()}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
