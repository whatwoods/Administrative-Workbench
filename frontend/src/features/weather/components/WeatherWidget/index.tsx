import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';
import { weatherService, WeatherData } from '../../services/weatherService';
import './styles.css';

const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        try {
            setLoading(true);
            const response = await weatherService.getCurrent();
            setWeather(response.data);
            setError(null);
        } catch (err) {
            setError('无法获取天气数据');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (condition: string) => {
        if (condition.includes('晴')) return <Sun className="weather-icon" />;
        if (condition.includes('雨')) return <CloudRain className="weather-icon" />;
        if (condition.includes('云')) return <Cloud className="weather-icon" />;
        return <Cloud className="weather-icon" />;
    };

    if (loading) {
        return <div className="weather-widget loading">加载中...</div>;
    }

    if (error || !weather) {
        return (
            <div className="weather-widget error">
                <p>{error || '获取天气失败'}</p>
                <button onClick={fetchWeather} className="retry-btn">
                    重试
                </button>
            </div>
        );
    }

    return (
        <div className="weather-widget">
            <div className="weather-header">
                <h3>{weather.location}</h3>
                <button onClick={fetchWeather} className="refresh-btn">
                    ↻
                </button>
            </div>

            <div className="weather-main">
                {getWeatherIcon(weather.condition)}
                <div className="temp-info">
                    <span className="temperature">{weather.temp}°C</span>
                    <span className="condition">{weather.condition}</span>
                </div>
            </div>

            <div className="weather-details">
                <div className="detail-item">
                    <Droplets size={18} />
                    <div>
                        <span className="label">湿度</span>
                        <span className="value">{weather.humidity}%</span>
                    </div>
                </div>
                <div className="detail-item">
                    <Wind size={18} />
                    <div>
                        <span className="label">风速</span>
                        <span className="value">{weather.windSpeed} km/h</span>
                    </div>
                </div>
                <div className="detail-item">
                    <Sun size={18} />
                    <div>
                        <span className="label">日落</span>
                        <span className="value">{weather.sunset}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
