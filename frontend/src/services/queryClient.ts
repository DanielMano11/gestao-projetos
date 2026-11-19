import { QueryClient } from '@tanstack/react-query';

export const TOKEN_STORAGE_KEY = 'gestao_projetos_token';
export const USER_STORAGE_KEY = 'gestao_projetos_user';

export interface StoredUser {
  id?: string;
  name?: string;
  email?: string;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  queryClient.clear();
}

export function getStoredUser(): StoredUser | null {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
    return parsed as StoredUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = atob(padded);
    const payload = JSON.parse(json) as unknown;
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function hasValidStoredToken(): boolean {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    clearAuthSession();
    return false;
  }

  if (exp * 1000 <= Date.now()) {
    clearAuthSession();
    return false;
  }

  return true;
}

