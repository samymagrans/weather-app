import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './current-weather-response.dto';
import { WeatherInsights } from '../utils/weather-insights.util';

export class DailyForecastDto {
  @ApiProperty({ example: '2026-04-04' }) date: string;
  @ApiProperty({ example: 'Saturday' }) dayOfWeek: string;
  @ApiProperty({ example: 78 }) tempHigh: number;
  @ApiProperty({ example: 61 }) tempLow: number;
  @ApiProperty({ example: 62 }) avgHumidity: number;
  @ApiProperty({ description: 'Probability of precipitation 0–100', example: 20 })
  precipitationProbability: number;
  @ApiProperty({ example: 'Partly cloudy' }) description: string;
  @ApiProperty({ example: 'Clouds' }) weatherMain: string;
  @ApiProperty({ example: '02d' }) icon: string;
  @ApiProperty({ example: 'https://openweathermap.org/img/wn/02d@2x.png' }) iconUrl: string;
  @ApiProperty({ example: 10 }) windSpeed: number;
  @ApiProperty({ example: 'SW' }) windDirection: string;
  @ApiProperty({ enum: ['imperial', 'metric'] }) units: string;
  @ApiProperty() insights: WeatherInsights;
}

export class ForecastResponseDto {
  @ApiProperty({ type: LocationDto }) location: LocationDto;
  @ApiProperty({ type: [DailyForecastDto] }) daily: DailyForecastDto[];
}
