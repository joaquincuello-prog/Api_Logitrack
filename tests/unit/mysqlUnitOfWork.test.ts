import { MySqlUnitOfWork } from '../../src/infrastructure/persistence/MySqlUnitOfWork';
import { MySqlEncomiendaRepository } from '../../src/repositories/MySqlEncomiendaRepository';
import { pool } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  pool: {
    getConnection: jest.fn(),
    execute: jest.fn()
  }
}));

describe('MySqlUnitOfWork - Transacciones ACID', () => {
  let uow: MySqlUnitOfWork;
  const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
    execute: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    uow = new MySqlUnitOfWork();
    (pool.getConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  test('Ejecuta commit y libera la conexión cuando la transacción es exitosa', async () => {
    const result = await uow.runInTransaction(async () => {
      return 'OK_RESULT';
    });

    expect(result).toBe('OK_RESULT');
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
    expect(mockConnection.rollback).not.toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
  });

  test('Ejecuta rollback y libera la conexión cuando la transacción lanza un error', async () => {
    await expect(
      uow.runInTransaction(async () => {
        throw new Error('Transacción abortada');
      })
    ).rejects.toThrow('Transacción abortada');

    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
  });

  test('Propaga la conexión transaccional al repositorio mediante AsyncLocalStorage', async () => {
    const repository = new MySqlEncomiendaRepository();
    mockConnection.execute.mockResolvedValueOnce([[{ id: 1, codigo_seguimiento: 'LOGI-123' }]]);

    await uow.runInTransaction(async () => {
      // Esta consulta debe ejecutarse sobre mockConnection (la conexión con transacción), NO sobre pool
      await repository.obtenerEncomiendaPorId(1);
    });

    expect(mockConnection.execute).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM encomiendas WHERE id = ?'),
      [1]
    );
    expect(pool.execute).not.toHaveBeenCalled();
  });

  test('Fuera de una transacción, el repositorio ejecuta consultas sobre el pool general', async () => {
    const repository = new MySqlEncomiendaRepository();
    (pool.execute as jest.Mock).mockResolvedValueOnce([[{ id: 2, codigo_seguimiento: 'LOGI-456' }]]);

    await repository.obtenerEncomiendaPorId(2);

    expect(pool.execute).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM encomiendas WHERE id = ?'),
      [2]
    );
    expect(mockConnection.execute).not.toHaveBeenCalled();
  });
});
