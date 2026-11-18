import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, tokenStorage } from '../lib/api';
import type { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const me = await apiFetch<CurrentUser>('/api/auth/me');
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshUser();
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginRequest) => {
    const auth = await apiFetch<AuthResponse>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify(payload) },
      false,
    );
    tokenStorage.setTokens(auth.token, auth.refreshToken);
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (payload: RegisterRequest) => {
    const auth = await apiFetch<AuthResponse>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(payload) },
      false,
    );
    if (auth.token && auth.refreshToken) {
      tokenStorage.setTokens(auth.token, auth.refreshToken);
      await refreshUser();
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiFetch<void>('/api/auth/revoke', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
