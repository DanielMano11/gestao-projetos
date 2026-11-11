import React from 'react';
import { STATUS_LABELS } from '../../components/ui/StatusBadge';
import type { ProjectStatus } from '../../types/project.types';

interface ProjectStatusSelectProps {
  value: ProjectStatus;
  onChange: (status: ProjectStatus) => void;
  disabled?: boolean;
}

const ALL_STATUSES: ProjectStatus[] = [
  'PROPOSAL',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'CANCELED',
];

export const ProjectStatusSelect: React.FC<ProjectStatusSelectProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <select
      aria-label="Alterar status do projeto"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as ProjectStatus)}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
    >
      {ALL_STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
};

