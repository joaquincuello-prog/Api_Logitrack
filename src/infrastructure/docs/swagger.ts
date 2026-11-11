import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import fs from 'fs';
import { Logger } from '../logging/logger';

export const swaggerRouter = Router();

try {
  const possiblePaths = [
    path.join(__dirname, 'openapi.yaml'),
    path.join(process.cwd(), 'src', 'infrastructure', 'docs', 'openapi.yaml'),
    path.join(process.cwd(), 'dist', 'infrastructure', 'docs', 'openapi.yaml')
  ];
  const yamlPath = possiblePaths.find(p => fs.existsSync(p));

  if (yamlPath) {
    const swaggerDocument = yaml.load(yamlPath);
    swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } else {
    Logger.warn('No se encontró el archivo openapi.yaml en ninguna ruta esperada');
  }
} catch (error) {
  Logger.warn('No se pudo cargar openapi.yaml para Swagger UI', {
    error: error instanceof Error ? error.message : String(error)
  });
}
