import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { MemoryCache } from '../cache/MemoryCache.js';
import { WeatherProvider } from '../providers/WeatherProvider.js';
import { AirQualityResponse, GeocodingResult, WeatherResponse } from '../types/weather.js';

const geocodeQuerySchema = z.object({
  q: z
    .string({ required_error: 'El parámetro "q" es obligatorio.' })
    .trim()
    .min(2, 'La búsqueda debe contener al menos 2 caracteres.')
    .max(100, 'La búsqueda no puede exceder 100 caracteres.'),
});

const coordinatesQuerySchema = z.object({
  lat: z.coerce
    .number({ invalid_type_error: 'La latitud debe ser un número válido.' })
    .min(-90, 'La latitud debe estar entre -90 y 90.')
    .max(90, 'La latitud debe estar entre -90 y 90.'),
  lon: z.coerce
    .number({ invalid_type_error: 'La longitud debe ser un número válido.' })
    .min(-180, 'La longitud debe estar entre -180 y 180.')
    .max(180, 'La longitud debe estar entre -180 y 180.'),
  units: z.enum(['metric', 'imperial']).optional().default('metric'),
});

const airQualityQuerySchema = z.object({
  lat: z.coerce
    .number({ invalid_type_error: 'La latitud debe ser un número válido.' })
    .min(-90, 'La latitud debe estar entre -90 y 90.')
    .max(90, 'La latitud debe estar entre -90 y 90.'),
  lon: z.coerce
    .number({ invalid_type_error: 'La longitud debe ser un número válido.' })
    .min(-180, 'La longitud debe estar entre -180 y 180.')
    .max(180, 'La longitud debe estar entre -180 y 180.'),
});

/**
 * Crea el enrutador de la API inyectando el proveedor meteorológico y el caché en memoria.
 */
export function createApiRouter(provider: WeatherProvider, cache: MemoryCache): Router {
  const router = Router();

  /**
   * GET /api/health
   * Estado de salud del servidor y métricas del caché.
   */
  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      cache: cache.stats(),
    });
  });

  /**
   * GET /api/geocode?q=lima
   * Autocompletado y búsqueda de ciudades por nombre.
   */
  router.get('/geocode', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = geocodeQuerySchema.parse(req.query);
      const cacheKey = `geocode:${q.toLowerCase()}`;

      const cached = cache.get<GeocodingResult[]>(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.json({ results: cached });
        return;
      }

      const results = await provider.searchCities(q);
      // Guardar geocodificación por 1 hora (3600s) ya que las coordenadas de ciudades no cambian
      cache.set(cacheKey, results, 3600);

      res.setHeader('X-Cache', 'MISS');
      res.json({ results });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/weather?lat=-12.04&lon=-77.04&units=metric
   * Clima actual + pronóstico horario (24h) + pronóstico diario (7 días).
   */
  router.get('/weather', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lon, units } = coordinatesQuerySchema.parse(req.query);
      const roundedLat = lat.toFixed(3);
      const roundedLon = lon.toFixed(3);
      const cacheKey = `weather:${roundedLat}:${roundedLon}:${units}`;

      const cached = cache.get<WeatherResponse>(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.json(cached);
        return;
      }

      const weather = await provider.getWeather(lat, lon, units);
      cache.set(cacheKey, weather);

      res.setHeader('X-Cache', 'MISS');
      res.json(weather);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/air-quality?lat=-12.04&lon=-77.04
   * Calidad del aire actual (AQI, PM2.5, PM10, NO2, O3).
   */
  router.get('/air-quality', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lat, lon } = airQualityQuerySchema.parse(req.query);
      const roundedLat = lat.toFixed(3);
      const roundedLon = lon.toFixed(3);
      const cacheKey = `aqi:${roundedLat}:${roundedLon}`;

      const cached = cache.get<AirQualityResponse>(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.json(cached);
        return;
      }

      const airQuality = await provider.getAirQuality(lat, lon);
      cache.set(cacheKey, airQuality);

      res.setHeader('X-Cache', 'MISS');
      res.json(airQuality);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
