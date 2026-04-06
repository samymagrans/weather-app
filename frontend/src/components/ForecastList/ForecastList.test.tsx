import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ForecastResponse } from '../../types/weather';
import { ForecastList } from './ForecastList';

const MOCK_INSIGHTS = {
  comfortIndex: { value: 72, label: 'Comfortable', description: 'Comfortable conditions', type: 'feels_like' as const },
  windCondition: 'Light Breeze',
  humidityComfort: 'Comfortable',
  activityRecommendation: 'Good day',
  visibilityDescription: 'Excellent Visibility',
};

const MOCK_DATA: ForecastResponse = {
  location: { city: 'Columbia', country: 'US', lat: 34.0, lon: -81.03 },
  daily: [
    {
      date: '2026-04-04',
      dayOfWeek: 'Saturday',
      tempHigh: 78,
      tempLow: 62,
      avgHumidity: 55,
      precipitationProbability: 10,
      description: 'Partly cloudy',
      weatherMain: 'Clouds',
      icon: '02d',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
      windSpeed: 10,
      windDirection: 'SW',
      units: 'imperial',
      insights: MOCK_INSIGHTS,
    },
    {
      date: '2026-04-05',
      dayOfWeek: 'Sunday',
      tempHigh: 74,
      tempLow: 58,
      avgHumidity: 60,
      precipitationProbability: 30,
      description: 'Light rain',
      weatherMain: 'Rain',
      icon: '10d',
      iconUrl: 'https://openweathermap.org/img/wn/10d@2x.png',
      windSpeed: 12,
      windDirection: 'NE',
      units: 'imperial',
      insights: MOCK_INSIGHTS,
    },
  ],
};

describe('ForecastList', () => {
  it('renders the section heading', () => {
    render(<ForecastList data={MOCK_DATA} />);
    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
  });

  it('renders one row per forecast day', () => {
    render(<ForecastList data={MOCK_DATA} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
  });

  it('displays abbreviated day names', () => {
    render(<ForecastList data={MOCK_DATA} />);
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('shows high and low temperatures', () => {
    render(<ForecastList data={MOCK_DATA} />);
    expect(screen.getByText('78°F')).toBeInTheDocument();
    expect(screen.getByText('62°F')).toBeInTheDocument();
  });

  it('shows precipitation probability when above zero', () => {
    render(<ForecastList data={MOCK_DATA} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });
});
