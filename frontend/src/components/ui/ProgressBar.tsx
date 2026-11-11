import React from 'react';

interface ProgressBarProps {
  percentage: number;
  completedCount?: number;
  totalCount?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  completedCount,
  totalCount,
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage || 0)));

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium">{clamped}% concluído</span>
        {totalCount !== undefined && (
          <span>
            {totalCount === 0
              ? 'Nenhuma tarefa'
              : `${completedCount ?? 0}/${totalCount} tarefas`}
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: `${clamped}%` }}
          className={`h-full transition-all duration-300 ${
            clamped === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
          }`}
        />
      </div>
    </div>
  );
};

