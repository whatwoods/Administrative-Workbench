import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Droplets, Wind, Sunset, Clock, ChevronDown } from 'lucide-react';
import './styles.css';

interface WeatherData {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
}

interface ForecastDay {
    date: string;
    high: number;
    low: number;
    condition: string;
}

interface SolarTerm {
    name: string;
    date: string;
    daysUntil: number;
}

const SOLAR_TERMS = [
    { name: '小寒', date: '01-06' }, { name: '大寒', date: '01-20' },
    { name: '立春', date: '02-04' }, { name: '雨水', date: '02-18' },
    { name: '惊蛰', date: '03-05' }, { name: '春分', date: '03-20' },
    { name: '清明', date: '04-04' }, { name: '谷雨', date: '04-20' },
    { name: '立夏', date: '05-05' }, { name: '小满', date: '05-21' },
    { name: '芒种', date: '06-05' }, { name: '夏至', date: '06-21' },
    { name: '小暑', date: '07-07' }, { name: '大暑', date: '07-22' },
    { name: '立秋', date: '08-07' }, { name: '处暑', date: '08-23' },
    { name: '白露', date: '09-07' }, { name: '秋分', date: '09-23' },
    { name: '寒露', date: '10-08' }, { name: '霜降', date: '10-23' },
    { name: '立冬', date: '11-07' }, { name: '小雪', date: '11-22' },
    { name: '大雪', date: '12-07' }, { name: '冬至', date: '12-21' },
];

const DEFAULT_LIGHT_CONFIG = {
    winter: { on: '17:00', off: '07:00' },
    summer: { on: '19:00', off: '06:00' },
};

export default function WeatherCard() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [currentTerm, setCurrentTerm] = useState<SolarTerm | null>(null);
    const [nextTerm, setNextTerm] = useState<SolarTerm | null>(null);
    const [showAllTerms, setShowAllTerms] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeatherData();
        calculateSolarTerms();
    }, []);

    const fetchWeatherData = async () => {
        try {
            setLoading(true);
            const [currentRes, forecastRes] = await Promise.all([
                fetch('http://localhost:5000/api/weather/current'),
                fetch('http://localhost:5000/api/weather/forecast?days=5')
            ]);

            const currentData = await currentRes.json();
            const forecastData = await forecastRes.json();

            setWeather(currentData.data?.data || currentData.data);
            setForecast(forecastData.data?.data || forecastData.data || []);
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            // 模拟数据
            setWeather({ temp: 8, condition: '晴', humidity: 65, windSpeed: 12 });
            setForecast([
                { date: '2026-01-16', high: 10, low: 2, condition: '晴' },
                { date: '2026-01-17', high: 8, low: 0, condition: '多云' },
                { date: '2026-01-18', high: 6, low: -2, condition: '阴' },
                { date: '2026-01-19', high: 9, low: 1, condition: '晴' },
                { date: '2026-01-20', high: 11, low: 3, condition: '晴' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const calculateSolarTerms = () => {
        const now = new Date();
        const year = now.getFullYear();

        for (let i = 0; i < SOLAR_TERMS.length; i++) {
            const term = SOLAR_TERMS[i];
            const termDate = new Date(`${year}-${term.date}`);
            const nextIdx = (i + 1) % SOLAR_TERMS.length;
            const nextTermDate = new Date(`${nextIdx === 0 ? year + 1 : year}-${SOLAR_TERMS[nextIdx].date}`);

            if (now >= termDate && now < nextTermDate) {
                setCurrentTerm({ ...term, date: termDate.toLocaleDateString('zh-CN'), daysUntil: 0 });
                const days = Math.ceil((nextTermDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                setNextTerm({ ...SOLAR_TERMS[nextIdx], date: nextTermDate.toLocaleDateString('zh-CN'), daysUntil: days });
                break;
            }
        }
    };

    const getWeatherIcon = (condition: string) => {
        if (condition?.includes('晴')) return <Sun className="weather-icon sunny" />;
        if (condition?.includes('雨')) return <CloudRain className="weather-icon rainy" />;
        if (condition?.includes('云') || condition?.includes('阴')) return <Cloud className="weather-icon cloudy" />;
        return <Sun className="weather-icon sunny" />;
    };

    const getLightSchedule = () => {
        const month = new Date().getMonth();
        const isWinter = month < 3 || month > 9;
        return isWinter ? DEFAULT_LIGHT_CONFIG.winter : DEFAULT_LIGHT_CONFIG.summer;
    };

    if (loading) {
        return <div className="weather-card" style={{ justifyContent: 'center', alignItems: 'center' }}>加载中...</div>;
    }

    const lightSchedule = getLightSchedule();

    return (
        <div className="weather-card">
            {/* 当前天气 */}
            <div className="weather-current">
                <div className="current-main">
                    {getWeatherIcon(weather?.condition || '')}
                    <div className="current-temp">
                        <span className="temp-value">{weather?.temp || '--'}°</span>
                        <span className="temp-condition">{weather?.condition || '未知'}</span>
                    </div>
                </div>
                <div className="current-details">
                    <div className="detail-item">
                        <Droplets size={16} />
                        <span>湿度 {weather?.humidity || '--'}%</span>
                    </div>
                    <div className="detail-item">
                        <Wind size={16} />
                        <span>风速 {weather?.windSpeed || '--'} km/h</span>
                    </div>
                    <div className="detail-item">
                        <Sunset size={16} />
                        <span>日落 18:05</span>
                    </div>
                </div>
            </div>

            {/* 5天预报 */}
            <div className="weather-forecast">
                <h4>未来5天</h4>
                <div className="forecast-list">
                    {forecast.slice(0, 5).map((day, idx) => (
                        <div key={idx} className="forecast-day">
                            <span className="day-name">
                                {idx === 0 ? '今天' : new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                            </span>
                            {getWeatherIcon(day.condition)}
                            <span className="day-temp">{day.high}° / {day.low}°</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 节气信息 */}
            <div className="solar-term-section">
                <div className="current-term">
                    <div className="term-badge">{currentTerm?.name || '小寒'}</div>
                    <span className="term-date">{currentTerm?.date}</span>
                </div>

                <div
                    className="next-term-countdown"
                    onMouseEnter={() => setShowAllTerms(true)}
                    onMouseLeave={() => setShowAllTerms(false)}
                >
                    <span>距 {nextTerm?.name} 还有</span>
                    <span className="countdown-days">{nextTerm?.daysUntil || '--'} 天</span>
                    <ChevronDown size={14} className={showAllTerms ? 'rotated' : ''} />

                    {showAllTerms && (
                        <div className="all-terms-popup">
                            <h5>二十四节气</h5>
                            <div className="terms-grid">
                                {SOLAR_TERMS.map((term, idx) => (
                                    <div
                                        key={idx}
                                        className={`term-item ${term.name === currentTerm?.name ? 'active' : ''}`}
                                    >
                                        <span className="term-name">{term.name}</span>
                                        <span className="term-date-small">{term.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 亮灯时间 */}
            <div className="light-schedule">
                <Clock size={16} />
                <span>园区亮灯 {lightSchedule.on} - {lightSchedule.off}</span>
            </div>
        </div>
    );
}
