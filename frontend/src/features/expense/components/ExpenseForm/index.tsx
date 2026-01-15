import { useState } from 'react'
import { Expense } from '../../services/expenseService'
import './styles.css'

interface ExpenseFormProps {
    onSubmit: (data: Partial<Expense>) => Promise<void>
    initialData?: Expense | null
}

export default function ExpenseForm({ onSubmit, initialData }: ExpenseFormProps) {
    const [amount, setAmount] = useState(initialData?.amount || '')
    const [category, setCategory] = useState<string>(initialData?.category || 'office')
    const [description, setDescription] = useState(initialData?.description || '')
    const [status, setStatus] = useState<string>(initialData?.status || 'pending')
    const [date, setDate] = useState(
        initialData?.date ? initialData.date.toString().split('T')[0] : new Date().toISOString().split('T')[0]
    )
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!amount || parseFloat(amount as string) <= 0) {
            alert('Amount must be greater than 0')
            return
        }

        setLoading(true)
        try {
            await onSubmit({
                amount: parseFloat(amount as string),
                category: category as any,
                description,
                status: status as any,
                date: new Date(date) as any,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="amount">Amount (¥) *</label>
                    <input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={loading}
                    />
                </div>
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
                        <option value="office">办公维修</option>
                        <option value="repair">工程维修</option>
                        <option value="water">水费</option>
                        <option value="electricity">电费</option>
                        <option value="gas">燃气费</option>
                        <option value="other">其他</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    disabled={loading}
                    rows={3}
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Expense'}
                </button>
            </div>
        </form>
    )
}
