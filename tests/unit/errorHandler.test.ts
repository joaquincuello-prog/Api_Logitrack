import { errorHandler } from '../../src/middlewares/errorHandler';
import { ZodError } from 'zod';
import {
  InvalidStateTransitionException,
  BusinessRuleViolationException,
  DomainException
} from '../../src/core/domain/exceptions/DomainException';
import {
  EntityNotFoundException,
  ApplicationException
} from '../../src/core/application/exceptions/ApplicationException';
import { Request, Response, NextFunction } from 'express';

describe('Middleware Global de Manejo de Errores - errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {
      headers: { 'x-request-id': 'req-test-123' },
      path: '/api/test',
      method: 'POST'
    };
    mockRes = {
      status: statusMock
    };
    mockNext = jest.fn();
  });

  test('Maneja ZodError devolviendo status 400 y formato ERROR_VALIDACION', () => {
    const zodError = new ZodError([
      {
        code: 'too_small',
        minimum: 3,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Mínimo 3 caracteres',
        path: ['cliente']
      }
    ]);

    errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR_VALIDACION',
        correlationId: 'req-test-123',
        errores: [{ campo: 'cliente', mensaje: 'Mínimo 3 caracteres' }]
      })
    );
  });

  test('Maneja InvalidStateTransitionException devolviendo status 400 con código de error', () => {
    const error = new InvalidStateTransitionException('ADMITIDO', 'ENTREGADO');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        codigo: 'INVALID_STATE_TRANSITION',
        mensaje: expect.stringContaining("no es posible pasar de 'ADMITIDO' a 'ENTREGADO'"),
        correlationId: 'req-test-123'
      })
    );
  });

  test('Maneja BusinessRuleViolationException de estilo validación', () => {
    const error = new BusinessRuleViolationException('Estado inválido: "DESCONOCIDO"');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR_VALIDACION',
        codigo: 'BUSINESS_RULE_VIOLATION'
      })
    );
  });

  test('Maneja EntityNotFoundException devolviendo status 404', () => {
    const error = new EntityNotFoundException('Recurso no encontrado');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        codigo: 'ENTITY_NOT_FOUND',
        mensaje: 'Recurso no encontrado'
      })
    );
  });

  test('Maneja ApplicationException genérica con su código de estado', () => {
    class CustomAppException extends ApplicationException {
      readonly code = 'CUSTOM_APP_ERROR';
      readonly statusCode = 409;
    }

    const error = new CustomAppException('Conflicto de recursos');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        codigo: 'CUSTOM_APP_ERROR',
        mensaje: 'Conflicto de recursos'
      })
    );
  });

  test('Maneja DomainException genérica devolviendo status 400', () => {
    class CustomDomainException extends DomainException {
      readonly code = 'CUSTOM_DOMAIN_ERROR';
    }

    const error = new CustomDomainException('Error de dominio personalizado');
    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        codigo: 'CUSTOM_DOMAIN_ERROR',
        mensaje: 'Error de dominio personalizado'
      })
    );
  });

  test('Maneja error genérico no controlado devolviendo status 500', () => {
    const genericError = new Error('Database crash unexpected');

    errorHandler(genericError, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        mensaje: 'Database crash unexpected'
      })
    );
  });
});
