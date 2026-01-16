import { Target } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout';

export default function LongTermPage() {
    return (
        <PageLayout
            title="长期事务"
            subtitle="管理你的长期目标和计划"
            icon={<Target size={20} />}
        >
            <div className="empty-page glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px',
                color: 'var(--text-muted)',
                gap: '16px'
            }}>
                <Target size={48} />
                <p>长期事务功能开发中...</p>
            </div>
        </PageLayout>
    );
}
