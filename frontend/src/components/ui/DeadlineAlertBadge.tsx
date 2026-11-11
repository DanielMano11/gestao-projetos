import React from 'react';
import type { ProjectStatus } from '../../types/project.types';

interface DeadlineAlertBadgeProps {
  deadline: string;
  status: ProjectStatus;
  daysRemaining?: number;
  isOverdue?: boolean;
  isUrgent?: boolean;
}

export const DeadlineAlertBadge: React.FC<DeadlineAlertBadgeProps> = ({
  deadline,
  status,
  daysRemaining,
  isOverdue,
  isUrgent,
}) => {
  const formattedDate = new Date(deadline).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  });

  const isTerminal = status === 'COMPLETED' || status === 'CANCELED';
  if (isTerminal) {
    return <span className="text-xs text-slate-500">{formattedDate}</span>;
  }

  if (isOverdue) {
    const daysLate = Math.abs(daysRemaining ?? 1);
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
        Em Atraso ({daysLate}d) • {formattedDate}
      </span>
    );
  }

  if (isUrgent) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
        Urgente ({daysRemaining ?? 0}d) • {formattedDate}
      </span>
    );
  }

  return <span className="text-xs text-slate-700">{formattedDate}</span>;
};

