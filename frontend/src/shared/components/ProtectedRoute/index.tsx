import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

interface ProtectedRouteProps {
    children?: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { token } = useAuthStore();

    if (!token) {

        return <Navigate to="/login" replace />;
    }

    // 如果有 children，渲染 children；否则渲染 Outlet（用于嵌套路由）
    return children ? <>{children}</> : <Outlet />;
}
