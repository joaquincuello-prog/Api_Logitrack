import { IEncomiendaRepository } from '../../domain/ports/IEncomiendaRepository';
import { EntityNotFoundException } from '../exceptions/ApplicationException';
import { Encomienda, Despacho, Entrega } from '../../../models/types';

export interface DetalleEncomiendaOutput {
  encomienda: Encomienda;
  despacho: Despacho | null;
  entrega: Entrega | null;
}

export class ConsultarEncomiendaUseCase {
  constructor(private readonly repository: IEncomiendaRepository) {}

  async execute(id: number): Promise<DetalleEncomiendaOutput> {
    const encomienda = await this.repository.obtenerEncomiendaPorId(id);
    if (!encomienda) {
      throw new EntityNotFoundException(`Encomienda con ID ${id} no encontrada`);
    }

    const despacho = await this.repository.obtenerDespachoPorEncomiendaId(id);
    let entrega: Entrega | null = null;
    if (despacho && despacho.id) {
      entrega = await this.repository.obtenerEntregaPorDespachoId(despacho.id);
    }

    return {
      encomienda,
      despacho,
      entrega
    };
  }
}
