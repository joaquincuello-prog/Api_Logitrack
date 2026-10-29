import { IEncomiendaRepository } from '../../domain/ports/IEncomiendaRepository';
import { IUnitOfWork } from '../../domain/ports/IUnitOfWork';
import { asignarVehiculo, calcularPlazoGarantizado } from '../../../services/despachoService';
import { Encomienda } from '../../domain/entities/Encomienda';
import { EntityNotFoundException } from '../exceptions/ApplicationException';
import { Despacho, TipoVehiculo } from '../../../models/types';

export interface DespacharInput {
  encomiendaId: number;
}

export interface DespacharOutput {
  despacho: Despacho;
  vehiculoAsignado: TipoVehiculo;
  plazoGarantizadoHoras: number;
  estadoNuevo: string;
}

export class DespacharEncomiendaUseCase {
  constructor(
    private readonly repository: IEncomiendaRepository,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute(input: DespacharInput): Promise<DespacharOutput> {
    return await this.unitOfWork.runInTransaction(async () => {
      const encomiendaModel = await this.repository.obtenerEncomiendaPorId(input.encomiendaId);
      if (!encomiendaModel) {
        throw new EntityNotFoundException(`No se encontró la encomienda con ID ${input.encomiendaId}`);
      }

      // Reconstruir entidad de dominio y disparar transición de estados FSM
      const encomienda = new Encomienda(encomiendaModel);
      encomienda.despachar();

      // Reglas de negocio logísticas
      const vehiculoAsignado = asignarVehiculo(encomienda.pesoFacturable);
      const plazoGarantizadoHoras = calcularPlazoGarantizado(encomienda.tipoZona, encomienda.esExpress);

      // Persistencia atómica
      const despacho = await this.repository.crearDespacho({
        encomiendaId: encomienda.id!,
        vehiculoAsignado,
        plazoGarantizadoHoras
      });

      await this.repository.actualizarEstadoEncomienda(encomienda.id!, encomienda.estado);

      return {
        despacho,
        vehiculoAsignado,
        plazoGarantizadoHoras,
        estadoNuevo: encomienda.estado
      };
    });
  }
}
