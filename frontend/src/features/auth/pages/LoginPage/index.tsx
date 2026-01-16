import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Lock } from 'lucide-react';
import './styles.css';

function getCurrentTime(): { time: string; date: string } {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('zh-CN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    return { time, date };
}

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [clock, setClock] = useState(getCurrentTime());
    const { handleLogin, loading } = useAuth();

    useEffect(() => {
        const timer = setInterval(() => {
            setClock(getCurrentTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 使用固定用户名 Way 登录
        handleLogin('Way', password);
    };

    return (
        <div className="login-container">
            {/* 动态背景动画 */}
            <div className="animated-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <div className="gradient-orb orb-4"></div>
            </div>

            {/* 时钟 */}
            <div className="login-clock">
                <div className="clock-date">{clock.date}</div>
                <div className="clock-time">{clock.time}</div>
            </div>

            {/* 登录卡片 */}
            <div className="login-card glass-panel">
                {/* 用户头像 */}
                <div className="login-avatar">
                    <span>W</span>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            className="glass-input login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="输入密码"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="glass-button primary login-button"
                        disabled={loading || !password}
                    >
                        {loading ? '登录中...' : '解锁'}
                    </button>
                </form>
            </div>
        </div>
    );
}
