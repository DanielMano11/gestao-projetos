import React from 'react';
import { NavLink } from 'react-router-dom';
import { FolderKanban, LayoutDashboard, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSidebarSurfaceTokens } from '../../utils/themeColors';
import { SidebarColorPicker } from './SidebarColorPicker';

export const Sidebar: React.FC = () => {
  const { effectiveSidebarColor } = useTheme();
  const tokens = getSidebarSurfaceTokens(effectiveSidebarColor);

  const sidebarStyle = {
    '--sidebar-bg': tokens.bg,
    '--sidebar-text': tokens.text,
    '--sidebar-text-muted': tokens.textMuted,
    '--sidebar-border': tokens.border,
    '--sidebar-hover-bg': tokens.hoverBg,
    '--sidebar-active-bg': tokens.activeBg,
    '--sidebar-active-text': tokens.activeText,
    '--sidebar-active-ring': tokens.activeRing,
    '--sidebar-icon-bg': tokens.iconBg,
    '--sidebar-icon-color': tokens.iconColor,
  } as React.CSSProperties;

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'app-sidebar-nav-link-active' : 'app-sidebar-nav-link'
    }`;

  return (
    <aside
      style={sidebarStyle}
      data-sidebar-color={tokens.bg}
      data-sidebar-tone={tokens.isLight ? 'light' : 'dark'}
      className="app-sidebar flex w-full flex-col border-b p-4 transition-colors duration-200 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r"
    >
      <div className="mb-4 flex items-center gap-2.5 px-1 md:mb-6">
        <div className="app-sidebar-brand-icon flex h-8 w-8 items-center justify-center rounded-lg">
          <FolderKanban className="h-5 w-5" />
        </div>
        <span className="text-base font-bold tracking-tight">
          Gestão de Projetos
        </span>
      </div>

      <nav className="flex flex-row gap-2 overflow-x-auto md:flex-1 md:flex-col md:overflow-y-auto">
        <NavLink to="/" end className={navClass}>
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Painel Inicial</span>
        </NavLink>
        <NavLink to="/clients" className={navClass}>
          <Users className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Clientes</span>
        </NavLink>
        <NavLink to="/projects" className={navClass}>
          <FolderKanban className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Projetos & Prazos</span>
        </NavLink>
      </nav>

      <div className="app-sidebar-border mt-3 border-t pt-3 md:mt-auto md:pt-4">
        <SidebarColorPicker />
      </div>
    </aside>
  );
};
