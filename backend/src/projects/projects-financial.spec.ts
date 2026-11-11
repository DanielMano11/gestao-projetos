import { BadRequestException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import {
  computeProjectMetrics,
  ProjectsService,
  validateFinancialAmounts,
} from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Projects Financial Rules & Hybrid Payments (US3)', () => {
  it('deve calcular saldo a receber de R$ 3.000,00 e status PARTIAL para cobrado R$ 5.000 e pago R$ 2.000', () => {
    const metrics = computeProjectMetrics({
      status: ProjectStatus.IN_PROGRESS,
      deadline: new Date('2026-11-20T00:00:00Z'),
      chargedAmount: 5000,
      paidAmount: 2000,
    });

    expect(metrics.receivableAmount).toBe(3000);
    expect(metrics.financialStatus).toBe('PARTIAL');
  });

  it('deve calcular saldo a receber R$ 0,00 e status PAID quando valor pago iguala o valor cobrado', () => {
    const metrics = computeProjectMetrics({
      status: ProjectStatus.COMPLETED,
      deadline: new Date('2026-11-20T00:00:00Z'),
      chargedAmount: 5000,
      paidAmount: 5000,
    });

    expect(metrics.receivableAmount).toBe(0);
    expect(metrics.financialStatus).toBe('PAID');
  });

  it('deve bloquear valores negativos ou valor pago superior ao valor cobrado', () => {
    expect(() => validateFinancialAmounts(-100, 0)).toThrow(BadRequestException);
    expect(() => validateFinancialAmounts(1000, -10)).toThrow(BadRequestException);
    expect(() => validateFinancialAmounts(1000, 1200)).toThrow(BadRequestException);
  });

  it('deve somar parcela individual (Payment) ao paidAmount do projeto e marcar tarefas como concluídas quando COMPLETED', async () => {
    const taskUpdateMany = jest.fn().mockResolvedValue({ count: 2 });
    const paymentCreate = jest.fn().mockResolvedValue({ id: 'pay-1' });
    const projectUpdate = jest.fn().mockResolvedValue({
      id: 'p1',
      clientId: 'c1',
      title: 'Projeto Teste',
      description: null,
      status: ProjectStatus.COMPLETED,
      deadline: new Date('2026-11-20T00:00:00Z'),
      chargedAmount: 5000,
      paidAmount: 3500,
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [
        { id: 't1', title: 'T1', isCompleted: true, position: 0, createdAt: new Date(), updatedAt: new Date() },
      ],
      payments: [
        { id: 'pay-1', amount: 1500, paidAt: new Date(), note: 'Parcela 2', createdAt: new Date() },
      ],
    });

    const prismaMock = {
      project: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'p1',
          clientId: 'c1',
          chargedAmount: 5000,
          paidAmount: 2000,
          status: ProjectStatus.IN_PROGRESS,
          deadline: new Date('2026-11-20T00:00:00Z'),
          tasks: [],
          payments: [],
        }),
      },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) =>
        cb({
          task: { updateMany: taskUpdateMany },
          payment: { create: paymentCreate },
          project: { update: projectUpdate },
        }),
      ),
    };

    const service = new ProjectsService(prismaMock as unknown as PrismaService);

    const afterPayment = await service.addPayment('u1', 'p1', {
      amount: 1500,
      note: 'Parcela 2',
    });
    expect(paymentCreate).toHaveBeenCalled();
    expect(afterPayment.paidAmount).toBe(3500);
    expect(afterPayment.receivableAmount).toBe(1500);

    await service.updateStatus('u1', 'p1', { status: ProjectStatus.COMPLETED });
    expect(taskUpdateMany).toHaveBeenCalledWith({
      where: { projectId: 'p1' },
      data: { isCompleted: true },
    });
  });
});

