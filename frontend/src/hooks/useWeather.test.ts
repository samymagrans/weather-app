import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as weatherApi from '../services/weatherApi';
import { useWeather } from './useWeather';

const MOCK_CURRENT = {
  location: { city: 'Columbia', country: 'US', lat: 34.0, lon: -81.03 },
  current: {
    temperature: 72, feelsLike: 70, tempMin: 68, tempMax: 76,
    humidity: 55, pressure: 1015, description: 'Clear sky',
    weatherMain: 'Clear', icon: '01d',
    iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
    windSpeed: 8, windDirection: 'NE', visibility: 10000,
    cloudCoverage: 0, sunrise: '2026-04-03T10:45:00.000Z',
    sunset: '2026-04-03T23:55:00.000Z', observedAt: '2026-04-03T18:00:00.000Z',
    units: 'imperial' as const,
  },
  insights: {
    comfortIndex: { value: 70, label: 'Comfortable', description: 'Comfortable conditions', type: 'feels_like' as const },
    windCondition: 'Light Breeze',
    humidityComfort: 'Comfortable',
    activityRecommendation: 'Ideal conditions',
    visibilityDescription: 'Excellent Visibility',
  },
};

const MOCK_FORECAST = {
  location: { city: 'Columbia', country: 'US', lat: 34.0, lon: -81.03 },
  daily: [],
};

describe('useWeather', () => {
  beforeEach(() => {
    vi.spyOn(weatherApi, 'fetchCurrentWeather').mockResolvedValue(MOCK_CURRENT);
    vi.spyOn(weatherApi, 'fetchForecast').mockResolvedValue(MOCK_FORECAST);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with no data and no error', () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current.currentWeather).toBeNull();
    expect(result.current.forecast).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets isLoading to true while fetching', async () => {
    const { result } = renderHook(() => useWeather());

    let resolveWeather: (v: typeof MOCK_CURRENT) => void;
    vi.spyOn(weatherApi, 'fetchCurrentWeather').mockReturnValue(
      new Promise<typeof MOCK_CURRENT>((resolve) => { resolveWeather = resolve; }),
    );

    act(() => {
      result.current.search('Columbia,SC,US', 'imperial');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveWeather!(MOCK_CURRENT);
    });
  });

  it('populates weather data on successful search', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Columbia,SC,US', 'imperial');
    });

    expect(result.current.currentWeather?.location.city).toBe('Columbia');
    expect(result.current.forecast).toEqual(MOCK_FORECAST);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error message when the API call fails', async () => {
    vi.spyOn(weatherApi, 'fetchCurrentWeather').mockRejectedValue(
      new Error('Location "Atlantis" was not found.'),
    );

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Atlantis', 'imperial');
    });

    expect(result.current.error).toBe('Location "Atlantis" was not found.');
    expect(result.current.currentWeather).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('resets state when clear() is called', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Columbia,SC,US', 'imperial');
    });

    expect(result.current.currentWeather).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.currentWeather).toBeNull();
    expect(result.current.forecast).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
