export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY ?? '',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
});
