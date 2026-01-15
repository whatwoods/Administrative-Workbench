import { useState } from 'react'
import { Todo } from '../../services/todoService'
import './styles.css'

interface TodoFormProps {
    onSubmit: (data: Partial<Todo>) => Promise<void>
    initialData?: Todo | null
}

export default function TodoForm({ onSubmit, initialData }: TodoFormProps) {
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [category, setCategory] = useState<string>(initialData?.category || 'daily')
    const [priority, setPriority] = useState<string>(initialData?.priority || 'medium')
    const [dueDate, setDueDate] = useState(
        initialData?.dueDate ? initialData.dueDate.toString().split('T')[0] : ''
    )
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            alert('Title is required')
            return
        }

        setLoading(true)
        try {
            await onSubmit({
                title,
                description,
                category: category as any,
                priority: priority as any,
                dueDate: dueDate ? new Date(dueDate) as any : undefined,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="todo-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter todo title"
                    disabled={loading}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={loading}
                    >
                        <option value="repair">维修事项</option>
                        <option value="project">工程项目</option>
                        <option value="daily">日常工作</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        disabled={loading}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter todo description"
                    disabled={loading}
                    rows={3}
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Todo'}
                </button>
            </div>
        </form>
    )
}
