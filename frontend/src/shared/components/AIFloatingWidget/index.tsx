import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import AIAssistant from '@/features/ai/components/AIAssistant';
import './styles.css';

interface AIFloatingWidgetProps {
    shortcut?: string; // Default: Ctrl+Shift+A
}

const AIFloatingWidget: React.FC<AIFloatingWidgetProps> = ({ shortcut = 'ctrl+shift+a' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // 快捷键监听
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const keys = shortcut.toLowerCase().split('+');
            const ctrlRequired = keys.includes('ctrl');
            const shiftRequired = keys.includes('shift');
            const altRequired = keys.includes('alt');
            const mainKey = keys.filter(k => !['ctrl', 'shift', 'alt'].includes(k))[0];

            if (
                e.ctrlKey === ctrlRequired &&
                e.shiftKey === shiftRequired &&
                e.altKey === altRequired &&
                e.key.toLowerCase() === mainKey
            ) {
                e.preventDefault();
                setIsOpen(prev => !prev);
                setIsMinimized(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcut]);

    // 拖拽处理
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.ai-widget-header')) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    }, [position]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // 初始化位置 (右下角)
    useEffect(() => {
        setPosition({
            x: window.innerWidth - 420,
            y: window.innerHeight - 620
        });
    }, []);

    return (
        <>
            {/* 悬浮按钮 */}
            {!isOpen && (
                <button
                    className="ai-floating-btn"
                    onClick={() => setIsOpen(true)}
                    title="AI 助手 (Ctrl+Shift+A)"
                >
                    <MessageSquare size={24} />
                    <span className="ai-floating-hint">Ctrl+Shift+A</span>
                </button>
            )}

            {/* 悬浮窗 */}
            {isOpen && (
                <div
                    className={`ai-floating-window ${isMinimized ? 'minimized' : ''}`}
                    style={{
                        left: position.x,
                        top: position.y,
                        cursor: isDragging ? 'grabbing' : 'default'
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <div className="ai-widget-header">
                        <span>🤖 AI 助手</span>
                        <div className="ai-widget-controls">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                title={isMinimized ? '展开' : '最小化'}
                            >
                                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} title="关闭">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                    {!isMinimized && (
                        <div className="ai-widget-content">
                            <AIAssistant />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AIFloatingWidget;
