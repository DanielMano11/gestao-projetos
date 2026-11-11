import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import {
  formatDateBR,
  getCurrentMonthDateRange,
  getPeriodDaysDateRange,
} from '../../utils/format';
import type { DashboardFilterParams } from '../../types/dashboard.types';
import type { ProjectStatus } from '../../types/project.types';

interface ClientOption {
  id: string;
  name: string;
}

interface DashboardFiltersBarProps {
  filters: DashboardFilterParams;
  clients?: ClientOption[];
  referenceDate?: Date;
  onChange: (nextFilters: DashboardFilterParams) => void;
  onReset: () => void;
}

const DAY_PRESETS: Array<{ label: string; days: 7 | 15 | 21 | 30 }> = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 15 dias', days: 15 },
  { label: 'Últimos 21 dias', days: 21 },
  { label: 'Últimos 30 dias', days: 30 },
];

const STATUS_OPTIONS: Array<{ label: string; value: ProjectStatus | '' }> = [
  { label: 'Todos os status', value: '' },
  { label: 'Em Proposta', value: 'PROPOSAL' },
  { label: 'Em Andamento', value: 'IN_PROGRESS' },
  { label: 'Pausado', value: 'PAUSED' },
  { label: 'Concluído', value: 'COMPLETED' },
  { label: 'Cancelado', value: 'CANCELED' },
];

export const DashboardFiltersBar: React.FC<DashboardFiltersBarProps> = ({
  filters,
  clients = [],
  referenceDate,
  onChange,
  onReset,
}) => {
  const currentMonthRange = getCurrentMonthDateRange(referenceDate);

  const isCurrentMonthActive =
    !filters.periodDays &&
    filters.startDate === currentMonthRange.startDate &&
    filters.endDate === currentMonthRange.endDate;

  const isAllTimeActive =
    !filters.periodDays && !filters.startDate && !filters.endDate;

  const handleCurrentMonthClick = () => {
    onChange({
      ...filters,
      periodDays: null,
      startDate: currentMonthRange.startDate,
      endDate: currentMonthRange.endDate,
      urgentDays: 7,
    });
  };

  const handleDayPresetClick = (days: 7 | 15 | 21 | 30) => {
    const range = getPeriodDaysDateRange(days, referenceDate);
    onChange({
      ...filters,
      periodDays: days,
      startDate: range.startDate,
      endDate: range.endDate,
      urgentDays: days,
    });
  };

  const handleAllTimeClick = () => {
    onChange({
      ...filters,
      periodDays: null,
      startDate: '',
      endDate: '',
      urgentDays: 7,
    });
  };

  const activeRangeText =
    filters.startDate && filters.endDate
      ? `${formatDateBR(filters.startDate)} - ${formatDateBR(filters.endDate)}`
      : filters.startDate
        ? `A partir de ${formatDateBR(filters.startDate)}`
        : filters.endDate
          ? `Até ${formatDateBR(filters.endDate)}`
          : 'Todo o período';

  return (
    <section
      aria-label="Filtros do Dashboard"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter className="h-4 w-4 text-indigo-600" />
            <span>Filtrar por Período e Critérios</span>
          </div>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            Período: {activeRangeText}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleCurrentMonthClick}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isCurrentMonthActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mês Atual
          </button>

          {DAY_PRESETS.map((preset) => {
            const isActive = filters.periodDays === preset.days;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleDayPresetClick(preset.days)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleAllTimeClick}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isAllTimeActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todo o período
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label
            htmlFor="dashboard-start-date"
            className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Data Inicial
          </label>
          <input
            id="dashboard-start-date"
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                startDate: e.target.value,
                periodDays: null,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="dashboard-end-date"
            className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Data Final
          </label>
          <input
            id="dashboard-end-date"
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                endDate: e.target.value,
                periodDays: null,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="dashboard-status-filter"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Status do Projeto
          </label>
          <select
            id="dashboard-status-filter"
            value={filters.status ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as ProjectStatus | '',
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="dashboard-client-filter"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Cliente
          </label>
          <select
            id="dashboard-client-filter"
            value={filters.clientId ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                clientId: e.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Todos os clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Mês Atual (Padrão)
          </button>
        </div>
      </div>
    </section>
  );
};
