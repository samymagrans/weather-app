/**
 * Shared TypeScript types mirroring the backend response DTOs.
 *
 * Note: In a monorepo setup these would live in a shared `packages/types`
 * workspace and be imported by both frontend and backend. For this project
 * they are duplicated here — the tradeoff is documented in ANSWERS.md.
 */

export type WeatherUnits = 'imperial' | 'metric';

export type ComfortIndexType = 'heat_index' | 'wind_chill' | 'feels_like';

export interface WeatherLocation {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export interface ComfortIndex {
  /** Apparent temperature in °F (always Fahrenheit — standard for these formulas) */
  value: number;
  label: string;
  description: string;
  type: ComfortIndexType;
}

export interface WeatherInsights {
  comfortIndex: ComfortIndex;
  windCondition: string;
  humidityComfort: string;
  activityRecommendation: string;
  visibilityDescription: string;
}

export interface CurrentConditions {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  description: string;
  weatherMain: string;
  icon: string;
  iconUrl: string;
  windSpeed: number;
  windDirection: string;
  windGust?: number;
  visibility: number;
  cloudCoverage: number;
  sunrise: string;
  sunset: string;
  observedAt: string;
  units: WeatherUnits;
}

export interface CurrentWeatherResponse {
  location: WeatherLocation;
  current: CurrentConditions;
  insights: WeatherInsights;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  tempHigh: number;
  tempLow: number;
  avgHumidity: number;
  precipitationProbability: number;
  description: string;
  weatherMain: string;
  icon: string;
  iconUrl: string;
  windSpeed: number;
  windDirection: string;
  units: WeatherUnits;
  insights: WeatherInsights;
}

export interface ForecastResponse {
  location: WeatherLocation;
  daily: DailyForecast[];
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}
