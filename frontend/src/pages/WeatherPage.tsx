import React, { useEffect, useState } from 'react';
import { Cloud, Wind, Sun, Droplets, AlertCircle } from 'lucide-react';
import { weatherService } from '../services/weatherService';
import './WeatherPage.css';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  sunset: string;
  location: string;
}

interface Forecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

interface SolarTerm {
  name: string;
  date: string;
  daysUntil: number;
  description: string;
}

interface AirQuality {
  level: string;
  aqi: number;
  color: string;
}

interface HealthIndex {
  index: string;
  level: string;
  description: string;
}

const WeatherPage: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [solarTerms, setSolarTerms] = useState<SolarTerm[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [healthIndex, setHealthIndex] = useState<HealthIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [weatherRes, forecastRes, solarRes, airRes, healthRes] = await Promise.all([
        weatherService.getCurrent(),
        weatherService.getForecast(7),
        weatherService.getSolarTerms(),
        weatherService.getAirQuality(),
        weatherService.getHealthIndex(),
      ]);

      setWeather(weatherRes.data);
      setForecast(forecastRes.data);
      setSolarTerms(solarRes.data);
      setAirQuality(airRes.data);
      setHealthIndex(healthRes.data);
      setError(null);
    } catch (err) {
      setError('获取天气数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('晴')) return <Sun className="icon-large" />;
    if (condition.includes('雨')) return <Cloud className="icon-large" />;
    if (condition.includes('云')) return <Cloud className="icon-large" />;
    return <Cloud className="icon-large" />;
  };

  if (loading) {
    return <div className="weather-page loading">加载中...</div>;
  }

  return (
    <div className="weather-page">
      <div className="page-header">
        <h1>🌤️ 天气预报</h1>
        <button onClick={fetchAllData} className="refresh-btn">
          刷新
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* 当前天气卡片 */}
      {weather && (
        <section className="section weather-card">
          <div className="card-header">
            <h2>{weather.location} - 当前天气</h2>
          </div>
          <div className="current-weather">
            <div className="weather-icon-section">
              {getWeatherIcon(weather.condition)}
            </div>
            <div className="weather-info">
              <div className="main-info">
                <div className="temp-display">{weather.temp}°C</div>
                <div className="condition-display">{weather.condition}</div>
              </div>
              <div className="details-grid">
                <div className="detail">
                  <Droplets size={20} />
                  <div>
                    <label>湿度</label>
                    <span className="value">{weather.humidity}%</span>
                  </div>
                </div>
                <div className="detail">
                  <Wind size={20} />
                  <div>
                    <label>风速</label>
                    <span className="value">{weather.windSpeed} km/h</span>
                  </div>
                </div>
                <div className="detail">
                  <Sun size={20} />
                  <div>
                    <label>日落时间</label>
                    <span className="value">{weather.sunset}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 空气质量卡片 */}
      {airQuality && (
        <section className="section air-quality-card">
          <h2>🌬️ 空气质量</h2>
          <div className="air-quality-content">
            <div
              className="aqi-circle"
              style={{ borderColor: airQuality.color }}
            >
              <span className="aqi-value">{airQuality.aqi}</span>
              <span className="aqi-level">{airQuality.level}</span>
            </div>
            <div className="aqi-description">
              空气质量：{airQuality.level}
              <p>
                {airQuality.level === '优' && '空气清新，非常适合户外活动'}
                {airQuality.level === '良' && '空气质量良好，可以放心户外活动'}
                {airQuality.level === '轻度污染' && '建议减少长时间户外活动'}
                {airQuality.level === '中度污染' && '建议少出门，做好防护措施'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 7天预报 */}
      <section className="section forecast-section">
        <h2>📅 7 天预报</h2>
        <div className="forecast-grid">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-card">
              <div className="date">{new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</div>
              <div className="forecast-icon">{getWeatherIcon(day.condition)}</div>
              <div className="temps">
                <span className="high">{day.high}°</span>
                <span className="low">{day.low}°</span>
              </div>
              <div className="condition">{day.condition}</div>
              <div className="precipitation">💧 {day.precipitation}%</div>
            </div>
          ))}
        </div>
      </section>

      {/* 生活指数 */}
      <section className="section health-index-section">
        <h2>💡 生活指数</h2>
        <div className="health-grid">
          {healthIndex.map((item, index) => (
            <div key={index} className="health-item">
              <h3>{item.index}</h3>
              <div className="level-badge">{item.level}</div>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 二十四节气 */}
      {solarTerms.length > 0 && (
        <section className="section solar-terms-section">
          <h2>🌾 二十四节气</h2>
          <div className="solar-terms-list">
            {solarTerms.slice(0, 6).map((term, index) => (
              <div key={index} className="solar-term-item">
                <div className="term-left">
                  <h4>{term.name}</h4>
                  <p>{term.description}</p>
                </div>
                <div className="term-right">
                  <span className="date">{term.date}</span>
                  {term.daysUntil >= 0 ? (
                    <span className="days-until">还有 {term.daysUntil} 天</span>
                  ) : (
                    <span className="days-past">已过 {Math.abs(term.daysUntil)} 天</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default WeatherPage;
