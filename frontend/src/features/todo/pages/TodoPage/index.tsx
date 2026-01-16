import { useState } from 'react';
import { Plus, CheckSquare, Check } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout';
import './styles.css';

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

// 模拟数据
const initialTodos: Todo[] = [
    { id: 1, title: '完成项目文档', completed: false },
    { id: 2, title: '回复客户邮件', completed: true },
    { id: 3, title: '准备周会内容', completed: false },
];

export default function TodoPage() {
    const [todos, setTodos] = useState<Todo[]>(initialTodos);

    const [newTodo, setNewTodo] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const handleAddTodo = () => {
        if (!newTodo.trim()) return;
        const todo: Todo = {
            id: Date.now(),
            title: newTodo,
            completed: false
        };
        setTodos([todo, ...todos]);
        setNewTodo('');
    };

    const handleToggle = (id: number) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDelete = (id: number) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'pending') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    const pendingCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;

    return (
        <PageLayout
            title="待办事项"
            subtitle={`${pendingCount} 待完成 · ${completedCount} 已完成`}
            icon={<CheckSquare size={20} />}
            actions={
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        全部
                    </button>
                    <button
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        待完成
                    </button>
                    <button
                        className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        已完成
                    </button>
                </div>
            }
        >
            <div className="todo-page">
                {/* 添加待办 */}
                <div className="add-todo-section glass-card">
                    <input
                        type="text"
                        className="add-todo-input"
                        placeholder="添加新的待办事项..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    />
                    <button className="btn btn-primary" onClick={handleAddTodo}>
                        <Plus size={18} />
                        添加
                    </button>
                </div>

                {/* 待办列表 */}
                <div className="todo-list">
                    {filteredTodos.length === 0 ? (
                        <div className="empty-state glass-card">
                            <CheckSquare size={48} />
                            <p>暂无待办事项</p>
                        </div>
                    ) : (
                        filteredTodos.map(todo => (
                            <div key={todo.id} className={`todo-item glass-card ${todo.completed ? 'completed' : ''}`}>
                                <button
                                    className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                                    onClick={() => handleToggle(todo.id)}
                                >
                                    {todo.completed && <Check size={14} />}
                                </button>
                                <div className="todo-content">
                                    <span className="todo-title">{todo.title}</span>
                                </div>
                                <button
                                    className="todo-delete"
                                    onClick={() => handleDelete(todo.id)}
                                >
                                    删除
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PageLayout>
    );
}
