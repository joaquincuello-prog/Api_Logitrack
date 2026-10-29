import { calcularIndemnizacion } from '../../src/services/indemnizacionService';

describe('Servicio de Indemnizaciones - BVA (Análisis de Valores Límite)', () => {
  const flete = 5000;
  const seguro = 30000;

  describe('BVA: Fronteras en Horas de Demora', () => {
    test('BVA-I01: Entrega en término exacta (0 horas de demora) -> 0% reintegro flete, 0% seguro', () => {
      const res = calcularIndemnizacion({
        horasDemora: 0,
        costoFlete: flete,
        seguroDeclarado: seguro,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(0);
      expect(res.indemnizacionFlete).toBe(0);
      expect(res.indemnizacionSeguro).toBe(0);
      expect(res.totalIndemnizado).toBe(0);
    });

    test('BVA-I02: Demora leve límite inferior (1 hora de demora) -> 20% reintegro flete, 0 seguro', () => {
      const res = calcularIndemnizacion({
        horasDemora: 1,
        costoFlete: flete,
        seguroDeclarado: seguro,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(20);
      expect(res.indemnizacionFlete).toBe(1000);
      expect(res.indemnizacionSeguro).toBe(0);
      expect(res.totalIndemnizado).toBe(1000);
    });

    test('BVA-I03: Demora leve límite superior (24 horas de demora) -> 20% reintegro flete, 0 seguro', () => {
      const res = calcularIndemnizacion({
        horasDemora: 24,
        costoFlete: flete,
        seguroDeclarado: seguro,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(20);
      expect(res.indemnizacionFlete).toBe(1000);
      expect(res.indemnizacionSeguro).toBe(0);
      expect(res.totalIndemnizado).toBe(1000);
    });

    test('BVA-I04: Demora media límite inferior (25 horas de demora) -> 50% reintegro flete, 0 seguro', () => {
      const res = calcularIndemnizacion({
        horasDemora: 25,
        costoFlete: flete,
        seguroDeclarado: seguro,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(50);
      expect(res.indemnizacionFlete).toBe(2500);
      expect(res.indemnizacionSeguro).toBe(0);
      expect(res.totalIndemnizado).toBe(2500);
    });

    test('BVA-I05: Demora media límite superior (48 horas de demora) -> 50% reintegro flete, 0 seguro', () => {
      const res = calcularIndemnizacion({
        horasDemora: 48,
        costoFlete: flete,
        seguroDeclarado: seguro,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(50);
      expect(res.indemnizacionFlete).toBe(2500);
      expect(res.indemnizacionSeguro).toBe(0);
      expect(res.totalIndemnizado).toBe(2500);
    });

    test('BVA-I06: Demora crítica límite inferior (49 horas de demora) -> 100% reintegro flete + 100% seguro', () => {
      const res = calcularIndemnizacion({
        horasDemora: 49,
        costoFlete: flete,
        seguroDeclarado: seguro,
        estadoFinal: 'ENTREGADO'
      });
      expect(res.porcentajeReintegro).toBe(100);
      expect(res.indemnizacionFlete).toBe(5000);
      expect(res.indemnizacionSeguro).toBe(30000);
      expect(res.totalIndemnizado).toBe(35000);
    });
  });

  describe('Casos Especiales: Siniestro e Invariantes Numéricos', () => {
    test('BVA-I07: Siniestro con 0 horas de demora aplica cobertura crítica total (100% flete + 100% seguro)', () => {
      const res = calcularIndemnizacion({
        horasDemora: 0,
        costoFlete: flete,
        seguroDeclarado: seguro,
        estadoFinal: 'SINIESTRADO'
      });
      expect(res.porcentajeReintegro).toBe(100);
      expect(res.indemnizacionFlete).toBe(5000);
      expect(res.indemnizacionSeguro).toBe(30000);
      expect(res.totalIndemnizado).toBe(35000);
    });

    test('BVA-I08: Demora negativa arroja excepción', () => {
      expect(() => calcularIndemnizacion({
        horasDemora: -1,
        costoFlete: flete,
        seguroDeclarado: seguro,
        estadoFinal: 'ENTREGADO'
      })).toThrow('Las horas de demora no pueden ser negativas');
    });

    test('BVA-I09: Costo de flete o seguro negativo arroja excepción', () => {
      expect(() => calcularIndemnizacion({
        horasDemora: 5,
        costoFlete: -100,
        seguroDeclarado: seguro,
        estadoFinal: 'ENTREGADO'
      })).toThrow('Los montos de flete y seguro deben ser mayores o iguales a cero');

      expect(() => calcularIndemnizacion({
        horasDemora: 5,
        costoFlete: flete,
        seguroDeclarado: -500,
        estadoFinal: 'ENTREGADO'
      })).toThrow('Los montos de flete y seguro deben ser mayores o iguales a cero');
    });
  });
});
