import { useCallback } from 'react';
import './App.css';
import { CurrentWeather } from './components/CurrentWeather/CurrentWeather';
import { ErrorMessage } from './components/ErrorMessage/ErrorMessage';
import { ForecastList } from './components/ForecastList/ForecastList';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { LocationSearch } from './components/LocationSearch/LocationSearch';
import { WeatherInsights } from './components/WeatherInsights/WeatherInsights';
import { useWeather } from './hooks/useWeather';
import { WeatherUnits } from './types/weather';
import { getWeatherTheme } from './utils/weatherHelpers';

export function App() {
  const { currentWeather, forecast, isLoading, error, search, clear } = useWeather();

  const handleSearch = useCallback(
    (location: string, units: WeatherUnits) => {
      search(location, units);
    },
    [search],
  );

  const weatherTheme = currentWeather?.current.weatherMain
    ? getWeatherTheme(currentWeather.current.weatherMain)
    : undefined;

  return (
    <div
      className="app"
      data-weather={weatherTheme}
    >
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">
            <span className="app-title-icon" aria-hidden="true">&#9729;</span>
            Weather
          </h1>
          <LocationSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      <main className="app-main">
        {isLoading && <LoadingSpinner />}

        {error && !isLoading && (
          <ErrorMessage message={error} onDismiss={clear} />
        )}

        {currentWeather && !isLoading && (
          <>
            <CurrentWeather data={currentWeather} />
            <WeatherInsights insights={currentWeather.insights} />
          </>
        )}

        {forecast && !isLoading && (
          <ForecastList data={forecast} />
        )}

        {!currentWeather && !isLoading && !error && (
          <div className="app-empty" aria-label="No weather data">
            <p className="app-empty-hint">
              Search for a city to see current weather and a 5-day forecast.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
