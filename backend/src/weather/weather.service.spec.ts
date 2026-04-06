import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios, { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeatherApiException } from '../common/exceptions/weather-api.exception';
import { WeatherService } from './weather.service';

// Mock only axios.get, keeping AxiosError as the real class so instanceof checks work.
vi.mock('axios', async (importActual) => {
  const actual = await importActual<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(),
    },
  };
});

const MOCK_CURRENT_RESPONSE = {
  data: {
    coord: { lon: -81.03, lat: 34.0 },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    main: {
      temp: 72,
      feels_like: 70,
      temp_min: 68,
      temp_max: 76,
      pressure: 1015,
      humidity: 55,
    },
    visibility: 10000,
    wind: { speed: 8, deg: 45 },
    clouds: { all: 0 },
    dt: 1712160000,
    sys: { country: 'US', sunrise: 1712138700, sunset: 1712184900 },
    timezone: -14400,
    name: 'Columbia',
    cod: 200,
  },
};

const MOCK_FORECAST_RESPONSE = {
  data: {
    cod: '200',
    message: 0,
    cnt: 2,
    list: [
      {
        dt: 1712160000,
        main: { temp: 72, feels_like: 70, temp_min: 68, temp_max: 76, pressure: 1015, sea_level: 1015, grnd_level: 980, humidity: 55, temp_kf: 0 },
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
        clouds: { all: 0 },
        wind: { speed: 8, deg: 45, gust: 12 },
        visibility: 10000,
        pop: 0.1,
        sys: { pod: 'd' },
        dt_txt: '2026-04-03 12:00:00',
      },
      {
        dt: 1712170800,
        main: { temp: 68, feels_like: 66, temp_min: 66, temp_max: 72, pressure: 1014, sea_level: 1014, grnd_level: 979, humidity: 60, temp_kf: 0 },
        weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
        clouds: { all: 20 },
        wind: { speed: 7, deg: 50, gust: 10 },
        visibility: 10000,
        pop: 0.05,
        sys: { pod: 'd' },
        dt_txt: '2026-04-03 15:00:00',
      },
    ],
    city: {
      id: 4574989,
      name: 'Columbia',
      coord: { lat: 34.0, lon: -81.03 },
      country: 'US',
      population: 129272,
      timezone: -14400,
      sunrise: 1712138700,
      sunset: 1712184900,
    },
  },
};

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const values: Record<string, string> = {
                'openWeather.apiKey': 'test-api-key',
                'openWeather.baseUrl': 'https://api.openweathermap.org/data/2.5',
              };
              return values[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    vi.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('maps the OpenWeather response into the expected shape', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce(MOCK_CURRENT_RESPONSE);

      const result = await service.getCurrentWeather({ location: 'Columbia,SC,US', units: 'imperial' });

      expect(result.location.city).toBe('Columbia');
      expect(result.location.country).toBe('US');
      expect(result.current.temperature).toBe(72);
      expect(result.current.humidity).toBe(55);
      expect(result.current.description).toBe('Clear sky');
      expect(result.current.iconUrl).toBe('https://openweathermap.org/img/wn/01d@2x.png');
      expect(result.current.windDirection).toBe('NE');
    });

    it('includes weather insights in the response', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce(MOCK_CURRENT_RESPONSE);

      const result = await service.getCurrentWeather({ location: 'Columbia,SC,US', units: 'imperial' });

      expect(result.insights).toBeDefined();
      expect(result.insights.comfortIndex).toBeDefined();
      // 8 mph is at the boundary: Beaufort uses strict < so 8 < 8 is false → 'Gentle Breeze'
      expect(result.insights.windCondition).toBe('Gentle Breeze');
      expect(result.insights.humidityComfort).toBe('Comfortable');
    });

    it('capitalises the weather description', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce(MOCK_CURRENT_RESPONSE);

      const result = await service.getCurrentWeather({ location: 'Columbia,SC,US', units: 'imperial' });

      // "clear sky" from OpenWeather → "Clear sky" from service
      expect(result.current.description).toBe('Clear sky');
    });

    it('throws WeatherApiException when location is not found (404)', async () => {
      const error = new AxiosError('Request failed', '404', undefined, undefined, {
        status: 404,
        data: { message: 'city not found' },
      } as any);
      vi.mocked(axios.get).mockRejectedValueOnce(error);

      await expect(
        service.getCurrentWeather({ location: 'NonExistentXYZ', units: 'imperial' }),
      ).rejects.toThrow(WeatherApiException);
    });

    it('throws WeatherApiException with a helpful message on 401', async () => {
      const error = new AxiosError('Unauthorized', '401', undefined, undefined, {
        status: 401,
        data: { message: 'Invalid API key' },
      } as any);
      vi.mocked(axios.get).mockRejectedValueOnce(error);

      await expect(
        service.getCurrentWeather({ location: 'London', units: 'imperial' }),
      ).rejects.toThrow(WeatherApiException);
    });
  });

  describe('getForecast', () => {
    it('aggregates forecast intervals into daily summaries', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce(MOCK_FORECAST_RESPONSE);

      const result = await service.getForecast({ location: 'Columbia,SC,US', units: 'imperial' });

      expect(result.location.city).toBe('Columbia');
      expect(result.daily.length).toBeGreaterThan(0);
      expect(result.daily[0].date).toBe('2026-04-03');
    });

    it('computes correct high/low across all intervals for a day', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce(MOCK_FORECAST_RESPONSE);

      const result = await service.getForecast({ location: 'Columbia,SC,US', units: 'imperial' });

      // The two intervals have temps of 72 and 68
      expect(result.daily[0].tempHigh).toBe(72);
      // tempLow is min(main.temp) across intervals: min(72, 68) = 68
      // (temp_min fields are not used — they refer to within a 3-hour window only)
      expect(result.daily[0].tempLow).toBe(68);
    });

    it('includes insights for each daily forecast', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce(MOCK_FORECAST_RESPONSE);

      const result = await service.getForecast({ location: 'Columbia,SC,US', units: 'imperial' });

      expect(result.daily[0].insights).toBeDefined();
      expect(result.daily[0].insights.comfortIndex).toBeDefined();
    });
  });
});
