import { CurrentWeatherResponse, ForecastResponse, WeatherUnits } from '../types/weather';

/**
 * Base URL for the backend API.
 * In development, the Vite dev server proxies /api → http://localhost:3001,
 * so we default to /api. In production, set VITE_API_BASE_URL to the
 * deployed backend's origin (e.g. https://api.yourapp.com).
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * Executes a GET request and returns parsed JSON, or throws an Error with the
 * backend's error message if the response is not 2xx.
 */
async function apiFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorBody.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetches the current weather conditions for a given location.
 *
 * @param location - City name, e.g. "Columbia,SC,US"
 * @param units    - "imperial" (°F) or "metric" (°C)
 */
export function fetchCurrentWeather(
  location: string,
  units: WeatherUnits,
): Promise<CurrentWeatherResponse> {
  return apiFetch<CurrentWeatherResponse>('/weather/current', { location, units });
}

/**
 * Fetches the 5-day daily forecast for a given location.
 *
 * @param location - City name, e.g. "Columbia,SC,US"
 * @param units    - "imperial" (°F) or "metric" (°C)
 */
export function fetchForecast(
  location: string,
  units: WeatherUnits,
): Promise<ForecastResponse> {
  return apiFetch<ForecastResponse>('/weather/forecast', { location, units });
}
