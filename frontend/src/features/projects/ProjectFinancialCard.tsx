import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';
import type {
  CreatePaymentInput,
  FinancialStatus,
  Payment,
  UpdateFinancialsInput,
} from '../../types/project.types';

interface ProjectFinancialCardProps {
  chargedAmount: number;
  paidAmount: number;
  receivableAmount: number;
  financialStatus: FinancialStatus;
  payments?: Payment[];
  onUpdateDirect: (payload: UpdateFinancialsInput) => Promise<void> | void;
  onAddPayment: (payload: CreatePaymentInput) => Promise<void> | void;
  onRemovePayment?: (paymentId: string) => Promise<void> | void;
}

const FINANCIAL_STATUS_LABELS: Record<FinancialStatus, string> = {
  PENDING: 'Pagamento Pendente',
  PARTIAL: 'Parcialmente Pago',
  PAID: 'Quitado',
};

export const ProjectFinancialCard: React.FC<ProjectFinancialCardProps> = ({
  chargedAmount,
  paidAmount,
  receivableAmount,
  financialStatus,
  payments = [],
  onUpdateDirect,
  onAddPayment,
  onRemovePayment,
}) => {
  const [chargedInput, setChargedInput] = useState(String(chargedAmount));
  const [paidInput, setPaidInput] = useState(String(paidAmount));
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [installmentNote, setInstallmentNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSaveDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextCharged = Number(chargedInput);
    const nextPaid = Number(paidInput);

    if (nextCharged < 0 || nextPaid < 0) {
      setValidationError('Valores não podem ser negativos.');
      return;
    }
    if (nextPaid > nextCharged) {
      setValidationError('O valor pago não pode superar o valor cobrado.');
      return;
    }

    setValidationError(null);
    await onUpdateDirect({ chargedAmount: nextCharged, paidAmount: nextPaid });
  };

  const handleAddInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(installmentAmount);
    if (!amount || amount <= 0) {
      setValidationError('Informe um valor de parcela positivo.');
      return;
    }
    if (Number((paidAmount + amount).toFixed(2)) > chargedAmount) {
      setValidationError(
        'A soma das parcelas não pode ultrapassar o valor cobrado.',
      );
      return;
    }

    setValidationError(null);
    await onAddPayment({
      amount,
      note: installmentNote.trim() || undefined,
    });
    setInstallmentAmount('');
    setInstallmentNote('');
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          Controle Financeiro do Projeto
        </h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {FINANCIAL_STATUS_LABELS[financialStatus]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Valor Cobrado</p>
          <p className="text-lg font-bold text-slate-900">
            <CurrencyDisplay value={chargedAmount} />
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">Valor Pago</p>
          <p className="text-lg font-bold text-emerald-700">
            <CurrencyDisplay value={paidAmount} />
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-amber-800">Saldo a Receber</p>
          <p className="text-lg font-bold text-amber-800">
            <CurrencyDisplay value={receivableAmount} />
          </p>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-2.5 text-xs font-medium text-red-700"
        >
          {validationError}
        </div>
      )}

      <form onSubmit={handleSaveDirect} className="space-y-3 border-t pt-3">
        <p className="text-xs font-semibold text-slate-700">
          Ajuste Direto (Acumulado)
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label
              htmlFor="chargedAmountInput"
              className="block text-xs text-slate-600"
            >
              Valor Cobrado (R$)
            </label>
            <input
              id="chargedAmountInput"
              type="number"
              step="0.01"
              value={chargedInput}
              onChange={(e) => setChargedInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="paidAmountInput"
              className="block text-xs text-slate-600"
            >
              Valor Pago Acumulado (R$)
            </label>
            <input
              id="paidAmountInput"
              type="number"
              step="0.01"
              value={paidInput}
              onChange={(e) => setPaidInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
        >
          Atualizar Valores
        </button>
      </form>

      <form onSubmit={handleAddInstallment} className="space-y-3 border-t pt-3">
        <p className="text-xs font-semibold text-slate-700">
          Lançar Parcela / Recebimento Individual
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            type="number"
            step="0.01"
            placeholder="Valor da parcela (R$)"
            value={installmentAmount}
            onChange={(e) => setInstallmentAmount(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
          />
          <input
            type="text"
            placeholder="Observação (ex.: Entrada 50%)"
            value={installmentNote}
            onChange={(e) => setInstallmentNote(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Registrar Parcela
        </button>
      </form>

      {payments.length > 0 && (
        <div className="border-t pt-3">
          <p className="mb-2 text-xs font-semibold text-slate-700">
            Histórico de Parcelas Recebidas
          </p>
          <ul className="space-y-1.5 text-xs">
            {payments.map((pay) => (
              <li
                key={pay.id}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5"
              >
                <span>
                  <CurrencyDisplay
                    value={pay.amount}
                    className="font-semibold text-emerald-700"
                  />{' '}
                  — {pay.note || 'Pagamento registrado'}
                </span>
                {onRemovePayment && (
                  <button
                    type="button"
                    onClick={() => onRemovePayment(pay.id)}
                    aria-label="Estornar parcela"
                    className="text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

