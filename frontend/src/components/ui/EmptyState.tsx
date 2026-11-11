import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
}) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
    <h4 className="text-base font-semibold text-slate-800">{title}</h4>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

