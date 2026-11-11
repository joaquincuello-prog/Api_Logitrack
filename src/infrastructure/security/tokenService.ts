import crypto from 'node:crypto';
import { ENV } from '../config/env';

export type UserRole = 'ADMIN' | 'OPERADOR' | 'CONDUCTOR' | 'CLIENTE';

export interface TokenPayload {
  sub: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

export class TokenService {
  private static readonly SECRET = ENV.JWT_SECRET;
  private static readonly EXPIRATION_HOURS = 24;

  static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresInHours: number = this.EXPIRATION_HOURS): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInHours * 3600
    };

    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const data = `${header}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', this.SECRET)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${data}.${signature}`;
  }

  static verifyToken(token: string): TokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Formato de token inválido');
    }

    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;

    const expectedSignature = crypto
      .createHmac('sha256', this.SECRET)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw new Error('Firma de token inválida');
    }

    const decodedPayload = JSON.parse(base64UrlDecode(payload)) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp && decodedPayload.exp < now) {
      throw new Error('El token ha expirado');
    }

    return decodedPayload;
  }
}
