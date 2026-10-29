import { correlationIdMiddleware } from '../../src/presentation/http/middlewares/correlationIdMiddleware';
import { rateLimiterMiddleware } from '../../src/presentation/http/middlewares/rateLimiterMiddleware';
import { Logger } from '../../src/infrastructure/logging/logger';
import { Request, Response, NextFunction } from 'express';

describe('Infraestructura: Logger y Middlewares de Seguridad / Trazabilidad', () => {
  describe('correlationIdMiddleware', () => {
    test('Conserva x-request-id existente si ya viene en las cabeceras', () => {
      const req: any = { headers: { 'x-request-id': 'custom-id-999' } };
      const res: any = { setHeader: jest.fn() };
      const next: NextFunction = jest.fn();

      correlationIdMiddleware(req, res, next);

      expect(req.headers['x-request-id']).toBe('custom-id-999');
      expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'custom-id-999');
      expect(next).toHaveBeenCalled();
    });

    test('Genera un nuevo correlationId si no viene provisto en headers', () => {
      const req: any = { headers: {} };
      const res: any = { setHeader: jest.fn() };
      const next: NextFunction = jest.fn();

      correlationIdMiddleware(req, res, next);

      expect(req.headers['x-request-id']).toMatch(/^req-/);
      expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.headers['x-request-id']);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('rateLimiterMiddleware', () => {
    test('Permite el paso inmediato en entorno de tests sin bloquear', () => {
      const req: any = {};
      const res: any = {};
      const next: NextFunction = jest.fn();

      rateLimiterMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Logger estructurado', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('Logger ejecuta métodos sin lanzar excepciones', () => {
      expect(() => {
        Logger.info('Mensaje informativo', { correlationId: 'req-1' });
        Logger.warn('Mensaje de advertencia', { correlationId: 'req-2' });
        Logger.error('Mensaje de error', new Error('Test err'), { correlationId: 'req-3' });
        Logger.debug('Mensaje de debug', { correlationId: 'req-4' });
      }).not.toThrow();
    });
  });
});
