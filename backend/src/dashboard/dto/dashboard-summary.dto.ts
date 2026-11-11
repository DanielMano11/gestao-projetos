import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';

export class DashboardFinancialsDto {
  @ApiProperty({ example: 45000.0 })
  totalCharged: number;

  @ApiProperty({ example: 28500.0 })
  totalPaid: number;

  @ApiProperty({ example: 16500.0 })
  totalReceivable: number;

  @ApiProperty({ example: 12000.0 })
  proposalsTotalValue: number;

  @ApiPropertyOptional({
    description: 'Total de entradas (recebimentos) registradas dentro do período filtrado',
    example: 14500.0,
  })
  entriesInPeriod?: number;

  @ApiPropertyOptional({
    description: 'Quantidade de lançamentos de entrada no período filtrado',
    example: 4,
  })
  entriesCount?: number;

  @ApiPropertyOptional({
    description: 'Percentual já recebido sobre o total contratado (0 a 100)',
    example: 63,
  })
  collectionRatePercentage?: number;

  @ApiPropertyOptional({
    description: 'Ticket médio dos projetos contratados',
    example: 9000.0,
  })
  averageTicket?: number;
}

export class DashboardEntryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  projectTitle: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty({ enum: ProjectStatus })
  projectStatus: ProjectStatus;

  @ApiProperty({ example: 5000.0 })
  amount: number;

  @ApiProperty()
  paidAt: Date;

  @ApiPropertyOptional()
  note?: string | null;
}

export class DashboardSystemOverviewDto {
  @ApiProperty({ example: 10 })
  totalProjects: number;

  @ApiProperty({ example: 5 })
  activeProjectsCount: number;

  @ApiProperty({ example: 3 })
  completedProjectsCount: number;

  @ApiProperty({ example: 1 })
  overdueProjectsCount: number;

  @ApiProperty({ example: 60 })
  completionRatePercentage: number;

  @ApiProperty({ example: 68 })
  averageProgressPercentage: number;
}

export class UrgentProjectItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty({ enum: ProjectStatus })
  status: ProjectStatus;

  @ApiProperty()
  deadline: Date;

  @ApiProperty()
  daysRemaining: number;

  @ApiProperty()
  isOverdue: boolean;

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  receivableAmount: number;
}

export class DashboardAppliedFilterDto {
  @ApiPropertyOptional({ nullable: true })
  periodDays: number | null;

  @ApiPropertyOptional({ nullable: true })
  startDate: string | null;

  @ApiPropertyOptional({ nullable: true })
  endDate: string | null;

  @ApiPropertyOptional({ enum: ProjectStatus, nullable: true })
  status: ProjectStatus | null;

  @ApiPropertyOptional({ nullable: true })
  clientId: string | null;

  @ApiProperty()
  urgentDays: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: DashboardFinancialsDto })
  financials: DashboardFinancialsDto;

  @ApiProperty()
  countsByStatus: Record<ProjectStatus, number>;

  @ApiProperty({ type: [UrgentProjectItemDto] })
  urgentProjects: UrgentProjectItemDto[];

  @ApiPropertyOptional({ type: [DashboardEntryItemDto] })
  recentEntries?: DashboardEntryItemDto[];

  @ApiPropertyOptional({ type: DashboardSystemOverviewDto })
  systemOverview?: DashboardSystemOverviewDto;

  @ApiPropertyOptional({ type: DashboardAppliedFilterDto })
  appliedFilter?: DashboardAppliedFilterDto;
}
