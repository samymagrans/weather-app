import { FormEvent, useState } from 'react';
import { WeatherUnits } from '../../types/weather';
import './LocationSearch.css';

interface LocationSearchProps {
  onSearch: (location: string, units: WeatherUnits) => void;
  isLoading?: boolean;
}

export function LocationSearch({ onSearch, isLoading = false }: LocationSearchProps) {
  const [location, setLocation] = useState('');
  const [units, setUnits] = useState<WeatherUnits>('imperial');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = location.trim();
    if (trimmed) {
      onSearch(trimmed, units);
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <div className="search-input-row">
        <label htmlFor="location-input" className="sr-only">
          Enter a city name
        </label>
        <input
          id="location-input"
          type="text"
          className="search-input"
          placeholder='City name — e.g. "Columbia, SC" or "London, GB"'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
          aria-label="Location"
        />
        <button
          type="submit"
          className="search-button"
          disabled={isLoading || !location.trim()}
          aria-label="Search weather"
        >
          {isLoading ? 'Loading…' : 'Search'}
        </button>
      </div>

      <div className="units-toggle" role="group" aria-label="Temperature unit">
        <label className={`units-option ${units === 'imperial' ? 'units-option--active' : ''}`}>
          <input
            type="radio"
            name="units"
            value="imperial"
            checked={units === 'imperial'}
            onChange={() => setUnits('imperial')}
          />
          °F
        </label>
        <label className={`units-option ${units === 'metric' ? 'units-option--active' : ''}`}>
          <input
            type="radio"
            name="units"
            value="metric"
            checked={units === 'metric'}
            onChange={() => setUnits('metric')}
          />
          °C
        </label>
      </div>
    </form>
  );
}
