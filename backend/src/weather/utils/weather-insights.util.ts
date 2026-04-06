/**
 * Weather Insights Utilities
 *
 * Pure functions that derive human-readable insights from raw weather data.
 * Keeping these stateless and free of NestJS dependencies makes them
 * trivially unit-testable and reusable across services.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ComfortIndexType = 'heat_index' | 'wind_chill' | 'feels_like';

export interface ComfortIndex {
  /** Apparent temperature value in °F (always Fahrenheit — a defined physical standard) */
  value: number;
  /** Short label, e.g. "Extreme Caution" */
  label: string;
  /** One-sentence explanation of the condition */
  description: string;
  /** Which formula produced this value */
  type: ComfortIndexType;
}

export interface WeatherInsights {
  comfortIndex: ComfortIndex;
  windCondition: string;
  humidityComfort: string;
  activityRecommendation: string;
  visibilityDescription: string;
}

// ---------------------------------------------------------------------------
// Heat Index
// ---------------------------------------------------------------------------

/**
 * Calculates the heat index using the Rothfusz regression equation.
 *
 * The heat index is the "feels-like" temperature that accounts for humidity's
 * effect on the body's ability to cool itself through perspiration.
 *
 * Valid range: tempF >= 80°F and humidity >= 40%.
 * Returns null when conditions are outside the valid range.
 *
 * @see https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 */
