import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/features/auth';
import { ProtectedRoute } from '@/shared';
import MainLayout from '@/shared/components/MainLayout';
import WorkbenchPage from '@/features/workbench/pages/WorkbenchPage';
import TodoPage from '@/features/todo/pages/TodoPage';
import LongTermPage from '@/features/longterm/pages/LongTermPage';
import PersonalPage from '@/features/personal/pages/PersonalPage';
import SchedulePage from '@/features/schedule/pages/SchedulePage';
import JournalPage from '@/features/journal/pages/JournalPage';
import AchievementPage from '@/features/achievement/pages/AchievementPage';
import AppsPage from '@/features/apps/pages/AppsPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* 受保护的路由 - 使用 MainLayout */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route index element={<WorkbenchPage />} />
                    <Route path="todo" element={<TodoPage />} />
                    <Route path="longterm" element={<LongTermPage />} />


                    <Route path="personal" element={<PersonalPage />} />
                    <Route path="schedule" element={<SchedulePage />} />
                    <Route path="journal" element={<JournalPage />} />
                    <Route path="achievement" element={<AchievementPage />} />
                    <Route path="apps" element={<AppsPage />} />
                </Route>
            </Route>

            {/* 暂时移除 404 fallback 方便调试 */}

        </Routes>
    );
}
