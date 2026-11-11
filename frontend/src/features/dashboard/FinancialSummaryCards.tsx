import React from 'react';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';
import type { DashboardSummary } from '../../types/dashboard.types';

interface FinancialSummaryCardsProps {
  financials: DashboardSummary['financials'];
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  financials,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Total Cobrado (Contratado)
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          <CurrencyDisplay value={financials.totalCharged} />
        </p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
          Total Recebido
        </p>
        <p className="mt-2 text-2xl font-bold text-emerald-700">
          <CurrencyDisplay value={financials.totalPaid} />
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-800">
          Saldo a Receber
        </p>
        <p className="mt-2 text-2xl font-bold text-amber-800">
          <CurrencyDisplay value={financials.totalReceivable} />
        </p>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-sky-800">
          Em Propostas
        </p>
        <p className="mt-2 text-2xl font-bold text-sky-800">
          <CurrencyDisplay value={financials.proposalsTotalValue} />
        </p>
      </div>
    </div>
  );
};

