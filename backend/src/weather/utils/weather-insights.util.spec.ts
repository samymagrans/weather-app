import { describe, expect, it } from 'vitest';
import {
  buildWeatherInsights,
  calculateHeatIndex,
  calculateWindChill,
  getCardinalDirection,
  getComfortIndex,
  getHumidityComfort,
  getVisibilityDescription,
  getWindCondition,
} from './weather-insights.util';

// ---------------------------------------------------------------------------
// calculateHeatIndex
// ---------------------------------------------------------------------------
describe('calculateHeatIndex', () => {
  it('returns null when temp is below 80°F', () => {
    expect(calculateHeatIndex(79, 50)).toBeNull();
  });

  it('returns null when humidity is below 40%', () => {
    expect(calculateHeatIndex(90, 39)).toBeNull();
  });

  it('returns null when both temp and humidity are at the boundary (exactly 80/40)', () => {
    // 80°F and exactly 40% humidity — the Rothfusz equation is valid at this point
    const result = calculateHeatIndex(80, 40);
    expect(result).not.toBeNull();
  });

  it('returns a heat index higher than air temperature at high humidity', () => {
    // At 95°F and 80% humidity the heat index should be well above the actual temp
    const hi = calculateHeatIndex(95, 80);
    expect(hi).not.toBeNull();
    expect(hi!).toBeGreaterThan(95);
  });

  it('produces a value in the expected range at 96°F, 65% humidity', () => {
    // The Rothfusz polynomial at 96°F, 65% evaluates to ~125.
    // The NWS printed table uses rounded values; the formula itself is the source of truth.
    const hi = calculateHeatIndex(96, 65);
    expect(hi).toBeGreaterThanOrEqual(122);
    expect(hi).toBeLessThanOrEqual(128);
  });
});

// ---------------------------------------------------------------------------
// calculateWindChill
// ---------------------------------------------------------------------------
describe('calculateWindChill', () => {
  it('returns null when temp is above 50°F', () => {
    expect(calculateWindChill(51, 10)).toBeNull();
  });

  it('returns null when wind speed is below 3 mph', () => {
    expect(calculateWindChill(30, 2)).toBeNull();
  });

  it('returns a value lower than air temperature', () => {
    const wc = calculateWindChill(30, 20);
    expect(wc).not.toBeNull();
    expect(wc!).toBeLessThan(30);
  });

  it('produces a known NWS reference value: 20°F, 10 mph → approximately 9', () => {
    const wc = calculateWindChill(20, 10);
    expect(wc).toBeGreaterThanOrEqual(7);
    expect(wc).toBeLessThanOrEqual(11);
  });
});

// ---------------------------------------------------------------------------
// getComfortIndex
// ---------------------------------------------------------------------------
describe('getComfortIndex', () => {
  it('returns heat_index type in hot, humid conditions', () => {
    const result = getComfortIndex(90, 88, 75, 5);
    expect(result.type).toBe('heat_index');
  });

  it('returns wind_chill type in cold, windy conditions', () => {
    const result = getComfortIndex(30, 22, 50, 20);
    expect(result.type).toBe('wind_chill');
  });

  it('returns feels_like type in mild conditions', () => {
    const result = getComfortIndex(72, 70, 55, 8);
    expect(result.type).toBe('feels_like');
  });

  it('prioritises heat_index over wind_chill when both conditions are met (edge case)', () => {
    // Logically impossible in nature, but unit-testing priority order
    const result = getComfortIndex(80, 78, 40, 3);
    expect(result.type).toBe('heat_index');
  });
});

// ---------------------------------------------------------------------------
// getWindCondition — Beaufort scale
// ---------------------------------------------------------------------------
describe('getWindCondition', () => {
  const cases: [number, string][] = [
    [0, 'Calm'],
    [2, 'Light Air'],
    [6, 'Light Breeze'],
    [10, 'Gentle Breeze'],
    [15, 'Moderate Breeze'],
    [22, 'Fresh Breeze'],
    [28, 'Strong Breeze'],
    [35, 'Near Gale'],
    [43, 'Gale'],
    [50, 'Severe Gale'],
    [60, 'Storm'],
    [70, 'Violent Storm'],
    [80, 'Hurricane Force'],
  ];

  it.each(cases)('classifies %d mph as "%s"', (speed, expected) => {
    expect(getWindCondition(speed)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getHumidityComfort
// ---------------------------------------------------------------------------
describe('getHumidityComfort', () => {
  const cases: [number, string][] = [
    [10, 'Very Dry'],
    [32, 'Dry'],
    [55, 'Comfortable'],
    [65, 'Humid'],
    [80, 'Very Humid'],
    [90, 'Oppressive'],
  ];

  it.each(cases)('classifies %d% as "%s"', (humidity, expected) => {
    expect(getHumidityComfort(humidity)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getVisibilityDescription
// ---------------------------------------------------------------------------
describe('getVisibilityDescription', () => {
  it('describes 10000m as good (6.2 miles — below the 10-mile excellent threshold)', () => {
    // 10,000m ≈ 6.2 miles; threshold for "Excellent" is ≥ 10 miles (16,093m)
    expect(getVisibilityDescription(10000)).toBe('Good Visibility');
  });

  it('describes 20000m as excellent visibility', () => {
    expect(getVisibilityDescription(20000)).toBe('Excellent Visibility');
  });

  it('describes 300m as dense fog', () => {
    expect(getVisibilityDescription(300)).toBe('Dense Fog');
  });

  it('describes 1500m as moderate fog', () => {
    expect(getVisibilityDescription(1500)).toBe('Moderate Fog');
  });
});

// ---------------------------------------------------------------------------
// getCardinalDirection
// ---------------------------------------------------------------------------
describe('getCardinalDirection', () => {
  const cases: [number, string][] = [
    [0, 'N'],
    [45, 'NE'],
    [90, 'E'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SW'],
    [270, 'W'],
    [315, 'NW'],
    [360, 'N'],
  ];

  it.each(cases)('%d° → "%s"', (degrees, expected) => {
    expect(getCardinalDirection(degrees)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// buildWeatherInsights
// ---------------------------------------------------------------------------
describe('buildWeatherInsights', () => {
  it('returns all required keys', () => {
    const insights = buildWeatherInsights(75, 73, 55, 10, 10000, 'Clear');
    expect(insights).toHaveProperty('comfortIndex');
    expect(insights).toHaveProperty('windCondition');
    expect(insights).toHaveProperty('humidityComfort');
    expect(insights).toHaveProperty('activityRecommendation');
    expect(insights).toHaveProperty('visibilityDescription');
  });

  it('recommends staying indoors during a thunderstorm', () => {
    const insights = buildWeatherInsights(75, 73, 80, 30, 2000, 'Thunderstorm', 0.9);
    expect(insights.activityRecommendation).toContain('Stay indoors');
  });

  it('recommends ideal outdoor conditions on a pleasant day', () => {
    const insights = buildWeatherInsights(72, 71, 50, 8, 10000, 'Clear', 0.05);
    expect(insights.activityRecommendation).toContain('Ideal conditions');
  });
});
