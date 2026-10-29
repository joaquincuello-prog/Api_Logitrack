import { ENV } from '../config/env';

export interface LogContext {
  correlationId?: string;
  [key: string]: any;
}

export class Logger {
  private static format(level: string, message: string, context?: LogContext): string {
    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: ENV.NODE_ENV,
      ...context
    };
    return JSON.stringify(logObject);
  }

  static info(message: string, context?: LogContext): void {
    if (ENV.NODE_ENV !== 'test') {
      console.log(this.format('INFO', message, context));
    }
  }

  static warn(message: string, context?: LogContext): void {
    if (ENV.NODE_ENV !== 'test') {
      console.warn(this.format('WARN', message, context));
    }
  }

  static error(message: string, error?: any, context?: LogContext): void {
    if (ENV.NODE_ENV !== 'test') {
      const errContext = {
        ...context,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      };
      console.error(this.format('ERROR', message, errContext));
    }
  }

  static debug(message: string, context?: LogContext): void {
    if (ENV.NODE_ENV === 'development') {
      console.debug(this.format('DEBUG', message, context));
    }
  }
}
