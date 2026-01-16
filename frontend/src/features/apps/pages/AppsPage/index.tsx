import { Grid3X3, ExternalLink } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout';
import './styles.css';

interface App {
    id: string;
    name: string;
    icon: string;
    desc: string;
    color: string;
    url?: string;
}

const apps: App[] = [
    { id: 'weather', name: '天气查询', icon: '🌤️', desc: '查看实时天气和预报', color: '#3b82f6' },
    { id: 'calculator', name: '计算器', icon: '🧮', desc: '快速计算', color: '#22c55e' },
    { id: 'notes', name: '便签', icon: '📝', desc: '快速记录想法', color: '#f59e0b' },
    { id: 'pomodoro', name: '番茄钟', icon: '🍅', desc: '专注工作计时器', color: '#ef4444' },
    { id: 'habit', name: '习惯打卡', icon: '✅', desc: '培养好习惯', color: '#8b5cf6' },
    { id: 'countdown', name: '倒计时', icon: '⏳', desc: '重要日期倒计时', color: '#ec4899' },
];

export default function AppsPage() {
    return (
        <PageLayout
            title="应用中心"
            subtitle="探索更多实用工具"
            icon={<Grid3X3 size={20} />}
        >
            <div className="apps-page">
                <div className="apps-grid">
                    {apps.map(app => (
                        <div key={app.id} className="app-card glass-card">
                            <div
                                className="app-icon"
                                style={{ background: `${app.color}20` }}
                            >
                                <span>{app.icon}</span>
                            </div>
                            <div className="app-info">
                                <h3 className="app-name">{app.name}</h3>
                                <p className="app-desc">{app.desc}</p>
                            </div>
                            {app.url && (
                                <ExternalLink size={16} className="app-link" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
}
