import { Calendar, Plus } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout';
import './styles.css';

export default function SchedulePage() {
    const today = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    // 生成本月日历
    const getDaysInMonth = () => {
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // 填充月初空白
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // 填充日期
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(i);
        }

        return days;
    };

    const days = getDaysInMonth();

    return (
        <PageLayout
            title="日程管理"
            subtitle={`${today.getFullYear()}年${today.getMonth() + 1}月`}
            icon={<Calendar size={20} />}
            actions={
                <button className="btn btn-primary">
                    <Plus size={18} />
                    添加日程
                </button>
            }
        >
            <div className="schedule-page">
                {/* 日历视图 */}
                <div className="calendar-view glass-card">
                    <div className="calendar-header">
                        {weekDays.map(day => (
                            <div key={day} className="calendar-weekday">{day}</div>
                        ))}
                    </div>
                    <div className="calendar-grid">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`calendar-day ${day === today.getDate() ? 'today' : ''} ${!day ? 'empty' : ''}`}
                            >
                                {day && (
                                    <>
                                        <span className="day-number">{day}</span>
                                        {day === today.getDate() && (
                                            <span className="today-label">今天</span>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 今日日程 */}
                <div className="today-schedules glass-card">
                    <h3 className="section-title">今日日程</h3>
                    <div className="empty-schedules">
                        <Calendar size={32} />
                        <p>暂无日程安排</p>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
