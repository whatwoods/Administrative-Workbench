import { User } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout';

export default function PersonalPage() {
    return (
        <PageLayout
            title="个人事务"
            subtitle="管理个人相关的事项"
            icon={<User size={20} />}
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
                <User size={48} />
                <p>个人事务功能开发中...</p>
            </div>
        </PageLayout>
    );
}
