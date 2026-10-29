import { ITarifaStrategy } from './ITarifaStrategy';
import { TarifaUrbanaStrategy } from './TarifaUrbanaStrategy';
import { TarifaProvincialStrategy } from './TarifaProvincialStrategy';
import { TarifaNacionalStrategy } from './TarifaNacionalStrategy';

export interface RecargosConfig {
  fragilPorcentaje: number;
  expressPorcentaje: number;
}

export class CalculadoraTarifariaContext {
  private readonly strategies: ITarifaStrategy[];
  private readonly recargos: RecargosConfig;

  constructor(
    strategies?: ITarifaStrategy[],
    recargos: RecargosConfig = { fragilPorcentaje: 0.15, expressPorcentaje: 0.30 }
  ) {
    this.strategies = strategies || [
      new TarifaUrbanaStrategy(),
      new TarifaProvincialStrategy(),
      new TarifaNacionalStrategy()
    ];
    this.recargos = recargos;
  }

  public resolverEstrategia(distanciaKm: number): ITarifaStrategy {
    if (distanciaKm <= 0) {
      throw new Error('La distancia recorrida debe ser mayor a cero');
    }
    const strategy = this.strategies.find(s => s.esAplicable(distanciaKm));
    if (!strategy) {
      throw new Error(`No se encontró una estrategia tarifaria aplicable para la distancia: ${distanciaKm} km`);
    }
    return strategy;
  }

  public getRecargos(): RecargosConfig {
    return { ...this.recargos };
  }
}
