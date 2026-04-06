import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatPercent,
  formatShortDay,
  formatTemperature,
  formatTime,
  formatVisibility,
  formatWindSpeed,
  getComfortIndexColor,
  getWeatherTheme,
} from './weatherHelpers';

describe('formatTemperature', () => {
  it('formats imperial with °F', () => {
    expect(formatTemperature(72, 'imperial')).toBe('72°F');
  });

  it('formats metric with °C', () => {
    expect(formatTemperature(22, 'metric')).toBe('22°C');
  });

  it('rounds fractional temperatures', () => {
    expect(formatTemperature(72.7, 'imperial')).toBe('73°F');
  });
});

describe('formatWindSpeed', () => {
  it('uses mph for imperial', () => {
    expect(formatWindSpeed(12, 'imperial')).toBe('12 mph');
  });

  it('uses km/h for metric', () => {
    expect(formatWindSpeed(19, 'metric')).toBe('19 km/h');
  });
});

describe('formatPercent', () => {
  it('appends % sign', () => {
    expect(formatPercent(65)).toBe('65%');
  });
});

describe('formatVisibility', () => {
  it('shows rounded miles for imperial distances >= 10 miles', () => {
    // 16,200m ≈ 10.07 miles → rounds to "10 mi"
    expect(formatVisibility(16200, 'imperial')).toBe('10 mi');
  });

  it('shows km for metric', () => {
    expect(formatVisibility(10000, 'metric')).toBe('10 km');
  });

  it('shows decimal for small distances', () => {
    expect(formatVisibility(1000, 'metric')).toBe('1.0 km');
  });
});

describe('formatDate', () => {
  it('returns weekday, month, and day', () => {
    // 2026-04-06 is a Monday
    const result = formatDate('2026-04-06');
    expect(result).toContain('Monday');
    expect(result).toContain('Apr');
    expect(result).toContain('6');
  });
});

describe('formatShortDay', () => {
  it('returns abbreviated weekday', () => {
    // 2026-04-06 is a Monday
    expect(formatShortDay('2026-04-06')).toBe('Mon');
  });
});

describe('formatTime', () => {
  it('returns an AM/PM time string', () => {
    const result = formatTime('2026-04-03T12:00:00.000Z');
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
  });
});

describe('getWeatherTheme', () => {
  it('lowercases the weather main condition', () => {
    expect(getWeatherTheme('Clear')).toBe('clear');
    expect(getWeatherTheme('Thunderstorm')).toBe('thunderstorm');
  });
});

describe('getComfortIndexColor', () => {
  it('returns hot class for heat_index', () => {
    expect(getComfortIndexColor('heat_index')).toBe('comfort--hot');
  });

  it('returns cold class for wind_chill', () => {
    expect(getComfortIndexColor('wind_chill')).toBe('comfort--cold');
  });

  it('returns neutral class for feels_like', () => {
    expect(getComfortIndexColor('feels_like')).toBe('comfort--neutral');
  });
});
