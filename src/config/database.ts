import mysql from 'mysql2/promise';
import { ENV } from '../infrastructure/config/env';
import { Logger } from '../infrastructure/logging/logger';

export const pool = mysql.createPool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    Logger.warn('No se pudo conectar a MySQL con las credenciales configuradas. Modo sin conexión o test activo.', {
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}
