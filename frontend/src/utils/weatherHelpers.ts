import { WeatherUnits } from '../types/weather';

/**
 * Frontend formatting utilities.
 *
 * This module handles display formatting only — no business logic.
 * All insight calculations are performed on the backend.
 */

export function formatTemperature(temp: number, units: WeatherUnits): string {
  const symbol = units === 'imperial' ? '°F' : '°C';
  return `${Math.round(temp)}${symbol}`;
}

export function formatWindSpeed(speed: number, units: WeatherUnits): string {
  const unit = units === 'imperial' ? 'mph' : 'km/h';
  return `${Math.round(speed)} ${unit}`;
}

export function formatPressure(hPa: number): string {
  return `${hPa} hPa`;
}

export function formatVisibility(meters: number, units: WeatherUnits): string {
  if (units === 'imperial') {
    const miles = meters / 1609.34;
    return `${miles >= 10 ? Math.round(miles) : miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  return `${km >= 10 ? Math.round(km) : km.toFixed(1)} km`;
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

/**
 * Formats a UTC ISO timestamp to a human-readable local time string.
 * Example: "6:45 AM"
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a YYYY-MM-DD date string to "Monday, Apr 3".
 * We append T12:00:00Z so the Date constructor treats it as noon UTC,
 * avoiding timezone-related off-by-one day errors.
 */
export function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00Z`);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Returns the short day name from a YYYY-MM-DD string, e.g. "Mon". */
export function formatShortDay(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00Z`);
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

/**
 * Returns a CSS class suffix based on the weather main condition.
 * Used to set data-weather attribute on the root element for dynamic theming.
 */
export function getWeatherTheme(weatherMain: string): string {
  return weatherMain.toLowerCase();
}

/**
 * Returns a Tailwind-like color description for a comfort index type.
 * The actual CSS class is defined in App.css; this maps the type to a label.
 */
export function getComfortIndexColor(
  type: 'heat_index' | 'wind_chill' | 'feels_like',
): string {
  switch (type) {
    case 'heat_index': return 'comfort--hot';
    case 'wind_chill': return 'comfort--cold';
    default: return 'comfort--neutral';
  }
}
