import { Router } from 'express';
import { EncomiendaController } from '../controllers/encomiendaController';
import { validateBody, admisionSchema, despachoSchema, entregaSchema } from '../middlewares/validation';

const router = Router();

// Funcionalidad 1: Admisión y Tarifación
router.post('/admitir', validateBody(admisionSchema), EncomiendaController.admitir);

// Funcionalidad 2: Asignación de Flota y Despacho
router.post('/despachar', validateBody(despachoSchema), EncomiendaController.despachar);

// Funcionalidad 3: Registro de Entrega e Indemnización
router.post('/entregar', validateBody(entregaSchema), EncomiendaController.registrarEntrega);

// Listado de encomiendas con filtro opcional por estado
router.get('/', EncomiendaController.listar);

// Estadísticas operativas y financieras
router.get('/estadisticas', EncomiendaController.obtenerEstadisticas);

// Consulta de Encomienda completa por ID
router.get('/:id', EncomiendaController.obtenerPorId);

export default router;
