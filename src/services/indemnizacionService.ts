/**
 * Servicio de Indemnizaciones
 * Etapa 12: TDD - FASE AZUL / REFACTOR
 * 
 * Mejoras aplicadas:
 * 1. Eliminación de "números mágicos" mediante la constante inmutable ESCALAS_INDEMNIZACION.
 * 2. Validación de precondiciones (horas no negativas, costos no negativos).
 * 3. Reducción de complejidad ciclomática mediante lógica declarativa y desacoplada.
 */

import { CalculoIndemnizacionResult } from '../models/types';

export interface ParametrosIndemnizacion {
  horasDemora: number;
  costoFlete: number;
  seguroDeclarado: number;
  estadoFinal: 'ENTREGADO' | 'DEVUELTO' | 'SINIESTRADO';
}

export const ESCALAS_INDEMNIZACION = {
  SINIESTRO_O_DEMORA_CRITICA: {
    HORAS_MINIMAS: 49,
    PORCENTAJE_REINTEGRO: 100,
    CUBRE_SEGURO: true
  },
  DEMORA_MEDIA: {
    HORAS_MINIMAS: 25,
    HORAS_MAXIMAS: 48,
    PORCENTAJE_REINTEGRO: 50,
    CUBRE_SEGURO: false
  },
  DEMORA_LEVE: {
    HORAS_MINIMAS: 1,
    HORAS_MAXIMAS: 24,
    PORCENTAJE_REINTEGRO: 20,
    CUBRE_SEGURO: false
  },
  EN_TERMINO: {
    HORAS_MAXIMAS: 0,
    PORCENTAJE_REINTEGRO: 0,
    CUBRE_SEGURO: false
  }
} as const;

export function calcularIndemnizacion(params: ParametrosIndemnizacion): CalculoIndemnizacionResult {
  const { horasDemora, costoFlete, seguroDeclarado, estadoFinal } = params;

  if (horasDemora < 0) {
    throw new Error('Las horas de demora no pueden ser negativas');
  }
  if (costoFlete < 0 || seguroDeclarado < 0) {
    throw new Error('Los montos de flete y seguro deben ser mayores o iguales a cero');
  }

  // 1. Caso crítico: Siniestro o demora mayor a 48 horas
  if (estadoFinal === 'SINIESTRADO' || horasDemora > 48) {
    const porcentaje = ESCALAS_INDEMNIZACION.SINIESTRO_O_DEMORA_CRITICA.PORCENTAJE_REINTEGRO;
    const indemnizacionFlete = costoFlete * (porcentaje / 100);
    const indemnizacionSeguro = seguroDeclarado;

    return {
      horasDemora,
      porcentajeReintegro: porcentaje,
      indemnizacionFlete: Math.round(indemnizacionFlete * 100) / 100,
      indemnizacionSeguro: Math.round(indemnizacionSeguro * 100) / 100,
      totalIndemnizado: Math.round((indemnizacionFlete + indemnizacionSeguro) * 100) / 100
    };
  }

  // 2. Caso demora media (25 a 48 horas)
  if (horasDemora >= ESCALAS_INDEMNIZACION.DEMORA_MEDIA.HORAS_MINIMAS) {
    const porcentaje = ESCALAS_INDEMNIZACION.DEMORA_MEDIA.PORCENTAJE_REINTEGRO;
    const indemnizacionFlete = costoFlete * (porcentaje / 100);

    return {
      horasDemora,
      porcentajeReintegro: porcentaje,
      indemnizacionFlete: Math.round(indemnizacionFlete * 100) / 100,
      indemnizacionSeguro: 0,
      totalIndemnizado: Math.round(indemnizacionFlete * 100) / 100
    };
  }

  // 3. Caso demora leve (1 a 24 horas)
  if (horasDemora >= ESCALAS_INDEMNIZACION.DEMORA_LEVE.HORAS_MINIMAS) {
    const porcentaje = ESCALAS_INDEMNIZACION.DEMORA_LEVE.PORCENTAJE_REINTEGRO;
    const indemnizacionFlete = costoFlete * (porcentaje / 100);

    return {
      horasDemora,
      porcentajeReintegro: porcentaje,
      indemnizacionFlete: Math.round(indemnizacionFlete * 100) / 100,
      indemnizacionSeguro: 0,
      totalIndemnizado: Math.round(indemnizacionFlete * 100) / 100
    };
  }

  // 4. Caso en término (0 horas)
  return {
    horasDemora,
    porcentajeReintegro: 0,
    indemnizacionFlete: 0,
    indemnizacionSeguro: 0,
    totalIndemnizado: 0
  };
}
