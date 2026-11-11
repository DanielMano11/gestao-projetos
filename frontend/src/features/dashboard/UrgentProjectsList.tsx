import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DeadlineAlertBadge } from '../../components/ui/DeadlineAlertBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';
import type { UrgentProjectItem } from '../../types/dashboard.types';

interface UrgentProjectsListProps {
  items: UrgentProjectItem[];
}

export const UrgentProjectsList: React.FC<UrgentProjectsListProps> = ({
  items,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h3 className="text-base font-semibold text-slate-900">
          Projetos Urgentes e em Atraso
        </h3>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Nenhum projeto atrasado ou com entrega crítica nos próximos 7 dias.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/projects/${item.id}`}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {item.title}
                  </Link>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-slate-500">
                  Cliente: <strong>{item.clientName}</strong> • Saldo a receber:{' '}
                  <CurrencyDisplay
                    value={item.receivableAmount}
                    className="font-medium text-slate-700"
                  />
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 sm:w-64 sm:items-end">
                <DeadlineAlertBadge
                  deadline={item.deadline}
                  status={item.status}
                  daysRemaining={item.daysRemaining}
                  isOverdue={item.isOverdue}
                  isUrgent={true}
                />
                <ProgressBar percentage={item.progressPercentage} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

