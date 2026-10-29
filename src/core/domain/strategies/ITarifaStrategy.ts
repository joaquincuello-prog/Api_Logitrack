export type TipoZona = 'URBANO' | 'PROVINCIAL' | 'NACIONAL';

export interface ITarifaStrategy {
  readonly tipoZona: TipoZona;
  esAplicable(distanciaKm: number): boolean;
  calcularTarifaBase(distanciaKm: number): number;
}
