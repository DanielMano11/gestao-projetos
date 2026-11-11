import { ProjectStatus } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService (US4 & Filtros de Período / Entradas)', () => {
  it('deve consolidar métricas excluindo PROPOSAL e CANCELED do saldo a receber e ordenar projetos urgentes', async () => {
    const refDate = new Date('2026-11-11T12:00:00Z');
    const prismaMock = {
      project: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'p-overdue',
            title: 'Site Institucional',
            status: ProjectStatus.IN_PROGRESS,
            deadline: new Date('2026-11-09T00:00:00Z'),
            chargedAmount: 10000,
            paidAmount: 4000,
            client: { id: 'c1', name: 'Cliente 1' },
            tasks: [{ isCompleted: true }, { isCompleted: false }],
          },
          {
            id: 'p-due-soon',
            title: 'Landing Page',
            status: ProjectStatus.PAUSED,
            deadline: new Date('2026-11-15T00:00:00Z'),
            chargedAmount: 5000,
            paidAmount: 5000,
            client: { id: 'c1', name: 'Cliente 1' },
            tasks: [{ isCompleted: true }],
          },
          {
            id: 'p-proposal',
            title: 'App Mobile (Proposta)',
            status: ProjectStatus.PROPOSAL,
            deadline: new Date('2026-11-12T00:00:00Z'),
            chargedAmount: 20000,
            paidAmount: 0,
            client: { id: 'c2', name: 'Cliente 2' },
            tasks: [],
          },
          {
            id: 'p-canceled',
            title: 'Projeto Cancelado',
            status: ProjectStatus.CANCELED,
            deadline: new Date('2026-11-05T00:00:00Z'),
            chargedAmount: 8000,
            paidAmount: 1000,
            client: { id: 'c2', name: 'Cliente 2' },
            tasks: [],
          },
        ]),
      },
    };

    const service = new DashboardService(prismaMock as unknown as PrismaService);
    const summary = await service.getSummary('u1', 7, refDate);

    // Contratados ativos/concluídos: 10000 + 5000 = 15000
    expect(summary.financials.totalCharged).toBe(15000);
    // Total efetivamente recebido (incluindo sinal retido de cancelado): 4000 + 5000 + 1000 = 10000
    expect(summary.financials.totalPaid).toBe(10000);
    // Saldo a receber apenas de contratados não cancelados: (10000 - 4000) + (5000 - 5000) = 6000
    expect(summary.financials.totalReceivable).toBe(6000);
    // Propostas separadas: 20000
    expect(summary.financials.proposalsTotalValue).toBe(20000);

    // Urgentes: apenas ativos (IN_PROGRESS e PAUSED) com prazo <= 7 dias, ordenados do mais atrasado
    expect(summary.urgentProjects).toHaveLength(2);
    expect(summary.urgentProjects[0].id).toBe('p-overdue');
    expect(summary.urgentProjects[0].isOverdue).toBe(true);
    expect(summary.urgentProjects[1].id).toBe('p-due-soon');
  });

  it.each([7, 15, 21, 30])(
    'deve filtrar entradas financeiras (recentEntries e entriesInPeriod) para os últimos %i dias',
    async (periodDays) => {
      const refDate = new Date('2026-11-11T12:00:00Z');
      const prismaMock = {
        project: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: 'p1',
              title: 'Sistema ERP',
              status: ProjectStatus.IN_PROGRESS,
              createdAt: new Date('2026-10-01T00:00:00Z'),
              deadline: new Date('2026-11-25T00:00:00Z'),
              chargedAmount: 12000,
              paidAmount: 7000,
              client: { id: 'c1', name: 'Empresa Alpha' },
              tasks: [{ isCompleted: true }, { isCompleted: false }],
              payments: [
                {
                  id: 'pay-recent',
                  amount: 3000,
                  paidAt: new Date('2026-11-08T00:00:00Z'), // 3 dias atrás
                  note: 'Parcela 2 (Recente)',
                },
                {
                  id: 'pay-20d',
                  amount: 4000,
                  paidAt: new Date('2026-10-22T00:00:00Z'), // 20 dias atrás
                  note: 'Entrada Inicial (20 dias atrás)',
                },
              ],
            },
          ]),
        },
      };

      const service = new DashboardService(prismaMock as unknown as PrismaService);
      const summary = await service.getSummary('u1', { periodDays }, refDate);

      expect(summary.appliedFilter?.periodDays).toBe(periodDays);

      if (periodDays < 20) {
        // Para 7 e 15 dias, apenas o pagamento de 3 dias atrás entra
        expect(summary.financials.entriesInPeriod).toBe(3000);
        expect(summary.recentEntries).toHaveLength(1);
        expect(summary.recentEntries?.[0].id).toBe('pay-recent');
      } else {
        // Para 21 e 30 dias, ambos os pagamentos (3 dias e 20 dias atrás) entram
        expect(summary.financials.entriesInPeriod).toBe(7000);
        expect(summary.recentEntries).toHaveLength(2);
      }
    },
  );
});
