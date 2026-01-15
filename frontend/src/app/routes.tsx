import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/features/auth';
import { Sidebar, ProtectedRoute } from '@/shared';

// Lazy load feature pages
import Dashboard from '@/features/dashboard/pages/Dashboard';
import TodoPage from '@/features/todo/pages/TodoPage';
import ExpensePage from '@/features/expense/pages/ExpensePage';
import NotePage from '@/features/note/pages/NotePage';
import WeatherPage from '@/features/weather/pages/WeatherPage';
import AIPage from '@/features/ai/pages/AIPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <div className="app-container">
                            <Sidebar />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/todos" element={<TodoPage />} />
                                    <Route path="/expenses" element={<ExpensePage />} />
                                    <Route path="/notes" element={<NotePage />} />
                                    <Route path="/weather" element={<WeatherPage />} />
                                    <Route path="/ai" element={<AIPage />} />
                                </Routes>
                            </main>
                        </div>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
