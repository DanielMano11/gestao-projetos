import React from 'react';
import { NavLink } from 'react-router-dom';
import { FolderKanban, LayoutDashboard, Users } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-full border-b bg-white p-4 md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6 flex items-center gap-2 px-2">
        <FolderKanban className="h-6 w-6 text-indigo-600" />
        <span className="text-base font-bold text-slate-900">
          Gestão de Projetos
        </span>
      </div>
      <nav className="flex flex-row gap-2 md:flex-col">
        <NavLink to="/" end className={navClass}>
          <LayoutDashboard className="h-4 w-4" />
          Painel Inicial
        </NavLink>
        <NavLink to="/clients" className={navClass}>
          <Users className="h-4 w-4" />
          Clientes
        </NavLink>
        <NavLink to="/projects" className={navClass}>
          <FolderKanban className="h-4 w-4" />
          Projetos & Prazos
        </NavLink>
      </nav>
    </aside>
  );
};

