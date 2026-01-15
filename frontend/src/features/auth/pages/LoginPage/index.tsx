import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './styles.css';

export default function LoginPage() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const { handleLogin, loading } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(emailOrUsername, password);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Administrative Workbench</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">用户名或邮箱</label>
                        <input
                            id="email"
                            type="text"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            placeholder="admin"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="admin123"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="default-hint">
                        默认账户: <code>admin</code> / <code>admin123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}

