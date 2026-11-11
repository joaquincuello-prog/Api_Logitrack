import { Router } from 'express';
import { EncomiendaController } from '../controllers/EncomiendaController';
import { validateBody, admisionSchema, despachoSchema, entregaSchema } from '../middlewares/validationMiddleware';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Funcionalidad 1: Admisión y Tarifación (Operador o Administrador)
router.post('/admitir', authenticate, authorize(['ADMIN', 'OPERADOR']), validateBody(admisionSchema), EncomiendaController.admitir);

// Funcionalidad 2: Asignación de Flota y Despacho (Operador, Conductor o Administrador)
router.post('/despachar', authenticate, authorize(['ADMIN', 'OPERADOR', 'CONDUCTOR']), validateBody(despachoSchema), EncomiendaController.despachar);

// Funcionalidad 3: Registro de Entrega e Indemnización (Conductor o Administrador)
router.post('/entregar', authenticate, authorize(['ADMIN', 'CONDUCTOR']), validateBody(entregaSchema), EncomiendaController.registrarEntrega);

// Listado de encomiendas con paginación y filtros opcionales (Operador o Administrador)
router.get('/', authenticate, authorize(['ADMIN', 'OPERADOR']), EncomiendaController.listar);

// Estadísticas operativas y financieras (Exclusivo Administrador)
router.get('/estadisticas', authenticate, authorize(['ADMIN']), EncomiendaController.obtenerEstadisticas);

// Consulta de Encomienda por código de seguimiento (PÚBLICO - Tracking sin autenticación)
router.get('/tracking/:codigo', EncomiendaController.rastrear);

// Consulta de Encomienda completa por ID interno (Personal operativo)
router.get('/:id', authenticate, authorize(['ADMIN', 'OPERADOR', 'CONDUCTOR']), EncomiendaController.obtenerPorId);

export default router;
