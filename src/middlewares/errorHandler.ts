import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DomainException, InvalidStateTransitionException, BusinessRuleViolationException } from '../core/domain/exceptions/DomainException';
import { ApplicationException, EntityNotFoundException } from '../core/application/exceptions/ApplicationException';
import { Logger } from '../infrastructure/logging/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req.headers['x-request-id'] as string) || undefined;

  // 1. Error de validación Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'ERROR_VALIDACION',
      mensaje: 'Los datos de entrada no cumplen con las restricciones del sistema',
      errores: err.errors.map(e => ({
        campo: e.path.join('.'),
        mensaje: e.message
      })),
      ...(correlationId && { correlationId })
    });
    return;
  }

  // 2. Transición inválida de la Máquina de Estados (FSM)
  if (err instanceof InvalidStateTransitionException) {
    res.status(400).json({
      status: 'ERROR',
      mensaje: err.message,
      codigo: err.code,
      ...(correlationId && { correlationId })
    });
    return;
  }

  // 3. Reglas de negocio de Dominio
  if (err instanceof BusinessRuleViolationException) {
    const isValidationStyle = err.message.includes('Estado inválido');
    res.status(400).json({
      status: isValidationStyle ? 'ERROR_VALIDACION' : 'ERROR',
      mensaje: err.message,
      codigo: err.code,
      ...(correlationId && { correlationId })
    });
    return;
  }

  if (err instanceof DomainException) {
    res.status(400).json({
      status: 'ERROR',
      mensaje: err.message,
      codigo: err.code,
      ...(correlationId && { correlationId })
    });
    return;
  }

  // 4. Errores de Aplicación (404, 409, etc.)
  if (err instanceof EntityNotFoundException) {
    res.status(err.statusCode).json({
      status: 'ERROR',
      mensaje: err.message,
      codigo: err.code,
      ...(correlationId && { correlationId })
    });
    return;
  }

  if (err instanceof ApplicationException) {
    res.status(err.statusCode).json({
      status: 'ERROR',
      mensaje: err.message,
      codigo: err.code,
      ...(correlationId && { correlationId })
    });
    return;
  }

  // 5. Errores genéricos o no controlados (500)
  const status = typeof err?.status === 'number' ? err.status : 500;
  const mensaje = err?.message || 'Error interno del servidor';

  Logger.error('Error no controlado en LogiTrack API', err, { correlationId, path: req.path, method: req.method });

  res.status(status).json({
    status: 'ERROR',
    mensaje,
    ...(correlationId && { correlationId }),
    detalles: process.env.NODE_ENV === 'development' ? err?.stack : undefined
  });
}
