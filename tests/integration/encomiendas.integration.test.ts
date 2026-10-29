/**
 * Etapa 9: Pruebas de Integración
 * Etapa 10: Pruebas de Sistema y Validación
 * Etapa 11: Automatización de Pruebas
 * 
 * Flujo Evaluado: Admisión -> Tarifación -> Despacho -> Entrega tardía con Indemnización
 * Herramientas: Jest + Supertest (HTTP + Lógica de Negocio + Persistencia en Repositorio)
 * Responsables: Cuello Joaquin & Vivas Guillermo
 */

import request from 'supertest';
import { app } from '../../src/app';
import { getEncomiendaRepository } from '../../src/repositories';

describe('Pruebas de Integración y Sistema - LogiTrack API', () => {
  beforeEach(async () => {
    const repo = getEncomiendaRepository();
    if (repo.limpiarDatos) {
      await repo.limpiarDatos();
    }
  });

  describe('Flujo Completo de Integración (Happy Path y Cálculo de Indemnización)', () => {
    test('PI-01: Ciclo de vida completo: Admisión -> Despacho en Camión -> Entrega con 30h de demora (50% reintegro)', async () => {
      // 1. Admisión de encomienda pesada (25 kg real, 100 km distancia)
      const resAdmision = await request(app)
        .post('/api/encomiendas/admitir')
        .send({
          cliente: 'Distribuidora Central S.A.',
          alto: 40,
          ancho: 40,
          largo: 40,
          pesoReal: 25,
          distanciaKm: 100,
          esFragil: true,
          esExpress: false,
          valorDeclarado: 50000
        });

      expect(resAdmision.status).toBe(201);
      expect(resAdmision.body.status).toBe('EXITO');
      expect(resAdmision.body.datos).toHaveProperty('id');
      expect(resAdmision.body.datos.codigoSeguimiento).toMatch(/^LOGI-/);
      expect(resAdmision.body.datos.tipoZona).toBe('PROVINCIAL');
      expect(resAdmision.body.datos.pesoFacturable).toBe(25);
      expect(resAdmision.body.datos.estado).toBe('ADMITIDO');

      const encomiendaId = resAdmision.body.datos.id;
      const costoTotalFlete = resAdmision.body.datos.costoTotal;

      // 2. Despacho y asignación automática de vehículo
      const resDespacho = await request(app)
        .post('/api/encomiendas/despachar')
        .send({ encomiendaId });

      expect(resDespacho.status).toBe(201);
      expect(resDespacho.body.status).toBe('EXITO');
      expect(resDespacho.body.datos.vehiculoAsignado).toBe('CAMION'); // > 20 kg
      expect(resDespacho.body.datos.plazoGarantizadoHoras).toBe(48); // Provincial estándar = 48h
      expect(resDespacho.body.datos.estadoNuevo).toBe('EN_TRANSITO');

      const despachoId = resDespacho.body.datos.despacho.id;

      // 3. Registro de entrega fuera de término (demora de 30 horas -> escala media 50%)
      const resEntrega = await request(app)
        .post('/api/encomiendas/entregar')
        .send({
          despachoId,
          horasDemora: 30,
          estadoFinal: 'ENTREGADO'
        });

      expect(resEntrega.status).toBe(200);
      expect(resEntrega.body.status).toBe('EXITO');
      expect(resEntrega.body.datos.liquidacion.porcentajeReintegro).toBe(50);
      expect(resEntrega.body.datos.liquidacion.indemnizacionFlete).toBe(costoTotalFlete * 0.5);
      expect(resEntrega.body.datos.liquidacion.indemnizacionSeguro).toBe(0);
      expect(resEntrega.body.datos.saldoFinalFlete).toBe(costoTotalFlete * 0.5);

      // 4. Verificación de consistencia del sistema completo (GET por ID)
      const resConsulta = await request(app)
        .get(`/api/encomiendas/${encomiendaId}`);

      expect(resConsulta.status).toBe(200);
      expect(resConsulta.body.datos.encomienda.estado).toBe('ENTREGADO');
      expect(resConsulta.body.datos.despacho.vehiculoAsignado).toBe('CAMION');
      expect(resConsulta.body.datos.entrega.horasDemora).toBe(30);
    });
  });

  describe('Pruebas de Integración con Datos Inválidos y Manejo de Errores', () => {
    test('PI-02: Rechazo en admisión por dimensiones superiores al límite (> 150 cm)', async () => {
      const res = await request(app)
        .post('/api/encomiendas/admitir')
        .send({
          cliente: 'Mueblería Los Andes',
          alto: 155, // Supera 150 cm
          ancho: 80,
          largo: 80,
          pesoReal: 20,
          distanciaKm: 40,
          esFragil: false,
          esExpress: false,
          valorDeclarado: 0
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('ERROR_VALIDACION');
      expect(res.body.errores[0].campo).toBe('alto');
      expect(res.body.errores[0].mensaje).toContain('150 cm');
    });

    test('PI-03: Rechazo en admisión por peso superior al límite (> 40 kg)', async () => {
      const res = await request(app)
        .post('/api/encomiendas/admitir')
        .send({
          cliente: 'Maquinarias Pesadas',
          alto: 100,
          ancho: 100,
          largo: 100,
          pesoReal: 45, // Supera 40 kg
          distanciaKm: 120,
          esFragil: false,
          esExpress: false,
          valorDeclarado: 100000
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('ERROR_VALIDACION');
      expect(res.body.errores[0].campo).toBe('pesoReal');
      expect(res.body.errores[0].mensaje).toContain('40 kg');
    });

    test('PI-04: Error 404 al intentar despachar encomienda inexistente', async () => {
      const res = await request(app)
        .post('/api/encomiendas/despachar')
        .send({ encomiendaId: 999999 });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('ERROR');
      expect(res.body.mensaje).toContain('No se encontró la encomienda');
    });

    test('PI-05: Indemnización total por siniestro (100% flete + seguro)', async () => {
      // Admisión
      const resAdm = await request(app)
        .post('/api/encomiendas/admitir')
        .send({
          cliente: 'Tecnología Avanzada',
          alto: 20,
          ancho: 20,
          largo: 20,
          pesoReal: 2,
          distanciaKm: 30,
          esFragil: true,
          esExpress: true,
          valorDeclarado: 80000
        });

      const encomiendaId = resAdm.body.datos.id;
      const costoFlete = resAdm.body.datos.costoTotal;

      // Despacho
      const resDesp = await request(app)
        .post('/api/encomiendas/despachar')
        .send({ encomiendaId });

      const despachoId = resDesp.body.datos.despacho.id;

      // Entrega con reporte de SINIESTRO
      const resEntrega = await request(app)
        .post('/api/encomiendas/entregar')
        .send({
          despachoId,
          horasDemora: 5,
          estadoFinal: 'SINIESTRADO'
        });

      expect(resEntrega.status).toBe(200);
      expect(resEntrega.body.datos.liquidacion.porcentajeReintegro).toBe(100);
      expect(resEntrega.body.datos.liquidacion.indemnizacionFlete).toBe(costoFlete);
      expect(resEntrega.body.datos.liquidacion.indemnizacionSeguro).toBe(80000);
      expect(resEntrega.body.datos.liquidacion.totalIndemnizado).toBe(costoFlete + 80000);
      expect(resEntrega.body.datos.saldoFinalFlete).toBe(0);
    });
  });

  describe('Pruebas de Integración para Nuevos Endpoints (Listado y Estadísticas)', () => {
    test('PI-06: Listado de encomiendas y filtro opcional por estado operativo', async () => {
      // 1. Verificar lista vacía inicialmente
      const resVacia = await request(app).get('/api/encomiendas');
      expect(resVacia.status).toBe(200);
      expect(resVacia.body.status).toBe('EXITO');
      expect(Array.isArray(resVacia.body.datos)).toBe(true);
      expect(resVacia.body.datos).toHaveLength(0);

      // 2. Crear Encomienda 1: ADMITIDO
      const adm1 = await request(app).post('/api/encomiendas/admitir').send({
        cliente: 'Cliente 1',
        alto: 10,
        ancho: 10,
        largo: 10,
        pesoReal: 2,
        distanciaKm: 20,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 1000
      });
      const id1 = adm1.body.datos.id;

      // 3. Crear Encomienda 2: EN_TRANSITO
      const adm2 = await request(app).post('/api/encomiendas/admitir').send({
        cliente: 'Cliente 2',
        alto: 20,
        ancho: 20,
        largo: 20,
        pesoReal: 8,
        distanciaKm: 40,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 5000
      });
      const id2 = adm2.body.datos.id;
      await request(app).post('/api/encomiendas/despachar').send({ encomiendaId: id2 });

      // 4. Crear Encomienda 3: ENTREGADO
      const adm3 = await request(app).post('/api/encomiendas/admitir').send({
        cliente: 'Cliente 3',
        alto: 30,
        ancho: 30,
        largo: 30,
        pesoReal: 22,
        distanciaKm: 60,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 10000
      });
      const id3 = adm3.body.datos.id;
      const desp3 = await request(app).post('/api/encomiendas/despachar').send({ encomiendaId: id3 });
      await request(app).post('/api/encomiendas/entregar').send({
        despachoId: desp3.body.datos.despacho.id,
        horasDemora: 0,
        estadoFinal: 'ENTREGADO'
      });

      // 5. Crear Encomienda 4: SINIESTRADO
      const adm4 = await request(app).post('/api/encomiendas/admitir').send({
        cliente: 'Cliente 4',
        alto: 15,
        ancho: 15,
        largo: 15,
        pesoReal: 3,
        distanciaKm: 30,
        esFragil: true,
        esExpress: true,
        valorDeclarado: 15000
      });
      const id4 = adm4.body.datos.id;
      const desp4 = await request(app).post('/api/encomiendas/despachar').send({ encomiendaId: id4 });
      await request(app).post('/api/encomiendas/entregar').send({
        despachoId: desp4.body.datos.despacho.id,
        horasDemora: 10,
        estadoFinal: 'SINIESTRADO'
      });

      // 6. Consultar todas las encomiendas (sin filtro)
      const resTodas = await request(app).get('/api/encomiendas');
      expect(resTodas.status).toBe(200);
      expect(resTodas.body.datos).toHaveLength(4);

      // 7. Filtrar por ADMITIDO
      const resAdmitido = await request(app).get('/api/encomiendas?estado=ADMITIDO');
      expect(resAdmitido.status).toBe(200);
      expect(resAdmitido.body.datos).toHaveLength(1);
      expect(resAdmitido.body.datos[0].id).toBe(id1);
      expect(resAdmitido.body.datos[0].estado).toBe('ADMITIDO');

      // 8. Filtrar por EN_TRANSITO
      const resEnTransito = await request(app).get('/api/encomiendas?estado=EN_TRANSITO');
      expect(resEnTransito.status).toBe(200);
      expect(resEnTransito.body.datos).toHaveLength(1);
      expect(resEnTransito.body.datos[0].id).toBe(id2);
      expect(resEnTransito.body.datos[0].estado).toBe('EN_TRANSITO');

      // 9. Filtrar por ENTREGADO
      const resEntregado = await request(app).get('/api/encomiendas?estado=ENTREGADO');
      expect(resEntregado.status).toBe(200);
      expect(resEntregado.body.datos).toHaveLength(1);
      expect(resEntregado.body.datos[0].id).toBe(id3);
      expect(resEntregado.body.datos[0].estado).toBe('ENTREGADO');

      // 10. Filtrar por SINIESTRADO
      const resSiniestrado = await request(app).get('/api/encomiendas?estado=SINIESTRADO');
      expect(resSiniestrado.status).toBe(200);
      expect(resSiniestrado.body.datos).toHaveLength(1);
      expect(resSiniestrado.body.datos[0].id).toBe(id4);
      expect(resSiniestrado.body.datos[0].estado).toBe('SINIESTRADO');

      // 11. Validación ante estado inválido (retorna 400 Bad Request)
      const resInvalido = await request(app).get('/api/encomiendas?estado=NO_EXISTE');
      expect(resInvalido.status).toBe(400);
      expect(resInvalido.body.status).toBe('ERROR_VALIDACION');
      expect(resInvalido.body.mensaje).toContain('Estado inválido');
    });

    test('PI-07: Consulta de estadísticas en sistema vacío (valores en cero)', async () => {
      const res = await request(app).get('/api/encomiendas/estadisticas');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('EXITO');
      expect(res.body.datos).toEqual({
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

    test('PI-08: Cálculo acumulado de estadísticas globales (recaudación, indemnizaciones y distribución de flota)', async () => {
      // 1. Encomienda Liviana (2 kg) -> Moto (< 5kg), entregada a tiempo (0 indemnización)
      const admMoto = await request(app).post('/api/encomiendas/admitir').send({
        cliente: 'Cliente Moto',
        alto: 10,
        ancho: 10,
        largo: 10,
        pesoReal: 2,
        distanciaKm: 15,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 5000
      });
      const fleteMoto = admMoto.body.datos.costoTotal;
      const despMoto = await request(app).post('/api/encomiendas/despachar').send({ encomiendaId: admMoto.body.datos.id });
      expect(despMoto.body.datos.vehiculoAsignado).toBe('MOTO');
      await request(app).post('/api/encomiendas/entregar').send({
        despachoId: despMoto.body.datos.despacho.id,
        horasDemora: 0,
        estadoFinal: 'ENTREGADO'
      });

      // 2. Encomienda Mediana (10 kg) -> Utilitario (5 a 20kg), entregada con 30h demora (50% reintegro flete)
      const admUtilitario = await request(app).post('/api/encomiendas/admitir').send({
        cliente: 'Cliente Utilitario',
        alto: 25,
        ancho: 25,
        largo: 25,
        pesoReal: 10,
        distanciaKm: 40,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 10000
      });
      const fleteUtilitario = admUtilitario.body.datos.costoTotal;
      const despUtilitario = await request(app).post('/api/encomiendas/despachar').send({ encomiendaId: admUtilitario.body.datos.id });
      expect(despUtilitario.body.datos.vehiculoAsignado).toBe('UTILITARIO');
      const resEntregaUtilitario = await request(app).post('/api/encomiendas/entregar').send({
        despachoId: despUtilitario.body.datos.despacho.id,
        horasDemora: 30,
        estadoFinal: 'ENTREGADO'
      });
      const indemnizacionUtilitario = resEntregaUtilitario.body.datos.liquidacion.totalIndemnizado;

      // 3. Encomienda Pesada (25 kg) -> Camión (> 20kg), siniestrada (100% flete + seguro)
      const admCamion = await request(app).post('/api/encomiendas/admitir').send({
        cliente: 'Cliente Camion',
        alto: 35,
        ancho: 35,
        largo: 35,
        pesoReal: 25,
        distanciaKm: 80,
        esFragil: true,
        esExpress: false,
        valorDeclarado: 40000
      });
      const fleteCamion = admCamion.body.datos.costoTotal;
      const despCamion = await request(app).post('/api/encomiendas/despachar').send({ encomiendaId: admCamion.body.datos.id });
      expect(despCamion.body.datos.vehiculoAsignado).toBe('CAMION');
      const resEntregaCamion = await request(app).post('/api/encomiendas/entregar').send({
        despachoId: despCamion.body.datos.despacho.id,
        horasDemora: 12,
        estadoFinal: 'SINIESTRADO'
      });
      const indemnizacionCamion = resEntregaCamion.body.datos.liquidacion.totalIndemnizado;

      // 4. Encomienda Admitida sin despachar
      const admPendiente = await request(app).post('/api/encomiendas/admitir').send({
        cliente: 'Cliente Pendiente',
        alto: 15,
        ancho: 15,
        largo: 15,
        pesoReal: 4,
        distanciaKm: 25,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 0
      });
      const fletePendiente = admPendiente.body.datos.costoTotal;

      // 5. Consultar estadísticas globales
      const resEstadisticas = await request(app).get('/api/encomiendas/estadisticas');

      expect(resEstadisticas.status).toBe(200);
      expect(resEstadisticas.body.status).toBe('EXITO');

      const datos = resEstadisticas.body.datos;
      expect(datos.totalEncomiendas).toBe(4);

      const recaudadoEsperado = Math.round((fleteMoto + fleteUtilitario + fleteCamion + fletePendiente) * 100) / 100;
      expect(datos.totalRecaudado).toBe(recaudadoEsperado);
      expect(datos.totalRecaudadoFletes).toBe(recaudadoEsperado);

      const indemnizadoEsperado = Math.round((indemnizacionUtilitario + indemnizacionCamion) * 100) / 100;
      expect(datos.totalIndemnizado).toBe(indemnizadoEsperado);

      expect(datos.distribucionFlota).toEqual({
        motos: 1,
        utilitarios: 1,
        camiones: 1
      });
    });
  });
});

