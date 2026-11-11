import { app } from './app';
import { testDbConnection, pool } from './config/database';
import { ENV } from './infrastructure/config/env';
import { Logger } from './infrastructure/logging/logger';

async function startServer() {
  const isDbConnected = await testDbConnection();
  if (isDbConnected) {
    Logger.info('Conexión con base de datos MySQL establecida correctamente.');
  } else {
    Logger.info('Servidor iniciado con repositorio activo.');
  }

  const server = app.listen(ENV.PORT, () => {
    Logger.info(`Servidor LogiTrack API corriendo en http://localhost:${ENV.PORT}`, {
      port: ENV.PORT,
      env: ENV.NODE_ENV
    });
  });

  // Graceful Shutdown: captura de señales de apagado del sistema operativo o contenedores
  const shutdown = (signal: string) => {
    Logger.info(`Señal ${signal} recibida. Iniciando cierre ordenado (Graceful Shutdown)...`);

    server.close(async () => {
      Logger.info('Servidor HTTP cerrado. Conexiones entrantes finalizadas.');
      try {
        await pool.end();
        Logger.info('Pool de conexiones MySQL cerrado correctamente.');
        process.exit(0);
      } catch (err) {
        Logger.error('Error al cerrar el pool de conexiones MySQL', err);
        process.exit(1);
      }
    });

    // Timeout de seguridad para evitar que el proceso quede colgado indefinidamente
    setTimeout(() => {
      Logger.warn('Tiempo de espera para cierre ordenado agotado. Forzando terminación.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

startServer();
