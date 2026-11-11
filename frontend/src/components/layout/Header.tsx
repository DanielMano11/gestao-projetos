import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('gestao_projetos_user');
  const user = rawUser ? (JSON.parse(rawUser) as { name?: string; email?: string }) : null;

  const handleLogout = () => {
    localStorage.removeItem('gestao_projetos_token');
    localStorage.removeItem('gestao_projetos_user');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <div>
        <h1 className="text-sm font-semibold text-slate-800">
          Controle de Serviços, Prazos e Fluxo de Caixa
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-xs text-slate-600">
            Olá, <strong>{user.name || user.email}</strong>
          </span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </header>
  );
};

