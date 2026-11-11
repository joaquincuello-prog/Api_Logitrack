import { IUnitOfWork } from '../../core/domain/ports/IUnitOfWork';
import { pool } from '../../config/database';
import { transactionStorage } from './transactionContext';

export class MySqlUnitOfWork implements IUnitOfWork {
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await transactionStorage.run(connection, async () => {
        return await work();
      });
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
