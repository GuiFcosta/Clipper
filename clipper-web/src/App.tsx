import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { BarbershopDetailPage } from './pages/BarbershopDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RadarPage } from './pages/RadarPage';
import { RegisterPage } from './pages/RegisterPage';

function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <p style={{ padding: '2rem' }}>Carregando...</p>;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <main style={{ maxWidth: 720, margin: '3rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Dashboard</h1>
      <pre style={{ background: '#111827', color: '#f9fafb', padding: '1rem', borderRadius: 8, overflowX: 'auto' }}>
        {JSON.stringify(user, null, 2)}
      </pre>
      <button type="button" onClick={() => void logout()}>
        Sair
      </button>
    </main>
  );
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
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
