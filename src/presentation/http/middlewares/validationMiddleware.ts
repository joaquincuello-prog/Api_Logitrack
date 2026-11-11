import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const admisionSchema = z.object({
  cliente: z.string().min(3, 'El nombre del cliente debe tener al menos 3 caracteres'),
  alto: z.number().positive('El alto debe ser mayor a 0').max(150, 'El alto no puede superar los 150 cm'),
  ancho: z.number().positive('El ancho debe ser mayor a 0').max(150, 'El ancho no puede superar los 150 cm'),
  largo: z.number().positive('El largo debe ser mayor a 0').max(150, 'El largo no puede superar los 150 cm'),
  pesoReal: z.number().positive('El peso real debe ser mayor a 0').max(40, 'El peso real no puede superar los 40 kg'),
  distanciaKm: z.number().positive('La distancia debe ser mayor a 0'),
  esFragil: z.boolean().default(false),
  esExpress: z.boolean().default(false),
  valorDeclarado: z.number().min(0, 'El valor declarado no puede ser negativo').default(0)
});

export const despachoSchema = z.object({
  encomiendaId: z.number().int().positive('El ID de encomienda debe ser un entero positivo')
});

export const entregaSchema = z.object({
  despachoId: z.number().int().positive('El ID de despacho debe ser un entero positivo'),
  horasDemora: z.number().int().min(0, 'Las horas de demora deben ser mayores o iguales a 0'),
  estadoFinal: z.enum(['ENTREGADO', 'DEVUELTO', 'SINIESTRADO'], {
    errorMap: () => ({ message: 'Estado final inválido. Valores permitidos: ENTREGADO, DEVUELTO, SINIESTRADO' })
  })
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'ERROR_VALIDACION',
          mensaje: 'Los datos de entrada no cumplen con las restricciones del sistema',
          errores: error.errors.map(err => ({
            campo: err.path.join('.'),
            mensaje: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}
