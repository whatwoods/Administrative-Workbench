import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Target,
    User,
    Calendar,
    BookOpen,
    Trophy,
    Grid3X3,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '@/shared/hooks';
import './styles.css';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
}

const navItems: NavItem[] = [
    { id: 'home', label: '我的主页', icon: <LayoutDashboard size={18} />, path: '/' },
    { id: 'todo', label: '待办事项', icon: <CheckSquare size={18} />, path: '/todo' },
    { id: 'longterm', label: '长期事务', icon: <Target size={18} />, path: '/longterm' },
    { id: 'personal', label: '个人事务', icon: <User size={18} />, path: '/personal' },
    { id: 'schedule', label: '日程管理', icon: <Calendar size={18} />, path: '/schedule' },
    { id: 'journal', label: '生活手账', icon: <BookOpen size={18} />, path: '/journal' },
    { id: 'achievement', label: '我的成就', icon: <Trophy size={18} />, path: '/achievement' },
    { id: 'apps', label: '应用中心', icon: <Grid3X3 size={18} />, path: '/apps' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-header">
                <h1 className="sidebar-logo">我的工作台</h1>
                <span className="sidebar-subtitle">EXPLORE OS</span>
            </div>

            {/* 导航菜单 */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        title={item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* 底部 */}
            <div className="sidebar-footer">
                <div className="sidebar-brand">
                    <span className="brand-name">未安科技</span>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={isDark ? '切换浅色模式' : '切换深色模式'}
                    >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </div>
        </aside>
    );
}
