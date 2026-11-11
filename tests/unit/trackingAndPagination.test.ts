import { InMemoryEncomiendaRepository } from '../../src/repositories/InMemoryEncomiendaRepository';
import { RastrearEncomiendaUseCase } from '../../src/core/application/use-cases/RastrearEncomiendaUseCase';
import { ListarEncomiendasUseCase } from '../../src/core/application/use-cases/ListarEncomiendasUseCase';
import { EntityNotFoundException } from '../../src/core/application/exceptions/ApplicationException';

describe('Rastrear y Paginación - Casos de Uso', () => {
  let repository: InMemoryEncomiendaRepository;

  beforeEach(() => {
    repository = new InMemoryEncomiendaRepository();
  });

  const baseEncomiendaData: any = {
    alto: 20,
    ancho: 20,
    largo: 20,
    pesoReal: 5,
    pesoVolumetrico: 1.6,
    pesoFacturable: 5,
    distanciaKm: 40,
    tipoZona: 'URBANO',
    esFragil: false,
    esExpress: false,
    valorDeclarado: 0,
    tarifaBase: 1500,
    recargoFragil: 0,
    recargoExpress: 0,
    costoTotal: 1500,
    estado: 'ADMITIDO'
  };

  describe('RastrearEncomiendaUseCase', () => {
    test('Rastrea exitosamente una encomienda existente por código de seguimiento', async () => {
      const creada = await repository.crearEncomienda({
        ...baseEncomiendaData,
        cliente: 'Cliente Test',
        codigoSeguimiento: 'LOGI-TEST-9999'
      });

      const despacho = await repository.crearDespacho({
        encomiendaId: creada.id!,
        vehiculoAsignado: 'MOTO',
        plazoGarantizadoHoras: 24
      });

      const useCase = new RastrearEncomiendaUseCase(repository);
      const resultado = await useCase.execute('LOGI-TEST-9999');

      expect(resultado.encomienda.codigoSeguimiento).toBe('LOGI-TEST-9999');
      expect(resultado.despacho?.id).toBe(despacho.id);
      expect(resultado.entrega).toBeNull();
    });

    test('Lanza EntityNotFoundException si el código no existe', async () => {
      const useCase = new RastrearEncomiendaUseCase(repository);
      await expect(useCase.execute('CODIGO_INEXISTENTE')).rejects.toThrow(EntityNotFoundException);
    });

    test('Lanza EntityNotFoundException si el código está vacío', async () => {
      const useCase = new RastrearEncomiendaUseCase(repository);
      await expect(useCase.execute('   ')).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('ListarEncomiendasUseCase - Paginación y Filtro de Cliente', () => {
    beforeEach(async () => {
      await repository.crearEncomienda({ ...baseEncomiendaData, cliente: 'Alfa Distribuciones', codigoSeguimiento: 'C1' });
      await repository.crearEncomienda({ ...baseEncomiendaData, cliente: 'Beta Logística', codigoSeguimiento: 'C2' });
      await repository.crearEncomienda({ ...baseEncomiendaData, cliente: 'Alfa Express', codigoSeguimiento: 'C3' });
      await repository.crearEncomienda({ ...baseEncomiendaData, cliente: 'Gamma Servicios', codigoSeguimiento: 'C4' });
    });

    test('Pagina los resultados correctamente', async () => {
      const useCase = new ListarEncomiendasUseCase(repository);
      const res = await useCase.execute({ page: 1, limit: 2 });

      expect(res.encomiendas.length).toBe(2);
      expect(res.paginacion.total).toBe(4);
      expect(res.paginacion.pagina).toBe(1);
      expect(res.paginacion.limite).toBe(2);
      expect(res.paginacion.totalPaginas).toBe(2);
    });

    test('Filtra por nombre de cliente insensible a mayúsculas/minúsculas', async () => {
      const useCase = new ListarEncomiendasUseCase(repository);
      const res = await useCase.execute({ cliente: 'alfa' });

      expect(res.encomiendas.length).toBe(2);
      expect(res.encomiendas.every(e => e.cliente.toLowerCase().includes('alfa'))).toBe(true);
      expect(res.paginacion.total).toBe(2);
    });

    test('Combina filtro de cliente y paginación', async () => {
      const useCase = new ListarEncomiendasUseCase(repository);
      const res = await useCase.execute({ cliente: 'alfa', page: 2, limit: 1 });

      expect(res.encomiendas.length).toBe(1);
      expect(res.encomiendas[0].cliente).toBe('Alfa Express');
      expect(res.paginacion.total).toBe(2);
      expect(res.paginacion.totalPaginas).toBe(2);
    });
  });
});
