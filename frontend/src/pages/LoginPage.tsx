import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('gestor@exemplo.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
      const payload = isRegisterMode
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const { data } = await api.post<{
        accessToken: string;
        user: { id: string; name: string; email: string };
      }>(endpoint, payload);

      localStorage.setItem('gestao_projetos_token', data.accessToken);
      localStorage.setItem('gestao_projetos_user', JSON.stringify(data.user));
      navigate('/');
    } catch {
      setError(
        isRegisterMode
          ? 'Não foi possível criar a conta. Verifique os dados informados.'
          : 'E-mail ou senha inválidos.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Sistema de Gestão de Projetos
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Serviços, Prazos, Entregas e Fluxo de Caixa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700">
              E-mail *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Senha *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading
              ? 'Processando...'
              : isRegisterMode
                ? 'Criar Conta'
                : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            {isRegisterMode
              ? 'Já possui conta? Faça login'
              : 'Novo por aqui? Crie sua conta gratuita'}
          </button>
        </div>
      </div>
    </div>
  );
};

