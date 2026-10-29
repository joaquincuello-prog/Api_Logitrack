/**
 * Servicio de Despacho y Asignación de Flota
 * Funcionalidad 2: Validación de Restricciones Físicas y Asignación de Vehículo
 * Responsable: Cuello Joaquin
 */

import { TipoVehiculo, TipoZona } from '../models/types';

export const REGLAS_ASIGNACION = {
  MOTO: {
    PESO_MAXIMO: 5.0
  },
  UTILITARIO: {
    PESO_MINIMO: 5.0,
    PESO_MAXIMO: 20.0
  },
  CAMION: {
    PESO_MINIMO: 20.01
  }
} as const;

export const PLAZOS_ENTREGA = {
  EXPRESS: 24,
  URBANO: 24,
  PROVINCIAL: 48,
  NACIONAL: 72
} as const;

export function asignarVehiculo(pesoFacturable: number): TipoVehiculo {
  if (pesoFacturable <= 0) {
    throw new Error('El peso facturable debe ser mayor a cero');
  }

  if (pesoFacturable < REGLAS_ASIGNACION.MOTO.PESO_MAXIMO) {
    return 'MOTO';
  } else if (pesoFacturable <= REGLAS_ASIGNACION.UTILITARIO.PESO_MAXIMO) {
    return 'UTILITARIO';
  } else {
    return 'CAMION';
  }
}

export function calcularPlazoGarantizado(tipoZona: TipoZona, esExpress: boolean): number {
  if (esExpress) {
    return PLAZOS_ENTREGA.EXPRESS;
  }
  if (tipoZona === 'URBANO') {
    return PLAZOS_ENTREGA.URBANO;
  }
  if (tipoZona === 'PROVINCIAL') {
    return PLAZOS_ENTREGA.PROVINCIAL;
  }
  return PLAZOS_ENTREGA.NACIONAL;
}
