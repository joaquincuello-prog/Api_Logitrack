import request from 'supertest';
import { app } from '../../src/app';
import { TokenService, UserRole } from '../../src/infrastructure/security/tokenService';

describe('Seguridad y Control de Acceso (RBAC & JWT)', () => {
  describe('TokenService', () => {
    test('Genera y verifica un token JWT válido', () => {
      const token = TokenService.generateToken({
        sub: 'user-123',
        name: 'Juan Perez',
        role: 'ADMIN'
      });

      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const decoded = TokenService.verifyToken(token);
      expect(decoded.sub).toBe('user-123');
      expect(decoded.name).toBe('Juan Perez');
      expect(decoded.role).toBe('ADMIN');
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    test('Lanza error si el token tiene una firma manipulada o alterada', () => {
      const token = TokenService.generateToken({
        sub: 'user-123',
        name: 'Juan Perez',
        role: 'CLIENTE'
      });

      const parts = token.split('.');
      const alteredToken = `${parts[0]}.${parts[1]}.firmainvalida1234567890abcdef`;

      expect(() => TokenService.verifyToken(alteredToken)).toThrow('Firma de token inválida');
    });

    test('Lanza error si el token tiene formato inválido', () => {
      expect(() => TokenService.verifyToken('token.invalido')).toThrow('Formato de token inválido');
    });

    test('Lanza error si el token expiró', () => {
      // Generar token con expiración negativa (-1 hora)
      const tokenExpirado = TokenService.generateToken(
        {
          sub: 'user-expirado',
          name: 'Expirado',
          role: 'OPERADOR'
        },
        -1
      );

      expect(() => TokenService.verifyToken(tokenExpirado)).toThrow('El token ha expirado');
    });
  });

  describe('Endpoints de Autenticación (/api/auth)', () => {
    test('POST /api/auth/login genera un token válido con el rol solicitado', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'operador_central',
          role: 'OPERADOR'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('EXITO');
      expect(res.body.datos.token).toBeDefined();
      expect(res.body.datos.usuario.role).toBe('OPERADOR');
    });

    test('POST /api/auth/login rechaza usernames vacíos o roles inexistentes', async () => {
      const res1 = await request(app)
        .post('/api/auth/login')
        .send({ username: '' });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post('/api/auth/login')
        .send({ username: 'alguien', role: 'ROL_INEXISTENTE' });
      expect(res2.status).toBe(400);
    });

    test('GET /api/auth/perfil retorna el usuario autenticado vía Bearer token', async () => {
      const token = TokenService.generateToken({
        sub: 'chofer-42',
        name: 'Carlos Chofer',
        role: 'CONDUCTOR'
      });

      const res = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.datos.sub).toBe('chofer-42');
      expect(res.body.datos.role).toBe('CONDUCTOR');
    });

    test('GET /api/auth/perfil rechaza formato inválido en encabezado Authorization', async () => {
      const res = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'TokenInvalidoSinBearer');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('NO_AUTORIZADO');
    });
  });

  describe('Control de Acceso basado en Roles (RBAC en Rutas)', () => {
    test('Un token con rol CLIENTE recibe 403 Forbidden al intentar admitir encomiendas', async () => {
      const tokenCliente = TokenService.generateToken({
        sub: 'cliente-1',
        name: 'Cliente Final',
        role: 'CLIENTE'
      });

      const res = await request(app)
        .post('/api/encomiendas/admitir')
        .set('Authorization', `Bearer ${tokenCliente}`)
        .send({
          cliente: 'Prueba',
          alto: 10,
          ancho: 10,
          largo: 10,
          pesoReal: 2,
          distanciaKm: 10
        });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('ACCESO_DENEGADO');
    });

    test('Un token con rol OPERADOR recibe 403 Forbidden al intentar consultar estadísticas financieras', async () => {
      const tokenOperador = TokenService.generateToken({
        sub: 'operador-1',
        name: 'Operador Recepción',
        role: 'OPERADOR'
      });

      const res = await request(app)
        .get('/api/encomiendas/estadisticas')
        .set('Authorization', `Bearer ${tokenOperador}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('ACCESO_DENEGADO');
    });

    test('El endpoint de Tracking público no requiere autenticación', async () => {
      const res = await request(app).get('/api/encomiendas/tracking/LOGI-NO-EXISTE');
      // Debe responder con 404 (búsqueda de entidad), NO con 401 (rechazo de autenticación)
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('ERROR');
    });
  });
});
