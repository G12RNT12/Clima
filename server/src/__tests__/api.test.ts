import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { MemoryCache } from '../cache/MemoryCache.js';
import { WeatherProvider } from '../providers/WeatherProvider.js';
import {
  AirQualityResponse,
  GeocodingResult,
  WeatherResponse,
} from '../types/weather.js';
import {
  degreesToCompass,
  resolveAqiCategory,
  resolveWeatherCondition,
} from '../utils/weatherCodes.js';

const mockCities: GeocodingResult[] = [
  {
    id: 3936456,
    name: 'Lima',
    country: 'Perú',
    countryCode: 'PE',
    region: 'Lima',
    latitude: -12.0464,
    longitude: -77.0428,
    timezone: 'America/Lima',
  },
];

const mockWeather: WeatherResponse = {
  location: {
    latitude: -12.0464,
    longitude: -77.0428,
    timezone: 'America/Lima',
  },
  units: 'metric',
  current: {
    temperature: 22.5,
    feelsLike: 23.1,
    tempMax: 24.0,
    tempMin: 18.5,
    humidity: 78,
    windSpeed: 14.2,
    windDirection: 180,
    windCompass: 'S',
    pressure: 1014,
    uvIndex: 6.5,
    visibility: 10,
    precipitationProb: 10,
    isDay: true,
    sunrise: '2026-10-13T05:48',
    sunset: '2026-10-13T18:09',
    localTime: '2026-10-13T12:00',
    timezone: 'America/Lima',
    condition: {
      code: 1,
      description: 'Mayormente despejado',
      icon: 'partly-cloudy-day',
      category: 'clear',
    },
  },
  hourly: [],
  daily: [],
  cachedAt: '2026-10-13T12:00:00.000Z',
};

const mockAirQuality: AirQualityResponse = {
  aqi: 42,
  europeanAqi: 30,
  category: 'Buena',
  description: 'La calidad del aire es satisfactoria y representa poco o ningún riesgo.',
  pm25: 10.2,
  pm10: 21.5,
  no2: 8.4,
  o3: 45.1,
  cachedAt: '2026-10-13T12:00:00.000Z',
};

describe('Utilidades meteorológicas (weatherCodes)', () => {
  it('traduce códigos WMO conocidos correctamente según día/noche', () => {
    const clearDay = resolveWeatherCondition(0, true);
    expect(clearDay.description).toBe('Cielo despejado');
    expect(clearDay.icon).toBe('sun');
    expect(clearDay.category).toBe('clear');

    const clearNight = resolveWeatherCondition(0, false);
    expect(clearNight.icon).toBe('moon');

    const storm = resolveWeatherCondition(95, true);
    expect(storm.category).toBe('storm');
    expect(storm.icon).toBe('thunderstorm');
  });

  it('maneja códigos WMO desconocidos de forma segura', () => {
    const unknown = resolveWeatherCondition(999, true);
    expect(unknown.description).toBe('Condición desconocida');
    expect(unknown.category).toBe('cloudy');
  });

  it('convierte grados de viento a puntos cardinales en español', () => {
    expect(degreesToCompass(0)).toBe('N');
    expect(degreesToCompass(45)).toBe('NE');
    expect(degreesToCompass(90)).toBe('E');
    expect(degreesToCompass(180)).toBe('S');
    expect(degreesToCompass(225)).toBe('SO');
    expect(degreesToCompass(270)).toBe('O');
    expect(degreesToCompass(315)).toBe('NO');
    expect(degreesToCompass(360)).toBe('N');
  });

  it('clasifica correctamente el índice AQI', () => {
    expect(resolveAqiCategory(25).category).toBe('Buena');
    expect(resolveAqiCategory(75).category).toBe('Moderada');
    expect(resolveAqiCategory(125).category).toBe('Dañina para grupos sensibles');
    expect(resolveAqiCategory(175).category).toBe('Dañina');
    expect(resolveAqiCategory(250).category).toBe('Muy dañina');
    expect(resolveAqiCategory(350).category).toBe('Peligrosa');
  });
});

describe('Endpoints de la API (/api)', () => {
  let mockProvider: WeatherProvider;
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache(600);
    mockProvider = {
      searchCities: vi.fn().mockResolvedValue(mockCities),
      getWeather: vi.fn().mockResolvedValue(mockWeather),
      getAirQuality: vi.fn().mockResolvedValue(mockAirQuality),
    };
  });

  it('GET /api/health responde 200 con estado ok y métricas de caché', async () => {
    const app = createApp({ provider: mockProvider, cache });
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.cache).toEqual({ size: 0, hits: 0, misses: 0 });
  });

  it('GET /api/geocode valida parámetro q y usa el caché en la segunda llamada', async () => {
    const app = createApp({ provider: mockProvider, cache });

    const invalidRes = await request(app).get('/api/geocode?q=a');
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.code).toBe('VALIDATION_ERROR');

    const firstRes = await request(app).get('/api/geocode?q=Lima');
    expect(firstRes.status).toBe(200);
    expect(firstRes.headers['x-cache']).toBe('MISS');
    expect(firstRes.body.results).toHaveLength(1);
    expect(mockProvider.searchCities).toHaveBeenCalledTimes(1);

    const secondRes = await request(app).get('/api/geocode?q=lima');
    expect(secondRes.status).toBe(200);
    expect(secondRes.headers['x-cache']).toBe('HIT');
    expect(mockProvider.searchCities).toHaveBeenCalledTimes(1);
  });

  it('GET /api/weather valida coordenadas y retorna datos normalizados con caché', async () => {
    const app = createApp({ provider: mockProvider, cache });

    const badCoords = await request(app).get('/api/weather?lat=120&lon=-77');
    expect(badCoords.status).toBe(400);
    expect(badCoords.body.code).toBe('VALIDATION_ERROR');

    const res1 = await request(app).get('/api/weather?lat=-12.0464&lon=-77.0428&units=metric');
    expect(res1.status).toBe(200);
    expect(res1.headers['x-cache']).toBe('MISS');
    expect(res1.body.current.temperature).toBe(22.5);

    const res2 = await request(app).get('/api/weather?lat=-12.0464&lon=-77.0428&units=metric');
    expect(res2.status).toBe(200);
    expect(res2.headers['x-cache']).toBe('HIT');
    expect(mockProvider.getWeather).toHaveBeenCalledTimes(1);
  });

  it('GET /api/air-quality retorna el AQI y contaminantes correctamente', async () => {
    const app = createApp({ provider: mockProvider, cache });

    const res = await request(app).get('/api/air-quality?lat=-12.0464&lon=-77.0428');
    expect(res.status).toBe(200);
    expect(res.body.aqi).toBe(42);
    expect(res.body.category).toBe('Buena');
  });
});
