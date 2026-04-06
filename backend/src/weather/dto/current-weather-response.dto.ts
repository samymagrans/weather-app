import { ApiProperty } from '@nestjs/swagger';
import { ComfortIndexType, WeatherInsights } from '../utils/weather-insights.util';

export class LocationDto {
  @ApiProperty({ example: 'Columbia' }) city: string;
  @ApiProperty({ example: 'US' }) country: string;
  @ApiProperty({ example: 34.0007 }) lat: number;
  @ApiProperty({ example: -81.0348 }) lon: number;
}

export class CurrentConditionsDto {
  @ApiProperty({ description: 'Temperature in the requested unit', example: 72 })
  temperature: number;

  @ApiProperty({ description: 'Feels-like temperature in the requested unit', example: 70 })
  feelsLike: number;

  @ApiProperty({ example: 68 }) tempMin: number;
  @ApiProperty({ example: 76 }) tempMax: number;
  @ApiProperty({ description: 'Relative humidity 0–100', example: 65 }) humidity: number;
  @ApiProperty({ description: 'Atmospheric pressure in hPa', example: 1015 }) pressure: number;
  @ApiProperty({ example: 'Partly cloudy' }) description: string;
  @ApiProperty({ description: 'OpenWeather condition group', example: 'Clouds' }) weatherMain: string;
  @ApiProperty({ example: '02d' }) icon: string;
  @ApiProperty({ example: 'https://openweathermap.org/img/wn/02d@2x.png' }) iconUrl: string;
  @ApiProperty({ example: 8 }) windSpeed: number;
  @ApiProperty({ example: 'NE' }) windDirection: string;

  @ApiProperty({ required: false, example: 12 })
  windGust?: number;

  @ApiProperty({ description: 'Visibility in meters', example: 10000 }) visibility: number;
  @ApiProperty({ description: 'Cloud coverage 0–100%', example: 40 }) cloudCoverage: number;
  @ApiProperty({ example: '2026-04-03T10:45:00.000Z' }) sunrise: string;
  @ApiProperty({ example: '2026-04-03T23:55:00.000Z' }) sunset: string;
  @ApiProperty({ example: '2026-04-03T18:00:00.000Z' }) observedAt: string;
  @ApiProperty({ enum: ['imperial', 'metric'], example: 'imperial' }) units: string;
}

export class ComfortIndexDto {
  @ApiProperty({ description: 'Apparent temperature in °F', example: 78 }) value: number;
  @ApiProperty({ example: 'Caution' }) label: string;
  @ApiProperty({ example: 'Fatigue possible with prolonged exposure' }) description: string;
  @ApiProperty({ enum: ['heat_index', 'wind_chill', 'feels_like'] }) type: ComfortIndexType;
}

export class InsightsDto {
  @ApiProperty({ type: ComfortIndexDto }) comfortIndex: ComfortIndexDto;
  @ApiProperty({ example: 'Light Breeze' }) windCondition: string;
  @ApiProperty({ example: 'Comfortable' }) humidityComfort: string;
  @ApiProperty({ example: 'Good day for outdoor activities' }) activityRecommendation: string;
  @ApiProperty({ example: 'Excellent Visibility' }) visibilityDescription: string;
}

export class CurrentWeatherResponseDto {
  @ApiProperty({ type: LocationDto }) location: LocationDto;
  @ApiProperty({ type: CurrentConditionsDto }) current: CurrentConditionsDto;
  @ApiProperty({ type: InsightsDto }) insights: WeatherInsights;
}
