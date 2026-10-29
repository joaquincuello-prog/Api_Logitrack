import { Encomienda, EncomiendaProps } from '../../src/core/domain/entities/Encomienda';
import { BusinessRuleViolationException, InvalidStateTransitionException } from '../../src/core/domain/exceptions/DomainException';

describe('Entidad de Dominio - Encomienda (DDD & Invariantes)', () => {
  const propsValidas: EncomiendaProps = {
    id: 1,
    codigoSeguimiento: 'LOGI-123456-7890',
    cliente: 'Logística Express SRL',
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
    valorDeclarado: 10000,
    tarifaBase: 2300,
    recargoFragil: 0,
    recargoExpress: 0,
    costoTotal: 2300,
    estado: 'ADMITIDO',
    fechaCreacion: new Date()
  };

  test('Crea una entidad válida y expone sus propiedades mediante getters', () => {
    const enc = new Encomienda(propsValidas);
    expect(enc.id).toBe(1);
    expect(enc.codigoSeguimiento).toBe('LOGI-123456-7890');
    expect(enc.cliente).toBe('Logística Express SRL');
    expect(enc.alto).toBe(20);
    expect(enc.ancho).toBe(20);
    expect(enc.largo).toBe(20);
    expect(enc.pesoReal).toBe(5);
    expect(enc.pesoVolumetrico).toBe(1.6);
    expect(enc.pesoFacturable).toBe(5);
    expect(enc.distanciaKm).toBe(40);
    expect(enc.tipoZona).toBe('URBANO');
    expect(enc.esFragil).toBe(false);
    expect(enc.esExpress).toBe(false);
    expect(enc.valorDeclarado).toBe(10000);
    expect(enc.tarifaBase).toBe(2300);
    expect(enc.recargoFragil).toBe(0);
    expect(enc.recargoExpress).toBe(0);
    expect(enc.costoTotal).toBe(2300);
    expect(enc.estado).toBe('ADMITIDO');
    expect(enc.fechaCreacion).toBeDefined();
  });

  test('Lanza BusinessRuleViolationException si el código de seguimiento está vacío', () => {
    expect(() => new Encomienda({ ...propsValidas, codigoSeguimiento: '' }))
      .toThrow(BusinessRuleViolationException);
  });

  test('Lanza BusinessRuleViolationException si el cliente tiene menos de 3 caracteres', () => {
    expect(() => new Encomienda({ ...propsValidas, cliente: 'AB' }))
      .toThrow('El nombre del cliente debe tener al menos 3 caracteres');
  });

  test('Lanza BusinessRuleViolationException si alguna dimensión o peso es menor o igual a cero', () => {
    expect(() => new Encomienda({ ...propsValidas, alto: 0 })).toThrow(BusinessRuleViolationException);
    expect(() => new Encomienda({ ...propsValidas, ancho: -1 })).toThrow(BusinessRuleViolationException);
    expect(() => new Encomienda({ ...propsValidas, largo: 0 })).toThrow(BusinessRuleViolationException);
    expect(() => new Encomienda({ ...propsValidas, pesoReal: -5 })).toThrow(BusinessRuleViolationException);
  });

  test('Transición controlada por FSM: despachar() cambia el estado a EN_TRANSITO', () => {
    const enc = new Encomienda(propsValidas);
    expect(enc.estado).toBe('ADMITIDO');

    enc.despachar();
    expect(enc.estado).toBe('EN_TRANSITO');

    // Intentar despachar nuevamente debe fallar según FSM
    expect(() => enc.despachar()).toThrow(InvalidStateTransitionException);
  });

  test('Transición controlada por FSM: finalizarEntrega() permite ENTREGADO, DEVUELTO, SINIESTRADO', () => {
    const enc = new Encomienda(propsValidas);
    enc.despachar();

    enc.finalizarEntrega('ENTREGADO');
    expect(enc.estado).toBe('ENTREGADO');

    // Estado terminal no admite más transiciones
    expect(() => enc.finalizarEntrega('DEVUELTO')).toThrow(InvalidStateTransitionException);
  });

  test('toJSON() devuelve un objeto inmutable congelado con las propiedades', () => {
    const enc = new Encomienda(propsValidas);
    const json = enc.toJSON();

    expect(json.codigoSeguimiento).toBe(propsValidas.codigoSeguimiento);
    expect(Object.isFrozen(json)).toBe(true);
  });
});
