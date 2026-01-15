import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, Circle } from 'lucide-react'
import toast from 'react-hot-toast'
import { todoService, Todo } from '../services/todoService'
import TodoForm from '../components/TodoForm'
import './TodoPage.css'

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [filter, setFilter] = useState<{
    category?: string
    priority?: string
    status?: string
  }>({})

  useEffect(() => {
    fetchTodos()
  }, [filter])

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const response = await todoService.getAll()
      setTodos(response.data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch todos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return

    try {
      await todoService.delete(id)
      setTodos(todos.filter(t => t._id !== id))
      toast.success('Todo deleted')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete todo')
    }
  }

  const handleStatusToggle = async (todo: Todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
    try {
      const response = await todoService.update(todo._id, { status: newStatus })
      setTodos(todos.map(t => t._id === todo._id ? response.data.data : t))
      toast.success('Todo updated')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update todo')
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter.category && todo.category !== filter.category) return false
    if (filter.priority && todo.priority !== filter.priority) return false
    if (filter.status && todo.status !== filter.status) return false
    return true
  })

  return (
    <div className="todo-page">
      <header className="todo-header">
        <h1>Todo List</h1>
        <button
          className="add-todo-btn"
          onClick={() => {
            setEditingTodo(null)
            setShowForm(!showForm)
          }}
        >
          <Plus size={20} /> Add Todo
        </button>
      </header>

      {showForm && (
        <TodoForm
          onSubmit={async (data) => {
            try {
              if (editingTodo) {
                const response = await todoService.update(editingTodo._id, data)
                setTodos(todos.map(t => t._id === editingTodo._id ? response.data.data : t))
                toast.success('Todo updated')
              } else {
                const response = await todoService.create(data as any)
                setTodos([...todos, response.data.data])
                toast.success('Todo created')
              }
              setShowForm(false)
              setEditingTodo(null)
            } catch (error: any) {
              toast.error(error.response?.data?.message || 'Failed to save todo')
            }
          }}
          initialData={editingTodo}
        />
      )}

      <div className="filters">
        <select
          value={filter.category || ''}
          onChange={(e) =>
            setFilter({ ...filter, category: e.target.value || undefined })
          }
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="repair">维修事项</option>
          <option value="project">工程项目</option>
          <option value="daily">日常工作</option>
        </select>

        <select
          value={filter.priority || ''}
          onChange={(e) =>
            setFilter({ ...filter, priority: e.target.value || undefined })
          }
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filter.status || ''}
          onChange={(e) =>
            setFilter({ ...filter, status: e.target.value || undefined })
          }
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : filteredTodos.length === 0 ? (
        <div className="empty-state">
          <p>No todos found. Create one to get started!</p>
        </div>
      ) : (
        <div className="todos-list">
          {filteredTodos.map(todo => (
            <div
              key={todo._id}
              className={`todo-item ${todo.status === 'completed' ? 'completed' : ''}`}
            >
              <button
                className="status-btn"
                onClick={() => handleStatusToggle(todo)}
              >
                {todo.status === 'completed' ? (
                  <CheckCircle size={24} className="checked" />
                ) : (
                  <Circle size={24} />
                )}
              </button>

              <div className="todo-content">
                <h3 className="todo-title">{todo.title}</h3>
                {todo.description && (
                  <p className="todo-description">{todo.description}</p>
                )}
                <div className="todo-meta">
                  <span className={`badge category-${todo.category}`}>
                    {todo.category}
                  </span>
                  <span className={`badge priority-${todo.priority}`}>
                    {todo.priority}
                  </span>
                  {todo.dueDate && (
                    <span className="due-date">
                      Due: {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="todo-actions">
                <button
                  className="action-btn edit"
                  onClick={() => {
                    setEditingTodo(todo)
                    setShowForm(true)
                  }}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(todo._id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
