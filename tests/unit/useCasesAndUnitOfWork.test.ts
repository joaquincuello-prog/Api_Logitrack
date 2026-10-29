import { InMemoryEncomiendaRepository } from '../../src/repositories/InMemoryEncomiendaRepository';
import { InMemoryUnitOfWork } from '../../src/infrastructure/persistence/InMemoryUnitOfWork';
import { AdmitirEncomiendaUseCase } from '../../src/core/application/use-cases/AdmitirEncomiendaUseCase';
import { DespacharEncomiendaUseCase } from '../../src/core/application/use-cases/DespacharEncomiendaUseCase';
import { RegistrarEntregaUseCase } from '../../src/core/application/use-cases/RegistrarEntregaUseCase';
import { ConsultarEncomiendaUseCase } from '../../src/core/application/use-cases/ConsultarEncomiendaUseCase';
import { ListarEncomiendasUseCase } from '../../src/core/application/use-cases/ListarEncomiendasUseCase';
import { ObtenerEstadisticasUseCase } from '../../src/core/application/use-cases/ObtenerEstadisticasUseCase';
import { EntityNotFoundException } from '../../src/core/application/exceptions/ApplicationException';
import { BusinessRuleViolationException, InvalidStateTransitionException } from '../../src/core/domain/exceptions/DomainException';

describe('Casos de Uso de Aplicación y Soporte Transaccional UnitOfWork', () => {
  let repository: InMemoryEncomiendaRepository;
  let unitOfWork: InMemoryUnitOfWork;

  beforeEach(() => {
    repository = new InMemoryEncomiendaRepository();
    unitOfWork = new InMemoryUnitOfWork(repository);
  });

  describe('AdmitirEncomiendaUseCase', () => {
    test('Admite encomienda generando código de seguimiento y tarifación', async () => {
      const useCase = new AdmitirEncomiendaUseCase(repository);
      const encomienda = await useCase.execute({
        cliente: 'Cliente Test',
        alto: 20,
        ancho: 20,
        largo: 20,
        pesoReal: 3,
        distanciaKm: 30,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 5000
      });

      expect(encomienda.id).toBe(1);
      expect(encomienda.codigoSeguimiento).toMatch(/^LOGI-/);
      expect(encomienda.tipoZona).toBe('URBANO');
      expect(encomienda.estado).toBe('ADMITIDO');
    });
  });

  describe('DespacharEncomiendaUseCase & Atomicidad Transaccional', () => {
    test('Lanza EntityNotFoundException si la encomienda no existe', async () => {
      const useCase = new DespacharEncomiendaUseCase(repository, unitOfWork);
      await expect(useCase.execute({ encomiendaId: 999 })).rejects.toThrow(EntityNotFoundException);
    });

    test('Lanza InvalidStateTransitionException si la encomienda ya fue despachada', async () => {
      const admitirUseCase = new AdmitirEncomiendaUseCase(repository);
      const despacharUseCase = new DespacharEncomiendaUseCase(repository, unitOfWork);

      const enc = await admitirUseCase.execute({
        cliente: 'Cliente Doble Despacho',
        alto: 10,
        ancho: 10,
        largo: 10,
        pesoReal: 2,
        distanciaKm: 20,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 0
      });

      // Primer despacho: Exitoso
      await despacharUseCase.execute({ encomiendaId: enc.id! });

      // Segundo despacho: Falla por FSM
      await expect(despacharUseCase.execute({ encomiendaId: enc.id! }))
        .rejects.toThrow(InvalidStateTransitionException);
    });

    test('Rollback transaccional: Si ocurre un fallo en la transacción, se restaura el estado previo', async () => {
      const admitirUseCase = new AdmitirEncomiendaUseCase(repository);
      const enc = await admitirUseCase.execute({
        cliente: 'Cliente Rollback',
        alto: 15,
        ancho: 15,
        largo: 15,
        pesoReal: 4,
        distanciaKm: 25,
        esFragil: false,
        esExpress: false,
        valorDeclarado: 0
      });

      const initialList = await repository.obtenerEncomiendas();
      expect(initialList[0].estado).toBe('ADMITIDO');

      // Intentar ejecutar transacción fallida que modifique datos y luego tire excepción
      await expect(
        unitOfWork.runInTransaction(async () => {
          await repository.actualizarEstadoEncomienda(enc.id!, 'EN_TRANSITO');
          await repository.crearDespacho({
            encomiendaId: enc.id!,
            vehiculoAsignado: 'MOTO',
            plazoGarantizadoHoras: 24
          });
          throw new Error('Fallo simulado de base de datos a mitad de transacción');
        })
      ).rejects.toThrow('Fallo simulado de base de datos a mitad de transacción');

      // Verificar que el estado volvió a ADMITIDO y no quedó despacho huérfano
      const encomiendaRestaurada = await repository.obtenerEncomiendaPorId(enc.id!);
      expect(encomiendaRestaurada?.estado).toBe('ADMITIDO');

      const despachoHuerfano = await repository.obtenerDespachoPorEncomiendaId(enc.id!);
      expect(despachoHuerfano).toBeNull();
    });
  });

  describe('RegistrarEntregaUseCase', () => {
    test('Lanza EntityNotFoundException si el despacho no existe', async () => {
      const useCase = new RegistrarEntregaUseCase(repository, unitOfWork);
      await expect(useCase.execute({
        despachoId: 888,
        horasDemora: 0,
        estadoFinal: 'ENTREGADO'
      })).rejects.toThrow('No se encontró el despacho con ID 888');
    });

    test('Lanza EntityNotFoundException si la encomienda vinculada al despacho no existe', async () => {
      const despacho = await repository.crearDespacho({
        encomiendaId: 777,
        vehiculoAsignado: 'MOTO',
        plazoGarantizadoHoras: 24
      });

      const useCase = new RegistrarEntregaUseCase(repository, unitOfWork);
      await expect(useCase.execute({
        despachoId: despacho.id!,
        horasDemora: 0,
        estadoFinal: 'ENTREGADO'
      })).rejects.toThrow('No se encontró la encomienda asociada al despacho');
    });
  });

  describe('ConsultarEncomiendaUseCase, ListarEncomiendasUseCase y Estadísticas', () => {
    test('ConsultarEncomiendaUseCase lanza EntityNotFoundException si no existe', async () => {
      const useCase = new ConsultarEncomiendaUseCase(repository);
      await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
    });

    test('ListarEncomiendasUseCase lanza BusinessRuleViolationException ante filtro inválido', async () => {
      const useCase = new ListarEncomiendasUseCase(repository);
      await expect(useCase.execute('ESTADO_INEXISTENTE')).rejects.toThrow(BusinessRuleViolationException);
    });

    test('ObtenerEstadisticasUseCase retorna métricas del repositorio', async () => {
      const useCase = new ObtenerEstadisticasUseCase(repository);
      const stats = await useCase.execute();
      expect(stats.totalEncomiendas).toBe(0);
      expect(stats.distribucionFlota).toBeDefined();
    });
  });
});
