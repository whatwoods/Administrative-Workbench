import { Trophy, Star, Target, Calendar } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout';
import './styles.css';

export default function AchievementPage() {
    const stats = [
        { label: '任务完成数', value: 12, icon: <Target size={20} />, color: 'orange' },
        { label: '连续打卡', value: 7, suffix: '天', icon: <Calendar size={20} />, color: 'green' },
        { label: '获得成就', value: 3, icon: <Star size={20} />, color: 'purple' },
    ];

    const achievements = [
        { id: 1, name: '初来乍到', desc: '完成首个待办事项', unlocked: true, icon: '🎉' },
        { id: 2, name: '坚持不懈', desc: '连续打卡7天', unlocked: true, icon: '🔥' },
        { id: 3, name: '效率达人', desc: '单日完成10个待办', unlocked: false, icon: '⚡' },
        { id: 4, name: '理财高手', desc: '记录100笔支出', unlocked: false, icon: '💰' },
    ];

    return (
        <PageLayout
            title="我的成就"
            subtitle="汇总你的个人成长与数据"
            icon={<Trophy size={20} />}
        >
            <div className="achievement-page">
                {/* 统计卡片 */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card glass-card">
                            <div className={`stat-icon icon-badge ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">
                                    {stat.value}{stat.suffix || ''}
                                </span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 成就列表 */}
                <div className="achievements-section">
                    <h3 className="section-title">成就徽章</h3>
                    <div className="achievements-grid">
                        {achievements.map(achievement => (
                            <div
                                key={achievement.id}
                                className={`achievement-card glass-card ${!achievement.unlocked ? 'locked' : ''}`}
                            >
                                <span className="achievement-icon">{achievement.icon}</span>
                                <h4 className="achievement-name">{achievement.name}</h4>
                                <p className="achievement-desc">{achievement.desc}</p>
                                {!achievement.unlocked && (
                                    <span className="locked-badge">未解锁</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
