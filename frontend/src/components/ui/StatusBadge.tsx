import React from 'react';
import type { ProjectStatus } from '../../types/project.types';

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  PROPOSAL: 'Proposta',
  IN_PROGRESS: 'Em Andamento',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  PROPOSAL: 'bg-sky-100 text-sky-800 border-sky-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  PAUSED: 'bg-amber-100 text-amber-800 border-amber-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELED: 'bg-slate-200 text-slate-700 border-slate-300',
};

interface StatusBadgeProps {
  status: ProjectStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
};

