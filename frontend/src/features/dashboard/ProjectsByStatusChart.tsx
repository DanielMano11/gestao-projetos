import React from 'react';
import { STATUS_LABELS } from '../../components/ui/StatusBadge';
import type { ProjectStatus } from '../../types/project.types';

interface ProjectsByStatusChartProps {
  countsByStatus: Record<ProjectStatus, number>;
}

const ORDERED_STATUSES: ProjectStatus[] = [
  'PROPOSAL',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'CANCELED',
];

export const ProjectsByStatusChart: React.FC<ProjectsByStatusChartProps> = ({
  countsByStatus,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">
        Projetos por Status
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ORDERED_STATUSES.map((status) => (
          <div
            key={status}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center"
          >
            <p className="text-xs text-slate-500">{STATUS_LABELS[status]}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {countsByStatus[status] ?? 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

