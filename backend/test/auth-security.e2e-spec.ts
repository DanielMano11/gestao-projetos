import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { parseAllowedOrigins } from '../src/config/env.validation';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth & Security Hardening (E2E Real)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const testEmail = `security-e2e-${uniqueSuffix}@exemplo.com`;
  const testPassword = 'SenhaSeguraE2E123';
  const createdEmails = [testEmail];
  let validAccessToken = '';
  let registeredUserId = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: createdEmails } },
    });
    await app.close();
  });

  describe('1. Proteção Global APP_GUARD & Tokens Inválidos', () => {
    it('deve bloquear com 401 requisições anônimas em todas as rotas privadas', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
      await request(app.getHttpServer()).get('/api/v1/clients').expect(401);
      await request(app.getHttpServer()).get('/api/v1/projects').expect(401);
      await request(app.getHttpServer()).get('/api/v1/dashboard/summary').expect(401);
    });

    it('deve rejeitar com 401 tokens malformados, forjados com outro segredo ou expirados', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token.invalido.adulterado')
        .expect(401);

      const forgedToken = await jwtService.signAsync(
        { sub: '00000000-0000-4000-8000-000000000001', email: 'forjado@exemplo.com' },
        { secret: 'outro-segredo-nao-autorizado-com-32-chars' },
      );

      await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${forgedToken}`)
        .expect(401);

      const expiredToken = await jwtService.signAsync(
        { sub: '00000000-0000-4000-8000-000000000001', email: testEmail },
        {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          expiresIn: '-10s',
        },
      );

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('2. Fluxo Real @Public() -> JWT Real -> Rotas Protegidas', () => {
    it('deve permitir register (@Public()), autenticar em /auth/me e permitir login (@Public())', async () => {
      // Chamada #1 em /auth/register
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Usuário Segurança E2E',
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(registerRes.body.accessToken).toEqual(expect.any(String));
      expect(registerRes.body.user).toEqual({
        id: expect.any(String),
        name: 'Usuário Segurança E2E',
        email: testEmail,
      });
      expect(registerRes.body.user).not.toHaveProperty('passwordHash');

      registeredUserId = registerRes.body.user.id;
      validAccessToken = registerRes.body.accessToken;

      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      expect(meRes.body).toEqual({
        id: registeredUserId,
        name: 'Usuário Segurança E2E',
        email: testEmail,
      });

      await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      // Chamada #1 em /auth/login (senha inválida)
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: 'SenhaErrada123' })
        .expect(401);

      // Chamada #2 em /auth/login (credenciais válidas)
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(201);

      expect(loginRes.body.accessToken).toEqual(expect.any(String));
      validAccessToken = loginRes.body.accessToken;
    });
  });

  describe('3. Cabeçalhos Helmet & CORS Restrito por FRONTEND_URL', () => {
    it('deve incluir cabeçalhos defensivos do Helmet e ocultar X-Powered-By', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('deve autorizar CORS apenas para a origem configurada em FRONTEND_URL e negar origens desconhecidas', async () => {
      const allowedOrigin = parseAllowedOrigins(
        configService.getOrThrow<string>('FRONTEND_URL'),
      )[0];

      const allowedRes = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Origin', allowedOrigin)
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      expect(allowedRes.headers['access-control-allow-origin']).toBe(
        allowedOrigin,
      );
      expect(allowedRes.headers['access-control-allow-credentials']).toBe(
        'true',
      );

      const disallowedRes = await request(app.getHttpServer())
        .options('/api/v1/auth/login')
        .set('Origin', 'https://malicioso.exemplo.com')
        .set('Access-Control-Request-Method', 'POST');

      expect(disallowedRes.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('4. Sanitização de Erros 500 e Mapeamento Prisma P2002', () => {
    it('deve mascarar erros internos 500 sem vazar detalhes de infraestrutura', async () => {
      jest
        .spyOn(prisma.client, 'findMany')
        .mockRejectedValueOnce(
          new Error('FATAL: password authentication failed postgres://10.0.0.5:5432'),
        );

      const res = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(500);

      expect(res.body.statusCode).toBe(500);
      expect(res.body.message).toBe('Erro interno no servidor');
      expect(JSON.stringify(res.body)).not.toContain('postgres');
      expect(JSON.stringify(res.body)).not.toContain('10.0.0.5');
    });

    it('deve converter PrismaClientKnownRequestError P2002 em 409 Conflict sem vazar constraints', async () => {
      jest.spyOn(prisma.client, 'create').mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed on the constraint: `clients_email_key`',
          {
            code: 'P2002',
            clientVersion: '5.22.0',
            meta: { target: ['email'] },
          },
        ),
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({ name: 'Cliente Duplicado' })
        .expect(409);

      expect(res.body.statusCode).toBe(409);
      expect(res.body.message).toBe(
        'Conflito: já existe um registro com os dados informados.',
      );
      expect(JSON.stringify(res.body)).not.toContain('clients_email_key');
    });
  });

  describe('5. Rate Limiting (@nestjs/throttler) em Rotas Públicas', () => {
    it('deve bloquear com 429 Too Many Requests a 6ª tentativa em /auth/login dentro de 60s', async () => {
      // Já foram feitas 2 chamadas ao /auth/login na suíte 2; as próximas 3 ainda passam até o limite 5
      for (let attempt = 3; attempt <= 5; attempt++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: testEmail, password: 'SenhaErradaLoop' })
          .expect(401);
      }

      const blockedRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(429);

      expect(blockedRes.body.statusCode).toBe(429);
    });

    it('deve bloquear com 429 Too Many Requests a 6ª tentativa em /auth/register sem afetar usuário autenticado', async () => {
      // Já foi feita 1 chamada ao /auth/register na suíte 2; as próximas 4 atingem o limite 5
      for (let attempt = 2; attempt <= 5; attempt++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            name: 'Tentativa Repetida',
            email: testEmail,
            password: testPassword,
          })
          .expect(409);
      }

      const blockedRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Tentativa Bloqueada',
          email: `novo-${uniqueSuffix}@exemplo.com`,
          password: testPassword,
        })
        .expect(429);

      expect(blockedRes.body.statusCode).toBe(429);

      // Rota autenticada privada permanece operacional dentro do seu limite baseline
      await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);
    });
  });
});

