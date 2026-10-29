import { app } from './app';
import { testDbConnection } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  const isDbConnected = await testDbConnection();
  if (isDbConnected) {
    console.log('✅ Conexión con base de datos MySQL establecida correctamente.');
  } else {
    console.log('ℹ️ Servidor iniciado con repositorio activo.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor LogiTrack API corriendo en http://localhost:${PORT}`);
    console.log(`📦 Documentación de Endpoints disponible en el README.md`);
  });
}

startServer();
