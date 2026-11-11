import React from 'react';
import type { ProjectStatus } from '../../types/project.types';

const STATUS_META: Record<
  ProjectStatus,
  { label: string; badgeColor: string; barColor: string }
> = {
  PROPOSAL: {
    label: 'Em Proposta',
    badgeColor: 'bg-slate-100 text-slate-700',
    barColor: 'bg-slate-400',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    barColor: 'bg-indigo-600',
  },
  PAUSED: {
    label: 'Pausados',
    badgeColor: 'bg-amber-100 text-amber-700',
    barColor: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Concluídos',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    barColor: 'bg-emerald-600',
  },
  CANCELED: {
    label: 'Cancelados',
    badgeColor: 'bg-red-100 text-red-700',
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Projetos por Status
          </h3>
          <p className="text-xs text-slate-500">
            Distribuição atual do portfólio ({totalProjects}{' '}
            {totalProjects === 1 ? 'projeto' : 'projetos'})
          </p>
        </div>
        {selectedStatus && onSelectStatus && (
          <button
            type="button"
            onClick={() => onSelectStatus('')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
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
                onSelectStatus ? 'cursor-pointer hover:border-indigo-300' : ''
              } ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/40'
                  : 'border-slate-100 bg-slate-50/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${meta.badgeColor}`}
                >
                  {meta.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{percentage}%</span>
                  <span className="text-sm font-bold text-slate-900">
                    {count}
                  </span>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
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
