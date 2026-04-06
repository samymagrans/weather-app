import { useCallback, useState } from 'react';
import { fetchCurrentWeather, fetchForecast } from '../services/weatherApi';
import { CurrentWeatherResponse, ForecastResponse, WeatherUnits } from '../types/weather';

interface WeatherState {
  currentWeather: CurrentWeatherResponse | null;
  forecast: ForecastResponse | null;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: WeatherState = {
  currentWeather: null,
  forecast: null,
  isLoading: false,
  error: null,
};

/**
 * Manages all weather data fetching and state for the app.
 *
 * Fires both API requests in parallel via Promise.all to minimize total wait
 * time — current weather and the 5-day forecast are independent calls.
 */
export function useWeather() {
  const [state, setState] = useState<WeatherState>(INITIAL_STATE);

  const search = useCallback(async (location: string, units: WeatherUnits) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [currentWeather, forecast] = await Promise.all([
        fetchCurrentWeather(location, units),
        fetchForecast(location, units),
      ]);
      setState({ currentWeather, forecast, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  const clear = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    currentWeather: state.currentWeather,
    forecast: state.forecast,
    isLoading: state.isLoading,
    error: state.error,
    search,
    clear,
  };
}
