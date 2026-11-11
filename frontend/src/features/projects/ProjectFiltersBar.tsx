import React from 'react';
import { STATUS_LABELS } from '../../components/ui/StatusBadge';
import type { ProjectFilterParams, ProjectStatus } from '../../types/project.types';

interface ProjectFiltersBarProps {
  filters: ProjectFilterParams;
  onChange: (next: ProjectFilterParams) => void;
}

export const ProjectFiltersBar: React.FC<ProjectFiltersBarProps> = ({
  filters,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="text"
        placeholder="Buscar projeto ou cliente..."
        value={filters.search || ''}
        onChange={(e) =>
          onChange({ ...filters, search: e.target.value, page: 1 })
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm sm:w-64"
      />

      <select
        aria-label="Filtrar por status"
        value={filters.status || ''}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as ProjectStatus | '',
            page: 1,
          })
        }
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
      >
        <option value="">Todos os status</option>
        {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((st) => (
          <option key={st} value={st}>
            {STATUS_LABELS[st]}
          </option>
        ))}
      </select>

      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(filters.overdueOnly)}
          onChange={(e) =>
            onChange({ ...filters, overdueOnly: e.target.checked, page: 1 })
          }
        />
        Apenas Atrasados
      </label>

      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(filters.urgentOnly)}
          onChange={(e) =>
            onChange({ ...filters, urgentOnly: e.target.checked, page: 1 })
          }
        />
        Apenas Urgentes (7 dias)
      </label>
    </div>
  );
};

