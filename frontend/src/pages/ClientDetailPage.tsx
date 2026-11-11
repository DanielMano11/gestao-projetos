import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useClientDetail } from '../hooks/useClients';
import { QuickContactActions } from '../components/ui/QuickContactActions';
import { CurrencyDisplay } from '../components/ui/CurrencyDisplay';
import { ClientServiceHistoryDrawer } from '../features/clients/ClientServiceHistoryDrawer';
import { Skeleton } from '../components/ui/Skeleton';

export const ClientDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: client, isLoading } = useClientDetail(id);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!client) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Cliente não encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Clientes
      </Link>

      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
          {client.notes && (
            <p className="mt-1 text-sm text-slate-600">{client.notes}</p>
          )}
        </div>
        <QuickContactActions
          whatsapp={client.whatsapp}
          whatsappClean={client.whatsappClean}
          email={client.email}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total Contratado</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            <CurrencyDisplay value={client.summary.totalCharged} />
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <p className="text-xs text-emerald-700">Total Pago pelo Cliente</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            <CurrencyDisplay value={client.summary.totalPaid} />
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="text-xs text-amber-800">Saldo Pendente</p>
          <p className="mt-1 text-lg font-bold text-amber-800">
            <CurrencyDisplay value={client.summary.totalReceivable} />
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">
          Histórico de Serviços ({client.projects.length})
        </h3>
        <ClientServiceHistoryDrawer projects={client.projects} />
      </div>
    </div>
  );
};

