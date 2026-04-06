import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

import { WeatherApiException } from '../common/exceptions/weather-api.exception';
import { CurrentWeatherResponseDto } from './dto/current-weather-response.dto';
import { DailyForecastDto, ForecastResponseDto } from './dto/forecast-response.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { OpenWeatherCurrentResponse } from './interfaces/openweather-current.interface';
import {
  OpenWeatherForecastItem,
  OpenWeatherForecastResponse,
} from './interfaces/openweather-forecast.interface';
import {
  buildWeatherInsights,
  getCardinalDirection,
} from './utils/weather-insights.util';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('openWeather.baseUrl');
    this.apiKey = this.config.get<string>('openWeather.apiKey');
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  async getCurrentWeather(query: WeatherQueryDto): Promise<CurrentWeatherResponseDto> {
    this.logger.log(`Fetching current weather — location: "${query.location}", units: ${query.units}`);
    const raw = await this.fetchCurrentWeather(query.location, query.units);
    return this.mapCurrentWeather(raw, query.units);
  }

  async getForecast(query: WeatherQueryDto): Promise<ForecastResponseDto> {
    this.logger.log(`Fetching forecast — location: "${query.location}", units: ${query.units}`);
    const raw = await this.fetchForecast(query.location, query.units);
    return this.mapForecast(raw, query.units);
  }

  // ---------------------------------------------------------------------------
  // OpenWeather API calls (direct REST — no wrapper library)
  // ---------------------------------------------------------------------------

  private async fetchCurrentWeather(
    location: string,
    units: string,
  ): Promise<OpenWeatherCurrentResponse> {
    try {
      const response = await axios.get<OpenWeatherCurrentResponse>(
        `${this.baseUrl}/weather`,
        { params: { q: location, appid: this.apiKey, units } },
      );
      return response.data;
    } catch (error) {
      this.handleUpstreamError(error, location);
    }
  }

  private async fetchForecast(
    location: string,
    units: string,
  ): Promise<OpenWeatherForecastResponse> {
    try {
      const response = await axios.get<OpenWeatherForecastResponse>(
        `${this.baseUrl}/forecast`,
        { params: { q: location, appid: this.apiKey, units, cnt: 40 } },
      );
      return response.data;
    } catch (error) {
      this.handleUpstreamError(error, location);
    }
  }

  // ---------------------------------------------------------------------------
  // Response mapping
  // ---------------------------------------------------------------------------

  private mapCurrentWeather(
    data: OpenWeatherCurrentResponse,
    units: string,
  ): CurrentWeatherResponseDto {
    const tempF = this.toFahrenheit(data.main.temp, units);
    const feelsLikeF = this.toFahrenheit(data.main.feels_like, units);
    const windSpeedMph = this.toMph(data.wind.speed, units);

    const insights = buildWeatherInsights(
      tempF,
      feelsLikeF,
      data.main.humidity,
      windSpeedMph,
      data.visibility ?? 10000,
      data.weather[0].main,
    );

    return {
      location: {
        city: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: this.capitalize(data.weather[0].description),
        weatherMain: data.weather[0].main,
        icon: data.weather[0].icon,
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        windSpeed: Math.round(data.wind.speed),
        windDirection: getCardinalDirection(data.wind.deg),
        windGust: data.wind.gust != null ? Math.round(data.wind.gust) : undefined,
        visibility: data.visibility ?? 10000,
        cloudCoverage: data.clouds.all,
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString(),
        observedAt: new Date(data.dt * 1000).toISOString(),
        units,
      },
      insights,
    };
  }

  private mapForecast(
    data: OpenWeatherForecastResponse,
    units: string,
  ): ForecastResponseDto {
    const grouped = this.groupByDate(data.list);
    const daily = Object.entries(grouped)
      .slice(0, 5)
      .map(([date, items]) => this.buildDailyForecast(date, items, units));

    return {
      location: {
        city: data.city.name,
        country: data.city.country,
        lat: data.city.coord.lat,
        lon: data.city.coord.lon,
      },
      daily,
    };
  }

  /**
   * Groups the 3-hour forecast intervals by calendar date (YYYY-MM-DD).
   * Date is derived from the dt_txt field so it uses the city's local date.
   */
  private groupByDate(
    items: OpenWeatherForecastItem[],
  ): Record<string, OpenWeatherForecastItem[]> {
    return items.reduce<Record<string, OpenWeatherForecastItem[]>>((acc, item) => {
      const date = item.dt_txt.split(' ')[0];
      acc[date] = acc[date] ?? [];
      acc[date].push(item);
      return acc;
    }, {});
  }

  /**
   * Aggregates a day's 3-hour intervals into a single daily summary.
   * High/low are the true max/min across all intervals.
   * The representative condition uses the midday (12:00) reading when available.
   */
  private buildDailyForecast(
    date: string,
    items: OpenWeatherForecastItem[],
    units: string,
  ): DailyForecastDto {
    const allTemps = items.map((i) => i.main.temp);
    const tempHigh = Math.round(Math.max(...allTemps));
    const tempLow = Math.round(Math.min(...allTemps));
    const avgHumidity = Math.round(
      items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length,
    );
    const maxPop = Math.max(...items.map((i) => i.pop));

    // Prefer the midday reading for representative icon/description
    const representative =
      items.find((i) => i.dt_txt.includes('12:00:00')) ??
      items[Math.floor(items.length / 2)];

    const repTempF = this.toFahrenheit(representative.main.temp, units);
    const repFeelsLikeF = this.toFahrenheit(representative.main.feels_like, units);
    const repWindMph = this.toMph(representative.wind.speed, units);

    const insights = buildWeatherInsights(
      repTempF,
      repFeelsLikeF,
      avgHumidity,
      repWindMph,
      representative.visibility ?? 10000,
      representative.weather[0].main,
      maxPop,
    );

    const dayOfWeek = new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    });

    return {
      date,
      dayOfWeek,
      tempHigh,
      tempLow,
      avgHumidity,
      precipitationProbability: Math.round(maxPop * 100),
      description: this.capitalize(representative.weather[0].description),
      weatherMain: representative.weather[0].main,
      icon: representative.weather[0].icon,
      iconUrl: `https://openweathermap.org/img/wn/${representative.weather[0].icon}@2x.png`,
      windSpeed: Math.round(representative.wind.speed),
      windDirection: getCardinalDirection(representative.wind.deg),
      units,
      insights,
    };
  }

  // ---------------------------------------------------------------------------
  // Unit conversion helpers
  // ---------------------------------------------------------------------------

  /**
   * Converts a temperature to Fahrenheit if it arrived in Celsius (metric units).
   * Heat index and wind chill formulas are defined in °F, so we always compute
   * insights in imperial regardless of the user's chosen units.
   */
  private toFahrenheit(value: number, units: string): number {
    return units === 'metric' ? (value * 9) / 5 + 32 : value;
  }

  /**
   * Converts wind speed to mph if it arrived in m/s (metric units).
   * Beaufort scale and wind chill formula use mph.
   */
  private toMph(value: number, units: string): number {
    return units === 'metric' ? value * 2.23694 : value;
  }

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

  /**
   * Maps Axios errors (including OpenWeather's HTTP status codes) to typed
   * WeatherApiExceptions with user-friendly messages.
   */
  private handleUpstreamError(error: unknown, location: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const vendorMessage = error.response?.data?.message ?? error.message;

      this.logger.error(
        `OpenWeather API error for "${location}": HTTP ${status ?? 'N/A'} — ${vendorMessage}`,
      );

      if (status === 404) {
        throw new WeatherApiException(
          `Location "${location}" was not found. Check spelling or try "City,StateCode,CountryCode".`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (status === 401) {
        throw new WeatherApiException(
          'Invalid OpenWeather API key. Set OPENWEATHER_API_KEY in the backend .env file.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (status === 429) {
        throw new WeatherApiException(
          'Weather service rate limit reached. Please wait a moment and try again.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new WeatherApiException(
        `Weather service error: ${vendorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    throw new WeatherApiException(
      'An unexpected error occurred while contacting the weather service.',
    );
  }

  // ---------------------------------------------------------------------------
  // Formatting helpers
  // ---------------------------------------------------------------------------

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
