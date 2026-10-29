/**
 * Etapa 5: Diseño de Casos de Prueba - Caja Negra y Caja Blanca
 * Etapa 8: Pruebas Unitarias Automatizadas
 * Etapa 12: TDD y Refactorización
 * Módulo: IndemnizacionService
 * Responsable: Vivas Guillermo
 */

import { calcularIndemnizacion } from '../../src/services/indemnizacionService';

describe('IndemnizacionService - Casos de Prueba y Valores Límite', () => {
  const fleteBase = 10000;
  const seguroDeclarado = 50000;

  describe('Caja Negra: Valores Límite en Horas de Demora', () => {
    test('CP-26: Valor Límite - Entrega sin demora (0 horas)', () => {
      const res = calcularIndemnizacion({
        horasDemora: 0,
        costoFlete: fleteBase,
        seguroDeclarado,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(0);
      expect(res.indemnizacionFlete).toBe(0);
      expect(res.indemnizacionSeguro).toBe(0);
      expect(res.totalIndemnizado).toBe(0);
    });

    test('CP-27: Límite Inferior Escala Leve (1 hora de demora) -> Reintegro 20%', () => {
      const res = calcularIndemnizacion({
        horasDemora: 1,
        costoFlete: fleteBase,
        seguroDeclarado,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(20);
      expect(res.indemnizacionFlete).toBe(2000);
      expect(res.totalIndemnizado).toBe(2000);
    });

    test('CP-28: Límite Superior Escala Leve (24 horas de demora) -> Reintegro 20%', () => {
      const res = calcularIndemnizacion({
        horasDemora: 24,
        costoFlete: fleteBase,
        seguroDeclarado,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(20);
      expect(res.indemnizacionFlete).toBe(2000);
      expect(res.totalIndemnizado).toBe(2000);
    });

    test('CP-29: Límite Inferior Escala Media (25 horas de demora) -> Reintegro 50%', () => {
      const res = calcularIndemnizacion({
        horasDemora: 25,
        costoFlete: fleteBase,
        seguroDeclarado,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(50);
      expect(res.indemnizacionFlete).toBe(5000);
      expect(res.totalIndemnizado).toBe(5000);
    });

    test('CP-30: Límite Superior Escala Media (48 horas de demora) -> Reintegro 50%', () => {
      const res = calcularIndemnizacion({
        horasDemora: 48,
        costoFlete: fleteBase,
        seguroDeclarado,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(50);
      expect(res.indemnizacionFlete).toBe(5000);
      expect(res.totalIndemnizado).toBe(5000);
    });

    test('CP-31: Límite Inferior Escala Crítica (49 horas de demora) -> Reintegro 100% + Seguro', () => {
      const res = calcularIndemnizacion({
        horasDemora: 49,
        costoFlete: fleteBase,
        seguroDeclarado,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(100);
      expect(res.indemnizacionFlete).toBe(10000);
      expect(res.indemnizacionSeguro).toBe(50000);
      expect(res.totalIndemnizado).toBe(60000);
    });
  });

  describe('Caja Blanca: Cobertura de Condiciones y Caminos Especiales', () => {
    test('CP-32: Condición de Siniestro con 0 horas de demora -> 100% flete + seguro', () => {
      const res = calcularIndemnizacion({
        horasDemora: 0,
        costoFlete: fleteBase,
        seguroDeclarado,
        estadoFinal: 'SINIESTRADO'
      });
      expect(res.porcentajeReintegro).toBe(100);
      expect(res.indemnizacionFlete).toBe(10000);
      expect(res.indemnizacionSeguro).toBe(50000);
      expect(res.totalIndemnizado).toBe(60000);
    });

    test('CP-33: Excepción ante datos inválidos (horas negativas)', () => {
      expect(() => {
        calcularIndemnizacion({
          horasDemora: -1,
          costoFlete: fleteBase,
          seguroDeclarado,
          estadoFinal: 'ENTREGADO'
        });
      }).toThrow('Las horas de demora no pueden ser negativas');
    });

    test('CP-34: Excepción ante montos negativos', () => {
      expect(() => {
        calcularIndemnizacion({
          horasDemora: 5,
          costoFlete: -100,
          seguroDeclarado,
          estadoFinal: 'ENTREGADO'
        });
      }).toThrow('Los montos de flete y seguro deben ser mayores o iguales a cero');
    });
  });
});
