export type TipoZona = 'URBANO' | 'PROVINCIAL' | 'NACIONAL';
export type TipoVehiculo = 'MOTO' | 'UTILITARIO' | 'CAMION';
export type EstadoEncomienda = 'ADMITIDO' | 'EN_TRANSITO' | 'ENTREGADO' | 'DEVUELTO' | 'SINIESTRADO';

export interface DimensionesEncomienda {
  alto: number;  // cm
  ancho: number; // cm
  largo: number; // cm
  pesoReal: number; // kg
}

export interface CalculoTarifarioInput extends DimensionesEncomienda {
  distanciaKm: number;
  esFragil: boolean;
  esExpress: boolean;
  valorDeclarado: number;
}

export interface CalculoTarifarioResult {
  pesoVolumetrico: number;
  pesoFacturable: number;
  tipoZona: TipoZona;
  tarifaBase: number;
  recargoFragil: number;
  recargoExpress: number;
  costoTotal: number;
}

export interface Encomienda extends DimensionesEncomienda, CalculoTarifarioResult {
  id?: number;
  codigoSeguimiento: string;
  cliente: string;
  distanciaKm: number;
  esFragil: boolean;
  esExpress: boolean;
  valorDeclarado: number;
  estado: EstadoEncomienda;
  fechaCreacion?: Date;
}

export interface Despacho {
  id?: number;
  encomiendaId: number;
  vehiculoAsignado: TipoVehiculo;
  plazoGarantizadoHoras: number;
  fechaDespacho?: Date;
}

export interface RegistroEntregaInput {
  despachoId: number;
  fechaEntregaReal: Date;
  estadoFinal: 'ENTREGADO' | 'DEVUELTO' | 'SINIESTRADO';
}

export interface CalculoIndemnizacionResult {
  horasDemora: number;
  porcentajeReintegro: number;
  indemnizacionFlete: number;
  indemnizacionSeguro: number;
  totalIndemnizado: number;
}

export interface Entrega extends CalculoIndemnizacionResult {
  id?: number;
  despachoId: number;
  fechaEntrega: Date;
  estadoFinal: 'ENTREGADO' | 'DEVUELTO' | 'SINIESTRADO';
}

export interface DistribucionFlota {
  motos: number;
  utilitarios: number;
  camiones: number;
}

export interface EstadisticasEncomiendas {
  totalEncomiendas: number;
  totalRecaudado: number;
  totalRecaudadoFletes: number;
  totalIndemnizado: number;
  distribucionFlota: DistribucionFlota;
}

