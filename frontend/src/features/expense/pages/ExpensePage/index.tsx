import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { expenseService, Expense } from '../../services/expenseService'
import ExpenseForm from '../../components/ExpenseForm'
import './styles.css'

export default function ExpensePage() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    })

    useEffect(() => {
        fetchExpenses()
        fetchStats()
    }, [dateRange])

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            const response = await expenseService.getAll()
            setExpenses((response.data as any).data)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch expenses')
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await expenseService.getStats()
            setStats((response.data as any).data)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch stats')
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return

        try {
            await expenseService.delete(id)
            setExpenses(expenses.filter(e => e._id !== id))
            toast.success('Expense deleted')
            fetchStats()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete expense')
        }
    }

    const categoryLabels: Record<string, string> = {
        office: '办公维修',
        repair: '工程维修',
        water: '水费',
        electricity: '电费',
        gas: '燃气费',
        other: '其他',
    }

    return (
        <div className="expense-page">
            <header className="expense-header">
                <h1>Expense Tracking</h1>
                <button
                    className="add-expense-btn"
                    onClick={() => {
                        setEditingExpense(null)
                        setShowForm(!showForm)
                    }}
                >
                    <Plus size={20} /> Add Expense
                </button>
            </header>

            {showForm && (
                <ExpenseForm
                    onSubmit={async (data) => {
                        try {
                            if (editingExpense) {
                                const response = await expenseService.update(editingExpense._id, data)
                                setExpenses(expenses.map(e => e._id === editingExpense._id ? (response.data as any).data : e))
                                toast.success('Expense updated')
                            } else {
                                const response = await expenseService.create(data as any)
                                setExpenses([...expenses, (response.data as any).data])
                                toast.success('Expense created')
                            }
                            setShowForm(false)
                            setEditingExpense(null)
                            fetchStats()
                        } catch (error: any) {
                            toast.error(error.response?.data?.message || 'Failed to save expense')
                        }
                    }}
                    initialData={editingExpense}
                />
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <p className="stat-label">Monthly Total</p>
                            <p className="stat-value">¥{stats.monthlyTotal?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>

                    {stats.categoryStats && stats.categoryStats.map((cat: any) => (
                        <div key={cat._id} className="stat-card">
                            <div className="stat-icon">
                                {cat._id === 'office' ? '🏢' : cat._id === 'repair' ? '🔧' : cat._id === 'water' ? '💧' : cat._id === 'electricity' ? '⚡' : cat._id === 'gas' ? '🔥' : '📦'}
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">{categoryLabels[cat._id]}</p>
                                <p className="stat-value">¥{cat.total?.toFixed(2) || '0.00'}</p>
                                <p className="stat-count">{cat.count} items</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart */}
            {stats?.categoryStats && stats.categoryStats.length > 0 && (
                <div className="chart-container">
                    <h3>Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.categoryStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="var(--primary-color)" name="Total (¥)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Expenses List */}
            {loading ? (
                <div className="loading">Loading...</div>
            ) : expenses.length === 0 ? (
                <div className="empty-state">
                    <p>No expenses yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="expenses-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense._id}>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>{categoryLabels[expense.category]}</td>
                                    <td>{expense.description}</td>
                                    <td className="amount">¥{expense.amount.toFixed(2)}</td>
                                    <td>
                                        <span className={`status ${expense.status}`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="action-btn edit"
                                            onClick={() => {
                                                setEditingExpense(expense)
                                                setShowForm(true)
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDelete(expense._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
