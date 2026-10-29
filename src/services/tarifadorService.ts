/**
 * Motor Tarifario y de Admisión de Encomiendas
 * Funcionalidad 1: Admisión y Tarifación
 * Refactorizado bajo Strategy Pattern y Clean Architecture
 */

import { CalculoTarifarioInput, CalculoTarifarioResult, TipoZona } from '../models/types';
import { CalculadoraTarifariaContext } from '../core/domain/strategies/CalculadoraTarifariaContext';

export const LIMITES_FISICOS = {
  LADO_MAXIMO_CM: 150,
  PESO_MAXIMO_KG: 40,
  DIVISOR_VOLUMETRICO: 5000
} as const;

export const TARIFAS_ZONA = {
  URBANO: {
    MAX_KM: 50,
    BASE: 1500,
    PRECIO_POR_KM: 20
  },
  PROVINCIAL: {
    MIN_KM: 50,
    MAX_KM: 300,
    BASE: 3500,
    PRECIO_POR_KM: 15
  },
  NACIONAL: {
    MIN_KM: 300.01,
    BASE: 7000,
    PRECIO_POR_KM: 12
  }
} as const;

export const RECARGOS = {
  FRAGIL_PORCENTAJE: 0.15,  // +15%
  EXPRESS_PORCENTAJE: 0.30  // +30%
} as const;

const defaultTarifadorContext = new CalculadoraTarifariaContext();

export function validarLimitesFisicos(alto: number, ancho: number, largo: number, pesoReal: number): void {
  if (alto <= 0 || ancho <= 0 || largo <= 0 || pesoReal <= 0) {
    throw new Error('Las dimensiones y el peso deben ser mayores a cero');
  }

  if (
    alto > LIMITES_FISICOS.LADO_MAXIMO_CM ||
    ancho > LIMITES_FISICOS.LADO_MAXIMO_CM ||
    largo > LIMITES_FISICOS.LADO_MAXIMO_CM
  ) {
    throw new Error(`Ningún lado puede superar los ${LIMITES_FISICOS.LADO_MAXIMO_CM} cm`);
  }

  if (pesoReal > LIMITES_FISICOS.PESO_MAXIMO_KG) {
    throw new Error(`El peso real no puede exceder el límite individual de ${LIMITES_FISICOS.PESO_MAXIMO_KG} kg`);
  }
}

export function determinarZona(distanciaKm: number): TipoZona {
  const strategy = defaultTarifadorContext.resolverEstrategia(distanciaKm);
  return strategy.tipoZona;
}

export function calcularPesoVolumetrico(alto: number, ancho: number, largo: number): number {
  const volumen = alto * ancho * largo;
  const pesoVol = volumen / LIMITES_FISICOS.DIVISOR_VOLUMETRICO;
  return Math.round(pesoVol * 100) / 100;
}

export function calcularTarifa(
  input: CalculoTarifarioInput,
  context: CalculadoraTarifariaContext = defaultTarifadorContext
): CalculoTarifarioResult {
  validarLimitesFisicos(input.alto, input.ancho, input.largo, input.pesoReal);

  const pesoVolumetrico = calcularPesoVolumetrico(input.alto, input.ancho, input.largo);
  const pesoFacturable = Math.round(Math.max(input.pesoReal, pesoVolumetrico) * 100) / 100;

  // Delegar resolución de zona y tarifa base a la estrategia correspondiente
  const strategy = context.resolverEstrategia(input.distanciaKm);
  const tipoZona = strategy.tipoZona;
  const tarifaBase = strategy.calcularTarifaBase(input.distanciaKm);

  // Recargos configurables
  const recargos = context.getRecargos();
  const recargoFragil = input.esFragil ? Math.round(tarifaBase * recargos.fragilPorcentaje * 100) / 100 : 0;
  const recargoExpress = input.esExpress ? Math.round(tarifaBase * recargos.expressPorcentaje * 100) / 100 : 0;

  const costoTotal = Math.round((tarifaBase + recargoFragil + recargoExpress) * 100) / 100;

  return {
    pesoVolumetrico,
    pesoFacturable,
    tipoZona,
    tarifaBase: Math.round(tarifaBase * 100) / 100,
    recargoFragil,
    recargoExpress,
    costoTotal
  };
}
