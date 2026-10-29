import { IEncomiendaRepository } from '../../domain/ports/IEncomiendaRepository';
import { Encomienda, EstadoEncomienda } from '../../../models/types';
import { BusinessRuleViolationException } from '../../domain/exceptions/DomainException';

export class ListarEncomiendasUseCase {
  constructor(private readonly repository: IEncomiendaRepository) {}

  async execute(estadoFiltro?: string): Promise<Encomienda[]> {
    let estado: EstadoEncomienda | undefined;

    if (estadoFiltro !== undefined && estadoFiltro !== '') {
      const estadoUpper = estadoFiltro.toUpperCase();
      const estadosValidos: EstadoEncomienda[] = ['ADMITIDO', 'EN_TRANSITO', 'ENTREGADO', 'DEVUELTO', 'SINIESTRADO'];
      if (!estadosValidos.includes(estadoUpper as EstadoEncomienda)) {
        throw new BusinessRuleViolationException(
          `Estado inválido: "${estadoFiltro}". Estados permitidos: ${estadosValidos.join(', ')}`
        );
      }
      estado = estadoUpper as EstadoEncomienda;
    }

    return await this.repository.obtenerEncomiendas(estado);
  }
}
