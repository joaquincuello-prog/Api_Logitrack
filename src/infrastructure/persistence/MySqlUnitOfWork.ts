import { IUnitOfWork } from '../../core/domain/ports/IUnitOfWork';
import { pool } from '../../config/database';

export class MySqlUnitOfWork implements IUnitOfWork {
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work();
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
