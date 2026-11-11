import { IEncomiendaRepository } from '../../domain/ports/IEncomiendaRepository';
import { EntityNotFoundException } from '../exceptions/ApplicationException';
import { Encomienda, Despacho, Entrega } from '../../../models/types';

export interface RastrearEncomiendaOutput {
  encomienda: Encomienda;
  despacho: Despacho | null;
  entrega: Entrega | null;
}

export class RastrearEncomiendaUseCase {
  constructor(private readonly repository: IEncomiendaRepository) {}

  async execute(codigoSeguimiento: string): Promise<RastrearEncomiendaOutput> {
    if (!codigoSeguimiento || !codigoSeguimiento.trim()) {
      throw new EntityNotFoundException('Debe proporcionar un código de seguimiento válido');
    }

    const codigoLimpio = codigoSeguimiento.trim();
    const encomienda = await this.repository.obtenerEncomiendaPorCodigo(codigoLimpio);
    if (!encomienda) {
      throw new EntityNotFoundException(`No se encontró ninguna encomienda con el código "${codigoLimpio}"`);
    }

    const despacho = encomienda.id ? await this.repository.obtenerDespachoPorEncomiendaId(encomienda.id) : null;
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
