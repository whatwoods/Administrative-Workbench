import { BookOpen, Plus, Edit3 } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout';
import './styles.css';

export default function JournalPage() {
    const entries = [
        { id: 1, date: '2026-01-16', title: '今日随记', content: '今天天气很好，工作顺利...', mood: '😊' },
    ];

    return (
        <PageLayout
            title="生活手账"
            subtitle="记录生活的点点滴滴"
            icon={<BookOpen size={20} />}
            actions={
                <button className="btn btn-primary">
                    <Plus size={18} />
                    新建手账
                </button>
            }
        >
            <div className="journal-page">
                {entries.length === 0 ? (
                    <div className="empty-state glass-card">
                        <BookOpen size={48} />
                        <p>还没有手账记录</p>
                        <button className="btn btn-primary">
                            <Edit3 size={16} />
                            开始记录
                        </button>
                    </div>
                ) : (
                    <div className="journal-list">
                        {entries.map(entry => (
                            <div key={entry.id} className="journal-card glass-card">
                                <div className="journal-header">
                                    <span className="journal-date">{entry.date}</span>
                                    <span className="journal-mood">{entry.mood}</span>
                                </div>
                                <h3 className="journal-title">{entry.title}</h3>
                                <p className="journal-content">{entry.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
