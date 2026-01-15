import apiClient from './api';

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  sunset: string;
  location: string;
}

export interface Forecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

export interface SolarTerm {
  name: string;
  date: string;
  daysUntil: number;
  description: string;
}

export interface AirQuality {
  level: string;
  aqi: number;
  color: string;
}

export interface HealthIndex {
  index: string;
  level: string;
  description: string;
}

export const weatherService = {
  getCurrent: () => apiClient.get<WeatherData>('/weather/current'),
  getForecast: (days: number = 5) =>
    apiClient.get<Forecast[]>(`/weather/forecast?days=${days}`),
  getSolarTerms: () => apiClient.get<SolarTerm[]>('/weather/solar-terms'),
  getAirQuality: () => apiClient.get<AirQuality>('/weather/air-quality'),
  getHealthIndex: () => apiClient.get<HealthIndex[]>('/weather/health-index'),
};

