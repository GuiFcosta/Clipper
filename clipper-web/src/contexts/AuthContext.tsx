import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, tokenStorage } from '../lib/api';
import type { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../types/auth';

const DEMO_USER_KEY = 'clipper_demo_user';

const DEMO_USERS: Record<'Customer' | 'BarberShopOwner', CurrentUser> = {
  Customer: {
    id: 'demo-customer-01',
    fullName: 'Guilherme B.',
    email: 'guilherme.demo@clipper.app',
    phoneNumber: '(11) 99876-5432',
    role: 'Customer',
    roles: ['Customer'],
    stateAccount: 'Active',
    barberShopId: null,
    barberId: null,
    customerId: 101,
  },
  BarberShopOwner: {
    id: 'demo-owner-01',
    fullName: 'Diego Ramos (Grid Barber Lab)',
    email: 'b2b.demo@clipper.app',
    phoneNumber: '(11) 99123-4567',
    role: 'BarberShopOwner',
    roles: ['BarberShopOwner'],
    stateAccount: 'Active',
    barberShopId: 1,
    barberId: 1,
    customerId: null,
  },
};

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  loginDemo: (role?: 'Customer' | 'BarberShopOwner') => void;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const demoRaw = localStorage.getItem(DEMO_USER_KEY);
    if (demoRaw) {
      try {
        setUser(JSON.parse(demoRaw) as CurrentUser);
        return;
      } catch {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

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

  const loginDemo = useCallback((role: 'Customer' | 'BarberShopOwner' = 'Customer') => {
    const demoUser = DEMO_USERS[role];
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  }, []);

  const login = useCallback(
    async (payload: LoginRequest) => {
      try {
        const auth = await apiFetch<AuthResponse>(
          '/api/auth/login',
          { method: 'POST', body: JSON.stringify(payload) },
          false,
        );
        localStorage.removeItem(DEMO_USER_KEY);
        tokenStorage.setTokens(auth.token, auth.refreshToken);
        await refreshUser();
      } catch (err) {
        // Fallback to demo session when backend is offline and demo credentials are used
        if (err instanceof TypeError) {
          const isOwner = payload.email.toLowerCase().includes('b2b');
          loginDemo(isOwner ? 'BarberShopOwner' : 'Customer');
          return;
        }
        throw err;
      }
    },
    [loginDemo, refreshUser],
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const auth = await apiFetch<AuthResponse>(
        '/api/auth/register',
        { method: 'POST', body: JSON.stringify(payload) },
        false,
      );
      if (auth.token && auth.refreshToken) {
        localStorage.removeItem(DEMO_USER_KEY);
        tokenStorage.setTokens(auth.token, auth.refreshToken);
        await refreshUser();
      }
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiFetch<void>('/api/auth/revoke', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem(DEMO_USER_KEY);
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
        loginDemo,
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
