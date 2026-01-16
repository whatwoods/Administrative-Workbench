import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/shared/components';
import './styles.css';

interface MainLayoutProps {
    children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (


        <div className="app-container">
            {/* 背景层 */}
            <div className="app-background" />

            {/* 侧边栏 */}
            <Sidebar />

            {/* 主内容区域 */}
            <main className="main-content">
                {children || <Outlet />}
            </main>
        </div>
    );
}
