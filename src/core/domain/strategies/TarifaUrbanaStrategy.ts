import { ITarifaStrategy, TipoZona } from './ITarifaStrategy';

export class TarifaUrbanaStrategy implements ITarifaStrategy {
  readonly tipoZona: TipoZona = 'URBANO';
  private readonly base: number;
  private readonly precioKm: number;
  private readonly maxKm: number;

  constructor(base = 1500, precioKm = 20, maxKm = 50) {
    this.base = base;
    this.precioKm = precioKm;
    this.maxKm = maxKm;
  }

  esAplicable(distanciaKm: number): boolean {
    return distanciaKm > 0 && distanciaKm < this.maxKm;
  }

  calcularTarifaBase(distanciaKm: number): number {
    return this.base + (distanciaKm * this.precioKm);
  }
}
