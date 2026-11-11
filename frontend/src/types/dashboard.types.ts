import type { ProjectStatus } from './project.types';

export interface UrgentProjectItem {
  id: string;
  title: string;
  clientName: string;
  status: ProjectStatus;
  deadline: string;
  daysRemaining: number;
  isOverdue: boolean;
  progressPercentage: number;
  receivableAmount: number;
}

export interface DashboardSummary {
  financials: {
    totalCharged: number;
    totalPaid: number;
    totalReceivable: number;
    proposalsTotalValue: number;
  };
  countsByStatus: Record<ProjectStatus, number>;
  urgentProjects: UrgentProjectItem[];
}

