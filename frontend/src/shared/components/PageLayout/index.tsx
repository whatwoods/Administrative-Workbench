import { ReactNode } from 'react';
import './styles.css';

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}

export default function PageLayout({ title, subtitle, icon, actions, children }: PageLayoutProps) {
    return (
        <div className="page-layout">
            <header className="page-header">
                <div className="page-title-section">
                    {icon && <span className="page-icon">{icon}</span>}
                    <div>
                        <h1 className="page-title">{title}</h1>
                        {subtitle && <p className="page-subtitle">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="page-actions">{actions}</div>}
            </header>
            <main className="page-content">
                {children}
            </main>
        </div>
    );
}
