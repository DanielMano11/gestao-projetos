import { ApiProperty } from '@nestjs/swagger';
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

export class DashboardSummaryDto {
  @ApiProperty({ type: DashboardFinancialsDto })
  financials: DashboardFinancialsDto;

  @ApiProperty()
  countsByStatus: Record<ProjectStatus, number>;

  @ApiProperty({ type: [UrgentProjectItemDto] })
  urgentProjects: UrgentProjectItemDto[];
}

