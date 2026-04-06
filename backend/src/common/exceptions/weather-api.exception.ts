import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown when an upstream OpenWeather API call fails.
 * Maps vendor-specific HTTP status codes to appropriate client-facing codes.
 */
export class WeatherApiException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_GATEWAY,
  ) {
    super(
      {
        statusCode,
        error: 'Weather API Error',
        message,
      },
      statusCode,
    );
  }
}
