import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({
  className = 'h-16 w-full',
}) => (
  <div
    className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
    aria-busy="true"
  />
);

