import { useState, useEffect } from 'react';
import { TrendingUp, PieChart } from 'lucide-react';
import './styles.css';

interface ExpenseCategory {
    name: string;
    amount: number;
    color: string;
}

interface MonthlyExpense {
    month: string;
    amount: number;
}

export default function ExpenseCard() {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyExpense[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenseData();
    }, []);

    const fetchExpenseData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/expenses');
            const data = await response.json();
            const expenses = data.data || [];

            // 按类别统计
            const categoryMap = new Map<string, number>();
            const categoryColors: Record<string, string> = {
                '餐饮': '#FF6B6B',
                '交通': '#4ECDC4',
                '购物': '#FFE66D',
                '娱乐': '#95E1D3',
                '住房': '#A8E6CF',
                '其他': '#DDA0DD',
            };

            expenses.forEach((expense: any) => {
                const cat = expense.category || '其他';
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + expense.amount);
            });

            const cats: ExpenseCategory[] = [];
            categoryMap.forEach((amount, name) => {
                cats.push({ name, amount, color: categoryColors[name] || '#888' });
            });
            setCategories(cats.sort((a, b) => b.amount - a.amount));

            // 计算总额
            const sum = cats.reduce((acc, c) => acc + c.amount, 0);
            setTotal(sum);

            // 按月统计（模拟数据）
            const months: MonthlyExpense[] = [
                { month: '9月', amount: 12500 },
                { month: '10月', amount: 15800 },
                { month: '11月', amount: 13200 },
                { month: '12月', amount: 18500 },
                { month: '1月', amount: sum || 8600 },
            ];
            setMonthlyData(months);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
            // 使用模拟数据
            setCategories([
                { name: '餐饮', amount: 3200, color: '#FF6B6B' },
                { name: '交通', amount: 1800, color: '#4ECDC4' },
                { name: '购物', amount: 2500, color: '#FFE66D' },
                { name: '娱乐', amount: 1100, color: '#95E1D3' },
            ]);
            setTotal(8600);
            setMonthlyData([
                { month: '9月', amount: 12500 },
                { month: '10月', amount: 15800 },
                { month: '11月', amount: 13200 },
                { month: '12月', amount: 18500 },
                { month: '1月', amount: 8600 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const maxMonthly = Math.max(...monthlyData.map(m => m.amount));

    if (loading) {
        return <div className="expense-card loading">加载中...</div>;
    }

    return (
        <div className="expense-card glass-card">

            <div className="expense-header">
                <h3>费用统计</h3>
                <div className="expense-total">
                    <span className="total-label">本月总支出</span>
                    <span className="total-value">¥{total.toLocaleString()}</span>
                </div>
            </div>

            <div className="expense-content">
                {/* 分类饼图 */}
                <div className="expense-pie">
                    <div className="pie-chart">
                        <PieChart size={80} className="pie-icon" />
                        <div className="pie-center">
                            <span className="pie-label">分类</span>
                        </div>
                    </div>
                    <div className="category-list">
                        {categories.slice(0, 4).map((cat, idx) => (
                            <div key={idx} className="category-item">
                                <span className="cat-dot" style={{ background: cat.color }}></span>
                                <span className="cat-name">{cat.name}</span>
                                <span className="cat-amount">¥{cat.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 月度趋势柱状图 */}
                <div className="expense-trend">
                    <div className="trend-header">
                        <TrendingUp size={16} />
                        <span>月度趋势</span>
                    </div>
                    <div className="trend-chart">
                        {monthlyData.map((month, idx) => (
                            <div key={idx} className="trend-bar-wrapper">
                                <div
                                    className="trend-bar"
                                    style={{
                                        height: `${(month.amount / maxMonthly) * 100}%`,
                                        background: idx === monthlyData.length - 1
                                            ? 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
                                            : 'var(--bg-elevated)'
                                    }}
                                >
                                    <span className="bar-value">¥{(month.amount / 1000).toFixed(1)}k</span>
                                </div>
                                <span className="bar-label">{month.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
