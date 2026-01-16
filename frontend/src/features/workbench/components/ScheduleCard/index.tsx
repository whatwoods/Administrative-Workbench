import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './styles.css';

interface ScheduleItem {
    id: string;
    title: string;
    time?: string;
    date: Date;
}

export default function ScheduleCard() {
    const [currentDate, setCurrentDate] = useState(new Date());

    // 模拟日程数据
    const schedules: ScheduleItem[] = [
        { id: '1', title: '无安排', date: new Date() }
    ];

    const getDaysInWeek = () => {
        const days = [];
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getDaysInWeek();
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="schedule-card glass-card">
            <div className="card-header">
                <div className="header-title">
                    <Calendar size={18} />
                    <h3>未来日程</h3>
                </div>
                <button className="header-btn">日历</button>
            </div>

            <div className="schedule-content">
                {/* 周视图 */}
                <div className="week-view">
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            className={`day-column ${isToday(day) ? 'today' : ''}`}
                        >
                            <div className="day-header">
                                <span className="day-name">{dayNames[index]}</span>
                                <span className="day-number">{day.getDate()}</span>
                            </div>
                            <div className="day-content">
                                {isToday(day) && (
                                    <div className="no-schedule">无安排</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
