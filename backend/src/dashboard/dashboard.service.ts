import { Injectable } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeProjectMetrics } from '../projects/projects.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    userId: string,
    urgentDays = 7,
    referenceDate: Date = new Date(),
  ): Promise<DashboardSummaryDto> {
    const projects = await this.prisma.project.findMany({
      where: {
        client: { userId },
      },
      include: {
        client: { select: { id: true, name: true } },
        tasks: true,
      },
      orderBy: { deadline: 'asc' },
    });

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

    const urgentProjects: DashboardSummaryDto['urgentProjects'] = [];

    for (const p of projects) {
      countsByStatus[p.status] = (countsByStatus[p.status] ?? 0) + 1;
      const metrics = computeProjectMetrics(p, referenceDate);

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
      }

      const isActiveStatus =
        p.status === ProjectStatus.IN_PROGRESS ||
        p.status === ProjectStatus.PAUSED;

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

    return {
      financials: {
        totalCharged: Number(totalCharged.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalReceivable: Number(totalReceivable.toFixed(2)),
        proposalsTotalValue: Number(proposalsTotalValue.toFixed(2)),
      },
      countsByStatus,
      urgentProjects,
    };
  }
}

