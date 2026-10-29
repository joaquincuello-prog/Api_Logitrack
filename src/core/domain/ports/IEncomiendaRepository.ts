import { Encomienda, Despacho, Entrega, EstadoEncomienda, EstadisticasEncomiendas } from '../../../models/types';

export interface IEncomiendaRepository {
  crearEncomienda(encomienda: Omit<Encomienda, 'id' | 'fechaCreacion'>): Promise<Encomienda>;
  obtenerEncomiendaPorId(id: number): Promise<Encomienda | null>;
  obtenerEncomiendaPorCodigo(codigo: string): Promise<Encomienda | null>;
  obtenerEncomiendas(estado?: EstadoEncomienda): Promise<Encomienda[]>;
  listarEncomiendas(estado?: EstadoEncomienda): Promise<Encomienda[]>;
  actualizarEstadoEncomienda(id: number, estado: Encomienda['estado']): Promise<boolean>;

  crearDespacho(despacho: Omit<Despacho, 'id' | 'fechaDespacho'>): Promise<Despacho>;
  obtenerDespachoPorId(id: number): Promise<Despacho | null>;
  obtenerDespachoPorEncomiendaId(encomiendaId: number): Promise<Despacho | null>;

  registrarEntrega(entrega: Omit<Entrega, 'id'>): Promise<Entrega>;
  obtenerEntregaPorDespachoId(despachoId: number): Promise<Entrega | null>;

  obtenerEstadisticas(): Promise<EstadisticasEncomiendas>;

  limpiarDatos?(): Promise<void>;
}
