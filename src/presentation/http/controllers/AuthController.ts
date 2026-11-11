import { Request, Response } from 'express';
import { TokenService, UserRole } from '../../../infrastructure/security/tokenService';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const { username, role = 'OPERADOR' } = req.body || {};

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      res.status(400).json({
        status: 'ERROR_VALIDACION',
        mensaje: 'Debe ingresar un nombre de usuario válido'
      });
      return;
    }

    const rolesValidos: UserRole[] = ['ADMIN', 'OPERADOR', 'CONDUCTOR', 'CLIENTE'];
    const roleUpper = (String(role).toUpperCase()) as UserRole;

    if (!rolesValidos.includes(roleUpper)) {
      res.status(400).json({
        status: 'ERROR_VALIDACION',
        mensaje: `Rol inválido. Roles permitidos: ${rolesValidos.join(', ')}`
      });
      return;
    }

    const token = TokenService.generateToken({
      sub: `user-${Date.now()}`,
      name: username.trim(),
      role: roleUpper
    });

    res.status(200).json({
      status: 'EXITO',
      mensaje: 'Autenticación exitosa',
      datos: {
        token,
        usuario: {
          username: username.trim(),
          role: roleUpper
        }
      }
    });
  }

  static async perfil(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'EXITO',
      datos: req.user
    });
  }
}
