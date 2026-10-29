import { IEncomiendaRepository } from '../../domain/ports/IEncomiendaRepository';
import { EstadisticasEncomiendas } from '../../../models/types';

export class ObtenerEstadisticasUseCase {
  constructor(private readonly repository: IEncomiendaRepository) {}

  async execute(): Promise<EstadisticasEncomiendas> {
    return await this.repository.obtenerEstadisticas();
  }
}
