import { InvalidStateTransitionException } from '../exceptions/DomainException';

export type EstadoEncomienda = 'ADMITIDO' | 'EN_TRANSITO' | 'ENTREGADO' | 'DEVUELTO' | 'SINIESTRADO';

export class EncomiendaStateMachine {
  private static readonly TRANSICIONES_VALIDAS: Record<EstadoEncomienda, readonly EstadoEncomienda[]> = {
    ADMITIDO: ['EN_TRANSITO'],
    EN_TRANSITO: ['ENTREGADO', 'DEVUELTO', 'SINIESTRADO'],
    ENTREGADO: [],
    DEVUELTO: [],
    SINIESTRADO: []
  };

  public static canTransition(from: EstadoEncomienda, to: EstadoEncomienda): boolean {
    const permitidos = this.TRANSICIONES_VALIDAS[from];
    return permitidos ? permitidos.includes(to) : false;
  }

  public static validateTransition(from: EstadoEncomienda, to: EstadoEncomienda): void {
    if (!this.canTransition(from, to)) {
      throw new InvalidStateTransitionException(from, to);
    }
  }

  public static getValidNextStates(from: EstadoEncomienda): readonly EstadoEncomienda[] {
    return this.TRANSICIONES_VALIDAS[from] || [];
  }

  public static isTerminal(estado: EstadoEncomienda): boolean {
    return this.getValidNextStates(estado).length === 0;
  }
}
