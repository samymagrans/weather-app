import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrentWeatherResponse } from '../../types/weather';
import { CurrentWeather } from './CurrentWeather';

const MOCK_DATA: CurrentWeatherResponse = {
  location: { city: 'Columbia', country: 'US', lat: 34.0, lon: -81.03 },
  current: {
    temperature: 72,
    feelsLike: 70,
    tempMin: 68,
    tempMax: 76,
    humidity: 55,
    pressure: 1015,
    description: 'Clear sky',
    weatherMain: 'Clear',
    icon: '01d',
    iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    windSpeed: 8,
    windDirection: 'NE',
    visibility: 10000,
    cloudCoverage: 0,
    sunrise: '2026-04-03T10:45:00.000Z',
    sunset: '2026-04-03T23:55:00.000Z',
    observedAt: '2026-04-03T18:00:00.000Z',
    units: 'imperial',
  },
  insights: {
    comfortIndex: { value: 70, label: 'Comfortable', description: 'Comfortable conditions', type: 'feels_like' },
    windCondition: 'Light Breeze',
    humidityComfort: 'Comfortable',
    activityRecommendation: 'Ideal conditions',
    visibilityDescription: 'Excellent Visibility',
  },
};

describe('CurrentWeather', () => {
  it('displays the city name', () => {
    render(<CurrentWeather data={MOCK_DATA} />);
    expect(screen.getByText('Columbia')).toBeInTheDocument();
  });

  it('displays the country code', () => {
    render(<CurrentWeather data={MOCK_DATA} />);
    expect(screen.getByText('US')).toBeInTheDocument();
  });

  it('displays the temperature with °F for imperial units', () => {
    render(<CurrentWeather data={MOCK_DATA} />);
    expect(screen.getByText('72°F')).toBeInTheDocument();
  });

  it('displays the weather description', () => {
    render(<CurrentWeather data={MOCK_DATA} />);
    expect(screen.getByText('Clear sky')).toBeInTheDocument();
  });

  it('displays the weather icon with accessible alt text', () => {
    render(<CurrentWeather data={MOCK_DATA} />);
    const img = screen.getByAltText('Clear sky');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', MOCK_DATA.current.iconUrl);
  });

  it('displays humidity in the stats grid', () => {
    render(<CurrentWeather data={MOCK_DATA} />);
    expect(screen.getByText('55%')).toBeInTheDocument();
  });

  it('does not display gusts when windGust is undefined', () => {
    render(<CurrentWeather data={MOCK_DATA} />);
    expect(screen.queryByText('Gusts')).not.toBeInTheDocument();
  });
});
