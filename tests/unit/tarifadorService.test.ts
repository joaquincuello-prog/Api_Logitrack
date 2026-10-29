/**
 * Etapa 5: Diseño de Casos de Prueba - Caja Negra y Caja Blanca
 * Etapa 8: Pruebas Unitarias Automatizadas
 * Módulo: TarifadorService (Admisión y Tarifación)
 * Responsable: Vivas Guillermo
 */

import {
  calcularTarifa,
  calcularPesoVolumetrico,
  determinarZona,
  validarLimitesFisicos,
  LIMITES_FISICOS
} from '../../src/services/tarifadorService';

describe('TarifadorService - Pruebas Unitarias y de Caja Negra / Blanca', () => {
  describe('Caja Negra: Análisis de Valores Límite en Dimensiones y Peso', () => {
    test('CP-01: Límite superior permitido de dimensión (150 cm) -> Válido', () => {
      expect(() => {
        validarLimitesFisicos(150, 50, 50, 10);
      }).not.toThrow();
    });

    test('CP-02: Valor límite excedido de dimensión (150.1 cm) -> Inválido (Excepción)', () => {
      expect(() => {
        validarLimitesFisicos(150.1, 50, 50, 10);
      }).toThrow('Ningún lado puede superar los 150 cm');
    });

    test('CP-03: Límite superior permitido de peso real (40.0 kg) -> Válido', () => {
      expect(() => {
        validarLimitesFisicos(50, 50, 50, 40.0);
      }).not.toThrow();
    });

    test('CP-04: Valor límite excedido de peso real (40.1 kg) -> Inválido (Excepción)', () => {
      expect(() => {
        validarLimitesFisicos(50, 50, 50, 40.1);
      }).toThrow('El peso real no puede exceder el límite individual de 40 kg');
    });

    test('CP-05: Valor inválido negativo en dimensiones -> Inválido (Excepción)', () => {
      expect(() => {
        validarLimitesFisicos(-5, 50, 50, 10);
      }).toThrow('Las dimensiones y el peso deben ser mayores a cero');
    });
  });

  describe('Caja Negra: Clases de Equivalencia para Zonas Geográficas', () => {
    test('CP-06: Clase Urbana (distancia < 50 km, ej: 25 km)', () => {
      expect(determinarZona(25)).toBe('URBANO');
    });

    test('CP-07: Límite frontera Provincial (distancia = 50 km)', () => {
      expect(determinarZona(50)).toBe('PROVINCIAL');
    });

    test('CP-08: Clase Provincial (distancia entre 50 y 300 km, ej: 150 km)', () => {
      expect(determinarZona(150)).toBe('PROVINCIAL');
    });

    test('CP-09: Límite frontera Provincial superior (distancia = 300 km)', () => {
      expect(determinarZona(300)).toBe('PROVINCIAL');
    });

    test('CP-10: Clase Nacional (distancia > 300 km, ej: 301 km)', () => {
      expect(determinarZona(301)).toBe('NACIONAL');
    });

    test('CP-11: Distancia inválida menor o igual a cero (0 km) -> Excepción', () => {
      expect(() => determinarZona(0)).toThrow('La distancia recorrida debe ser mayor a cero');
    });
  });

  describe('Caja Blanca: Cobertura de Ramas y Cálculo de Tarifas con Recargos', () => {
    test('CP-12: Paquete estándar en zona Urbana sin recargos (peso real > volumétrico)', () => {
      // 20x20x20 / 5000 = 1.6 kg volumétrico. Peso real = 4 kg. Facturable = 4 kg.
      // Distancia: 20 km -> Base urbana: 1500 + (20 * 20) = 1900.
      const res = calcularTarifa({
        alto: 20,
        ancho: 20,
        largo: 20,
        pesoReal: 4,
        distanciaKm: 20,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 0
      });

      expect(res.pesoVolumetrico).toBe(1.6);
      expect(res.pesoFacturable).toBe(4);
      expect(res.tipoZona).toBe('URBANO');
      expect(res.tarifaBase).toBe(1900);
      expect(res.recargoFragil).toBe(0);
      expect(res.recargoExpress).toBe(0);
      expect(res.costoTotal).toBe(1900);
    });

    test('CP-13: Paquete voluminoso en zona Provincial con recargo Frágil (+15%)', () => {
      // 50x50x50 / 5000 = 25 kg volumétrico. Peso real = 5 kg. Facturable = 25 kg.
      // Distancia: 100 km -> Base provincial: 3500 + (100 * 15) = 5000.
      // Recargo Frágil: 5000 * 0.15 = 750. Total = 5750.
      const res = calcularTarifa({
        alto: 50,
        ancho: 50,
        largo: 50,
        pesoReal: 5,
        distanciaKm: 100,
        esFragil: true,
        esExpress: false,
        valorDeclarado: 10000
      });

      expect(res.pesoVolumetrico).toBe(25);
      expect(res.pesoFacturable).toBe(25);
      expect(res.tipoZona).toBe('PROVINCIAL');
      expect(res.tarifaBase).toBe(5000);
      expect(res.recargoFragil).toBe(750);
      expect(res.recargoExpress).toBe(0);
      expect(res.costoTotal).toBe(5750);
    });

    test('CP-14: Paquete en zona Nacional con recargo Express (+30%) y Frágil (+15%)', () => {
      // Distancia: 500 km -> Base nacional: 7000 + (500 * 12) = 13000.
      // Recargo Frágil: 13000 * 0.15 = 1950.
      // Recargo Express: 13000 * 0.30 = 3900.
      // Total = 13000 + 1950 + 3900 = 18850.
      const res = calcularTarifa({
        alto: 30,
        ancho: 30,
        largo: 30,
        pesoReal: 8,
        distanciaKm: 500,
        esFragil: true,
        esExpress: true,
        valorDeclarado: 25000
      });

      expect(res.tipoZona).toBe('NACIONAL');
      expect(res.tarifaBase).toBe(13000);
      expect(res.recargoFragil).toBe(1950);
      expect(res.recargoExpress).toBe(3900);
      expect(res.costoTotal).toBe(18850);
    });
  });
});
