import { ITarifaStrategy, TipoZona } from './ITarifaStrategy';

export class TarifaProvincialStrategy implements ITarifaStrategy {
  readonly tipoZona: TipoZona = 'PROVINCIAL';
  private readonly base: number;
  private readonly precioKm: number;
  private readonly minKm: number;
  private readonly maxKm: number;

  constructor(base = 3500, precioKm = 15, minKm = 50, maxKm = 300) {
    this.base = base;
    this.precioKm = precioKm;
    this.minKm = minKm;
    this.maxKm = maxKm;
  }

  esAplicable(distanciaKm: number): boolean {
    return distanciaKm >= this.minKm && distanciaKm <= this.maxKm;
  }

  calcularTarifaBase(distanciaKm: number): number {
    return this.base + (distanciaKm * this.precioKm);
  }
}
