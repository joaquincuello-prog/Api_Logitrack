import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';

export const swaggerRouter = Router();

try {
  const swaggerDocument = yaml.load(path.join(__dirname, 'openapi.yaml'));
  swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('⚠️ No se pudo cargar openapi.yaml para Swagger UI:', error);
}
