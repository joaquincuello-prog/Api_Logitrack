import { IEncomiendaRepository } from './IEncomiendaRepository';
import { Encomienda, Despacho, Entrega, EstadoEncomienda, EstadisticasEncomiendas } from '../models/types';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MySqlEncomiendaRepository implements IEncomiendaRepository {
  async crearEncomienda(encomienda: Omit<Encomienda, 'id' | 'fechaCreacion'>): Promise<Encomienda> {
    const query = `
      INSERT INTO encomiendas (
        codigo_seguimiento, cliente, alto, ancho, largo, peso_real,
        peso_volumetrico, peso_facturable, distancia_km, tipo_zona,
        es_fragil, es_express, valor_declarado, tarifa_base,
        recargo_fragil, recargo_express, costo_total, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      encomienda.codigoSeguimiento,
      encomienda.cliente,
      encomienda.alto,
      encomienda.ancho,
      encomienda.largo,
      encomienda.pesoReal,
      encomienda.pesoVolumetrico,
      encomienda.pesoFacturable,
      encomienda.distanciaKm,
      encomienda.tipoZona,
      encomienda.esFragil,
      encomienda.esExpress,
      encomienda.valorDeclarado,
      encomienda.tarifaBase,
      encomienda.recargoFragil,
      encomienda.recargoExpress,
      encomienda.costoTotal,
      encomienda.estado
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return {
      ...encomienda,
      id: result.insertId,
      fechaCreacion: new Date()
    };
  }

  async obtenerEncomiendaPorId(id: number): Promise<Encomienda | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM encomiendas WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;
    return this.mapRowToEncomienda(rows[0]);
  }

  async obtenerEncomiendaPorCodigo(codigo: string): Promise<Encomienda | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM encomiendas WHERE codigo_seguimiento = ?',
      [codigo]
    );

    if (rows.length === 0) return null;
    return this.mapRowToEncomienda(rows[0]);
  }

  async obtenerEncomiendas(estado?: EstadoEncomienda): Promise<Encomienda[]> {
    let query = 'SELECT * FROM encomiendas';
    const params: any[] = [];
    if (estado) {
      query += ' WHERE estado = ?';
      params.push(estado);
    }
    query += ' ORDER BY id ASC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows.map(row => this.mapRowToEncomienda(row));
  }

  async listarEncomiendas(estado?: EstadoEncomienda): Promise<Encomienda[]> {
    return this.obtenerEncomiendas(estado);
  }


  async actualizarEstadoEncomienda(id: number, estado: Encomienda['estado']): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE encomiendas SET estado = ? WHERE id = ?',
      [estado, id]
    );
    return result.affectedRows > 0;
  }

  async crearDespacho(despacho: Omit<Despacho, 'id' | 'fechaDespacho'>): Promise<Despacho> {
    const query = `
      INSERT INTO despachos (encomienda_id, vehiculo_asignado, plazo_garantizado_horas)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [
      despacho.encomiendaId,
      despacho.vehiculoAsignado,
      despacho.plazoGarantizadoHoras
    ]);

    return {
      ...despacho,
      id: result.insertId,
      fechaDespacho: new Date()
    };
  }

  async obtenerDespachoPorId(id: number): Promise<Despacho | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM despachos WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return {
      id: rows[0].id,
      encomiendaId: rows[0].encomienda_id,
      vehiculoAsignado: rows[0].vehiculo_asignado,
      plazoGarantizadoHoras: rows[0].plazo_garantizado_horas,
      fechaDespacho: rows[0].fecha_despacho
    };
  }

  async obtenerDespachoPorEncomiendaId(encomiendaId: number): Promise<Despacho | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM despachos WHERE encomienda_id = ?',
      [encomiendaId]
    );
    if (rows.length === 0) return null;
    return {
      id: rows[0].id,
      encomiendaId: rows[0].encomienda_id,
      vehiculoAsignado: rows[0].vehiculo_asignado,
      plazoGarantizadoHoras: rows[0].plazo_garantizado_horas,
      fechaDespacho: rows[0].fecha_despacho
    };
  }

  async registrarEntrega(entrega: Omit<Entrega, 'id'>): Promise<Entrega> {
    const query = `
      INSERT INTO entregas (
        despacho_id, fecha_entrega, horas_demora, estado_final,
        porcentaje_reintegro, indemnizacion_flete, indemnizacion_seguro, total_indemnizado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      entrega.despachoId,
      entrega.fechaEntrega,
      entrega.horasDemora,
      entrega.estadoFinal,
      entrega.porcentajeReintegro,
      entrega.indemnizacionFlete,
      entrega.indemnizacionSeguro,
      entrega.totalIndemnizado
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return {
      ...entrega,
      id: result.insertId
    };
  }

  async obtenerEntregaPorDespachoId(despachoId: number): Promise<Entrega | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM entregas WHERE despacho_id = ?',
      [despachoId]
    );
    if (rows.length === 0) return null;
    return {
      id: rows[0].id,
      despachoId: rows[0].despacho_id,
      fechaEntrega: rows[0].fecha_entrega,
      horasDemora: rows[0].horas_demora,
      estadoFinal: rows[0].estado_final,
      porcentajeReintegro: Number(rows[0].porcentaje_reintegro),
      indemnizacionFlete: Number(rows[0].indemnizacion_flete),
      indemnizacionSeguro: Number(rows[0].indemnizacion_seguro),
      totalIndemnizado: Number(rows[0].total_indemnizado)
    };
  }

  async obtenerEstadisticas(): Promise<EstadisticasEncomiendas> {
    const [encRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as totalEncomiendas, COALESCE(SUM(costo_total), 0) as totalRecaudado FROM encomiendas'
    );

    const [entRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COALESCE(SUM(total_indemnizado), 0) as totalIndemnizado FROM entregas'
    );

    const [flotaRows] = await pool.execute<RowDataPacket[]>(
      'SELECT vehiculo_asignado, COUNT(*) as cantidad FROM despachos GROUP BY vehiculo_asignado'
    );

    const totalEncomiendas = Number(encRows[0]?.totalEncomiendas || 0);
    const totalRecaudado = Math.round(Number(encRows[0]?.totalRecaudado || 0) * 100) / 100;
    const totalIndemnizado = Math.round(Number(entRows[0]?.totalIndemnizado || 0) * 100) / 100;

    const distribucionFlota = {
      motos: 0,
      utilitarios: 0,
      camiones: 0
    };

    for (const row of flotaRows) {
      if (row.vehiculo_asignado === 'MOTO') distribucionFlota.motos = Number(row.cantidad);
      if (row.vehiculo_asignado === 'UTILITARIO') distribucionFlota.utilitarios = Number(row.cantidad);
      if (row.vehiculo_asignado === 'CAMION') distribucionFlota.camiones = Number(row.cantidad);
    }

    return {
      totalEncomiendas,
      totalRecaudado,
      totalRecaudadoFletes: totalRecaudado,
      totalIndemnizado,
      distribucionFlota
    };
  }

  private mapRowToEncomienda(row: any): Encomienda {
    return {
      id: row.id,
      codigoSeguimiento: row.codigo_seguimiento,
      cliente: row.cliente,
      alto: Number(row.alto),
      ancho: Number(row.ancho),
      largo: Number(row.largo),
      pesoReal: Number(row.peso_real),
      pesoVolumetrico: Number(row.peso_volumetrico),
      pesoFacturable: Number(row.peso_facturable),
      distanciaKm: Number(row.distancia_km),
      tipoZona: row.tipo_zona,
      esFragil: Boolean(row.es_fragil),
      esExpress: Boolean(row.es_express),
      valorDeclarado: Number(row.valor_declarado),
      tarifaBase: Number(row.tarifa_base),
      recargoFragil: Number(row.recargo_fragil),
      recargoExpress: Number(row.recargo_express),
      costoTotal: Number(row.costo_total),
      estado: row.estado,
      fechaCreacion: row.fecha_creacion
    };
  }
}
