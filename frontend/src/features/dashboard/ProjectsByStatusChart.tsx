import React from 'react';
import type { ProjectStatus } from '../../types/project.types';

const STATUS_META: Record<
  ProjectStatus,
  { label: string; badgeColor: string; barColor: string }
> = {
  PROPOSAL: {
    label: 'Em Proposta',
    badgeColor:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    barColor: 'bg-slate-400 dark:bg-slate-500',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    badgeColor:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    barColor: 'bg-indigo-600 dark:bg-indigo-500',
  },
  PAUSED: {
    label: 'Pausados',
    badgeColor:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    barColor: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Concluídos',
    badgeColor:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    barColor: 'bg-emerald-600 dark:bg-emerald-500',
  },
  CANCELED: {
    label: 'Cancelados',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    barColor: 'bg-red-500',
  },
};

interface ProjectsByStatusChartProps {
  counts: Record<ProjectStatus, number>;
  selectedStatus?: ProjectStatus | '';
  onSelectStatus?: (status: ProjectStatus | '') => void;
}

export const ProjectsByStatusChart: React.FC<ProjectsByStatusChartProps> = ({
  counts,
  selectedStatus,
  onSelectStatus,
}) => {
  const totalProjects = (Object.keys(STATUS_META) as ProjectStatus[]).reduce(
    (acc, key) => acc + (counts[key] ?? 0),
    0,
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Projetos por Status
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribuição atual do portfólio ({totalProjects}{' '}
            {totalProjects === 1 ? 'projeto' : 'projetos'})
          </p>
        </div>
        {selectedStatus && onSelectStatus && (
          <button
            type="button"
            onClick={() => onSelectStatus('')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Ver todos
          </button>
        )}
      </div>

      <div className="space-y-3">
        {(Object.keys(STATUS_META) as ProjectStatus[]).map((status) => {
          const meta = STATUS_META[status];
          const count = counts[status] ?? 0;
          const percentage =
            totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
          const isSelected = selectedStatus === status;

          return (
            <div
              key={status}
              onClick={() =>
                onSelectStatus
                  ? onSelectStatus(isSelected ? '' : status)
                  : undefined
              }
              className={`rounded-lg border p-2.5 transition-colors ${
                onSelectStatus
                  ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/60'
                  : ''
              } ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/40 dark:border-indigo-400 dark:bg-indigo-950/40'
                  : 'border-slate-100 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${meta.badgeColor}`}
                >
                  {meta.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {percentage}%
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {count}
                  </span>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${meta.barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
