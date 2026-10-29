import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'logitrack_db',
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
    console.warn('⚠️ No se pudo conectar a MySQL con las credenciales actuales. Modo sin conexión o test.');
    return false;
  }
}
