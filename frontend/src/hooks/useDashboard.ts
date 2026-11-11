import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardFilterParams } from '../types/dashboard.types';

export function useDashboard(filters: number | DashboardFilterParams = {}) {
  return useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => dashboardService.getSummary(filters),
  });
}
