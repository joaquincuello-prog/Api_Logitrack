import { asignarVehiculo, calcularPlazoGarantizado } from '../../src/services/despachoService';

describe('Servicio de Despacho y Asignación de Flota - BVA (Análisis de Valores Límite)', () => {
  describe('BVA: Asignación de Flota por Peso Facturable', () => {
    test('BVA-F01: Peso mínimo positivo (0.01 kg) -> MOTO', () => {
      expect(asignarVehiculo(0.01)).toBe('MOTO');
    });

    test('BVA-F02: Justo por debajo del límite de Moto (4.99 kg) -> MOTO', () => {
      expect(asignarVehiculo(4.99)).toBe('MOTO');
    });

    test('BVA-F03: Límite frontera exacto Moto / Utilitario (5.00 kg) -> UTILITARIO', () => {
      expect(asignarVehiculo(5.0)).toBe('UTILITARIO');
    });

    test('BVA-F04: Justo sobre frontera inferior de Utilitario (5.01 kg) -> UTILITARIO', () => {
      expect(asignarVehiculo(5.01)).toBe('UTILITARIO');
    });

    test('BVA-F05: Justo por debajo del límite de Utilitario (19.99 kg) -> UTILITARIO', () => {
      expect(asignarVehiculo(19.99)).toBe('UTILITARIO');
    });

    test('BVA-F06: Límite frontera exacto Utilitario / Camión (20.00 kg) -> UTILITARIO', () => {
      expect(asignarVehiculo(20.0)).toBe('UTILITARIO');
    });

    test('BVA-F07: Justo sobre frontera de Camión (20.01 kg) -> CAMION', () => {
      expect(asignarVehiculo(20.01)).toBe('CAMION');
    });

    test('BVA-F08: Límite máximo operativo permitido (40.00 kg) -> CAMION', () => {
      expect(asignarVehiculo(40.0)).toBe('CAMION');
    });

    test('BVA-F09: Peso inválido cero o negativo -> Excepción', () => {
      expect(() => asignarVehiculo(0)).toThrow('El peso facturable debe ser mayor a cero');
      expect(() => asignarVehiculo(-5)).toThrow('El peso facturable debe ser mayor a cero');
    });
  });

  describe('BVA & Clases de Equivalencia: Plazo Garantizado de Entrega', () => {
    test('Servicio Express garantiza 24 horas independientemente de la zona geográfica', () => {
      expect(calcularPlazoGarantizado('URBANO', true)).toBe(24);
      expect(calcularPlazoGarantizado('PROVINCIAL', true)).toBe(24);
      expect(calcularPlazoGarantizado('NACIONAL', true)).toBe(24);
    });

    test('Servicio Estándar asigna plazos escalonados por distancia de zona', () => {
      expect(calcularPlazoGarantizado('URBANO', false)).toBe(24);
      expect(calcularPlazoGarantizado('PROVINCIAL', false)).toBe(48);
      expect(calcularPlazoGarantizado('NACIONAL', false)).toBe(72);
    });
  });
});
