import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import encomiendaRoutes from './routes/encomiendaRoutes';
import { errorHandler } from './middlewares/errorHandler';
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

// 6. Servir frontend SPA estático desde public/
app.use(express.static(path.join(__dirname, '../public')));

// 7. Documentación viva Swagger / OpenAPI 3.0 en /api/docs
app.use('/api/docs', swaggerRouter);

// 8. Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', servicio: 'LogiTrack API', timestamp: new Date() });
});

// 9. Rutas principales de la API
app.use('/api/encomiendas', encomiendaRoutes);

// 10. Manejo centralizado y desacoplado de errores
app.use(errorHandler);
