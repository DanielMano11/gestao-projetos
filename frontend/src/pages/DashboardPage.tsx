import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { FinancialSummaryCards } from '../features/dashboard/FinancialSummaryCards';
import { UrgentProjectsList } from '../features/dashboard/UrgentProjectsList';
import { ProjectsByStatusChart } from '../features/dashboard/ProjectsByStatusChart';
import { Skeleton } from '../components/ui/Skeleton';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError } = useDashboard(7);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Não foi possível carregar os indicadores do painel inicial.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Painel Inicial — Métricas Financeiras e Prazos
        </h2>
        <p className="text-xs text-slate-500">
          Visão consolidada do fluxo de caixa e dos projetos urgentes da sua carteira.
        </p>
      </div>

      <FinancialSummaryCards financials={data.financials} />
      <UrgentProjectsList items={data.urgentProjects} />
      <ProjectsByStatusChart countsByStatus={data.countsByStatus} />
    </div>
  );
};

