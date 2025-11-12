/**
 * Error Middleware
 * Middleware global para manejo centralizado de errores
 * Principio: Single Responsibility - Solo maneja errores HTTP
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Interfaz para errores personalizados
 */
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Middleware de manejo de errores
 * Captura y formatea todos los errores de la aplicación
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log del error (en producción usar logger apropiado)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determinar código de estado
  const statusCode = err.statusCode || 500;

  // Respuesta de error
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

/**
 * Middleware para rutas no encontradas (404)
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.path}`,
    },
  });
}

/**
 * Crear error personalizado
 */
export function createError(message: string, statusCode: number = 500): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
