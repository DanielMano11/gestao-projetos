import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
}) => {
  const { isDark, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Tema do sistema"
      className={`inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={!isDark}
        aria-label="Ativar tema claro"
        title="Tema claro"
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
          !isDark
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        <span>Claro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={isDark}
        aria-label="Ativar tema escuro"
        title="Tema escuro"
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
          isDark
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Moon className="h-3.5 w-3.5 text-indigo-500 dark:text-white" />
        <span>Escuro</span>
      </button>
    </div>
  );
};
