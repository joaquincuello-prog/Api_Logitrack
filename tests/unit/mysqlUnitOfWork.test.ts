import { MySqlUnitOfWork } from '../../src/infrastructure/persistence/MySqlUnitOfWork';
import { pool } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  pool: {
    getConnection: jest.fn()
  }
}));

describe('MySqlUnitOfWork - Transacciones ACID', () => {
  let uow: MySqlUnitOfWork;
  const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
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
});
