import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

const MOCK_CURRENT = {
  location: { city: 'London', country: 'GB', lat: 51.51, lon: -0.13 },
  current: {
    temperature: 60, feelsLike: 58, tempMin: 55, tempMax: 63, humidity: 70,
    pressure: 1012, description: 'Overcast clouds', weatherMain: 'Clouds',
    icon: '04d', iconUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
    windSpeed: 12, windDirection: 'W', visibility: 10000, cloudCoverage: 100,
    sunrise: '2026-04-03T05:30:00.000Z', sunset: '2026-04-03T18:45:00.000Z',
    observedAt: '2026-04-03T14:00:00.000Z', units: 'imperial',
  },
  insights: {
    comfortIndex: { value: 58, label: 'Cool', description: 'Cool — a light jacket may be needed', type: 'feels_like' },
    windCondition: 'Gentle Breeze',
    humidityComfort: 'Humid',
    activityRecommendation: 'Good conditions for outdoor activities',
    visibilityDescription: 'Excellent Visibility',
  },
};

const MOCK_FORECAST = {
  location: { city: 'London', country: 'GB', lat: 51.51, lon: -0.13 },
  daily: [],
};

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getCurrentWeather: vi.fn().mockResolvedValue(MOCK_CURRENT),
            getForecast: vi.fn().mockResolvedValue(MOCK_FORECAST),
          },
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  describe('getCurrentWeather', () => {
    it('delegates to WeatherService.getCurrentWeather', async () => {
      const query = { location: 'London', units: 'imperial' as const };
      const result = await controller.getCurrentWeather(query);

      expect(weatherService.getCurrentWeather).toHaveBeenCalledWith(query);
      expect(result.location.city).toBe('London');
    });

    it('passes the units parameter through to the service', async () => {
      const query = { location: 'Paris', units: 'metric' as const };
      await controller.getCurrentWeather(query);

      expect(weatherService.getCurrentWeather).toHaveBeenCalledWith(
        expect.objectContaining({ units: 'metric' }),
      );
    });
  });

  describe('getForecast', () => {
    it('delegates to WeatherService.getForecast', async () => {
      const query = { location: 'London', units: 'imperial' as const };
      const result = await controller.getForecast(query);

      expect(weatherService.getForecast).toHaveBeenCalledWith(query);
      expect(result.location.city).toBe('London');
    });
  });
});
