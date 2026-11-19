import { BadRequestException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { calculateChecklistProgress, TasksService } from './tasks.service';
import { computeProjectMetrics } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService & Prazos (US2)', () => {
  it('deve retornar 0% quando o checklist estiver vazio (sem divisão por zero)', () => {
    const res = calculateChecklistProgress([]);
    expect(res).toEqual({
      completedCount: 0,
      totalCount: 0,
      progressPercentage: 0,
    });
  });

  it('deve calcular 50% quando 2 de 4 tarefas estiverem concluídas', () => {
    const res = calculateChecklistProgress([
      { isCompleted: true },
      { isCompleted: true },
      { isCompleted: false },
      { isCompleted: false },
    ]);
    expect(res.progressPercentage).toBe(50);
    expect(res.completedCount).toBe(2);
    expect(res.totalCount).toBe(4);
  });

  it('deve sinalizar projeto ativo como Atrasado (isOverdue) e Urgente (isUrgent) quando prazo é anterior a hoje', () => {
    const refDate = new Date('2026-11-11T12:00:00Z');
    const metrics = computeProjectMetrics(
      {
        status: ProjectStatus.IN_PROGRESS,
        deadline: new Date('2026-11-08T00:00:00Z'),
        chargedAmount: 3000,
        paidAmount: 1000,
        tasks: [{ isCompleted: true }, { isCompleted: false }],
      },
      refDate,
    );

    expect(metrics.isOverdue).toBe(true);
    expect(metrics.isUrgent).toBe(true);
    expect(metrics.daysRemaining).toBe(-3);
  });

  it('deve remover alertas de atraso e urgência quando o projeto é Concluído ou Cancelado', () => {
    const refDate = new Date('2026-11-11T12:00:00Z');
    const completedMetrics = computeProjectMetrics(
      {
        status: ProjectStatus.COMPLETED,
        deadline: new Date('2026-11-01T00:00:00Z'),
        chargedAmount: 3000,
        paidAmount: 3000,
        tasks: [{ isCompleted: true }],
      },
      refDate,
    );

    expect(completedMetrics.isOverdue).toBe(false);
    expect(completedMetrics.isUrgent).toBe(false);
    expect(completedMetrics.progressPercentage).toBe(100);
  });

  it('deve bloquear criação de nova tarefa quando o projeto atinge o limite de 200 tarefas', async () => {
    const prismaMock = {
      project: {
        findFirst: jest.fn().mockResolvedValue({ id: 'p1', clientId: 'c1' }),
      },
      task: {
        count: jest.fn().mockResolvedValue(200),
        create: jest.fn(),
      },
    };

    const service = new TasksService(prismaMock as unknown as PrismaService);

    await expect(
      service.create('u1', 'p1', { title: 'Tarefa excedente' }),
    ).rejects.toThrow(BadRequestException);
    expect(prismaMock.task.create).not.toHaveBeenCalled();
  });
});

