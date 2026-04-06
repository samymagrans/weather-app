import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export type WeatherUnits = 'imperial' | 'metric';

export class WeatherQueryDto {
  @ApiProperty({
    description:
      'City name, optionally with ISO 3166 state code and country code. ' +
      'Examples: "London", "Columbia,SC,US", "Paris,FR"',
    example: 'Columbia,SC,US',
  })
  @IsString()
  @IsNotEmpty({ message: 'location must not be empty' })
  @MaxLength(100)
  location: string;

  @ApiPropertyOptional({
    description: 'Unit system for temperature and wind speed.',
    enum: ['imperial', 'metric'],
    default: 'imperial',
    example: 'imperial',
  })
  @IsOptional()
  @IsString()
  @IsIn(['imperial', 'metric'], {
    message: 'units must be "imperial" or "metric"',
  })
  units: WeatherUnits = 'imperial';
}
