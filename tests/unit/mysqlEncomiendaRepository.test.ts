/**
 * Pruebas Unitarias para MySqlEncomiendaRepository
 * Módulo: Repositorio MySQL con Mocking de Pool de Conexiones
 */

import { MySqlEncomiendaRepository } from '../../src/repositories/MySqlEncomiendaRepository';
import { pool } from '../../src/config/database';

jest.mock('../../src/config/database', () => ({
  pool: {
    execute: jest.fn()
  }
}));

describe('MySqlEncomiendaRepository - Pruebas Unitarias', () => {
  let repository: MySqlEncomiendaRepository;
  const mockedPoolExecute = pool.execute as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MySqlEncomiendaRepository();
  });

  const mockRow = {
    id: 1,
    codigo_seguimiento: 'LOGI-123456-1111',
    cliente: 'Empresa A',
    alto: '20.00',
    ancho: '20.00',
    largo: '20.00',
    peso_real: '5.00',
    peso_volumetrico: '1.60',
    peso_facturable: '5.00',
    distancia_km: '50.00',
    tipo_zona: 'URBANO',
    es_fragil: 0,
    es_express: 0,
    valor_declarado: '0.00',
    tarifa_base: '3000.00',
    recargo_fragil: '0.00',
    recargo_express: '0.00',
    costo_total: '3000.00',
    estado: 'ADMITIDO',
    fecha_creacion: new Date('2026-10-18T10:00:00Z')
  };

  describe('crearEncomienda', () => {
    test('Inserta encomienda y retorna con insertId asignado', async () => {
      mockedPoolExecute.mockResolvedValueOnce([{ insertId: 42 }]);

      const encomiendaData: any = {
        codigoSeguimiento: 'LOGI-123456-1111',
        cliente: 'Empresa A',
        alto: 20,
        ancho: 20,
        largo: 20,
        pesoReal: 5,
        pesoVolumetrico: 1.6,
        pesoFacturable: 5,
        distanciaKm: 50,
        tipoZona: 'URBANO',
        esFragil: false,
        esExpress: false,
        valorDeclarado: 0,
        tarifaBase: 3000,
        recargoFragil: 0,
        recargoExpress: 0,
        costoTotal: 3000,
        estado: 'ADMITIDO'
      };

      const result = await repository.crearEncomienda(encomiendaData);
      expect(result.id).toBe(42);
      expect(mockedPoolExecute).toHaveBeenCalled();
    });
  });

  describe('obtenerEncomiendaPorId y por Código', () => {
    test('Retorna encomienda mapeada cuando existe por ID', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[mockRow]]);
      const result = await repository.obtenerEncomiendaPorId(1);
      expect(result?.codigoSeguimiento).toBe('LOGI-123456-1111');
    });

    test('Retorna null cuando no existe por ID', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[]]);
      const result = await repository.obtenerEncomiendaPorId(999);
      expect(result).toBeNull();
    });

    test('Retorna encomienda mapeada cuando existe por Código', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[mockRow]]);
      const result = await repository.obtenerEncomiendaPorCodigo('LOGI-123456-1111');
      expect(result?.cliente).toBe('Empresa A');
    });

    test('Retorna null cuando no existe por Código', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[]]);
      const result = await repository.obtenerEncomiendaPorCodigo('NO_EXISTE');
      expect(result).toBeNull();
    });
  });

  describe('actualizarEstadoEncomienda', () => {
    test('Retorna true si se afectó al menos una fila', async () => {
      mockedPoolExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const res = await repository.actualizarEstadoEncomienda(1, 'EN_TRANSITO');
      expect(res).toBe(true);
    });

    test('Retorna false si no se afectaron filas', async () => {
      mockedPoolExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      const res = await repository.actualizarEstadoEncomienda(999, 'EN_TRANSITO');
      expect(res).toBe(false);
    });
  });

  describe('Despachos', () => {
    test('crearDespacho inserta y retorna con ID asignado', async () => {
      mockedPoolExecute.mockResolvedValueOnce([{ insertId: 10 }]);
      const res = await repository.crearDespacho({
        encomiendaId: 1,
        vehiculoAsignado: 'MOTO',
        plazoGarantizadoHoras: 24
      });
      expect(res.id).toBe(10);
      expect(res.vehiculoAsignado).toBe('MOTO');
    });

    test('obtenerDespachoPorId mapea fila cuando existe', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[
        { id: 10, encomienda_id: 1, vehiculo_asignado: 'MOTO', plazo_garantizado_horas: 24, fecha_despacho: new Date() }
      ]]);
      const res = await repository.obtenerDespachoPorId(10);
      expect(res?.id).toBe(10);
      expect(res?.vehiculoAsignado).toBe('MOTO');
    });

    test('obtenerDespachoPorId retorna null si no existe', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[]]);
      const res = await repository.obtenerDespachoPorId(999);
      expect(res).toBeNull();
    });

    test('obtenerDespachoPorEncomiendaId mapea fila cuando existe', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[
        { id: 10, encomienda_id: 1, vehiculo_asignado: 'MOTO', plazo_garantizado_horas: 24, fecha_despacho: new Date() }
      ]]);
      const res = await repository.obtenerDespachoPorEncomiendaId(1);
      expect(res?.id).toBe(10);
    });

    test('obtenerDespachoPorEncomiendaId retorna null si no existe', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[]]);
      const res = await repository.obtenerDespachoPorEncomiendaId(999);
      expect(res).toBeNull();
    });
  });

  describe('Entregas', () => {
    test('registrarEntrega inserta y retorna con ID asignado', async () => {
      mockedPoolExecute.mockResolvedValueOnce([{ insertId: 5 }]);
      const entregaData: any = {
        despachoId: 10,
        fechaEntrega: new Date(),
        horasDemora: 0,
        estadoFinal: 'ENTREGADO',
        porcentajeReintegro: 0,
        indemnizacionFlete: 0,
        indemnizacionSeguro: 0,
        totalIndemnizado: 0
      };
      const res = await repository.registrarEntrega(entregaData);
      expect(res.id).toBe(5);
    });

    test('obtenerEntregaPorDespachoId mapea fila cuando existe', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[
        {
          id: 5,
          despacho_id: 10,
          fecha_entrega: new Date(),
          horas_demora: 0,
          estado_final: 'ENTREGADO',
          porcentaje_reintegro: '0.00',
          indemnizacion_flete: '0.00',
          indemnizacion_seguro: '0.00',
          total_indemnizado: '0.00'
        }
      ]]);
      const res = await repository.obtenerEntregaPorDespachoId(10);
      expect(res?.id).toBe(5);
      expect(res?.estadoFinal).toBe('ENTREGADO');
    });

    test('obtenerEntregaPorDespachoId retorna null si no existe', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[]]);
      const res = await repository.obtenerEntregaPorDespachoId(999);
      expect(res).toBeNull();
    });
  });

  describe('obtenerEncomiendas', () => {
    test('Debe listar todas las encomiendas ordenadas por id cuando no se pasa estado', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[mockRow]]);
      const resultado = await repository.obtenerEncomiendas();

      expect(mockedPoolExecute).toHaveBeenCalledWith(
        'SELECT * FROM encomiendas ORDER BY id ASC',
        []
      );
      expect(resultado).toHaveLength(1);
      expect(resultado[0].codigoSeguimiento).toBe('LOGI-123456-1111');
      expect(resultado[0].costoTotal).toBe(3000);
      expect(resultado[0].esFragil).toBe(false);
      expect(resultado[0].estado).toBe('ADMITIDO');
    });

    test('Debe filtrar por estado con cláusula WHERE cuando se pasa un estado', async () => {
      const mockRowTransito = {
        ...mockRow,
        id: 2,
        codigo_seguimiento: 'LOGI-123456-2222',
        es_fragil: 1,
        es_express: 1,
        estado: 'EN_TRANSITO'
      };

      mockedPoolExecute.mockResolvedValueOnce([[mockRowTransito]]);
      const resultado = await repository.obtenerEncomiendas('EN_TRANSITO');

      expect(mockedPoolExecute).toHaveBeenCalledWith(
        'SELECT * FROM encomiendas WHERE estado = ? ORDER BY id ASC',
        ['EN_TRANSITO']
      );
      expect(resultado).toHaveLength(1);
      expect(resultado[0].estado).toBe('EN_TRANSITO');
      expect(resultado[0].esFragil).toBe(true);
      expect(resultado[0].esExpress).toBe(true);
    });

    test('El alias listarEncomiendas debe comportarse de forma idéntica', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[]]);
      const res = await repository.listarEncomiendas();
      expect(res).toEqual([]);
    });
  });

  describe('obtenerEstadisticas', () => {
    test('Debe calcular correctamente estadísticas y distribución de flota desde las consultas agregadas', async () => {
      mockedPoolExecute.mockResolvedValueOnce([
        [{ totalEncomiendas: '5', totalRecaudado: '25450.50' }]
      ]);
      mockedPoolExecute.mockResolvedValueOnce([
        [{ totalIndemnizado: '3200.00' }]
      ]);
      mockedPoolExecute.mockResolvedValueOnce([
        [
          { vehiculo_asignado: 'MOTO', cantidad: '2' },
          { vehiculo_asignado: 'UTILITARIO', cantidad: '1' },
          { vehiculo_asignado: 'CAMION', cantidad: '1' }
        ]
      ]);

      const estadisticas = await repository.obtenerEstadisticas();

      expect(mockedPoolExecute).toHaveBeenCalledTimes(3);
      expect(estadisticas).toEqual({
        totalEncomiendas: 5,
        totalRecaudado: 25450.5,
        totalRecaudadoFletes: 25450.5,
        totalIndemnizado: 3200,
        distribucionFlota: {
          motos: 2,
          utilitarios: 1,
          camiones: 1
        }
      });
    });

    test('Debe devolver ceros si las tablas están vacías (valores NULL manejados con COALESCE)', async () => {
      mockedPoolExecute.mockResolvedValueOnce([[{ totalEncomiendas: 0, totalRecaudado: 0 }]]);
      mockedPoolExecute.mockResolvedValueOnce([[{ totalIndemnizado: 0 }]]);
      mockedPoolExecute.mockResolvedValueOnce([[]]);

      const estadisticas = await repository.obtenerEstadisticas();

      expect(estadisticas).toEqual({
        totalEncomiendas: 0,
        totalRecaudado: 0,
        totalRecaudadoFletes: 0,
        totalIndemnizado: 0,
        distribucionFlota: {
          motos: 0,
          utilitarios: 0,
          camiones: 0
        }
      });
    });
  });
});
