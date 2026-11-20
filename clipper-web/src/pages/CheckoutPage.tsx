import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Timer,
  User,
  Zap,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { CheckoutBookingState } from '../types/booking';

const DEFAULT_BOOKING: CheckoutBookingState = {
  shopId: 'grid-lab-01',
  shopName: 'GRID // BARBER LAB 01',
  shopAddress: 'Rua dos Pinheiros, 842 — Pinheiros, São Paulo - SP',
  barberName: 'Mestre Diego R.',
  barberInitials: 'DR',
  barberBench: 'BANCADA #01',
  barberRating: '4.99',
  barberCutsCount: 240,
  dateLabel: 'HOJE • QUI 19 NOV',
  startTime: '15:15',
  endTime: '16:05',
  totalDuration: 50,
  totalPrice: 140,
  services: [
    { id: 'corte-fade', name: 'Corte Clássico / Fade de Precisão', durationMin: 30, price: 85 },
    { id: 'barboterapia', name: 'Barboterapia & Toalha Quente', durationMin: 20, price: 55 },
  ],
};

const VISAGISM_CHIPS = [
  'Fade Baixo 0.5',
  'Tesoura no Topo',
  'Barba Alinhada na Navalha',
  'Toalha Bem Quente',
  'Café Espresso Curto',
];

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const stateBooking = location.state as CheckoutBookingState | null;
  const booking = stateBooking ?? DEFAULT_BOOKING;

  // Countdown timer (04:48 = 288s)
  const [secondsLeft, setSecondsLeft] = useState(288);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const timerDisplay =
    secondsLeft > 0
      ? `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`
      : 'EXPIRADO';

  // Guest identification state (only needed when !isAuthenticated)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Notes & chips
  const [selectedChips, setSelectedChips] = useState<string[]>([
    'Fade Baixo 0.5',
    'Barba Alinhada na Navalha',
  ]);
  const [notes, setNotes] = useState(
    'Degradê baixo na 0.5 mantendo volume natural em cima. Acabamento fino nas têmporas e toalha extra quente na barba.',
  );

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'bench' | 'pix' | 'card'>('bench');

  // Booking confirmation status
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'confirmed'>('idle');

  const finalPrice = paymentMethod === 'pix' ? booking.totalPrice * 0.95 : booking.totalPrice;
  const displayClientName = isAuthenticated && user ? user.fullName : guestName.trim() || 'CONVIDADO';

  function toggleChip(chip: string) {
    setSelectedChips((prev) => {
      const exists = prev.includes(chip);
      if (exists) {
        return prev.filter((item) => item !== chip);
      }
      if (!notes.includes(chip)) {
        setNotes((curr) => (curr ? `${curr} • ${chip}` : chip));
      }
      return [...prev, chip];
    });
  }

  function handleConfirmBooking(e?: FormEvent) {
    if (e) e.preventDefault();
    if (bookingStatus !== 'idle') return;

    if (!isAuthenticated) {
      if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
        setFormError(
          'Preencha seu nome, e-mail e número de telefone para finalizar sem conta, ou entre na sua conta Clipper.',
        );
        return;
      }
    }

    setFormError(null);
    setBookingStatus('submitting');
    setTimeout(() => {
      setBookingStatus('confirmed');
    }, 900);
  }

  return (
    <div className="min-h-screen bg-surface-variant text-on-surface flex flex-col">
      {/* Checkout Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b-[1.5px] border-on-surface">
        <div className="h-16 w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 border-r-[1.5px] border-on-surface pr-6">
              <span className="w-3 h-3 bg-primary block" />
              <span className="font-headline font-bold text-lg tracking-wider text-on-surface uppercase">
                CLIPPER<span className="text-primary">//</span>HUB.v2
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2 font-mono text-xs text-on-surface-variant tracking-tight">
              <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
              <span>RADAR: ONLINE</span>
              <span className="text-on-surface/30">/</span>
              <span>SYS_LATENCY: 12ms</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center border-[1.5px] border-on-surface divide-x-[1.5px] divide-on-surface text-xs font-mono tracking-wider uppercase">
            <Link
              to={`/barbearia/${booking.shopId}`}
              className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
            >
              <span>01</span>
              <span>SERVIÇOS</span>
            </Link>
            <Link
              to={`/barbearia/${booking.shopId}`}
              className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
            >
              <span>02</span>
              <span>BARBEIRO</span>
            </Link>
            <Link
              to={`/barbearia/${booking.shopId}`}
              className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
            >
              <span>03</span>
              <span>HORÁRIO</span>
            </Link>
            <span className="px-4 py-2 bg-on-surface text-white font-bold flex items-center gap-1.5">
              <span>04</span>
              <span>CHECKOUT</span>
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center border-[1.5px] border-on-surface px-3 py-1.5 bg-white text-xs font-mono font-bold text-on-surface uppercase gap-2">
              <span className="text-primary">UNIT:</span>
              <span>{booking.shopId.toUpperCase()}</span>
            </div>
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-[1.5px] border-on-surface"
            >
              <User className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* Telemetry Sub-Navigation Bar */}
        <section className="w-full bg-white border-b-[1.5px] border-on-surface px-4 lg:px-8 py-3 select-none">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <Link
              to={`/barbearia/${booking.shopId}`}
              className="flex items-center gap-2 font-mono text-xs font-bold text-on-surface hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>VOLTAR PARA A GRADE DE HORÁRIOS</span>
            </Link>

            {/* Progress Telemetry Stepper */}
            <div className="flex items-center font-mono text-xs tracking-tight overflow-x-auto py-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant/70">
                <span className="w-4 h-4 bg-on-surface/10 text-on-surface flex items-center justify-center font-bold text-[10px]">
                  01
                </span>
                <span>SERVIÇOS</span>
                <span className="text-live font-bold">✓</span>
              </div>
              <span className="mx-3 text-on-surface/30">──────</span>
              <div className="flex items-center gap-1.5 text-on-surface-variant/70">
                <span className="w-4 h-4 bg-on-surface/10 text-on-surface flex items-center justify-center font-bold text-[10px]">
                  02
                </span>
                <span>BANCADA &amp; BARBEIRO</span>
                <span className="text-live font-bold">✓</span>
              </div>
              <span className="mx-3 text-on-surface/30">──────</span>
              <div className="flex items-center gap-2 bg-on-surface text-white px-2.5 py-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="tracking-wider">03 CONFIRMAÇÃO 15S</span>
              </div>
            </div>

            {/* Live Slot Lock Monospace Badge */}
            <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-variant px-3 py-1.5 font-mono text-xs font-bold">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-on-surface-variant">SLOT TRAVADO POR:</span>
              <span
                className={`px-1.5 py-0.5 tracking-wider font-bold ${
                  secondsLeft === 0 ? 'bg-primary text-white' : 'bg-on-surface text-white'
                }`}
              >
                {timerDisplay}
              </span>
            </div>
          </div>
        </section>

        {/* Architectural 2-Column Swiss Grid Layout */}
        <section className="w-full px-4 lg:px-8 py-8 lg:py-10 flex-1">
          <form
            onSubmit={handleConfirmBooking}
            className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* LEFT COLUMN: Configuration & Guest/Auth Form (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* BLOCK 01: Slot Allocation Protocol */}
              <div className="bg-white border-[1.5px] border-on-surface shadow-[3px_3px_0px_#090D16] overflow-hidden">
                <div className="bg-surface-variant border-b-[1.5px] border-on-surface px-6 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-on-surface">
                    <span className="w-2 h-2 bg-primary inline-block" />
                    <span>PROTOCOLO DE ALOCAÇÃO #SLOT-9021</span>
                  </div>
                  <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-tight">
                    STATUS: LOCKED // IN-PIPELINE
                  </span>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase block mb-1">
                        LOCALIZAÇÃO &amp; UNIDADE
                      </span>
                      <h1 className="font-headline font-bold text-2xl md:text-3xl text-on-surface tracking-tight uppercase">
                        {booking.shopName}
                      </h1>
                      <p className="font-body text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-on-surface shrink-0" />
                        <span>{booking.shopAddress}</span>
                      </p>
                    </div>
                    <div className="border-[1.5px] border-on-surface p-3 bg-surface-variant flex md:flex-col items-center justify-between gap-2 shrink-0">
                      <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant">
                        BANCADA ALOCADA
                      </span>
                      <span className="font-headline font-bold text-xl text-primary">
                        {booking.barberBench}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="border-[1.5px] border-on-surface p-4 bg-white flex items-center gap-3">
                      <div className="w-12 h-12 bg-on-surface text-white flex items-center justify-center font-headline font-bold text-lg border-[1.5px] border-on-surface shrink-0">
                        {booking.barberInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-[10px] text-on-surface-variant uppercase font-bold">
                          PROFISSIONAL TITULAR
                        </span>
                        <span className="font-headline font-bold text-base text-on-surface truncate">
                          {booking.barberName}
                        </span>
                        {booking.barberRating && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-primary text-xs font-mono font-bold">
                              ★ {booking.barberRating}
                            </span>
                            <span className="text-[11px] font-mono text-on-surface-variant">
                              ({booking.barberCutsCount ?? 240} cortes avaliados)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-[1.5px] border-on-surface p-4 bg-white flex flex-col justify-center">
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase font-bold">
                        JANELA DE HORÁRIO PRECISO
                      </span>
                      <span className="font-mono font-bold text-base text-on-surface tracking-tight mt-0.5">
                        {booking.dateLabel} • {booking.startTime} → {booking.endTime}
                      </span>
                      <span className="font-mono text-[11px] text-primary font-bold mt-1">
                        DURAÇÃO TOTAL: {booking.totalDuration} MINUTOS
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-variant border-[1.5px] border-on-surface p-3 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-live animate-pulse shrink-0" />
                    <span className="font-mono text-xs text-on-surface font-medium tracking-tight">
                      SINCRONIZADO VIA WEBSOCKET // ZERO CONFLITO NA GRADE EM TEMPO REAL
                    </span>
                  </div>
                </div>
              </div>

              {/* BLOCK 02: IDENTIFICAÇÃO (CONVIDADO SEM CONTA OU CONTA CLIPPER) */}
              <div className="bg-white border-[1.5px] border-on-surface shadow-[3px_3px_0px_#090D16] p-6 md:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-on-surface/15 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary inline-block" />
                    <h2 className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">
                      IDENTIFICAÇÃO DO CLIENTE
                    </h2>
                  </div>

                  {isAuthenticated && user ? (
                    <span className="font-mono text-[11px] font-bold text-live bg-live/10 border border-live px-2 py-0.5 uppercase">
                      ✓ CONTA CONECTADA
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 border border-primary px-2 py-0.5 uppercase">
                      SEM CONTA OU LOGIN RÁPIDO
                    </span>
                  )}
                </div>

                {isAuthenticated && user ? (
                  <div className="p-4 bg-surface-container-low border-[1.5px] border-live flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-mono text-xs font-bold text-live uppercase">
                        ● DADOS PREENCHIDOS AUTOMATICAMENTE PELA SUA CONTA
                      </div>
                      <div className="font-headline font-bold text-base text-on-surface">
                        {user.fullName}
                      </div>
                      <div className="font-mono text-xs text-on-surface-variant">{user.email}</div>
                    </div>
                    <span className="font-mono text-[11px] font-bold bg-white border border-on-surface px-3 py-1.5 text-on-surface shrink-0">
                      NENHUM FORMULÁRIO NECESSÁRIO ✓
                    </span>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Option Banner to Login / Create Account */}
                    <div className="p-4 bg-surface-variant border-[1.5px] border-on-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-bold text-on-surface uppercase">
                          JÁ TEM CONTA OU QUER CRIAR UMA AGORA?
                        </div>
                        <p className="font-body text-xs text-on-surface-variant">
                          Entrando na sua conta Clipper você não precisa preencher nenhum dado abaixo.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                        className="px-4 py-2.5 bg-on-surface hover:bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                      >
                        ENTRAR / CRIAR CONTA ↗
                      </button>
                    </div>

                    {/* Guest Form */}
                    <div className="space-y-4">
                      <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                        OU CONTINUE SEM CONTA PREENCHENDO SEUS DADOS:
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1.5">
                          <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                            NOME COMPLETO *
                          </span>
                          <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                            <User className="w-4 h-4 text-primary shrink-0" />
                            <input
                              type="text"
                              required
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              placeholder="Ex: Guilherme Silva"
                              className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                            />
                          </div>
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                            NÚMERO / WHATSAPP *
                          </span>
                          <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                            <Phone className="w-4 h-4 text-primary shrink-0" />
                            <input
                              type="tel"
                              required
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              placeholder="(11) 99999-9999"
                              className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                            />
                          </div>
                        </label>
                      </div>

                      <label className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] font-bold uppercase text-on-surface">
                          E-MAIL PARA RECEBER O DIGITAL PASS *
                        </span>
                        <div className="flex items-center gap-2 border-[1.5px] border-on-surface bg-surface-container-low px-3 py-2.5 focus-within:border-primary focus-within:bg-white">
                          <Mail className="w-4 h-4 text-primary shrink-0" />
                          <input
                            type="email"
                            required
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="voce@email.com"
                            className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {formError && (
                  <div className="p-3 bg-primary/10 border-[1.5px] border-primary font-mono text-xs font-bold text-primary">
                    ⚠ {formError}
                  </div>
                )}
              </div>

              {/* BLOCK 03: Bench Visagism Notes & Quick Directives */}
              <div className="bg-white border-[1.5px] border-on-surface shadow-[3px_3px_0px_#090D16] p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-on-surface inline-block" />
                    <h2 className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">
                      NOTAS PARA A BANCADA // INSTRUÇÕES DE CORTE &amp; VISAGISMO
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant uppercase">
                    [OPCIONAL]
                  </span>
                </div>

                <p className="font-body text-xs text-on-surface-variant mb-4">
                  Selecione parâmetros rápidos de personalização ou descreva preferências específicas
                  para a execução pelo barbeiro.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {VISAGISM_CHIPS.map((chip) => {
                    const isSelected = selectedChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip(chip)}
                        className={`border-[1.5px] border-on-surface px-3 py-1 font-mono text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-on-surface text-white hover:bg-primary hover:border-primary'
                            : 'bg-white text-on-surface hover:border-primary hover:text-primary'
                        }`}
                      >
                        {isSelected ? `✓ ${chip}` : `+ ${chip}`}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione observações de visagismo, altura do fade, preferência de bebida..."
                    className="w-full bg-surface-variant border-[1.5px] border-on-surface p-3 font-mono text-xs text-on-surface focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none leading-relaxed"
                  />
                  <div className="mt-1 text-right font-mono text-[10px] text-on-surface-variant font-bold">
                    STREAM: BENCH-DIRECT-INPUT
                  </div>
                </div>
              </div>

              {/* BLOCK 04: Payment Protocol Selection */}
              <div className="bg-white border-[1.5px] border-on-surface shadow-[3px_3px_0px_#090D16] p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-primary inline-block" />
                  <h2 className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">
                    FORMA DE PAGAMENTO &amp; PROTOCOLO DE CHECK-IN
                  </h2>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Option 1: Bench */}
                  <label
                    className={`cursor-pointer border-[1.5px] p-4 flex items-start gap-4 transition-all ${
                      paymentMethod === 'bench'
                        ? 'border-primary bg-white'
                        : 'border-on-surface bg-surface-variant/30 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'bench'}
                      onChange={() => setPaymentMethod('bench')}
                      className="mt-1 accent-primary cursor-pointer w-4 h-4"
                    />
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-headline font-bold text-sm text-on-surface uppercase tracking-tight">
                          Pagar na Barbearia (Zero Cobrança Prévia)
                        </span>
                        {paymentMethod === 'bench' && (
                          <span className="font-mono text-[10px] bg-primary text-white px-2 py-0.5 font-bold uppercase">
                            [✓ SELECIONADO]
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                        Pague diretamente na bancada via Pix, Cartão de Débito ou Crédito após o
                        término do serviço. Zero trava no cartão no ato da reserva.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Pix */}
                  <label
                    className={`cursor-pointer border-[1.5px] p-4 flex items-start gap-4 transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-primary bg-white'
                        : 'border-on-surface bg-surface-variant/30 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                      className="mt-1 accent-primary cursor-pointer w-4 h-4"
                    />
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-sm text-on-surface uppercase tracking-tight">
                            Pix Instantâneo (Check-out Expresso)
                          </span>
                          <span className="font-mono text-[10px] bg-live/15 text-live px-1.5 py-0.5 font-bold">
                            -5% OFF
                          </span>
                        </div>
                        {paymentMethod === 'pix' && (
                          <span className="font-mono text-[10px] bg-primary text-white px-2 py-0.5 font-bold uppercase">
                            [✓ SELECIONADO]
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                        Gera QR Code imediato com 5% de desconto de pontualidade. Saída express
                        liberada sem fila de caixa na recepção.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Saved Card */}
                  <label
                    className={`cursor-pointer border-[1.5px] p-4 flex items-start gap-4 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-white'
                        : 'border-on-surface bg-surface-variant/30 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-1 accent-primary cursor-pointer w-4 h-4"
                    />
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-headline font-bold text-sm text-on-surface uppercase tracking-tight">
                          Cartão de Crédito (Cobrança Pós-Check-in)
                        </span>
                        {paymentMethod === 'card' && (
                          <span className="font-mono text-[10px] bg-primary text-white px-2 py-0.5 font-bold uppercase">
                            [✓ SELECIONADO]
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                        Cobrança processada apenas após a confirmação física do seu check-in na
                        cadeira do barbeiro.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* BLOCK 05: Clipper Policy Guarantee */}
              <div className="border-[1.5px] border-on-surface bg-white p-4 md:p-5 flex items-start gap-4 font-mono">
                <div className="w-8 h-8 bg-on-surface text-white flex items-center justify-center shrink-0 border-[1.5px] border-on-surface">
                  <ShieldCheck className="w-4 h-4 text-live" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    GARANTIA DE PONTUALIDADE &amp; CANCELAMENTO FLEXÍVEL CLIPPER
                  </span>
                  <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                    Cancelamento ou reagendamento sem custo com 1-clique até 2 horas antes do
                    horário. Tolerância de bancada de 10 minutos assegurada por SLA de telemetria.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Digital Boarding Pass Ticket Preview (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col">
              <div className="bg-white border-[1.5px] border-on-surface shadow-[4px_4px_0px_#090D16] relative">
                {/* Boarding Pass Header Stamp */}
                <div className="bg-on-surface text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary block" />
                    <span className="font-headline font-bold text-sm md:text-base tracking-wider uppercase">
                      CLIPPER // DIGITAL PASS
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary tracking-widest">
                    #CLP-8942
                  </span>
                </div>

                {/* Ticket Sub-grid Metadata */}
                <div className="grid grid-cols-3 border-b-[1.5px] border-on-surface divide-x-[1.5px] divide-on-surface bg-surface-variant font-mono text-[11px]">
                  <div className="p-3 flex flex-col">
                    <span className="text-on-surface-variant text-[9px] uppercase font-bold">
                      CLIENTE
                    </span>
                    <span className="font-bold text-on-surface mt-0.5 truncate uppercase">
                      {displayClientName}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col">
                    <span className="text-on-surface-variant text-[9px] uppercase font-bold">
                      STATUS
                    </span>
                    <span
                      className={`font-bold mt-0.5 ${
                        bookingStatus === 'confirmed' ? 'text-live' : 'text-primary'
                      }`}
                    >
                      {bookingStatus === 'confirmed' ? 'CONFIRMADO ✓' : 'PRÉ-RESERVA'}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col">
                    <span className="text-on-surface-variant text-[9px] uppercase font-bold">
                      CHECK-IN
                    </span>
                    <span className="font-bold text-on-surface mt-0.5">{booking.startTime}</span>
                  </div>
                </div>

                {/* Services Breakdown */}
                <div className="p-6 flex flex-col gap-4 font-mono text-xs">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    DISCRIMINAÇÃO DOS SERVIÇOS &amp; ALOCAÇÃO
                  </span>

                  <div className="flex flex-col gap-3">
                    {booking.services.map((srv) => (
                      <div
                        key={srv.id}
                        className="flex items-center justify-between gap-2 border-b-[1.5px] border-dashed border-on-surface/20 pb-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{srv.name}</span>
                          <span className="text-[10px] text-on-surface-variant">
                            Slot alocado: {srv.durationMin} minutos
                          </span>
                        </div>
                        <span className="font-bold text-on-surface shrink-0">
                          {formatBRL(srv.price)}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between gap-2 border-b-[1.5px] border-dashed border-on-surface/20 pb-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">
                          Buffer Técnico de Higienização
                        </span>
                        <span className="text-[10px] text-live font-bold">
                          Intervalo preventivo (5 min)
                        </span>
                      </div>
                      <span className="font-bold text-live shrink-0">R$ 0,00 [CORTESIA]</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">
                          Taxa de Telemetria Clipper Hub
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          Garantia anti-overbooking
                        </span>
                      </div>
                      <span className="font-bold text-on-surface-variant shrink-0">
                        R$ 0,00 [ISENTO]
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perforated Ticket Notches & Divider */}
                <div className="relative w-full flex items-center py-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-surface-variant border-[1.5px] border-on-surface absolute -left-3.5 z-10" />
                  <div className="w-full border-t-[1.5px] border-dashed border-on-surface mx-4" />
                  <div className="w-6 h-6 rounded-full bg-surface-variant border-[1.5px] border-on-surface absolute -right-3.5 z-10" />
                </div>

                {/* Total Calculation Section */}
                <div className="p-6 bg-white flex flex-col gap-4">
                  <div className="flex items-end justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant block">
                        VALOR TOTAL CONTRATADO
                      </span>
                      <span className="font-headline font-bold text-3xl md:text-4xl text-on-surface tracking-tight">
                        {formatBRL(finalPrice)}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 border-[1.5px] border-primary px-2.5 py-1">
                      {paymentMethod === 'pix'
                        ? 'PIX EXPRESSO (-5%)'
                        : paymentMethod === 'card'
                          ? 'CARTÃO PÓS-CHECK-IN'
                          : 'PAGAMENTO NA BARBEARIA'}
                    </span>
                  </div>

                  {/* Stylized Monochrome QR Code Radar Box */}
                  <div className="border-[1.5px] border-on-surface p-4 bg-surface-variant flex flex-col items-center justify-center gap-3 relative">
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-on-surface" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-on-surface" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-on-surface" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-on-surface" />

                    <div className="w-24 h-24 bg-white border-[1.5px] border-on-surface p-1.5 flex items-center justify-center">
                      <svg className="w-full h-full text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                        <rect fill="currentColor" height="30" width="30" x="5" y="5" />
                        <rect fill="#FFFFFF" height="20" width="20" x="10" y="10" />
                        <rect fill="currentColor" height="10" width="10" x="15" y="15" />
                        <rect fill="currentColor" height="30" width="30" x="65" y="5" />
                        <rect fill="#FFFFFF" height="20" width="20" x="70" y="10" />
                        <rect fill="currentColor" height="10" width="10" x="75" y="15" />
                        <rect fill="currentColor" height="30" width="30" x="5" y="65" />
                        <rect fill="#FFFFFF" height="20" width="20" x="10" y="70" />
                        <rect fill="currentColor" height="10" width="10" x="15" y="75" />
                        <rect height="6" width="6" x="42" y="10" />
                        <rect height="6" width="6" x="52" y="15" />
                        <rect height="6" width="6" x="42" y="25" />
                        <rect height="12" width="12" x="45" y="45" />
                        <rect height="8" width="6" x="20" y="45" />
                        <rect height="6" width="8" x="70" y="45" />
                        <rect height="12" width="6" x="42" y="65" />
                        <rect height="6" width="10" x="65" y="65" />
                        <rect height="8" width="8" x="80" y="75" />
                        <rect height="12" width="6" x="55" y="80" />
                        <rect height="6" width="12" x="70" y="85" />
                      </svg>
                    </div>

                    <div className="text-center font-mono">
                      <span className="text-[11px] font-bold text-on-surface block">
                        QR CODE DE CHECK-IN AUTOMÁTICO
                      </span>
                      <span className="text-[9px] text-on-surface-variant block mt-0.5">
                        {bookingStatus === 'confirmed'
                          ? 'LIBERADO PARA LEITURA NA BANCADA ✓'
                          : 'ATIVADO IMEDIATAMENTE APÓS A CONFIRMAÇÃO'}
                      </span>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={bookingStatus === 'submitting'}
                    className={`w-full font-headline font-bold text-base md:text-lg py-4 px-6 border-[1.5px] border-on-surface shadow-[4px_4px_0px_#090D16] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#090D16] transition-all flex items-center justify-center gap-3 uppercase tracking-wider cursor-pointer ${
                      bookingStatus === 'confirmed'
                        ? 'bg-live text-white'
                        : bookingStatus === 'submitting'
                          ? 'bg-on-surface text-white'
                          : 'bg-primary hover:bg-[#e04400] text-white'
                    }`}
                  >
                    {bookingStatus === 'submitting' ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>TRANSMITINDO TELEMETRIA...</span>
                      </>
                    ) : bookingStatus === 'confirmed' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>RESERVA CONCLUÍDA • #CLP-8942</span>
                      </>
                    ) : (
                      <>
                        <span>CONFIRMAR RESERVA EM 15s</span>
                        <Zap className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {bookingStatus === 'confirmed' && (
                    <div className="p-3 bg-live/10 border border-live font-mono text-xs text-on-surface space-y-1">
                      <div className="font-bold text-live">
                        ✓ DIGITAL PASS ENVIADO COM SUCESSO
                      </div>
                      <div>
                        Comprovante encaminhado para{' '}
                        <strong>{isAuthenticated && user ? user.email : guestEmail}</strong>.
                      </div>
                    </div>
                  )}

                  {/* Telemetry Micro-Notices */}
                  <div className="flex flex-col gap-1.5 pt-2 font-mono text-[10px] text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">⚡</span>
                      <span>
                        Notificação de bancada enviada em &lt;100ms ao tablet de{' '}
                        {booking.barberName}.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-live shrink-0" />
                      <span>
                        Transação criptografada ponta a ponta • Protocolo Anti-Overbooking v2.4
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Decorative Barcode Simulation Strip */}
                <div className="bg-surface-variant border-t-[1.5px] border-on-surface p-3 flex items-center justify-between font-mono text-[9px] text-on-surface-variant overflow-hidden">
                  <span>HASH: 8F02B-AA91-PINHEIROS</span>
                  <div className="flex items-center gap-0.5 h-4 opacity-75">
                    <span className="w-0.5 h-full bg-on-surface" />
                    <span className="w-1.5 h-full bg-on-surface" />
                    <span className="w-0.5 h-full bg-on-surface" />
                    <span className="w-1 h-full bg-on-surface" />
                    <span className="w-2 h-full bg-on-surface" />
                    <span className="w-0.5 h-full bg-on-surface" />
                    <span className="w-1.5 h-full bg-on-surface" />
                    <span className="w-0.5 h-full bg-on-surface" />
                    <span className="w-2 h-full bg-on-surface" />
                    <span className="w-1 h-full bg-on-surface" />
                  </div>
                  <span>LOC: SP-BR // UTC-3</span>
                </div>
              </div>
            </div>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t-[1.5px] border-on-surface py-6 font-mono text-xs mt-auto">
        <div className="w-full px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-on-surface-variant">
            <span className="text-on-surface font-bold uppercase tracking-wider">
              CLIPPER ENGINE v2.4.9
            </span>
            <span className="text-on-surface/20">|</span>
            <span>ALL BOOKINGS PRECISION TIME-LOCKED</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-on-surface-variant uppercase">HARDWARE_STATUS</span>
            <span className="text-on-surface-variant uppercase">PROTOCOL_TERMS</span>
            <span className="text-on-surface font-bold">© 2026 CLIPPER TECH GROUP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
