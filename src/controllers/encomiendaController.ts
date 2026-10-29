import { Request, Response, NextFunction } from 'express';
import { getEncomiendaRepository, getUnitOfWork } from '../repositories';
import { AdmitirEncomiendaUseCase } from '../core/application/use-cases/AdmitirEncomiendaUseCase';
import { DespacharEncomiendaUseCase } from '../core/application/use-cases/DespacharEncomiendaUseCase';
import { RegistrarEntregaUseCase } from '../core/application/use-cases/RegistrarEntregaUseCase';
import { ConsultarEncomiendaUseCase } from '../core/application/use-cases/ConsultarEncomiendaUseCase';
import { ListarEncomiendasUseCase } from '../core/application/use-cases/ListarEncomiendasUseCase';
import { ObtenerEstadisticasUseCase } from '../core/application/use-cases/ObtenerEstadisticasUseCase';

export class EncomiendaController {
  static async admitir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = getEncomiendaRepository();
      const useCase = new AdmitirEncomiendaUseCase(repo);
      const nuevaEncomienda = await useCase.execute(req.body);

      res.status(201).json({
        status: 'EXITO',
        mensaje: 'Encomienda admitida y tarifada correctamente',
        datos: nuevaEncomienda
      });
    } catch (error) {
      next(error);
    }
  }

  static async despachar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = getEncomiendaRepository();
      const uow = getUnitOfWork();
      const useCase = new DespacharEncomiendaUseCase(repo, uow);
      const resultado = await useCase.execute({ encomiendaId: req.body.encomiendaId });

      res.status(201).json({
        status: 'EXITO',
        mensaje: 'Encomienda despachada y vehículo asignado exitosamente',
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  static async registrarEntrega(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = getEncomiendaRepository();
      const uow = getUnitOfWork();
      const useCase = new RegistrarEntregaUseCase(repo, uow);
      const resultado = await useCase.execute({
        despachoId: req.body.despachoId,
        horasDemora: req.body.horasDemora,
        estadoFinal: req.body.estadoFinal
      });

      res.status(200).json({
        status: 'EXITO',
        mensaje: 'Entrega registrada y liquidación de indemnización calculada',
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  static async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = getEncomiendaRepository();
      const useCase = new ConsultarEncomiendaUseCase(repo);
      const resultado = await useCase.execute(Number(req.params.id));

      res.status(200).json({
        status: 'EXITO',
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  static async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = getEncomiendaRepository();
      const useCase = new ListarEncomiendasUseCase(repo);
      const encomiendas = await useCase.execute(req.query.estado as string | undefined);

      res.status(200).json({
        status: 'EXITO',
        datos: encomiendas
      });
    } catch (error) {
      next(error);
    }
  }

  static async obtenerEstadisticas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = getEncomiendaRepository();
      const useCase = new ObtenerEstadisticasUseCase(repo);
      const estadisticas = await useCase.execute();

      res.status(200).json({
        status: 'EXITO',
        datos: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }
}
