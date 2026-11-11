import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';
import { DeadlineAlertBadge } from '../../components/ui/DeadlineAlertBadge';
import type { Project } from '../../types/project.types';

interface ClientServiceHistoryDrawerProps {
  projects: Project[];
}

export const ClientServiceHistoryDrawer: React.FC<
  ClientServiceHistoryDrawerProps
> = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Nenhum projeto ou serviço registrado para este cliente até o momento.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Projeto / Serviço</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Prazo Final</th>
            <th className="px-4 py-3">Valor Cobrado</th>
            <th className="px-4 py-3">Saldo Pendente</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link
                  to={`/projects/${p.id}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {p.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-4 py-3">
                <DeadlineAlertBadge
                  deadline={p.deadline}
                  status={p.status}
                  daysRemaining={p.daysRemaining}
                  isOverdue={p.isOverdue}
                  isUrgent={p.isUrgent}
                />
              </td>
              <td className="px-4 py-3">
                <CurrencyDisplay value={p.chargedAmount} />
              </td>
              <td className="px-4 py-3 font-medium">
                <CurrencyDisplay value={p.receivableAmount} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

