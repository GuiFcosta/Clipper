import {
  ArrowLeft,
  Building2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Scissors,
  User,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../lib/api';
import type { RegisterRequest } from '../types/auth';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { from?: string } | null;
  const redirectTo = state?.from ?? '/dashboard';

  const [role, setRole] = useState<RegisterRequest['role']>('Customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [barberShopName, setBarberShopName] = useState('');
  const [barberShopAddress, setBarberShopAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName,
        email,
        phoneNumber,
        password,
        confirmPassword,
        role,
        ...(role === 'BarberShopOwner'
          ? {
              barberShopName: barberShopName.trim() || undefined,
              barberShopAddress: barberShopAddress.trim() || undefined,
            }
          : {}),
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar conta. Verifique os dados.');
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white border-[1.5px] border-on-surface shadow-[6px_6px_0px_#090D16] grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Panel */}
          <div className="md:col-span-5 bg-on-surface text-white p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 font-mono text-[10px] font-bold text-primary uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>NOVO REGISTRO // HUB.v2</span>
              </div>

              <h1 className="font-headline font-bold text-3xl uppercase tracking-tight leading-none">
                CRIE SUA CONTA NO <span className="text-primary">CLIPPER</span>
              </h1>

              <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed">
                {role === 'Customer'
                  ? 'Cadastre-se como cliente para reservar horários em 15 segundos, salvar suas preferências de corte e nunca mais esperar em fila.'
                  : 'Cadastre sua barbearia no ecossistema CLIPPER e sincronize suas bancadas e horários em tempo real.'}
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/15 font-mono text-[11px] text-slate-300 space-y-2">
              <div className="text-primary font-bold uppercase">// PROTOCOLO DE CONTA</div>
              <div>• Preenchimento automático no checkout</div>
              <div>• Digital Pass com QR Code na bancada</div>
              <div>• Cancelamento flexível em 1 clique</div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="md:col-span-7 p-8 sm:p-10 space-y-6">
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-widest">
                [ TIPO DE CONTA ]
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Customer')}
                  className={`p-3 border-[1.5px] border-on-surface font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === 'Customer'
                      ? 'bg-on-surface text-white shadow-[2px_2px_0px_#FF4D00]'
                      : 'bg-white text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>CLIENTE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('BarberShopOwner')}
                  className={`p-3 border-[1.5px] border-on-surface font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === 'BarberShopOwner'
                      ? 'bg-on-surface text-white shadow-[2px_2px_0px_#FF4D00]'
                      : 'bg-white text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  <Scissors className="w-4 h-4" />
                  <span>BARBEARIA</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                    NOME COMPLETO *
                  </span>
                  <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                    <User className="w-4 h-4 text-primary shrink-0" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                    WHATSAPP / TELEFONE *
                  </span>
                  <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                    />
                  </div>
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                  E-MAIL *
                </span>
                <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
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

              {role === 'BarberShopOwner' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                      NOME DA BARBEARIA *
                    </span>
                    <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      <input
                        type="text"
                        required
                        value={barberShopName}
                        onChange={(e) => setBarberShopName(e.target.value)}
                        placeholder="Ex: Grid Barber Lab"
                        className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                      />
                    </div>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                      ENDEREÇO DA UNIDADE *
                    </span>
                    <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <input
                        type="text"
                        required
                        value={barberShopAddress}
                        onChange={(e) => setBarberShopAddress(e.target.value)}
                        placeholder="Rua, número - Bairro"
                        className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                      />
                    </div>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                    SENHA *
                  </span>
                  <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                    <Lock className="w-4 h-4 text-primary shrink-0" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                    CONFIRMAR SENHA *
                  </span>
                  <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                    <Lock className="w-4 h-4 text-primary shrink-0" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                    />
                  </div>
                </label>
              </div>

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
                {submitting ? 'CRIANDO CONTA...' : 'CRIAR CONTA NO CLIPPER ↗'}
              </button>
            </form>

            <div className="pt-4 border-t-[1.5px] border-on-surface/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
              <span className="text-on-surface-variant">Já possui uma conta?</span>
              <Link
                to="/login"
                state={{ from: redirectTo }}
                className="font-bold text-on-surface hover:text-primary underline underline-offset-4 uppercase"
              >
                ENTRAR NA MINHA CONTA →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
