import { EncomiendaStateMachine } from '../../src/core/domain/fsm/EncomiendaStateMachine';
import { InvalidStateTransitionException } from '../../src/core/domain/exceptions/DomainException';

describe('Máquina de Estados Finita (FSM) - EncomiendaStateMachine', () => {
  describe('Transiciones Válidas', () => {
    test('Permite transición legal de ADMITIDO a EN_TRANSITO', () => {
      expect(EncomiendaStateMachine.canTransition('ADMITIDO', 'EN_TRANSITO')).toBe(true);
      expect(() => EncomiendaStateMachine.validateTransition('ADMITIDO', 'EN_TRANSITO')).not.toThrow();
    });

    test('Permite transición legal de EN_TRANSITO a ENTREGADO', () => {
      expect(EncomiendaStateMachine.canTransition('EN_TRANSITO', 'ENTREGADO')).toBe(true);
      expect(() => EncomiendaStateMachine.validateTransition('EN_TRANSITO', 'ENTREGADO')).not.toThrow();
    });

    test('Permite transición legal de EN_TRANSITO a DEVUELTO', () => {
      expect(EncomiendaStateMachine.canTransition('EN_TRANSITO', 'DEVUELTO')).toBe(true);
      expect(() => EncomiendaStateMachine.validateTransition('EN_TRANSITO', 'DEVUELTO')).not.toThrow();
    });

    test('Permite transición legal de EN_TRANSITO a SINIESTRADO', () => {
      expect(EncomiendaStateMachine.canTransition('EN_TRANSITO', 'SINIESTRADO')).toBe(true);
      expect(() => EncomiendaStateMachine.validateTransition('EN_TRANSITO', 'SINIESTRADO')).not.toThrow();
    });
  });

  describe('Transiciones Inválidas e Ilegales', () => {
    test('Rechaza saltar de ADMITIDO directamente a ENTREGADO sin pasar por EN_TRANSITO', () => {
      expect(EncomiendaStateMachine.canTransition('ADMITIDO', 'ENTREGADO')).toBe(false);
      expect(() => EncomiendaStateMachine.validateTransition('ADMITIDO', 'ENTREGADO'))
        .toThrow(InvalidStateTransitionException);
    });

    test('Rechaza saltar de ADMITIDO a DEVUELTO o SINIESTRADO', () => {
      expect(EncomiendaStateMachine.canTransition('ADMITIDO', 'DEVUELTO')).toBe(false);
      expect(EncomiendaStateMachine.canTransition('ADMITIDO', 'SINIESTRADO')).toBe(false);
    });

    test('Rechaza redespachar un paquete que ya fue ENTREGADO', () => {
      expect(EncomiendaStateMachine.canTransition('ENTREGADO', 'EN_TRANSITO')).toBe(false);
      expect(() => EncomiendaStateMachine.validateTransition('ENTREGADO', 'EN_TRANSITO'))
        .toThrow(InvalidStateTransitionException);
    });

    test('Rechaza transiciones inversas o cíclicas (ENTREGADO -> ADMITIDO)', () => {
      expect(EncomiendaStateMachine.canTransition('ENTREGADO', 'ADMITIDO')).toBe(false);
      expect(() => EncomiendaStateMachine.validateTransition('ENTREGADO', 'ADMITIDO'))
        .toThrow(InvalidStateTransitionException);
    });

    test('Rechaza modificar estado de paquetes DEVUELTOS o SINIESTRADOS', () => {
      expect(EncomiendaStateMachine.canTransition('DEVUELTO', 'ENTREGADO')).toBe(false);
      expect(EncomiendaStateMachine.canTransition('SINIESTRADO', 'ENTREGADO')).toBe(false);
    });
  });

  describe('Propiedades de Estados Terminales y Consultas', () => {
    test('Identifica correctamente estados terminales (ENTREGADO, DEVUELTO, SINIESTRADO)', () => {
      expect(EncomiendaStateMachine.isTerminal('ENTREGADO')).toBe(true);
      expect(EncomiendaStateMachine.isTerminal('DEVUELTO')).toBe(true);
      expect(EncomiendaStateMachine.isTerminal('SINIESTRADO')).toBe(true);
      expect(EncomiendaStateMachine.isTerminal('ADMITIDO')).toBe(false);
      expect(EncomiendaStateMachine.isTerminal('EN_TRANSITO')).toBe(false);
    });

    test('Obtiene la lista exacta de próximos estados válidos', () => {
      expect(EncomiendaStateMachine.getValidNextStates('ADMITIDO')).toEqual(['EN_TRANSITO']);
      expect(EncomiendaStateMachine.getValidNextStates('EN_TRANSITO')).toEqual(['ENTREGADO', 'DEVUELTO', 'SINIESTRADO']);
      expect(EncomiendaStateMachine.getValidNextStates('ENTREGADO')).toEqual([]);
    });
  });
});
