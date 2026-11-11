import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import type { Client, CreateClientInput } from '../../types/client.types';

interface ClientFormModalProps {
  isOpen: boolean;
  initialData?: Client | null;
  onClose: () => void;
  onSubmit: (data: CreateClientInput) => Promise<void>;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setWhatsapp(initialData.whatsapp || '');
      setEmail(initialData.email || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setWhatsapp('');
      setEmail('');
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do cliente é obrigatório.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao salvar o cliente.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar Cliente' : 'Novo Cliente'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Nome / Empresa *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex.: Tech Soluções Ltda"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              WhatsApp
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="5511999998888"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="contato@empresa.com.br"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Observações
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

