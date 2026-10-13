import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ExternalProviderError } from '../providers/OpenMeteoProvider.js';

/**
 * Middleware centralizado para el manejo de errores.
 * Garantiza que nunca se filtren trazas de pila (stack traces) ni detalles internos al cliente.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    res.status(400).json({
      error: `Parámetros de consulta inválidos: ${message}`,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  if (err instanceof ExternalProviderError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Log interno solo en entorno fuera de pruebas
  if (process.env.NODE_ENV !== 'test') {
    console.error('[InternalError]', err);
  }

  res.status(500).json({
    error: 'Error interno del servidor al procesar la solicitud meteorológica.',
    code: 'INTERNAL_SERVER_ERROR',
  });
}
