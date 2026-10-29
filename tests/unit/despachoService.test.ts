/**
 * Etapa 5: Diseño de Casos de Prueba - Caja Negra y Caja Blanca
 * Etapa 8: Pruebas Unitarias Automatizadas
 * Módulo: DespachoService (Asignación de Flota y Plazos)
 * Responsable: Cuello Joaquin
 */

import { asignarVehiculo, calcularPlazoGarantizado } from '../../src/services/despachoService';

describe('DespachoService - Pruebas Unitarias y Asignación de Flota', () => {
  describe('Caja Negra y Valores Límite: Asignación de Tipo de Vehículo', () => {
    test('CP-15: Peso menor a 5 kg (ej. 4.9 kg) -> Asigna MOTO', () => {
      expect(asignarVehiculo(4.9)).toBe('MOTO');
    });

    test('CP-16: Valor frontera inferior Utilitario (5.0 kg) -> Asigna UTILITARIO', () => {
      expect(asignarVehiculo(5.0)).toBe('UTILITARIO');
    });

    test('CP-17: Rango medio Utilitario (12.5 kg) -> Asigna UTILITARIO', () => {
      expect(asignarVehiculo(12.5)).toBe('UTILITARIO');
    });

    test('CP-18: Valor frontera superior Utilitario (20.0 kg) -> Asigna UTILITARIO', () => {
      expect(asignarVehiculo(20.0)).toBe('UTILITARIO');
    });

    test('CP-19: Valor frontera inferior Camión (20.1 kg) -> Asigna CAMION', () => {
      expect(asignarVehiculo(20.1)).toBe('CAMION');
    });

    test('CP-20: Carga pesada (38.0 kg) -> Asigna CAMION', () => {
      expect(asignarVehiculo(38.0)).toBe('CAMION');
    });

    test('CP-21: Peso inválido (0 kg o negativo) -> Excepción', () => {
      expect(() => asignarVehiculo(0)).toThrow('El peso facturable debe ser mayor a cero');
      expect(() => asignarVehiculo(-3)).toThrow('El peso facturable debe ser mayor a cero');
    });
  });

  describe('Caja Blanca: Cobertura de Decisiones en Plazos de Entrega', () => {
    test('CP-22: Envío Express siempre garantiza 24 horas independientemente de la zona', () => {
      expect(calcularPlazoGarantizado('NACIONAL', true)).toBe(24);
      expect(calcularPlazoGarantizado('PROVINCIAL', true)).toBe(24);
      expect(calcularPlazoGarantizado('URBANO', true)).toBe(24);
    });

    test('CP-23: Envío estándar en zona Urbana -> 24 horas', () => {
      expect(calcularPlazoGarantizado('URBANO', false)).toBe(24);
    });

    test('CP-24: Envío estándar en zona Provincial -> 48 horas', () => {
      expect(calcularPlazoGarantizado('PROVINCIAL', false)).toBe(48);
    });

    test('CP-25: Envío estándar en zona Nacional -> 72 horas', () => {
      expect(calcularPlazoGarantizado('NACIONAL', false)).toBe(72);
    });
  });
});
