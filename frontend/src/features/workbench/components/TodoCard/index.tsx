import { useState, useEffect } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import './styles.css';

interface Todo {
    id: number;
    title: string;
    completed: boolean;
    priority?: string;
}

export default function TodoCard() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/todos');
            const data = await response.json();
            setTodos(data.data || []);
        } catch (error) {
            console.error('Failed to fetch todos:', error);
            const saved = localStorage.getItem('local_todos');
            if (saved) setTodos(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async () => {
        if (!newTodo.trim()) return;

        const todo: Todo = {
            id: Date.now(),
            title: newTodo,
            completed: false,
        };

        try {
            await fetch('http://localhost:5000/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTodo }),
            });
            fetchTodos();
        } catch {
            const updated = [...todos, todo];
            setTodos(updated);
            localStorage.setItem('local_todos', JSON.stringify(updated));
        }

        setNewTodo('');
    };

    const toggleTodo = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            await fetch(`http://localhost:5000/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !todo.completed }),
            });
            fetchTodos();
        } catch {
            const updated = todos.map(t =>
                t.id === id ? { ...t, completed: !t.completed } : t
            );
            setTodos(updated);
            localStorage.setItem('local_todos', JSON.stringify(updated));
        }
    };

    const deleteTodo = async (id: number) => {
        try {
            await fetch(`http://localhost:5000/api/todos/${id}`, { method: 'DELETE' });
            fetchTodos();
        } catch {
            const updated = todos.filter(t => t.id !== id);
            setTodos(updated);
            localStorage.setItem('local_todos', JSON.stringify(updated));
        }
    };

    const pendingCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;

    return (
        <div className="todo-card glass-card">

            <div className="todo-header">
                <h3>待办事项</h3>
                <div className="todo-stats">
                    <span className="stat pending">{pendingCount} 待完成</span>
                    <span className="stat completed">{completedCount} 已完成</span>
                </div>
            </div>

            <div className="todo-input-group">
                <input
                    type="text"
                    className="todo-input"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="添加新任务..."
                />
                <button className="add-btn" onClick={addTodo}>
                    <Plus size={18} />
                </button>
            </div>

            <div className="todo-list">
                {loading ? (
                    <div className="todo-loading">加载中...</div>
                ) : todos.length === 0 ? (
                    <div className="todo-empty">暂无任务</div>
                ) : (
                    todos.slice(0, 6).map((todo) => (
                        <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                            <button
                                className={`check-btn ${todo.completed ? 'checked' : ''}`}
                                onClick={() => toggleTodo(todo.id)}
                            >
                                {todo.completed && <Check size={14} />}
                            </button>
                            <span className="todo-title">{todo.title}</span>
                            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
