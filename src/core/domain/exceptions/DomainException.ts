export abstract class DomainException extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidStateTransitionException extends DomainException {
  readonly code = 'INVALID_STATE_TRANSITION';

  constructor(public readonly fromState: string, public readonly toState: string) {
    super(`Transición de estado inválida: no es posible pasar de '${fromState}' a '${toState}'.`);
  }
}

export class BusinessRuleViolationException extends DomainException {
  readonly code = 'BUSINESS_RULE_VIOLATION';
}

export class LimiteFisicoExcedidoException extends DomainException {
  readonly code = 'LIMITE_FISICO_EXCEDIDO';
}
