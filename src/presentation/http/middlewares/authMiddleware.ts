import { Request, Response, NextFunction } from 'express';
import { TokenService, UserRole, TokenPayload } from '../../../infrastructure/security/tokenService';
import { ENV } from '../../../infrastructure/config/env';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    if (ENV.AUTH_ENABLED === 'true') {
      res.status(401).json({
        status: 'NO_AUTORIZADO',
        mensaje: 'Se requiere encabezado Authorization: Bearer <token>'
      });
      return;
    }

    // Modo desarrollo / passthrough: asigna usuario administrador por defecto
    req.user = {
      sub: 'dev-user-1',
      name: 'Usuario Desarrollo',
      role: 'ADMIN'
    };
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      status: 'NO_AUTORIZADO',
      mensaje: 'Formato de autorización inválido. Debe ser: Bearer <token>'
    });
    return;
  }

  try {
    const payload = TokenService.verifyToken(parts[1]);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'NO_AUTORIZADO',
      mensaje: error instanceof Error ? error.message : 'Token inválido o expirado'
    });
  }
}

export function authorize(rolesPermitidos: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'NO_AUTORIZADO',
        mensaje: 'Usuario no autenticado'
      });
      return;
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      res.status(403).json({
        status: 'ACCESO_DENEGADO',
        mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
      });
      return;
    }

    next();
  };
}
