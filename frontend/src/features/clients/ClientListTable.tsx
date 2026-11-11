import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { QuickContactActions } from '../../components/ui/QuickContactActions';
import type { Client } from '../../types/client.types';

interface ClientListTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientListTable: React.FC<ClientListTableProps> = ({
  clients,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Contatos Rápidos</th>
            <th className="px-4 py-3">Projetos</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <Link
                  to={`/clients/${client.id}`}
                  className="font-semibold text-slate-900 hover:text-indigo-600"
                >
                  {client.name}
                </Link>
                {client.notes && (
                  <p className="text-xs text-slate-500">{client.notes}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <QuickContactActions
                  whatsapp={client.whatsapp}
                  whatsappClean={client.whatsappClean}
                  email={client.email}
                />
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {client.projectsCount} serviço(s)
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <Link
                    to={`/clients/${client.id}`}
                    className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                    title="Ver Histórico de Serviços"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit(client)}
                    className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    title="Editar Cliente"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(client)}
                    className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    title="Excluir Cliente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

