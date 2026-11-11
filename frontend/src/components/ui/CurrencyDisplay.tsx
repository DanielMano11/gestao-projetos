import React from 'react';

interface CurrencyDisplayProps {
  value: number;
  className?: string;
}

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  value,
  className = '',
}) => {
  return <span className={className}>{brlFormatter.format(value || 0)}</span>;
};

