import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { B2BDashboardPage } from './pages/B2BDashboardPage';
import { BarbershopDetailPage } from './pages/BarbershopDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { RadarPage } from './pages/RadarPage';
import { RegisterPage } from './pages/RegisterPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-variant flex items-center justify-center font-mono text-xs font-bold uppercase">
        VERIFICANDO SESSÃO CLIPPER...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

function DashboardRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-variant flex items-center justify-center font-mono text-xs font-bold uppercase">
        CARREGANDO...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'BarberShopOwner') {
    return <Navigate to="/b2b" replace />;
  }

  return <Navigate to="/meus-agendamentos" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/radar" element={<RadarPage />} />
      <Route path="/barbearia/:id" element={<BarbershopDetailPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/meus-agendamentos"
        element={
          <RequireAuth>
            <MyAppointmentsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/b2b"
        element={
          <RequireAuth>
            <B2BDashboardPage />
          </RequireAuth>
        }
      />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
