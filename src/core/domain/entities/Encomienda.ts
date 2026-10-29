import { EstadoEncomienda, EncomiendaStateMachine } from '../fsm/EncomiendaStateMachine';
import { TipoZona } from '../strategies/ITarifaStrategy';
import { BusinessRuleViolationException } from '../exceptions/DomainException';

export interface EncomiendaProps {
  id?: number;
  codigoSeguimiento: string;
  cliente: string;
  alto: number;
  ancho: number;
  largo: number;
  pesoReal: number;
  pesoVolumetrico: number;
  pesoFacturable: number;
  distanciaKm: number;
  tipoZona: TipoZona;
  esFragil: boolean;
  esExpress: boolean;
  valorDeclarado: number;
  tarifaBase: number;
  recargoFragil: number;
  recargoExpress: number;
  costoTotal: number;
  estado: EstadoEncomienda;
  fechaCreacion?: Date;
}

export class Encomienda {
  private props: EncomiendaProps;

  constructor(props: EncomiendaProps) {
    if (!props.codigoSeguimiento) {
      throw new BusinessRuleViolationException('El código de seguimiento es obligatorio');
    }
    if (!props.cliente || props.cliente.trim().length < 3) {
      throw new BusinessRuleViolationException('El nombre del cliente debe tener al menos 3 caracteres');
    }
    if (props.alto <= 0 || props.ancho <= 0 || props.largo <= 0 || props.pesoReal <= 0) {
      throw new BusinessRuleViolationException('Las dimensiones y peso deben ser mayores a cero');
    }
    this.props = { ...props };
  }

  get id(): number | undefined { return this.props.id; }
  get codigoSeguimiento(): string { return this.props.codigoSeguimiento; }
  get cliente(): string { return this.props.cliente; }
  get alto(): number { return this.props.alto; }
  get ancho(): number { return this.props.ancho; }
  get largo(): number { return this.props.largo; }
  get pesoReal(): number { return this.props.pesoReal; }
  get pesoVolumetrico(): number { return this.props.pesoVolumetrico; }
  get pesoFacturable(): number { return this.props.pesoFacturable; }
  get distanciaKm(): number { return this.props.distanciaKm; }
  get tipoZona(): TipoZona { return this.props.tipoZona; }
  get esFragil(): boolean { return this.props.esFragil; }
  get esExpress(): boolean { return this.props.esExpress; }
  get valorDeclarado(): number { return this.props.valorDeclarado; }
  get tarifaBase(): number { return this.props.tarifaBase; }
  get recargoFragil(): number { return this.props.recargoFragil; }
  get recargoExpress(): number { return this.props.recargoExpress; }
  get costoTotal(): number { return this.props.costoTotal; }
  get estado(): EstadoEncomienda { return this.props.estado; }
  get fechaCreacion(): Date | undefined { return this.props.fechaCreacion; }

  public despachar(): void {
    EncomiendaStateMachine.validateTransition(this.props.estado, 'EN_TRANSITO');
    this.props.estado = 'EN_TRANSITO';
  }

  public finalizarEntrega(estadoFinal: 'ENTREGADO' | 'DEVUELTO' | 'SINIESTRADO'): void {
    EncomiendaStateMachine.validateTransition(this.props.estado, estadoFinal);
    this.props.estado = estadoFinal;
  }

  public toJSON(): EncomiendaProps {
    return Object.freeze({ ...this.props });
  }
}
