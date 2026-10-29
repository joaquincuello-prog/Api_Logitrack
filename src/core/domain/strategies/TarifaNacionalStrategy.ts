import { ITarifaStrategy, TipoZona } from './ITarifaStrategy';

export class TarifaNacionalStrategy implements ITarifaStrategy {
  readonly tipoZona: TipoZona = 'NACIONAL';
  private readonly base: number;
  private readonly precioKm: number;
  private readonly minKm: number;

  constructor(base = 7000, precioKm = 12, minKm = 300) {
    this.base = base;
    this.precioKm = precioKm;
    this.minKm = minKm;
  }

  esAplicable(distanciaKm: number): boolean {
    return distanciaKm > this.minKm;
  }

  calcularTarifaBase(distanciaKm: number): number {
    return this.base + (distanciaKm * this.precioKm);
  }
}
