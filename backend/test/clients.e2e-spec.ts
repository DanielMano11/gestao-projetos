import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ClientsController } from '../src/clients/clients.controller';
import { ClientsService } from '../src/clients/clients.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

describe('ClientsController (E2E)', () => {
  let app: INestApplication;
  const clientsServiceMock = {
    findAll: jest.fn().mockResolvedValue({
      data: [{ id: 'c1', name: 'Empresa Alpha', whatsappClean: '5511999998888', projectsCount: 1 }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    }),
    create: jest.fn().mockImplementation((_userId: string, dto: { name: string }) => ({
      id: 'c2',
      ...dto,
      whatsappClean: '5511988887777',
      projectsCount: 0,
    })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [{ provide: ClientsService, useValue: clientsServiceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: 'u1', email: 'gestor@exemplo.com', name: 'Gestor' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/clients deve listar clientes da carteira do usuário', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/clients').expect(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Empresa Alpha');
  });

  it('POST /api/v1/clients deve validar payload obrigatório e criar cliente', async () => {
    await request(app.getHttpServer()).post('/api/v1/clients').send({}).expect(400);

    const res = await request(app.getHttpServer())
      .post('/api/v1/clients')
      .send({ name: 'Novo Cliente', whatsapp: '(11) 98888-7777', email: 'novo@cliente.com' })
      .expect(201);

    expect(res.body.name).toBe('Novo Cliente');
  });
});

