import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { clearAuthSession, getStoredUser } from '../../services/queryClient';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Controle de Serviços, Prazos e Fluxo de Caixa
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {user && (
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Olá,{' '}
            <strong className="text-slate-900 dark:text-white">
              {user.name || user.email}
            </strong>
          </span>
        )}
        <ThemeSwitcher />
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </header>
  );
};
