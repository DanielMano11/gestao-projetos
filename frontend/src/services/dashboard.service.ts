import { api } from './api';
import type {
  DashboardFilterParams,
  DashboardSummary,
} from '../types/dashboard.types';

export const dashboardService = {
  async getSummary(
    paramsOrUrgentDays: number | DashboardFilterParams = 7,
  ): Promise<DashboardSummary> {
    const params: Record<string, string | number> = {};

    if (typeof paramsOrUrgentDays === 'number') {
      params.urgentDays = paramsOrUrgentDays;
    } else if (paramsOrUrgentDays) {
      if (
        typeof paramsOrUrgentDays.periodDays === 'number' &&
        paramsOrUrgentDays.periodDays > 0
      ) {
        params.periodDays = paramsOrUrgentDays.periodDays;
      }
      if (paramsOrUrgentDays.startDate) {
        params.startDate = paramsOrUrgentDays.startDate;
      }
      if (paramsOrUrgentDays.endDate) {
        params.endDate = paramsOrUrgentDays.endDate;
      }
      if (paramsOrUrgentDays.status) {
        params.status = paramsOrUrgentDays.status;
      }
      if (paramsOrUrgentDays.clientId) {
        params.clientId = paramsOrUrgentDays.clientId;
      }
      if (typeof paramsOrUrgentDays.urgentDays === 'number') {
        params.urgentDays = paramsOrUrgentDays.urgentDays;
      }
    }

    const { data } = await api.get<DashboardSummary>('/dashboard/summary', {
      params,
    });
    return data;
  },
};
