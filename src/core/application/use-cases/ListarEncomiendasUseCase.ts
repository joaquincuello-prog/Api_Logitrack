import { IEncomiendaRepository } from '../../domain/ports/IEncomiendaRepository';
import { Encomienda, EstadoEncomienda } from '../../../models/types';
import { BusinessRuleViolationException } from '../../domain/exceptions/DomainException';

export interface ListarEncomiendasInput {
  estado?: string;
  cliente?: string;
  page?: number;
  limit?: number;
}

export interface ListarEncomiendasOutput {
  encomiendas: Encomienda[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export class ListarEncomiendasUseCase {
  constructor(private readonly repository: IEncomiendaRepository) {}

  private validarEstado(estadoFiltro?: string): EstadoEncomienda | undefined {
    if (estadoFiltro !== undefined && estadoFiltro !== '') {
      const estadoUpper = estadoFiltro.toUpperCase();
      const estadosValidos: EstadoEncomienda[] = ['ADMITIDO', 'EN_TRANSITO', 'ENTREGADO', 'DEVUELTO', 'SINIESTRADO'];
      if (!estadosValidos.includes(estadoUpper as EstadoEncomienda)) {
        throw new BusinessRuleViolationException(
          `Estado inválido: "${estadoFiltro}". Estados permitidos: ${estadosValidos.join(', ')}`
        );
      }
      return estadoUpper as EstadoEncomienda;
    }
    return undefined;
  }

  async execute(filtro?: string): Promise<Encomienda[]>;
  async execute(input: ListarEncomiendasInput): Promise<ListarEncomiendasOutput>;
  async execute(input?: string | ListarEncomiendasInput): Promise<Encomienda[] | ListarEncomiendasOutput> {
    if (typeof input === 'string' || input === undefined) {
      const estado = this.validarEstado(input);
      return await this.repository.obtenerEncomiendas(estado);
    }

    const estado = this.validarEstado(input.estado);
    let items = await this.repository.obtenerEncomiendas(estado);

    if (input.cliente && input.cliente.trim() !== '') {
      const queryCliente = input.cliente.trim().toLowerCase();
      items = items.filter(e => e.cliente.toLowerCase().includes(queryCliente));
    }

    const total = items.length;
    const pagina = input.page && input.page > 0 ? Math.floor(input.page) : 1;
    const limite = input.limit && input.limit > 0 ? Math.floor(input.limit) : 50;
    const totalPaginas = Math.ceil(total / limite) || 1;

    const offset = (pagina - 1) * limite;
    const encomiendasPaginadas = items.slice(offset, offset + limite);

    return {
      encomiendas: encomiendasPaginadas,
      paginacion: {
        total,
        pagina,
        limite,
        totalPaginas
      }
    };
  }
}
