import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Generar token JWT con rol (simulación de login / credenciales)
router.post('/login', AuthController.login);

// Obtener perfil del usuario autenticado
router.get('/perfil', authenticate, AuthController.perfil);

export default router;
