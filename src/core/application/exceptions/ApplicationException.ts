export abstract class ApplicationException extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundException extends ApplicationException {
  readonly code = 'ENTITY_NOT_FOUND';
  readonly statusCode = 404;
}

export class ConflictException extends ApplicationException {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;
}
