import { api } from './api';
import type { DashboardSummary } from '../types/dashboard.types';

export const dashboardService = {
  async getSummary(urgentDays = 7) {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary', {
      params: { urgentDays },
    });
    return data;
  },
};

