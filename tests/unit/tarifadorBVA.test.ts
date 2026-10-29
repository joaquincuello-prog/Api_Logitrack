import {
  determinarZona,
  calcularTarifa,
  validarLimitesFisicos,
  calcularPesoVolumetrico
} from '../../src/services/tarifadorService';
import { CalculadoraTarifariaContext } from '../../src/core/domain/strategies/CalculadoraTarifariaContext';
import { ITarifaStrategy } from '../../src/core/domain/strategies/ITarifaStrategy';

describe('Motor Tarifario - BVA (Análisis de Valores Límite) y Strategy Pattern', () => {
  describe('BVA: Fronteras de Distancia y Clasificación de Zonas Geográficas', () => {
    test('BVA-01: Límite inferior urbano (0.01 km) -> URBANO', () => {
      expect(determinarZona(0.01)).toBe('URBANO');
    });

    test('BVA-02: Límite superior urbano (49.99 km) -> URBANO', () => {
      expect(determinarZona(49.99)).toBe('URBANO');
    });

    test('BVA-03: Límite exacto frontera Provincial inferior (50.00 km) -> PROVINCIAL', () => {
      expect(determinarZona(50.0)).toBe('PROVINCIAL');
    });

    test('BVA-04: Justo sobre frontera Provincial inferior (50.01 km) -> PROVINCIAL', () => {
      expect(determinarZona(50.01)).toBe('PROVINCIAL');
    });

    test('BVA-05: Justo por debajo de frontera Provincial superior (299.99 km) -> PROVINCIAL', () => {
      expect(determinarZona(299.99)).toBe('PROVINCIAL');
    });

    test('BVA-06: Límite exacto frontera Provincial superior (300.00 km) -> PROVINCIAL', () => {
      expect(determinarZona(300.0)).toBe('PROVINCIAL');
    });

    test('BVA-07: Justo sobre frontera Provincial hacia Nacional (300.01 km) -> NACIONAL', () => {
      expect(determinarZona(300.01)).toBe('NACIONAL');
    });

    test('BVA-08: Distancia larga nacional (1500 km) -> NACIONAL', () => {
      expect(determinarZona(1500)).toBe('NACIONAL');
    });

    test('BVA-09: Distancia frontera inválida cero o negativa (0 km, -1 km) -> Excepción', () => {
      expect(() => determinarZona(0)).toThrow('La distancia recorrida debe ser mayor a cero');
      expect(() => determinarZona(-10)).toThrow('La distancia recorrida debe ser mayor a cero');
    });
  });

  describe('BVA: Fronteras de Dimensiones y Pesos Físicos', () => {
    test('BVA-10: Lado límite exacto permitido (150 cm) en cada eje', () => {
      expect(() => validarLimitesFisicos(150, 10, 10, 10)).not.toThrow();
      expect(() => validarLimitesFisicos(10, 150, 10, 10)).not.toThrow();
      expect(() => validarLimitesFisicos(10, 10, 150, 10)).not.toThrow();
    });

    test('BVA-11: Lado que supera por 0.1 cm el límite superior (150.1 cm) en cada eje', () => {
      expect(() => validarLimitesFisicos(150.1, 10, 10, 10)).toThrow('Ningún lado puede superar los 150 cm');
      expect(() => validarLimitesFisicos(10, 150.1, 10, 10)).toThrow('Ningún lado puede superar los 150 cm');
      expect(() => validarLimitesFisicos(10, 10, 150.1, 10)).toThrow('Ningún lado puede superar los 150 cm');
    });

    test('BVA-12: Peso real límite exacto (40.0 kg) -> Válido', () => {
      expect(() => validarLimitesFisicos(10, 10, 10, 40.0)).not.toThrow();
    });

    test('BVA-13: Peso real excedido por 0.01 kg (40.01 kg) -> Excepción', () => {
      expect(() => validarLimitesFisicos(10, 10, 10, 40.01)).toThrow('no puede exceder el límite individual de 40 kg');
    });

    test('BVA-14: Dimensiones mínimas permitidas (0.1 cm y 0.01 kg) -> Válido', () => {
      expect(() => validarLimitesFisicos(0.1, 0.1, 0.1, 0.01)).not.toThrow();
    });
  });

  describe('Strategy Pattern: Extensibilidad e Inyección de Nuevas Estrategias', () => {
    test('Permite inyectar una estrategia comercial personalizada (ej. Tarifa Especial Patagonia)', () => {
      class TarifaPatagoniaStrategy implements ITarifaStrategy {
        readonly tipoZona = 'NACIONAL';
        esAplicable(distanciaKm: number): boolean {
          return distanciaKm >= 2000;
        }
        calcularTarifaBase(distanciaKm: number): number {
          return 10000 + (distanciaKm * 10);
        }
      }

      const customContext = new CalculadoraTarifariaContext([
        new TarifaPatagoniaStrategy()
      ]);

      const strategy = customContext.resolverEstrategia(2500);
      expect(strategy.tipoZona).toBe('NACIONAL');
      expect(strategy.calcularTarifaBase(2500)).toBe(35000);
    });

    test('Lanza excepción si ninguna estrategia del contexto aplica a la distancia', () => {
      const emptyContext = new CalculadoraTarifariaContext([]);
      expect(() => emptyContext.resolverEstrategia(100)).toThrow('No se encontró una estrategia tarifaria aplicable');
    });
  });
});
