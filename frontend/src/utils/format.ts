const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

export function formatCurrencyBRL(value: number): string {
  return brlFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatDateBR(dateValue: string | Date): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function getCurrentMonthDateRange(referenceDate: Date = new Date()): {
  startDate: string;
  endDate: string;
} {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(Date.UTC(year, month, 1))
    .toISOString()
    .slice(0, 10);
  const lastDay = new Date(Date.UTC(year, month + 1, 0))
    .toISOString()
    .slice(0, 10);

  return {
    startDate: firstDay,
    endDate: lastDay,
  };
}

export function getPeriodDaysDateRange(
  days: number,
  referenceDate: Date = new Date(),
): {
  startDate: string;
  endDate: string;
} {
  const endUtc = Date.UTC(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  const startUtc = endUtc - days * 24 * 60 * 60 * 1000;

  return {
    startDate: new Date(startUtc).toISOString().slice(0, 10),
    endDate: new Date(endUtc).toISOString().slice(0, 10),
  };
}
