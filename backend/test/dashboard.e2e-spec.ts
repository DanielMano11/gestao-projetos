import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DashboardController } from '../src/dashboard/dashboard.controller';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

describe('DashboardController (E2E)', () => {
  let app: INestApplication;
  const dashboardServiceMock = {
    getSummary: jest.fn().mockResolvedValue({
      financials: {
        totalCharged: 15000,
        totalPaid: 10000,
        totalReceivable: 5000,
        proposalsTotalValue: 8000,
      },
      countsByStatus: {
        PROPOSAL: 1,
        IN_PROGRESS: 2,
        PAUSED: 0,
        COMPLETED: 1,
        CANCELED: 0,
      },
      urgentProjects: [],
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: dashboardServiceMock }],
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/dashboard/summary deve retornar indicadores consolidados', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard/summary')
      .expect(200);

    expect(res.body.financials.totalReceivable).toBe(5000);
    expect(res.body.countsByStatus.IN_PROGRESS).toBe(2);
  });
});

