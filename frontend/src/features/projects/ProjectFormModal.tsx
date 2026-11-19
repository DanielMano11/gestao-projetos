import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import type { Client } from '../../types/client.types';
import type { CreateProjectInput, ProjectStatus } from '../../types/project.types';

interface ProjectFormModalProps {
  isOpen: boolean;
  clients: Client[];
  onClose: () => void;
  onSubmit: (data: CreateProjectInput) => Promise<void>;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  clients,
  onClose,
  onSubmit,
}) => {
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PROPOSAL');
  const [deadline, setDeadline] = useState('');
  const [chargedAmount, setChargedAmount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [tasksText, setTasksText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const charged = Number(chargedAmount);
    const paid = Number(paidAmount);

    if (charged < 0 || paid < 0) {
      setError('Os valores não podem ser negativos.');
      return;
    }
    if (paid > charged) {
      setError('O valor pago não pode ser superior ao valor cobrado.');
      return;
    }

    const initialTasks = tasksText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        clientId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        deadline,
        chargedAmount: charged,
        paidAmount: paid,
        initialTasks,
      });
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erro ao cadastrar projeto.',
      );
    }
  };

  return (
    <Modal isOpen={isOpen} title="Novo Projeto / Serviço" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Cliente *
          </label>
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Selecione um cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Título do Projeto *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Descrição / Escopo
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Status Inicial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="PROPOSAL">Proposta</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="PAUSED">Pausado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Prazo Final *
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Valor Cobrado (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={chargedAmount}
              onChange={(e) => setChargedAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Valor Pago Inicial (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Checklist Inicial (1 tarefa por linha)
          </label>
          <textarea
            rows={3}
            value={tasksText}
            onChange={(e) => setTasksText(e.target.value)}
            placeholder="Levantamento de requisitos&#10;Desenvolvimento&#10;Entrega final"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Criar Projeto
          </button>
        </div>
      </form>
    </Modal>
  );
};