export function calculateHeatIndex(
  tempF: number,
  humidity: number,
): number | null {
  if (tempF < 80 || humidity < 40) return null;

  // Full Rothfusz polynomial
  let hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * humidity -
    0.22475541 * tempF * humidity -
    0.00683783 * tempF * tempF -
    0.05391553 * humidity * humidity +
    0.00122874 * tempF * tempF * humidity +
    0.00085282 * tempF * humidity * humidity -
    0.00000199 * tempF * tempF * humidity * humidity;

  // NWS adjustment for low-humidity, high-temp edge case
  if (humidity < 13 && tempF >= 80 && tempF <= 112) {
    hi -= ((13 - humidity) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
  }

  // NWS adjustment for high-humidity, lower-temp edge case
  if (humidity > 85 && tempF >= 80 && tempF <= 87) {
    hi += ((humidity - 85) / 10) * ((87 - tempF) / 5);
  }

  return Math.round(hi);
}

// ---------------------------------------------------------------------------
// Wind Chill
// ---------------------------------------------------------------------------

/**
 * Calculates wind chill using the NWS formula (adopted in 2001).
 *
 * Wind chill represents the cooling effect of wind on exposed skin, making
 * cold air feel colder than the thermometer reading.
 *
 * Valid range: tempF <= 50°F and windSpeedMph >= 3 mph.
 * Returns null when conditions are outside the valid range.
 *
 * @see https://www.weather.gov/media/epz/wxcalc/windChill.pdf
 */
export function calculateWindChill(
  tempF: number,
  windSpeedMph: number,
): number | null {
  if (tempF > 50 || windSpeedMph < 3) return null;

  const wc =
    35.74 +
    0.6215 * tempF -
    35.75 * Math.pow(windSpeedMph, 0.16) +
    0.4275 * tempF * Math.pow(windSpeedMph, 0.16);

  return Math.round(wc);
}

// ---------------------------------------------------------------------------
// Comfort Index orchestrator
// ---------------------------------------------------------------------------

interface HeatIndexThreshold {
  max: number;
  label: string;
  description: string;
}

const HEAT_INDEX_THRESHOLDS: HeatIndexThreshold[] = [
  { max: 90, label: 'Caution', description: 'Fatigue possible with prolonged exposure' },
  { max: 103, label: 'Extreme Caution', description: 'Heat cramps or heat exhaustion possible' },
  { max: 125, label: 'Danger', description: 'Heat cramps or heat exhaustion likely; heat stroke possible' },
  { max: Infinity, label: 'Extreme Danger', description: 'Heat stroke imminent' },
];

interface WindChillThreshold {
  min: number;
  label: string;
  description: string;
}

const WIND_CHILL_THRESHOLDS: WindChillThreshold[] = [
  { min: 32, label: 'Cold', description: 'Chilly but manageable with appropriate clothing' },
  { min: 16, label: 'Very Cold', description: 'Very cold — dress in warm layers' },
  { min: -17, label: 'Bitterly Cold', description: 'Frostbite possible within 30 minutes of exposure' },
  { min: -35, label: 'Extreme Cold', description: 'Frostbite possible within 10 minutes' },
  { min: -Infinity, label: 'Dangerous Cold', description: 'Frostbite possible within 5 minutes — stay indoors' },
];

/**
 * Determines the appropriate apparent-temperature metric for the given conditions.
 * Priority: heat index first, then wind chill, then plain feels-like.
 */
export function getComfortIndex(
  tempF: number,
  feelsLikeF: number,
  humidity: number,
  windSpeedMph: number,
): ComfortIndex {
  const heatIndex = calculateHeatIndex(tempF, humidity);
  if (heatIndex !== null) {
    const threshold =
      HEAT_INDEX_THRESHOLDS.find((t) => heatIndex < t.max) ??
      HEAT_INDEX_THRESHOLDS[HEAT_INDEX_THRESHOLDS.length - 1];
    return { value: heatIndex, label: threshold.label, description: threshold.description, type: 'heat_index' };
  }

  const windChill = calculateWindChill(tempF, windSpeedMph);
  if (windChill !== null) {
    const threshold =
      WIND_CHILL_THRESHOLDS.find((t) => windChill >= t.min) ??
      WIND_CHILL_THRESHOLDS[WIND_CHILL_THRESHOLDS.length - 1];
    return { value: windChill, label: threshold.label, description: threshold.description, type: 'wind_chill' };
  }

  return {
    value: Math.round(feelsLikeF),
    label: getFeelsLikeLabel(feelsLikeF),
    description: getFeelsLikeDescription(feelsLikeF),
    type: 'feels_like',
  };
}

function getFeelsLikeLabel(tempF: number): string {
  if (tempF < 32) return 'Freezing';
  if (tempF < 50) return 'Cold';
  if (tempF < 65) return 'Cool';
  if (tempF < 75) return 'Comfortable';
  if (tempF < 85) return 'Warm';
  return 'Hot';
}

function getFeelsLikeDescription(tempF: number): string {
  if (tempF < 32) return 'Below freezing — dress warmly';
  if (tempF < 50) return 'Cold — a coat is recommended';
  if (tempF < 65) return 'Cool — a light jacket may be needed';
  if (tempF < 75) return 'Comfortable conditions for most people';
  if (tempF < 85) return 'Warm and pleasant';
  return 'Hot — stay hydrated and seek shade';
}

// ---------------------------------------------------------------------------
// Wind — Beaufort Scale
// ---------------------------------------------------------------------------

interface BeaufortEntry {
  maxMph: number;
  condition: string;
}

const BEAUFORT_SCALE: BeaufortEntry[] = [
  { maxMph: 1, condition: 'Calm' },
  { maxMph: 4, condition: 'Light Air' },
  { maxMph: 8, condition: 'Light Breeze' },
  { maxMph: 13, condition: 'Gentle Breeze' },
  { maxMph: 19, condition: 'Moderate Breeze' },
  { maxMph: 25, condition: 'Fresh Breeze' },
  { maxMph: 32, condition: 'Strong Breeze' },
  { maxMph: 39, condition: 'Near Gale' },
  { maxMph: 47, condition: 'Gale' },
  { maxMph: 55, condition: 'Severe Gale' },
  { maxMph: 64, condition: 'Storm' },
  { maxMph: 73, condition: 'Violent Storm' },
  { maxMph: Infinity, condition: 'Hurricane Force' },
];

/**
 * Classifies wind speed using the Beaufort scale.
 * @see https://www.weather.gov/mfl/beaufort
 */
export function getWindCondition(windSpeedMph: number): string {
  const entry = BEAUFORT_SCALE.find((b) => windSpeedMph < b.maxMph);
  return entry?.condition ?? 'Hurricane Force';
}

// ---------------------------------------------------------------------------
// Humidity
// ---------------------------------------------------------------------------

/**
 * Describes relative humidity comfort in plain language.
 */
export function getHumidityComfort(humidity: number): string {
  if (humidity < 25) return 'Very Dry';
  if (humidity < 40) return 'Dry';
  if (humidity < 60) return 'Comfortable';
  if (humidity < 70) return 'Humid';
  if (humidity < 85) return 'Very Humid';
  return 'Oppressive';
}

// ---------------------------------------------------------------------------
// Visibility
// ---------------------------------------------------------------------------

/**
 * Converts visibility in meters to a descriptive label.
 */
export function getVisibilityDescription(visibilityMeters: number): string {
  const miles = visibilityMeters / 1609.34;
  if (miles < 0.25) return 'Dense Fog';
  if (miles < 0.5) return 'Heavy Fog';
  if (miles < 1) return 'Moderate Fog';
  if (miles < 3) return 'Light Fog / Haze';
  if (miles < 6) return 'Haze';
  if (miles < 10) return 'Good Visibility';
  return 'Excellent Visibility';
}

// ---------------------------------------------------------------------------
// Cardinal direction
// ---------------------------------------------------------------------------

const CARDINAL_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/**
 * Converts a meteorological wind direction in degrees to a compass label.
 */
export function getCardinalDirection(degrees: number): string {
  const index = Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16;
  return CARDINAL_DIRECTIONS[index];
}

// ---------------------------------------------------------------------------
// Activity recommendation
// ---------------------------------------------------------------------------

/**
 * Returns a plain-English recommendation based on current conditions.
 * Rules are evaluated in priority order from most dangerous to most pleasant.
 */
export function getActivityRecommendation(
  weatherMain: string,
  tempF: number,
  windSpeedMph: number,
  humidity: number,
  precipitationProbability = 0,
): string {
  const condition = weatherMain.toLowerCase();

  if (condition === 'thunderstorm') {
    return 'Stay indoors — lightning and severe weather present';
  }
  if (condition === 'tornado' || condition === 'squall') {
    return 'Seek shelter immediately — dangerous conditions';
  }
  if (condition === 'snow' || condition === 'blizzard') {
    return 'Travel with caution — snow and reduced visibility';
  }
  if (precipitationProbability > 0.7 || condition === 'rain' || condition === 'drizzle') {
    return 'Bring an umbrella — precipitation likely';
  }
  if (windSpeedMph > 40) {
    return 'Stay indoors if possible — dangerous wind speeds';
  }
  if (windSpeedMph > 25) {
    return 'High winds — secure loose outdoor items and dress in layers';
  }
  if (tempF >= 80 && humidity >= 40) {
    const hi = calculateHeatIndex(tempF, humidity);
    if (hi !== null && hi >= 103) return 'Limit outdoor activity — dangerous heat index';
    if (hi !== null && hi >= 90) return 'Take breaks and stay hydrated outdoors';
  }
  if (tempF <= 0) {
    return 'Minimize time outdoors — dangerously cold temperatures';
  }
  if (tempF < 20) {
    return 'Keep outdoor exposure brief — extreme cold';
  }
  if (tempF < 32) {
    return 'Bundle up — temperatures are below freezing';
  }
  if (tempF >= 65 && tempF <= 80 && humidity < 65 && windSpeedMph < 20 && precipitationProbability < 0.2) {
    return 'Ideal conditions — great day for outdoor activities';
  }
  if (precipitationProbability < 0.3 && tempF > 50 && tempF < 90) {
    return 'Good conditions for outdoor activities';
  }
  return 'Typical conditions — dress appropriately for the weather';
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

/**
 * Assembles the full WeatherInsights object from raw weather measurements.
 * All temperature inputs must be in °F; wind speed in mph; visibility in meters.
 */
export function buildWeatherInsights(
  tempF: number,
  feelsLikeF: number,
  humidity: number,
  windSpeedMph: number,
  visibilityMeters: number,
  weatherMain: string,
  precipitationProbability = 0,
): WeatherInsights {
  return {
    comfortIndex: getComfortIndex(tempF, feelsLikeF, humidity, windSpeedMph),
    windCondition: getWindCondition(windSpeedMph),
    humidityComfort: getHumidityComfort(humidity),
    activityRecommendation: getActivityRecommendation(
      weatherMain,
      tempF,
      windSpeedMph,
      humidity,
      precipitationProbability,
    ),
    visibilityDescription: getVisibilityDescription(visibilityMeters),
  };
}
