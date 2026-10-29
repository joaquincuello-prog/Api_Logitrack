import { Request, Response, NextFunction } from 'express';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const correlationId = (typeof incomingId === 'string' && incomingId) 
    ? incomingId 
    : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  req.headers['x-request-id'] = correlationId;
  res.setHeader('x-request-id', correlationId);
  next();
}
