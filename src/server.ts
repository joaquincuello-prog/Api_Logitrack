import { app } from './app';
import { testDbConnection } from './config/database';
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

  return server;
}

startServer();
