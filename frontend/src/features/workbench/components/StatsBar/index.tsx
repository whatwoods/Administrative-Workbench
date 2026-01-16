import { CheckSquare, Target, User, Cloud } from 'lucide-react';
import './styles.css';

interface StatItem {
    id: string;
    icon: React.ReactNode;
    iconBg: string;
    value: string | number;
    label: string;
}

interface StatsBarProps {
    todoCount?: number;
    longTermCount?: number;
    personalCount?: number;
    weather?: string;
}

export default function StatsBar({
    todoCount = 0,
    longTermCount = 0,
    personalCount = 0,
    weather = 'Loading...'
}: StatsBarProps) {
    const stats: StatItem[] = [
        {
            id: 'todo',
            icon: <CheckSquare size={18} />,
            iconBg: 'orange',
            value: todoCount,
            label: '待办事项'
        },
        {
            id: 'longterm',
            icon: <Target size={18} />,
            iconBg: 'green',
            value: longTermCount,
            label: '长期任务'
        },
        {
            id: 'personal',
            icon: <User size={18} />,
            iconBg: 'blue',
            value: personalCount,
            label: '个人事务'
        },
        {
            id: 'weather',
            icon: <Cloud size={18} />,
            iconBg: 'purple',
            value: weather,
            label: '今日天气'
        }
    ];

    return (
        <div className="stats-bar">
            {stats.map((stat, index) => (
                <div
                    key={stat.id}
                    className={`stat-card glass-card animate-in delay-${index + 1}`}
                >
                    <div className={`stat-icon icon-badge ${stat.iconBg}`}>
                        {stat.icon}
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
