import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_DARK_SIDEBAR_COLOR,
  DEFAULT_LIGHT_SIDEBAR_COLOR,
  isValidHexColor,
  normalizeHexColor,
} from '../utils/themeColors';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'gestao_projetos_theme';
export const SIDEBAR_COLOR_STORAGE_KEY = 'gestao_projetos_sidebar_color';

export interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  customSidebarColor: string | null;
  effectiveSidebarColor: string;
  setSidebarColor: (hex: string) => void;
  resetSidebarColor: () => void;
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'dark' || raw === 'light') {
      return raw;
    }
    if (raw !== null) {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    }
  } catch {
    // Ignore storage access errors
  }

  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

export function getStoredSidebarColor(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(SIDEBAR_COLOR_STORAGE_KEY);
    if (raw === null) return null;
    if (isValidHexColor(raw)) {
      return normalizeHexColor(raw);
    }
    window.localStorage.removeItem(SIDEBAR_COLOR_STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }

  return null;
}

export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function initializeThemeOnDocument(): ThemeMode {
  const initialTheme = getStoredTheme();
  applyThemeToDocument(initialTheme);
  return initialTheme;
}

const DEFAULT_CONTEXT_VALUE: ThemeContextValue = {
  theme: 'light',
  isDark: false,
  setTheme: () => undefined,
  toggleTheme: () => undefined,
  customSidebarColor: null,
  effectiveSidebarColor: DEFAULT_LIGHT_SIDEBAR_COLOR,
  setSidebarColor: () => undefined,
  resetSidebarColor: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(DEFAULT_CONTEXT_VALUE);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
  const [customSidebarColor, setCustomSidebarColor] = useState<string | null>(
    () => getStoredSidebarColor(),
  );

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    applyThemeToDocument(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyThemeToDocument(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage access errors
      }
      return next;
    });
  }, []);

  const setSidebarColor = useCallback((hex: string) => {
    if (!isValidHexColor(hex)) return;
    const normalized = normalizeHexColor(hex);
    setCustomSidebarColor(normalized);
    try {
      window.localStorage.setItem(SIDEBAR_COLOR_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const resetSidebarColor = useCallback(() => {
    setCustomSidebarColor(null);
    try {
      window.localStorage.removeItem(SIDEBAR_COLOR_STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const effectiveSidebarColor = useMemo(() => {
    if (customSidebarColor) return customSidebarColor;
    return theme === 'dark'
      ? DEFAULT_DARK_SIDEBAR_COLOR
      : DEFAULT_LIGHT_SIDEBAR_COLOR;
  }, [customSidebarColor, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
      customSidebarColor,
      effectiveSidebarColor,
      setSidebarColor,
      resetSidebarColor,
    }),
    [
      theme,
      setTheme,
      toggleTheme,
      customSidebarColor,
      effectiveSidebarColor,
      setSidebarColor,
      resetSidebarColor,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
