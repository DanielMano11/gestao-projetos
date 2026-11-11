import type { ProjectStatus } from './project.types';

export interface DashboardFilterParams {
  periodDays?: 7 | 15 | 21 | 30 | number | null;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus | '';
  clientId?: string;
  urgentDays?: number;
}

export interface DashboardFinancials {
  totalCharged: number;
  totalPaid: number;
  totalReceivable: number;
  proposalsTotalValue: number;
  entriesInPeriod?: number;
  entriesCount?: number;
  collectionRatePercentage?: number;
  averageTicket?: number;
}

export interface DashboardEntryItem {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  projectStatus: ProjectStatus;
  amount: number;
  paidAt: string;
  note?: string | null;
}

export interface DashboardSystemOverview {
  totalProjects: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  overdueProjectsCount: number;
  completionRatePercentage: number;
  averageProgressPercentage: number;
}

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

export interface DashboardAppliedFilter {
  periodDays: number | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus | null;
  clientId: string | null;
  urgentDays: number;
}

export interface DashboardSummary {
  financials: DashboardFinancials;
  countsByStatus: Record<ProjectStatus, number>;
  urgentProjects: UrgentProjectItem[];
  recentEntries?: DashboardEntryItem[];
  systemOverview?: DashboardSystemOverview;
  appliedFilter?: DashboardAppliedFilter;
}
