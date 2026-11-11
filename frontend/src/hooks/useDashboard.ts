import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export function useDashboard(urgentDays = 7) {
  return useQuery({
    queryKey: ['dashboard-summary', urgentDays],
    queryFn: () => dashboardService.getSummary(urgentDays),
  });
}

