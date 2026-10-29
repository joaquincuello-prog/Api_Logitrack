import { IEncomiendaRepository } from '../../domain/ports/IEncomiendaRepository';
import { IUnitOfWork } from '../../domain/ports/IUnitOfWork';
import { calcularIndemnizacion } from '../../../services/indemnizacionService';
import { Encomienda } from '../../domain/entities/Encomienda';
import { EntityNotFoundException } from '../exceptions/ApplicationException';
import { Entrega, CalculoIndemnizacionResult } from '../../../models/types';

export interface RegistrarEntregaInput {
  despachoId: number;
  horasDemora: number;
  estadoFinal: 'ENTREGADO' | 'DEVUELTO' | 'SINIESTRADO';
}

export interface RegistrarEntregaOutput {
  entrega: Entrega;
  liquidacion: CalculoIndemnizacionResult;
  saldoFinalFlete: number;
}

export class RegistrarEntregaUseCase {
  constructor(
    private readonly repository: IEncomiendaRepository,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute(input: RegistrarEntregaInput): Promise<RegistrarEntregaOutput> {
    return await this.unitOfWork.runInTransaction(async () => {
      const despacho = await this.repository.obtenerDespachoPorId(input.despachoId);
      if (!despacho) {
        throw new EntityNotFoundException(`No se encontró el despacho con ID ${input.despachoId}`);
      }

      const encomiendaModel = await this.repository.obtenerEncomiendaPorId(despacho.encomiendaId);
      if (!encomiendaModel) {
        throw new EntityNotFoundException('No se encontró la encomienda asociada al despacho');
      }

      // Reconstrucción del agregado y validación FSM de transición final
      const encomienda = new Encomienda(encomiendaModel);
      encomienda.finalizarEntrega(input.estadoFinal);

      // Liquidación de reintegros y seguros
      const liquidacion = calcularIndemnizacion({
        horasDemora: input.horasDemora,
        costoFlete: encomienda.costoTotal,
        seguroDeclarado: encomienda.valorDeclarado,
        estadoFinal: input.estadoFinal
      });

      // Persistencia atómica de la entrega y actualización del estado
      const entrega = await this.repository.registrarEntrega({
        despachoId: input.despachoId,
        fechaEntrega: new Date(),
        horasDemora: input.horasDemora,
        estadoFinal: input.estadoFinal,
        porcentajeReintegro: liquidacion.porcentajeReintegro,
        indemnizacionFlete: liquidacion.indemnizacionFlete,
        indemnizacionSeguro: liquidacion.indemnizacionSeguro,
        totalIndemnizado: liquidacion.totalIndemnizado
      });

      await this.repository.actualizarEstadoEncomienda(encomienda.id!, input.estadoFinal);

      const saldoFinalFlete = Math.max(0, encomienda.costoTotal - liquidacion.indemnizacionFlete);

      return {
        entrega,
        liquidacion,
        saldoFinalFlete
      };
    });
  }
}
