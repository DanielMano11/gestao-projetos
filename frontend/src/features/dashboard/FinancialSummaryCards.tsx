import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { formatCurrencyBRL } from '../../utils/format';
import type {
  DashboardAppliedFilter,
  DashboardFinancials,
  DashboardSystemOverview,
} from '../../types/dashboard.types';

interface FinancialSummaryCardsProps {
  financials: DashboardFinancials;
  systemOverview?: DashboardSystemOverview;
  appliedFilter?: DashboardAppliedFilter;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  financials,
  systemOverview,
  appliedFilter,
}) => {
  const entriesInPeriod =
    typeof financials.entriesInPeriod === 'number'
      ? financials.entriesInPeriod
      : financials.totalPaid;
  const entriesCount = financials.entriesCount ?? 0;
  const collectionRate =
    typeof financials.collectionRatePercentage === 'number'
      ? financials.collectionRatePercentage
      : financials.totalCharged > 0
        ? Math.min(
            100,
            Math.round((financials.totalPaid / financials.totalCharged) * 100),
          )
        : 0;
  const averageTicket = financials.averageTicket ?? 0;

  const periodSubtitle = appliedFilter?.periodDays
    ? `Nos últimos ${appliedFilter.periodDays} dias (${entriesCount} ${entriesCount === 1 ? 'entrada' : 'entradas'})`
    : appliedFilter?.startDate || appliedFilter?.endDate
      ? `No intervalo filtrado (${entriesCount} ${entriesCount === 1 ? 'entrada' : 'entradas'})`
      : `Acumulado no período (${entriesCount} ${entriesCount === 1 ? 'entrada' : 'entradas'})`;

  const cards = [
    {
      title: 'Entradas no Período',
      value: formatCurrencyBRL(entriesInPeriod),
      subtitle: periodSubtitle,
      icon: ArrowDownLeft,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      title: 'Total Recebido (Caixa)',
      value: formatCurrencyBRL(financials.totalPaid),
      subtitle: `Taxa de recebimento: ${collectionRate}% do contratado`,
      icon: TrendingUp,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Total Cobrado (Contratado)',
      value: formatCurrencyBRL(financials.totalCharged),
      subtitle:
        averageTicket > 0
          ? `Ticket médio: ${formatCurrencyBRL(averageTicket)}`
          : 'Projetos ativos e concluídos',
      icon: DollarSign,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Saldo a Receber',
      value: formatCurrencyBRL(financials.totalReceivable),
      subtitle: 'Pendente de projetos contratados',
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      title: 'Em Propostas',
      value: formatCurrencyBRL(financials.proposalsTotalValue),
      subtitle: 'Potencial em negociação',
      icon: FileText,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.title}
                </span>
                <div className={`rounded-lg border p-2 ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {systemOverview && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Projetos no Filtro
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">
                {systemOverview.totalProjects}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({systemOverview.activeProjectsCount} ativos)
                </span>
              </p>
            </div>
            <Activity className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Taxa de Conclusão
              </p>
              <p className="mt-0.5 text-lg font-bold text-emerald-700">
                {systemOverview.completionRatePercentage}%{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({systemOverview.completedProjectsCount} concluídos)
                </span>
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Progresso Médio (Tarefas)
              </p>
              <p className="mt-0.5 text-lg font-bold text-indigo-700">
                {systemOverview.averageProgressPercentage}%
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Projetos em Atraso
              </p>
              <p
                className={`mt-0.5 text-lg font-bold ${
                  systemOverview.overdueProjectsCount > 0
                    ? 'text-red-600'
                    : 'text-slate-900'
                }`}
              >
                {systemOverview.overdueProjectsCount}
              </p>
            </div>
            <AlertTriangle
              className={`h-5 w-5 ${
                systemOverview.overdueProjectsCount > 0
                  ? 'text-red-500'
                  : 'text-slate-400'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
