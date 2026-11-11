import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ProjectStatus } from '@prisma/client';
import request from 'supertest';
import { ProjectsController } from '../src/projects/projects.controller';
import { ProjectsService } from '../src/projects/projects.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

describe('ProjectsController (E2E)', () => {
  let app: INestApplication;
  const projectsServiceMock = {
    findAll: jest.fn().mockResolvedValue({
      data: [{ id: 'p1', title: 'Sistema Web', status: ProjectStatus.IN_PROGRESS }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    }),
    updateStatus: jest.fn().mockImplementation((_u: string, id: string, dto: { status: ProjectStatus }) => ({
      id,
      status: dto.status,
      progressPercentage: dto.status === ProjectStatus.COMPLETED ? 100 : 50,
    })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: projectsServiceMock }],
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

  it('PATCH /api/v1/projects/:id/status deve validar enum ProjectStatus e atualizar status', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    await request(app.getHttpServer())
      .patch(`/api/v1/projects/${validUuid}/status`)
      .send({ status: 'INVALID_STATUS' })
      .expect(400);

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/projects/${validUuid}/status`)
      .send({ status: ProjectStatus.COMPLETED })
      .expect(200);

    expect(res.body.status).toBe(ProjectStatus.COMPLETED);
    expect(res.body.progressPercentage).toBe(100);
  });
});

