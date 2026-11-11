import { Injectable } from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeProjectMetrics } from '../projects/projects.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import {
  DashboardEntryItemDto,
  DashboardSummaryDto,
} from './dto/dashboard-summary.dto';

interface DashboardProjectRecord {
  id: string;
  title: string;
  status: ProjectStatus;
  startDate?: Date | null;
  deadline: Date;
  chargedAmount: number | Prisma.Decimal;
  paidAmount: number | Prisma.Decimal;
  createdAt?: Date;
  updatedAt?: Date;
  client: { id: string; name: string };
  tasks: { isCompleted: boolean }[];
  payments?: {
    id: string;
    amount: number | Prisma.Decimal;
    paidAt: Date;
    note?: string | null;
    createdAt?: Date;
  }[];
}

function isWithinRange(
  value: Date | string | null | undefined,
  fromDate: Date | null,
  toDate: Date | null,
): boolean {
  if (!fromDate && !toDate) return true;
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;
  if (fromDate && timestamp < fromDate.getTime()) return false;
  if (toDate && timestamp > toDate.getTime()) return false;
  return true;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    userId: string,
    filtersOrUrgentDays: number | DashboardFilterDto = 7,
    referenceDate: Date = new Date(),
  ): Promise<DashboardSummaryDto> {
    const filter: DashboardFilterDto =
      typeof filtersOrUrgentDays === 'number'
        ? { urgentDays: filtersOrUrgentDays }
        : (filtersOrUrgentDays ?? {});

    const urgentDays =
      typeof filter.urgentDays === 'number' &&
      Number.isFinite(filter.urgentDays) &&
      filter.urgentDays >= 0
        ? filter.urgentDays
        : typeof filter.periodDays === 'number' && filter.periodDays > 0
          ? filter.periodDays
          : 7;

    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    if (filter.startDate) {
      fromDate = new Date(
        filter.startDate.includes('T')
          ? filter.startDate
          : `${filter.startDate}T00:00:00.000Z`,
      );
    } else if (filter.periodDays && filter.periodDays > 0) {
      const refUtcMidnight = Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
        0,
        0,
        0,
        0,
      );
      fromDate = new Date(
        refUtcMidnight - filter.periodDays * 24 * 60 * 60 * 1000,
      );
    }

    if (filter.endDate) {
      toDate = new Date(
        filter.endDate.includes('T')
          ? filter.endDate
          : `${filter.endDate}T23:59:59.999Z`,
      );
    } else if (filter.periodDays && filter.periodDays > 0) {
      toDate = new Date(
        Date.UTC(
          referenceDate.getUTCFullYear(),
          referenceDate.getUTCMonth(),
          referenceDate.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );
    }

    const projects = (await this.prisma.project.findMany({
      where: {
        client: {
          userId,
          ...(filter.clientId ? { id: filter.clientId } : {}),
        },
        ...(filter.status ? { status: filter.status } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
        tasks: true,
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
      orderBy: { deadline: 'asc' },
    })) as unknown as DashboardProjectRecord[];

    const countsByStatus: Record<ProjectStatus, number> = {
      PROPOSAL: 0,
      IN_PROGRESS: 0,
      PAUSED: 0,
      COMPLETED: 0,
      CANCELED: 0,
    };

    let totalCharged = 0;
    let totalPaid = 0;
    let totalReceivable = 0;
    let proposalsTotalValue = 0;
    let entriesInPeriod = 0;

    let contractedProjectsCount = 0;
    let activeProjectsCount = 0;
    let completedProjectsCount = 0;
    let overdueProjectsCount = 0;
    let totalProgressSum = 0;
    let filteredProjectsCount = 0;

    const urgentProjects: DashboardSummaryDto['urgentProjects'] = [];
    const recentEntries: DashboardEntryItemDto[] = [];

    const hasDateFilter = Boolean(fromDate || toDate);

    for (const p of projects) {
      if (filter.clientId && p.client?.id !== filter.clientId) continue;
      if (filter.status && p.status !== filter.status) continue;

      const metrics = computeProjectMetrics(p, referenceDate);
      const projectPayments = p.payments ?? [];

      // Constrói todas as entradas financeiras vinculadas ao projeto
      const projectEntries: DashboardEntryItemDto[] = projectPayments.map(
        (pay) => ({
          id: pay.id,
          projectId: p.id,
          projectTitle: p.title,
          clientName: p.client.name,
          projectStatus: p.status,
          amount: Number(Number(pay.amount).toFixed(2)),
          paidAt: new Date(pay.paidAt),
          note: pay.note ?? null,
        }),
      );

      const recordedSum = projectEntries.reduce(
        (acc, item) => acc + item.amount,
        0,
      );
      const directDifference = Number(
        (metrics.paidAmount - recordedSum).toFixed(2),
      );

      if (directDifference > 0.009) {
        const fallbackEntryDate =
          p.updatedAt ?? p.createdAt ?? p.startDate ?? p.deadline;
        projectEntries.push({
          id: `direct-${p.id}`,
          projectId: p.id,
          projectTitle: p.title,
          clientName: p.client.name,
          projectStatus: p.status,
          amount: directDifference,
          paidAt: new Date(fallbackEntryDate),
          note: 'Pagamento registrado diretamente no projeto',
        });
      }

      const entriesMatchingPeriod = projectEntries.filter((entry) =>
        isWithinRange(entry.paidAt, fromDate, toDate),
      );

      for (const entry of entriesMatchingPeriod) {
        entriesInPeriod += entry.amount;
        recentEntries.push(entry);
      }

      // Verifica se o projeto pertence à janela de datas selecionada
      const projectMatchesDateFilter =
        !hasDateFilter ||
        entriesMatchingPeriod.length > 0 ||
        isWithinRange(p.createdAt, fromDate, toDate) ||
        isWithinRange(p.startDate, fromDate, toDate) ||
        isWithinRange(p.deadline, fromDate, toDate) ||
        isWithinRange(p.updatedAt, fromDate, toDate);

      if (!projectMatchesDateFilter) {
        continue;
      }

      filteredProjectsCount += 1;
      countsByStatus[p.status] = (countsByStatus[p.status] ?? 0) + 1;
      totalProgressSum += metrics.progressPercentage;

      totalPaid += metrics.paidAmount;

      if (p.status === ProjectStatus.PROPOSAL) {
        proposalsTotalValue += metrics.chargedAmount;
      } else if (
        p.status === ProjectStatus.IN_PROGRESS ||
        p.status === ProjectStatus.PAUSED ||
        p.status === ProjectStatus.COMPLETED
      ) {
        totalCharged += metrics.chargedAmount;
        totalReceivable += metrics.receivableAmount;
        contractedProjectsCount += 1;
      }

      if (p.status === ProjectStatus.COMPLETED) {
        completedProjectsCount += 1;
      }

      const isActiveStatus =
        p.status === ProjectStatus.IN_PROGRESS ||
        p.status === ProjectStatus.PAUSED;

      if (isActiveStatus) {
        activeProjectsCount += 1;
        if (metrics.isOverdue) {
          overdueProjectsCount += 1;
        }
      }

      if (isActiveStatus && metrics.daysRemaining <= urgentDays) {
        urgentProjects.push({
          id: p.id,
          title: p.title,
          clientName: p.client.name,
          status: p.status,
          deadline: p.deadline,
          daysRemaining: metrics.daysRemaining,
          isOverdue: metrics.isOverdue,
          progressPercentage: metrics.progressPercentage,
          receivableAmount: metrics.receivableAmount,
        });
      }
    }

    urgentProjects.sort((a, b) => a.daysRemaining - b.daysRemaining);
    recentEntries.sort(
      (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
    );

    const collectionRatePercentage =
      totalCharged > 0
        ? Math.min(100, Math.round((totalPaid / totalCharged) * 100))
        : 0;

    const averageTicket =
      contractedProjectsCount > 0
        ? Number((totalCharged / contractedProjectsCount).toFixed(2))
        : 0;

    const nonCanceledTotal =
      filteredProjectsCount - (countsByStatus.CANCELED ?? 0);
    const completionRatePercentage =
      nonCanceledTotal > 0
        ? Math.round((completedProjectsCount / nonCanceledTotal) * 100)
        : 0;

    const averageProgressPercentage =
      filteredProjectsCount > 0
        ? Math.round(totalProgressSum / filteredProjectsCount)
        : 0;

    return {
      financials: {
        totalCharged: Number(totalCharged.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalReceivable: Number(totalReceivable.toFixed(2)),
        proposalsTotalValue: Number(proposalsTotalValue.toFixed(2)),
        entriesInPeriod: Number(entriesInPeriod.toFixed(2)),
        entriesCount: recentEntries.length,
        collectionRatePercentage,
        averageTicket,
      },
      countsByStatus,
      urgentProjects,
      recentEntries,
      systemOverview: {
        totalProjects: filteredProjectsCount,
        activeProjectsCount,
        completedProjectsCount,
        overdueProjectsCount,
        completionRatePercentage,
        averageProgressPercentage,
      },
      appliedFilter: {
        periodDays: filter.periodDays ?? null,
        startDate: fromDate ? fromDate.toISOString().slice(0, 10) : null,
        endDate: toDate ? toDate.toISOString().slice(0, 10) : null,
        status: filter.status ?? null,
        clientId: filter.clientId ?? null,
        urgentDays,
      },
    };
  }
}
