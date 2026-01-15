import React, { useEffect, useState, useRef } from 'react';
import { Send, Trash2, Download, HelpCircle } from 'lucide-react';
// Assuming aiService is migrated to features/ai/services/aiService.ts
// If not, we might need to fix this import later. 
// For now, I will use the path relative to features/ai/components/AIAssistant/index.tsx
import { aiService } from '../../services/aiService';
import './styles.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    suggestions?: string[];
    timestamp: string;
}

const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchInitialData = async () => {
        try {
            const res = await aiService.getSuggestions('general');
            setSuggestions(res.data);

            // 添加欢迎信息
            const welcomeMessage: Message = {
                id: '0',
                role: 'assistant',
                content: '您好！👋 我是您的 AI 助手。我可以帮助您管理任务、追踪费用、记录笔记等。请问有什么我可以帮助您的吗？',
                suggestions: res.data,
                timestamp: new Date().toISOString(),
            };
            setMessages([welcomeMessage]);
        } catch (err) {
            console.error('获取初始数据失败:', err);
        }
    };

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend) return;

        // 添加用户消息
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
            const response = await aiService.chat(textToSend);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.assistantMessage,
                suggestions: response.data.suggestions,
                timestamp: response.data.timestamp,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            setError('发送消息失败，请重试');
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

    return (
        <div className="ai-assistant">
            <div className="ai-header">
                <h1>🤖 AI 助手</h1>
                <div className="ai-actions">
                    <button
                        onClick={() => setInput('')}
                        className="icon-btn"
                        title="清除输入"
                    >
                        <Trash2 size={18} />
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
                        <HelpCircle size={18} />
                    </button>
                </div>
            </div>

            <div className="chat-container">
                <div className="messages">
                    {messages.map((message) => (
                        <div key={message.id} className={`message message-${message.role}`}>
                            <div className="message-avatar">
                                {message.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="message-content">
                                <p>{message.content}</p>
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
                    </div>
                )}

                <div className="input-area">
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
                        placeholder="输入您的问题或指令..."
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
