import type { Task } from './task.types';

export type ProjectStatus =
  | 'PROPOSAL'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELED';

export type FinancialStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export interface Payment {
  id: string;
  amount: number;
  paidAt: string;
  note?: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  deadline: string;
  chargedAmount: number;
  paidAmount: number;
  receivableAmount: number;
  financialStatus: FinancialStatus;
  progressPercentage: number;
  completedTasksCount: number;
  totalTasksCount: number;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean;
  client?: {
    id: string;
    name: string;
    whatsapp?: string | null;
    email?: string | null;
  };
  tasks?: Task[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  clientId: string;
  title: string;
  description?: string;
  status?: ProjectStatus;
  deadline: string;
  chargedAmount: number;
  paidAmount?: number;
  initialTasks?: string[];
}

export type UpdateProjectInput = Partial<Omit<CreateProjectInput, 'initialTasks'>>;

export interface ProjectFilterParams {
  status?: ProjectStatus | '';
  clientId?: string;
  urgentOnly?: boolean;
  overdueOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateFinancialsInput {
  chargedAmount: number;
  paidAmount: number;
}

export interface CreatePaymentInput {
  amount: number;
  paidAt?: string;
  note?: string;
}

