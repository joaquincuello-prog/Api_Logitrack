import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import encomiendaRoutes from './presentation/http/routes/encomiendaRoutes';
import authRoutes from './presentation/http/routes/authRoutes';
import { errorHandler } from './presentation/http/middlewares/errorHandlerMiddleware';
import { correlationIdMiddleware } from './presentation/http/middlewares/correlationIdMiddleware';
import { rateLimiterMiddleware } from './presentation/http/middlewares/rateLimiterMiddleware';
import { swaggerRouter } from './infrastructure/docs/swagger';
import { ENV } from './infrastructure/config/env';

export const app = express();

// 1. Headers de Seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Permitir estilos inline y assets locales para dashboard y Swagger UI
  crossOriginEmbedderPolicy: false
}));

// 2. CORS parametrizable
app.use(cors({
  origin: ENV.CORS_ORIGIN === '*' ? '*' : ENV.CORS_ORIGIN
}));

// 3. Trazabilidad con Correlation ID
app.use(correlationIdMiddleware);

// 4. Rate Limiting
app.use(rateLimiterMiddleware);

// 5. Parsing de JSON
app.use(express.json());

// 6. Servir frontend SPA estático desde public/ con resolución para local y Serverless (Vercel)
const publicPath = [
  path.join(__dirname, '../public'),
  path.join(process.cwd(), 'public'),
  path.join(__dirname, 'public')
].find(p => fs.existsSync(p)) || path.join(process.cwd(), 'public');

app.use(express.static(publicPath));

// Ruta raíz explícita para garantizar entrega de index.html
app.get('/', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).json({ status: 'OK', servicio: 'LogiTrack API', timestamp: new Date() });
});

// 7. Documentación viva Swagger / OpenAPI 3.0 en /api/docs
app.use('/api/docs', swaggerRouter);

// 8. Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', servicio: 'LogiTrack API', timestamp: new Date() });
});

// 9. Rutas de autenticación y sesiones
app.use('/api/auth', authRoutes);

// 10. Rutas principales de la API
app.use('/api/encomiendas', encomiendaRoutes);

// 11. Manejo centralizado y desacoplado de errores
app.use(errorHandler);
