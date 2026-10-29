import { EncomiendaController } from '../../src/controllers/encomiendaController';
import { Request, Response, NextFunction } from 'express';

describe('EncomiendaController - Pruebas Unitarias de Manejo de Excepciones', () => {
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  test('admitir pasa error a next() si el caso de uso falla', async () => {
    const mockReq: Partial<Request> = {
      body: null // Provocará fallo en execute
    };

    await EncomiendaController.admitir(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  test('despachar pasa error a next() si el caso de uso falla', async () => {
    const mockReq: Partial<Request> = {
      body: null
    };

    await EncomiendaController.despachar(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  test('registrarEntrega pasa error a next() si el caso de uso falla', async () => {
    const mockReq: Partial<Request> = {
      body: null
    };

    await EncomiendaController.registrarEntrega(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  test('obtenerPorId pasa error a next() si el caso de uso falla', async () => {
    const mockReq: Partial<Request> = {
      params: undefined as any
    };

    await EncomiendaController.obtenerPorId(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  test('listar pasa error a next() si ocurre un fallo', async () => {
    const mockReq: Partial<Request> = {
      query: { estado: 'INVALIDO_TEST' }
    };

    await EncomiendaController.listar(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
