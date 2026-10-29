import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { ENV } from '../../../infrastructure/config/env';

const limiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'ERROR',
    mensaje: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde'
  }
});

export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (ENV.NODE_ENV === 'test') {
    return next();
  }
  return limiter(req, res, next);
}
