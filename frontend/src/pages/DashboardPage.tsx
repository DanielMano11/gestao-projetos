import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useClients } from '../hooks/useClients';
import { DashboardFiltersBar } from '../features/dashboard/DashboardFiltersBar';
import { FinancialSummaryCards } from '../features/dashboard/FinancialSummaryCards';
import { CashInEntriesPanel } from '../features/dashboard/CashInEntriesPanel';
import { UrgentProjectsList } from '../features/dashboard/UrgentProjectsList';
import { ProjectsByStatusChart } from '../features/dashboard/ProjectsByStatusChart';
import { getCurrentMonthDateRange } from '../utils/format';
import type { DashboardFilterParams } from '../types/dashboard.types';

function createCurrentMonthFilters(
  referenceDate: Date = new Date(),
): DashboardFilterParams {
  const { startDate, endDate } = getCurrentMonthDateRange(referenceDate);
  return {
    periodDays: null,
    startDate,
    endDate,
    status: '',
    clientId: '',
    urgentDays: 7,
  };
}

export const DashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilterParams>(() =>
    createCurrentMonthFilters(),
  );
  const { data, isLoading } = useDashboard(filters);
  const { data: clientsData } = useClients({ page: 1, limit: 100 });

  const clientsList = (clientsData?.data ?? []).map((client) => ({
    id: client.id,
    name: client.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Dashboard Financeiro e Operacional
        </h2>
        <p className="text-sm text-slate-500">
          Visão consolidada de entradas de caixa, recebíveis, prazos e saúde dos projetos
        </p>
      </div>

      <DashboardFiltersBar
        filters={filters}
        clients={clientsList}
        onChange={setFilters}
        onReset={() => setFilters(createCurrentMonthFilters())}
      />

      {isLoading || !data ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Carregando indicadores do sistema...
        </div>
      ) : (
        <>
          <FinancialSummaryCards
            financials={data.financials}
            systemOverview={data.systemOverview}
            appliedFilter={data.appliedFilter}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <CashInEntriesPanel
                entries={data.recentEntries ?? []}
                financials={data.financials}
                appliedFilter={data.appliedFilter}
              />
              <UrgentProjectsList items={data.urgentProjects} />
            </div>
            <div>
              <ProjectsByStatusChart
                counts={data.countsByStatus}
                selectedStatus={filters.status ?? ''}
                onSelectStatus={(status) =>
                  setFilters((prev) => ({ ...prev, status }))
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
