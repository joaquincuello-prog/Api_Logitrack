import { Router } from 'express';
import { EncomiendaController } from '../controllers/EncomiendaController';
import { validateBody, admisionSchema, despachoSchema, entregaSchema } from '../middlewares/validationMiddleware';

const router = Router();

// Funcionalidad 1: Admisión y Tarifación
router.post('/admitir', validateBody(admisionSchema), EncomiendaController.admitir);

// Funcionalidad 2: Asignación de Flota y Despacho
router.post('/despachar', validateBody(despachoSchema), EncomiendaController.despachar);

// Funcionalidad 3: Registro de Entrega e Indemnización
router.post('/entregar', validateBody(entregaSchema), EncomiendaController.registrarEntrega);

// Listado de encomiendas con paginación y filtros opcionales (?page=1&limit=20&estado=...&cliente=...)
router.get('/', EncomiendaController.listar);

// Estadísticas operativas y financieras
router.get('/estadisticas', EncomiendaController.obtenerEstadisticas);

// Consulta de Encomienda por código de seguimiento (Tracking público)
router.get('/tracking/:codigo', EncomiendaController.rastrear);

// Consulta de Encomienda completa por ID
router.get('/:id', EncomiendaController.obtenerPorId);

export default router;
