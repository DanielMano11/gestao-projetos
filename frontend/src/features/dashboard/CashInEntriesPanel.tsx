import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, Calendar, ExternalLink } from 'lucide-react';
import { formatCurrencyBRL, formatDateBR } from '../../utils/format';
import type {
  DashboardAppliedFilter,
  DashboardEntryItem,
  DashboardFinancials,
} from '../../types/dashboard.types';

interface CashInEntriesPanelProps {
  entries: DashboardEntryItem[];
  financials: DashboardFinancials;
  appliedFilter?: DashboardAppliedFilter;
}

export const CashInEntriesPanel: React.FC<CashInEntriesPanelProps> = ({
  entries,
  financials,
  appliedFilter,
}) => {
  const entriesInPeriod =
    typeof financials.entriesInPeriod === 'number'
      ? financials.entriesInPeriod
      : entries.reduce((acc, item) => acc + item.amount, 0);

  const totalContracted = financials.totalCharged;
  const paidShare =
    totalContracted > 0
      ? Math.min(100, Math.round((financials.totalPaid / totalContracted) * 100))
      : 0;
  const receivableShare = Math.max(0, 100 - paidShare);

  const periodLabel = appliedFilter?.periodDays
    ? `Últimos ${appliedFilter.periodDays} dias`
    : appliedFilter?.startDate || appliedFilter?.endDate
      ? `Período: ${appliedFilter.startDate ? formatDateBR(appliedFilter.startDate) : 'Início'} até ${appliedFilter.endDate ? formatDateBR(appliedFilter.endDate) : 'Hoje'}`
      : 'Todo o período';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
            Entradas de Caixa e Recebimentos
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Acompanhamento de valores que entraram no sistema ({periodLabel})
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-right">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-emerald-700">
            Total de Entradas no Filtro
          </span>
          <span className="text-base font-bold text-emerald-800">
            {formatCurrencyBRL(entriesInPeriod)}
          </span>
        </div>
      </div>

      {/* Barra comparativa Recebido vs A Receber */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>
            Recebido: <strong className="text-emerald-700">{formatCurrencyBRL(financials.totalPaid)}</strong> ({paidShare}%)
          </span>
          <span>
            A Receber: <strong className="text-amber-700">{formatCurrencyBRL(financials.totalReceivable)}</strong> ({receivableShare}%)
          </span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${paidShare}%` }}
            title={`Recebido: ${paidShare}%`}
          />
          <div
            className="bg-amber-400 transition-all duration-300"
            style={{ width: `${receivableShare}%` }}
            title={`A Receber: ${receivableShare}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Entrada efetivada em caixa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Saldo pendente a receber
          </span>
        </div>
      </div>

      {/* Lista de Entradas */}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          Nenhuma entrada financeira registrada para o período ou filtro selecionado.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/projects/${entry.projectId}`}
                    className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-indigo-600"
                  >
                    {entry.projectTitle}
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                  <span className="text-xs text-slate-500">
                    • {entry.clientName}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-xs text-slate-500">{entry.note}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDateBR(entry.paidAt)}
                </span>
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  + {formatCurrencyBRL(entry.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

