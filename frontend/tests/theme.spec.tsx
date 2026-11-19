import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  SIDEBAR_COLOR_STORAGE_KEY,
  THEME_STORAGE_KEY,
  ThemeProvider,
  getStoredSidebarColor,
  getStoredTheme,
} from '../src/contexts/ThemeContext';
import { Header } from '../src/components/layout/Header';
import { Sidebar } from '../src/components/layout/Sidebar';
import {
  DEFAULT_DARK_SIDEBAR_COLOR,
  DEFAULT_LIGHT_SIDEBAR_COLOR,
  getSidebarSurfaceTokens,
  isLightColor,
  isValidHexColor,
} from '../src/utils/themeColors';

const renderLayoutShell = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <Sidebar />
        <Header />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('Tema Global do Sistema e Aparência Exclusiva do Menu Lateral', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('deve validar cores hexadecimais e calcular contraste adequado automaticamente', () => {
    expect(isValidHexColor('#1e1b4b')).toBe(true);
    expect(isValidHexColor('#AABBCC')).toBe(true);
    expect(isValidHexColor('red')).toBe(false);
    expect(isValidHexColor('#123')).toBe(false);
    expect(isValidHexColor('javascript:alert(1)')).toBe(false);

    expect(isLightColor('#ffffff')).toBe(true);
    expect(isLightColor('#fef08a')).toBe(true);
    expect(isLightColor('#1e1b4b')).toBe(false);
    expect(isLightColor('#064e3b')).toBe(false);

    const lightTokens = getSidebarSurfaceTokens('#f8fafc');
    expect(lightTokens.isLight).toBe(true);
    expect(lightTokens.text).toBe('#0f172a');

    const darkTokens = getSidebarSurfaceTokens('#064e3b');
    expect(darkTokens.isLight).toBe(false);
    expect(darkTokens.text).toBe('#f8fafc');
  });

  it('deve alternar o tema global do sistema (Claro e Escuro) pelo Header e usar cor padrão distinta no menu', () => {
    const { container } = renderLayoutShell();
    const sidebar = container.querySelector('aside') as HTMLElement;

    const themeGroup = screen.getByRole('group', { name: /Tema do sistema/i });
    const lightBtn = within(themeGroup).getByRole('button', {
      name: /Ativar tema claro/i,
    });
    const darkBtn = within(themeGroup).getByRole('button', {
      name: /Ativar tema escuro/i,
    });

    // Inicia no tema Claro
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(lightBtn).toHaveAttribute('aria-pressed', 'true');
    expect(darkBtn).toHaveAttribute('aria-pressed', 'false');
    expect(sidebar).toHaveAttribute(
      'data-sidebar-color',
      DEFAULT_LIGHT_SIDEBAR_COLOR,
    );
    expect(sidebar).toHaveAttribute('data-sidebar-tone', 'light');

    // Alterna para Escuro pelo Header
    fireEvent.click(darkBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    expect(sidebar).toHaveAttribute(
      'data-sidebar-color',
      DEFAULT_DARK_SIDEBAR_COLOR,
    );
    expect(sidebar).toHaveAttribute('data-sidebar-tone', 'dark');

    // Volta para Claro pelo Header
    fireEvent.click(lightBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(sidebar).toHaveAttribute(
      'data-sidebar-color',
      DEFAULT_LIGHT_SIDEBAR_COLOR,
    );
  });

  it('deve abrir e fechar o pop-up da engrenagem contendo exclusivamente as cores do menu lateral', () => {
    const { container } = renderLayoutShell();
    const sidebar = container.querySelector('aside') as HTMLElement;

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const gearBtn = within(sidebar).getByRole('button', {
      name: /Personalizar aparência do menu lateral/i,
    });
    fireEvent.click(gearBtn);

    const dialog = screen.getByRole('dialog', {
      name: /Aparência do menu lateral/i,
    });
    expect(dialog).toBeInTheDocument();

    // O pop-up do menu não deve conter controle de tema global Claro/Escuro
    expect(
      within(dialog).queryByRole('button', { name: /Ativar tema escuro/i }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: /Ativar tema claro/i }),
    ).not.toBeInTheDocument();

    // Fecha via Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Abre novamente e fecha clicando fora
    fireEvent.click(gearBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deve permitir escolher cor do menu no pop-up e mantê-la ao alternar entre temas Claro e Escuro', () => {
    const { container } = renderLayoutShell();
    const sidebar = container.querySelector('aside') as HTMLElement;

    const themeGroup = screen.getByRole('group', { name: /Tema do sistema/i });
    const lightBtn = within(themeGroup).getByRole('button', {
      name: /Ativar tema claro/i,
    });
    const darkBtn = within(themeGroup).getByRole('button', {
      name: /Ativar tema escuro/i,
    });

    // Ativa tema escuro global
    fireEvent.click(darkBtn);

    // Abre o pop-up de aparência do menu na engrenagem
    fireEvent.click(
      within(sidebar).getByRole('button', {
        name: /Personalizar aparência do menu lateral/i,
      }),
    );

    // Escolhe Esmeralda Escuro para o menu
    const emeraldBtn = screen.getByRole('button', {
      name: /Cor do menu: Esmeralda Escuro/i,
    });
    fireEvent.click(emeraldBtn);
    expect(emeraldBtn).toHaveAttribute('aria-pressed', 'true');
    expect(sidebar).toHaveAttribute('data-sidebar-color', '#064e3b');
    expect(sidebar).toHaveAttribute('data-sidebar-tone', 'dark');
    expect(localStorage.getItem(SIDEBAR_COLOR_STORAGE_KEY)).toBe('#064e3b');

    // Trocar o tema global do sistema preserva a cor escolhida para o menu
    fireEvent.click(lightBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(sidebar).toHaveAttribute('data-sidebar-color', '#064e3b');

    fireEvent.click(darkBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(sidebar).toHaveAttribute('data-sidebar-color', '#064e3b');

    // Cor personalizada clara via input color adapta automaticamente o contraste
    const colorInput = screen.getByLabelText(
      /Escolher cor personalizada do menu lateral/i,
    );
    fireEvent.change(colorInput, { target: { value: '#fef08a' } });
    expect(sidebar).toHaveAttribute('data-sidebar-color', '#fef08a');
    expect(sidebar).toHaveAttribute('data-sidebar-tone', 'light');
    expect(localStorage.getItem(SIDEBAR_COLOR_STORAGE_KEY)).toBe('#fef08a');

    // Restaurar padrão volta para a cor padrão do tema atual (Índigo Noturno no escuro)
    fireEvent.click(screen.getByRole('button', { name: /Padrão/i }));
    expect(sidebar).toHaveAttribute(
      'data-sidebar-color',
      DEFAULT_DARK_SIDEBAR_COLOR,
    );
    expect(localStorage.getItem(SIDEBAR_COLOR_STORAGE_KEY)).toBeNull();
  });

  it('deve ignorar e limpar valores inválidos no localStorage sem quebrar', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'tema-invalido');
    localStorage.setItem(
      SIDEBAR_COLOR_STORAGE_KEY,
      'not-a-color;background:red',
    );

    expect(getStoredTheme()).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    expect(getStoredSidebarColor()).toBeNull();
    expect(localStorage.getItem(SIDEBAR_COLOR_STORAGE_KEY)).toBeNull();
  });
});
