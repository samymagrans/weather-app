import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentWeatherResponseDto } from './dto/current-weather-response.dto';
import { ForecastResponseDto } from './dto/forecast-response.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@Controller('weather')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @ApiOperation({
    summary: 'Get current weather',
    description:
      'Returns current conditions plus heat index / wind chill insights for a given location.',
  })
  @ApiQuery({ name: 'location', example: 'Columbia,SC,US' })
  @ApiQuery({ name: 'units', enum: ['imperial', 'metric'], required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current weather data with comfort insights.',
    type: CurrentWeatherResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Location not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid API key.' })
  @ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, description: 'Rate limit exceeded.' })
  getCurrentWeather(@Query() query: WeatherQueryDto): Promise<CurrentWeatherResponseDto> {
    return this.weatherService.getCurrentWeather(query);
  }

  @Get('forecast')
  @ApiOperation({
    summary: 'Get 5-day forecast',
    description:
      'Returns a 5-day daily forecast aggregated from 3-hour OpenWeather intervals. ' +
      'Each day includes high/low temps, precipitation probability, and comfort insights.',
  })
  @ApiQuery({ name: 'location', example: 'Columbia,SC,US' })
  @ApiQuery({ name: 'units', enum: ['imperial', 'metric'], required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '5-day daily forecast.',
    type: ForecastResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Location not found.' })
  getForecast(@Query() query: WeatherQueryDto): Promise<ForecastResponseDto> {
    return this.weatherService.getForecast(query);
  }
}
