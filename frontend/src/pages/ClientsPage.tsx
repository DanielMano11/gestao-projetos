import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  useClients,
  useCreateClient,
  useDeleteClient,
  useUpdateClient,
} from '../hooks/useClients';
import { ClientListTable } from '../features/clients/ClientListTable';
import { ClientFormModal } from '../features/clients/ClientFormModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Toast } from '../components/ui/Toast';
import type { Client, CreateClientInput } from '../types/client.types';

export const ClientsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [toast, setToast] = useState<{
    message: string | null;
    type: 'success' | 'error';
  }>({ message: null, type: 'success' });

  const { data, isLoading } = useClients({ search });
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const handleSave = async (payload: CreateClientInput) => {
    if (editingClient) {
      await updateClient.mutateAsync({ id: editingClient.id, payload });
      setToast({ message: 'Cliente atualizado com sucesso!', type: 'success' });
    } else {
      await createClient.mutateAsync(payload);
      setToast({ message: 'Cliente cadastrado com sucesso!', type: 'success' });
    }
  };

  const handleDelete = async (client: Client) => {
    try {
      await deleteClient.mutateAsync(client.id);
      setToast({ message: 'Cliente removido.', type: 'success' });
    } catch {
      setToast({
        message:
          'Não é possível excluir um cliente que possui histórico de projetos.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clientes</h2>
          <p className="text-xs text-slate-500">
            Contatos rápidos (WhatsApp e e-mail) e histórico de serviços contratados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingClient(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Buscar por nome, WhatsApp ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm sm:w-80"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Cadastre seu primeiro cliente para vincular projetos e serviços."
        />
      ) : (
        <ClientListTable
          clients={data.data}
          onEdit={(c) => {
            setEditingClient(c);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <ClientFormModal
        isOpen={modalOpen}
        initialData={editingClient}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, message: null })}
      />
    </div>
  );
};

