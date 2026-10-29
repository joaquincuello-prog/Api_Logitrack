import { IEncomiendaRepository } from './IEncomiendaRepository';
import { Encomienda, Despacho, Entrega, EstadoEncomienda, EstadisticasEncomiendas } from '../models/types';

export interface InMemorySnapshot {
  encomiendas: string;
  despachos: string;
  entregas: string;
  nextEncomiendaId: number;
  nextDespachoId: number;
  nextEntregaId: number;
}

export class InMemoryEncomiendaRepository implements IEncomiendaRepository {
  private encomiendas: Encomienda[] = [];
  private despachos: Despacho[] = [];
  private entregas: Entrega[] = [];
  private nextEncomiendaId = 1;
  private nextDespachoId = 1;
  private nextEntregaId = 1;

  async crearEncomienda(encomienda: Omit<Encomienda, 'id' | 'fechaCreacion'>): Promise<Encomienda> {
    const nueva: Encomienda = {
      ...encomienda,
      id: this.nextEncomiendaId++,
      fechaCreacion: new Date()
    };
    this.encomiendas.push(nueva);
    return nueva;
  }

  async obtenerEncomiendaPorId(id: number): Promise<Encomienda | null> {
    return this.encomiendas.find(e => e.id === id) || null;
  }

  async obtenerEncomiendaPorCodigo(codigo: string): Promise<Encomienda | null> {
    return this.encomiendas.find(e => e.codigoSeguimiento === codigo) || null;
  }

  async obtenerEncomiendas(estado?: EstadoEncomienda): Promise<Encomienda[]> {
    if (estado) {
      return this.encomiendas.filter(e => e.estado === estado);
    }
    return [...this.encomiendas];
  }

  async listarEncomiendas(estado?: EstadoEncomienda): Promise<Encomienda[]> {
    return this.obtenerEncomiendas(estado);
  }

  async actualizarEstadoEncomienda(id: number, estado: Encomienda['estado']): Promise<boolean> {
    const enc = this.encomiendas.find(e => e.id === id);
    if (!enc) return false;
    enc.estado = estado;
    return true;
  }

  async crearDespacho(despacho: Omit<Despacho, 'id' | 'fechaDespacho'>): Promise<Despacho> {
    const nuevo: Despacho = {
      ...despacho,
      id: this.nextDespachoId++,
      fechaDespacho: new Date()
    };
    this.despachos.push(nuevo);
    return nuevo;
  }

  async obtenerDespachoPorId(id: number): Promise<Despacho | null> {
    return this.despachos.find(d => d.id === id) || null;
  }

  async obtenerDespachoPorEncomiendaId(encomiendaId: number): Promise<Despacho | null> {
    return this.despachos.find(d => d.encomiendaId === encomiendaId) || null;
  }

  async registrarEntrega(entrega: Omit<Entrega, 'id'>): Promise<Entrega> {
    const nueva: Entrega = {
      ...entrega,
      id: this.nextEntregaId++
    };
    this.entregas.push(nueva);
    return nueva;
  }

  async obtenerEntregaPorDespachoId(despachoId: number): Promise<Entrega | null> {
    return this.entregas.find(e => e.despachoId === despachoId) || null;
  }

  async obtenerEstadisticas(): Promise<EstadisticasEncomiendas> {
    const totalEncomiendas = this.encomiendas.length;
    const totalRecaudadoRaw = this.encomiendas.reduce((acc, e) => acc + (e.costoTotal || 0), 0);
    const totalIndemnizadoRaw = this.entregas.reduce((acc, e) => acc + (e.totalIndemnizado || 0), 0);

    const distribucionFlota = {
      motos: 0,
      utilitarios: 0,
      camiones: 0
    };

    for (const d of this.despachos) {
      if (d.vehiculoAsignado === 'MOTO') distribucionFlota.motos++;
      else if (d.vehiculoAsignado === 'UTILITARIO') distribucionFlota.utilitarios++;
      else if (d.vehiculoAsignado === 'CAMION') distribucionFlota.camiones++;
    }

    const totalRecaudado = Math.round(totalRecaudadoRaw * 100) / 100;
    const totalIndemnizado = Math.round(totalIndemnizadoRaw * 100) / 100;

    return {
      totalEncomiendas,
      totalRecaudado,
      totalRecaudadoFletes: totalRecaudado,
      totalIndemnizado,
      distribucionFlota
    };
  }

  async limpiarDatos(): Promise<void> {
    this.encomiendas = [];
    this.despachos = [];
    this.entregas = [];
    this.nextEncomiendaId = 1;
    this.nextDespachoId = 1;
    this.nextEntregaId = 1;
  }

  createSnapshot(): InMemorySnapshot {
    return {
      encomiendas: JSON.stringify(this.encomiendas),
      despachos: JSON.stringify(this.despachos),
      entregas: JSON.stringify(this.entregas),
      nextEncomiendaId: this.nextEncomiendaId,
      nextDespachoId: this.nextDespachoId,
      nextEntregaId: this.nextEntregaId
    };
  }

  restoreSnapshot(snapshot: InMemorySnapshot): void {
    this.encomiendas = JSON.parse(snapshot.encomiendas);
    this.despachos = JSON.parse(snapshot.despachos);
    this.entregas = JSON.parse(snapshot.entregas);
    this.nextEncomiendaId = snapshot.nextEncomiendaId;
    this.nextDespachoId = snapshot.nextDespachoId;
    this.nextEntregaId = snapshot.nextEntregaId;
  }
}
