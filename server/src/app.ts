import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { MemoryCache } from './cache/MemoryCache.js';
import { errorHandler } from './middleware/errorHandler.js';
import { OpenMeteoProvider } from './providers/OpenMeteoProvider.js';
import { WeatherProvider } from './providers/WeatherProvider.js';
import { createApiRouter } from './routes/api.js';

export interface AppDependencies {
  provider?: WeatherProvider;
  cache?: MemoryCache;
}

/**
 * Crea y configura la aplicación Express con seguridad (Helmet, CORS, Rate Limiting),
 * caché en memoria y rutas normalizadas.
 */
export function createApp(deps: AppDependencies = {}): Express {
  const app = express();

  const cacheTtl = Number(process.env.CACHE_TTL_SECONDS) || 600;
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

  const provider = deps.provider ?? new OpenMeteoProvider();
  const cache = deps.cache ?? new MemoryCache(cacheTtl);

  // Cabeceras de seguridad HTTP
  app.use(helmet());

  // Configuración CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigin === '*' ||
          origin === allowedOrigin ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          callback(null, true);
        } else {
          callback(new Error('Origen no permitido por CORS'));
        }
      },
      methods: ['GET'],
    })
  );

  app.use(express.json());

  // Limitador de peticiones para prevenir abuso (120 peticiones por minuto por IP)
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Demasiadas solicitudes desde esta dirección IP. Por favor intenta de nuevo en un minuto.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  });

  app.use('/api', limiter, createApiRouter(provider, cache));

  // Ruta 404 para endpoints no existentes
  app.use((_req, res) => {
    res.status(404).json({
      error: 'Recurso o endpoint no encontrado.',
      code: 'NOT_FOUND',
    });
  });

  // Manejo centralizado de errores
  app.use(errorHandler);

  return app;
}
