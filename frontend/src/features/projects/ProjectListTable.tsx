import React from 'react';
import { Link } from 'react-router-dom';
import { DeadlineAlertBadge } from '../../components/ui/DeadlineAlertBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';
import { ProjectStatusSelect } from './ProjectStatusSelect';
import type { Project, ProjectStatus } from '../../types/project.types';

interface ProjectListTableProps {
  projects: Project[];
  onStatusChange: (projectId: string, status: ProjectStatus) => void;
}

export const ProjectListTable: React.FC<ProjectListTableProps> = ({
  projects,
  onStatusChange,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Projeto / Cliente</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Prazo Final</th>
            <th className="px-4 py-3">Progresso</th>
            <th className="px-4 py-3">Cobrado / A Receber</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {project.title}
                </Link>
                {project.client && (
                  <p className="text-xs text-slate-500">
                    Cliente: {project.client.name}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                <ProjectStatusSelect
                  value={project.status}
                  onChange={(st) => onStatusChange(project.id, st)}
                />
              </td>
              <td className="px-4 py-3">
                <DeadlineAlertBadge
                  deadline={project.deadline}
                  status={project.status}
                  daysRemaining={project.daysRemaining}
                  isOverdue={project.isOverdue}
                  isUrgent={project.isUrgent}
                />
              </td>
              <td className="w-48 px-4 py-3">
                <ProgressBar
                  percentage={project.progressPercentage}
                  completedCount={project.completedTasksCount}
                  totalCount={project.totalTasksCount}
                />
              </td>
              <td className="px-4 py-3">
                <div className="text-xs">
                  <div>
                    Cobrado:{' '}
                    <CurrencyDisplay
                      value={project.chargedAmount}
                      className="font-medium text-slate-900"
                    />
                  </div>
                  <div className="text-amber-700">
                    A receber:{' '}
                    <CurrencyDisplay
                      value={project.receivableAmount}
                      className="font-semibold"
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

