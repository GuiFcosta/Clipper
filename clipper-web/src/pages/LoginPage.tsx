import { ArrowLeft, Lock, Mail, ShieldCheck, Zap } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../lib/api';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { from?: string } | null;
  const redirectTo = state?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-variant text-on-surface flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-white border-b-[1.5px] border-on-surface">
        <div className="h-16 max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-primary border-[1.5px] border-on-surface block" />
            <span className="font-headline font-bold text-lg tracking-tighter uppercase text-on-surface">
              CLIPPER<span className="text-primary">//</span>HUB.v2
            </span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-xs font-bold text-on-surface hover:text-primary transition-colors uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLTAR AO RADAR</span>
          </Link>
        </div>
      </header>

      {/* Main Split Grid */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white border-[1.5px] border-on-surface shadow-[6px_6px_0px_#090D16] grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Panel: Telemetry & Value */}
          <div className="md:col-span-5 bg-on-surface text-white p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 font-mono text-[10px] font-bold text-live uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
                <span>AUTENTICAÇÃO SEGURA • JWT</span>
              </div>

              <h1 className="font-headline font-bold text-3xl uppercase tracking-tight leading-none">
                ACESSE SUA CONTA <span className="text-primary">CLIPPER</span>
              </h1>

              <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed">
                Entre para agendar cadeiras em 15 segundos com preenchimento automático, acessar seu
                Digital Pass e gerenciar seus horários em tempo real.
              </p>
            </div>

            <div className="space-y-3 border-t border-white/15 pt-6 font-mono text-xs">
              <div className="flex items-center gap-2.5 text-slate-200">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <span>Checkout 1-clique sem preencher formulários</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-live shrink-0" />
                <span>Histórico completo &amp; Digital Pass com QR</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-widest">
                [ TERMINAL DE ACESSO ]
              </span>
              <h2 className="font-headline font-bold text-2xl uppercase tracking-tight text-on-surface">
                Entrar na Plataforma
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                  E-MAIL *
                </span>
                <div className="flex items-center gap-2.5 border-[1.5px] border-on-surface bg-surface-container-low px-3.5 py-3 focus-within:border-primary focus-within:bg-white transition-colors">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                  SENHA *
                </span>
                <div className="flex items-center gap-2.5 border-[1.5px] border-on-surface bg-surface-container-low px-3.5 py-3 focus-within:border-primary focus-within:bg-white transition-colors">
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                  />
                </div>
              </label>

              {error && (
                <div className="p-3 bg-primary/10 border-[1.5px] border-primary font-mono text-xs font-bold text-primary">
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-primary hover:bg-[#e04400] disabled:opacity-60 text-white font-headline font-bold text-sm uppercase tracking-wider border-[1.5px] border-on-surface shadow-[3px_3px_0px_#090D16] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                {submitting ? 'AUTENTICANDO...' : 'ENTRAR NO CLIPPER ↗'}
              </button>
            </form>

            <div className="pt-4 border-t-[1.5px] border-on-surface/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
              <span className="text-on-surface-variant">Ainda não tem conta?</span>
              <Link
                to="/register"
                state={{ from: redirectTo }}
                className="font-bold text-on-surface hover:text-primary underline underline-offset-4 uppercase"
              >
                CRIAR CONTA AGORA →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
