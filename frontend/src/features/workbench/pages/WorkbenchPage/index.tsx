import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import StatsBar from '../../components/StatsBar';
import TodoCard from '../../components/TodoCard';
import ScheduleCard from '../../components/ScheduleCard';
import NotesCard from '../../components/NotesCard';
import ExpenseCard from '../../components/ExpenseCard';
import './styles.css';

export default function WorkbenchPage() {
    const { user } = useAuth();

    const [todoCount, setTodoCount] = useState(0);
    const [weather, setWeather] = useState('Loading...');

    useEffect(() => {
        // 模拟获取数据
        setTodoCount(1);
        setWeather('晴 18°C');
    }, []);

    return (
        <div className="workbench">
            {/* 顶部统计栏 */}
            <StatsBar
                todoCount={todoCount}
                longTermCount={1}
                personalCount={1}
                weather={weather}
            />

            {/* 主内容网格 */}
            <div className="workbench-grid">
                {/* 左侧：待办事项 */}
                <div className="grid-item todo-area animate-in delay-2">
                    <TodoCard />
                </div>

                {/* 中间：未来日程 */}
                <div className="grid-item schedule-area animate-in delay-3">
                    <ScheduleCard />
                </div>

                {/* 右上：便签 */}
                <div className="grid-item notes-area animate-in delay-4">
                    <NotesCard />
                </div>

                {/* 右下：费用统计 */}
                <div className="grid-item expense-area animate-in delay-5">
                    <ExpenseCard />
                </div>
            </div>
        </div>
    );
}
