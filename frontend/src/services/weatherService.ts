import apiClient from './api';

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  sunset: string;
}

export interface Forecast {
  date: string;
  high: number;
  low: number;
  condition: string;
}

export interface SolarTerm {
  name: string;
  date: string;
  daysUntil: number;
}

export const weatherService = {
  getCurrent: () => apiClient.get<WeatherData>('/weather/current'),
  getForecast: (days: number = 5) =>
    apiClient.get<Forecast[]>(`/weather/forecast?days=${days}`),
  getSolarTerms: () => apiClient.get<SolarTerm[]>('/weather/solar-terms'),
};
