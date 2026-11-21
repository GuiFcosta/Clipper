import {
  Calendar,
  ExternalLink,
  Hourglass,
  Map,
  MapPin,
  RefreshCw,
  Scissors,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InternalNavbar } from '../components/layout/InternalNavbar';
import { useAuth } from '../contexts/AuthContext';
import type { CheckoutBookingState } from '../types/booking';

interface PastAppointment {
  id: string;
  dateTime: string;
  shopId: string;
  shopName: string;
  barberName: string;
  services: string;
  durationMin: number;
  price: number;
  paymentMethod: string;
  recent90Days: boolean;
}

const PAST_APPOINTMENTS: PastAppointment[] = [
  {
    id: 'hist-1',
    dateTime: '28 OUT 2026 • 15:30',
    shopId: 'grid-lab-01',
    shopName: 'GRID // BARBER LAB 01',
    barberName: 'Mestre Diego R.',
    services: 'Corte + Barba [50m]',
    durationMin: 50,
    price: 140,
    paymentMethod: 'Pix',
    recent90Days: true,
  },
  {
    id: 'hist-2',
    dateTime: '05 OUT 2026 • 18:00',
    shopId: 'kinetic-cuts',
    shopName: 'KINETIC CUTS HUB',
    barberName: 'Lucas Prado',
    services: 'Corte Clássico [30m]',
    durationMin: 30,
    price: 80,
    paymentMethod: 'Cartão',
    recent90Days: true,
  },
  {
    id: 'hist-3',
    dateTime: '14 SET 2026 • 11:15',
    shopId: 'vertice-studio',
    shopName: 'VÉRTICE STUDIO TECH',
    barberName: 'Alex Silva',
    services: 'Barboterapia & Hidratação [25m]',
    durationMin: 25,
    price: 60,
    paymentMethod: 'Pix',
    recent90Days: true,
  },
  {
    id: 'hist-4',
    dateTime: '22 AGO 2026 • 16:30',
    shopId: 'grid-lab-01',
    shopName: 'GRID // BARBER LAB 01',
    barberName: 'Mestre Diego R.',
    services: 'Combo Executivo Completo [60m]',
    durationMin: 60,
    price: 150,
    paymentMethod: 'Pix',
    recent90Days: false,
  },
];

export function MyAppointmentsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [historyFilter, setHistoryFilter] = useState<'all' | '90d'>('all');
  const [activeCancelled, setActiveCancelled] = useState(false);

  const filteredHistory =
    historyFilter === '90d'
      ? PAST_APPOINTMENTS.filter((item) => item.recent90Days)
      : PAST_APPOINTMENTS;

  function handleQuickRebook(
    shopId: string,
    shopName: string,
    barberName: string,
    slotTime: string,
    price: number,
    serviceName: string,
  ) {
    const state: CheckoutBookingState = {
      shopId,
      shopName,
      shopAddress: 'Pinheiros, São Paulo - SP',
      barberName,
      barberInitials: barberName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      barberBench: 'BANCADA #01',
      barberRating: '4.99',
      barberCutsCount: 240,
      dateLabel: slotTime,
      startTime: slotTime.split(' ').pop() ?? '10:30',
      endTime: '11:20',
      totalDuration: 50,
      totalPrice: price,
      services: [{ id: 'rebook', name: serviceName, durationMin: 50, price }],
    };
    navigate('/checkout', { state });
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface flex flex-col">
      <InternalNavbar activeTab="agendamentos" />

      <main className="w-full pt-16 flex-1">
        <div className="w-full px-4 lg:px-8 py-8 flex flex-col gap-8 max-w-[1520px] mx-auto">
          {/* 1. SUB-HEADER & STATUS PROTOCOL STRIP */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[1.5px] border-on-surface p-4 lg:p-5 shadow-[3px_3px_0px_0px_#090D16]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary inline-block" />
                <h1 className="font-headline font-bold text-xl md:text-2xl uppercase tracking-tight text-on-surface">
                  PAINEL DO CLIENTE // MEUS AGENDAMENTOS
                </h1>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-container-low border border-on-surface font-mono text-[11px] font-bold text-on-surface">
                <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
                <span>PROTOCOLO ATIVO [{user?.fullName ?? 'GUILHERME B.'}]</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-on-surface-variant bg-surface-container-low px-3 py-1.5 border border-on-surface/20">
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>CONTA SINCRONIZADA • BANCO DE DADOS REGIONAL SP</span>
              </div>
              <Link
                to="/b2b"
                className="px-3 py-1.5 bg-on-surface text-white hover:bg-primary font-mono text-[11px] font-bold uppercase transition-colors"
              >
                PAINEL B2B ↗
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="px-3 py-1.5 bg-white border-[1.5px] border-on-surface hover:bg-surface-variant font-mono text-[11px] font-bold uppercase cursor-pointer"
              >
                SAIR
              </button>
            </div>
          </div>

          {/* 2. TOP TELEMETRY KPI STRIP (3-Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white border-[1.5px] border-on-surface p-5 flex flex-col justify-between shadow-[3px_3px_0px_0px_#090D16]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  PRÓXIMO ATENDIMENTO
                </span>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="font-mono font-bold text-3xl lg:text-4xl text-on-surface tracking-tight my-1">
                {activeCancelled ? 'SEM RESERVA' : 'HOJE • 15:15'}
              </div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-live mt-2 bg-live/10 px-2 py-1 self-start">
                <span className="w-2 h-2 rounded-full bg-live" />
                <span>
                  {activeCancelled
                    ? 'CANCELADO PELO CLIENTE'
                    : 'EM 2h 15m • BANCADA NO HORÁRIO (0 min espera)'}
                </span>
              </div>
            </div>

            <div className="bg-white border-[1.5px] border-on-surface p-5 flex flex-col justify-between shadow-[3px_3px_0px_0px_#090D16]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  ATENDIMENTOS CONCLUÍDOS
                </span>
                <Scissors className="w-5 h-5 text-on-surface" />
              </div>
              <div className="font-mono font-bold text-3xl lg:text-4xl text-on-surface tracking-tight my-1">
                14 CORTES
              </div>
              <div className="font-mono text-xs font-semibold text-on-surface-variant mt-2 bg-surface-container-low px-2 py-1 self-start">
                FREQUÊNCIA: A CADA 21 DIAS • CLIENTE VIP NÍVEL 2
              </div>
            </div>

            <div className="bg-white border-[1.5px] border-on-surface p-5 flex flex-col justify-between shadow-[3px_3px_0px_0px_#090D16]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  TEMPO ECONOMIZADO SEM FILA
                </span>
                <Hourglass className="w-5 h-5 text-live" />
              </div>
              <div className="font-mono font-bold text-3xl lg:text-4xl text-on-surface tracking-tight my-1">
                5h 40m
              </div>
              <div className="font-mono text-xs font-semibold text-on-surface-variant mt-2 bg-surface-container-low px-2 py-1 self-start">
                ZERO CHÁ DE CADEIRA • 100% PONTUALIDADE SLA
              </div>
            </div>
          </div>

          {/* 3. ACTIVE UPCOMING APPOINTMENT HERO CARD */}
          {!activeCancelled && (
            <div className="bg-white border-[1.5px] border-on-surface shadow-[5px_5px_0px_0px_#090D16] overflow-hidden flex flex-col">
              <div className="bg-on-surface text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold tracking-wider text-primary">
                    ■ CLIPPER // DIGITAL PASS #CLP-8942
                  </span>
                  <span className="hidden sm:inline text-white/40">|</span>
                  <span className="flex items-center gap-1.5 text-live font-bold">
                    <span className="w-2 h-2 rounded-full bg-live animate-ping" />
                    CONFIRMADO • BANCADA #01 EM OPERAÇÃO NORMAL
                  </span>
                </div>
                <div className="bg-white/10 text-white px-2.5 py-0.5 font-bold uppercase tracking-wider text-[11px]">
                  SLOT TRAVADO: HOJE, 19 NOV
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Section */}
                <div className="lg:col-span-8 p-6 lg:p-8 flex flex-col justify-between gap-6 bg-white lg:border-r-[1.5px] border-on-surface">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">
                        UNIDADE &amp; LOCALIZAÇÃO
                      </div>
                      <h2 className="font-headline font-bold text-2xl md:text-3xl text-on-surface uppercase tracking-tight">
                        GRID // BARBER LAB 01
                      </h2>
                      <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-xs mt-1.5">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span>Rua dos Pinheiros, 842 — Pinheiros, São Paulo - SP</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-surface-container-low border border-on-surface font-mono text-xs font-bold text-on-surface self-start flex items-center gap-2">
                      <span className="w-2 h-2 bg-live rounded-full" />
                      <span>BANCADA #01 ATIVA</span>
                    </div>
                  </div>

                  {/* Nested Swiss Box */}
                  <div className="bg-surface-container-low border-[1.5px] border-on-surface p-5 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-on-surface/15 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white font-mono font-bold text-sm flex items-center justify-center border border-on-surface">
                          DR
                        </div>
                        <div>
                          <div className="font-mono text-[10px] uppercase font-bold text-on-surface-variant">
                            BARBEIRO DESIGNADO
                          </div>
                          <div className="font-headline font-bold text-base text-on-surface">
                            Mestre Diego R.
                          </div>
                        </div>
                      </div>
                      <div className="font-mono text-xs font-bold bg-white border border-on-surface px-2.5 py-1 text-on-surface flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="text-primary font-bold">★ 4.99</span>
                        <span className="text-on-surface-variant">• 240 cortes avaliados</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
                          SERVIÇOS CONTRATADOS
                        </span>
                        <p className="font-headline text-sm font-bold text-on-surface leading-snug">
                          Corte Clássico / Fade de Precisão [30m] + Barboterapia &amp; Toalha Quente
                          [20m]
                        </p>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
                          JANELA HORÁRIA SLA
                        </span>
                        <p className="font-mono text-sm font-bold text-on-surface">
                          HOJE, 19 NOV • 15:15 → 16:05
                          <span className="block text-xs font-normal text-on-surface-variant mt-0.5">
                            (DURAÇÃO: 50 MINUTOS)
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-on-surface/15 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                      <span className="text-on-surface-variant font-bold">
                        VALOR FIXADO &amp; LIQUIDAÇÃO:
                      </span>
                      <span className="font-bold text-on-surface bg-white border border-on-surface px-2 py-0.5">
                        R$ 140,00 • PAGAMENTO PÓS-ATENDIMENTO (NA BARBEARIA)
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to="/radar"
                      className="px-4 py-2.5 bg-white border-[1.5px] border-on-surface text-on-surface font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#090D16] hover:bg-surface-container-low transition-all flex items-center gap-2"
                    >
                      <Map className="w-4 h-4 text-primary" />
                      <span>[ ABRIR ROTA NO MAPA ↗ ]</span>
                    </Link>
                    <Link
                      to="/barbearia/grid-lab-01"
                      className="px-4 py-2.5 bg-surface-container-low border-[1.5px] border-on-surface text-on-surface font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#090D16] hover:bg-white transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>[ REAGENDAR SLOT ]</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveCancelled(true)}
                      className="px-3 py-2.5 text-on-surface-variant font-mono text-xs font-bold uppercase tracking-wider hover:text-primary transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>[ CANCELAR RESERVA ]</span>
                    </button>
                  </div>
                </div>

                {/* Right Section: QR Check-in */}
                <div className="lg:col-span-4 p-6 lg:p-8 bg-surface-container-low flex flex-col items-center justify-between gap-6">
                  <div className="w-full flex items-center justify-between pb-2">
                    <div className="font-mono text-xs uppercase tracking-wider font-bold text-on-surface flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-on-surface" />
                      CHECK-IN EXPRESSO NA BANCADA
                    </div>
                    <span className="font-mono text-[10px] text-on-surface-variant font-bold">
                      [TOTEM V.3]
                    </span>
                  </div>

                  <div className="p-3 bg-white border-[1.5px] border-on-surface shadow-[3px_3px_0px_0px_#090D16] flex flex-col items-center justify-center">
                    <svg className="w-40 h-40 text-on-surface" fill="currentColor" viewBox="0 0 160 160">
                      <rect height="35" width="35" x="10" y="10" />
                      <rect fill="#FFFFFF" height="25" width="25" x="15" y="15" />
                      <rect height="15" width="15" x="20" y="20" />
                      <rect height="35" width="35" x="115" y="10" />
                      <rect fill="#FFFFFF" height="25" width="25" x="120" y="15" />
                      <rect height="15" width="15" x="125" y="20" />
                      <rect height="35" width="35" x="10" y="115" />
                      <rect fill="#FFFFFF" height="25" width="25" x="15" y="120" />
                      <rect height="15" width="15" x="20" y="125" />
                      <rect height="8" width="8" x="55" y="15" />
                      <rect height="8" width="12" x="70" y="15" />
                      <rect height="8" width="15" x="90" y="15" />
                      <rect height="10" width="10" x="55" y="55" />
                      <rect height="8" width="12" x="75" y="55" />
                      <rect height="12" width="8" x="95" y="55" />
                      <rect height="8" width="15" x="65" y="75" />
                      <rect height="12" width="8" x="85" y="75" />
                      <rect height="8" width="12" x="105" y="75" />
                      <rect height="8" width="12" x="55" y="95" />
                      <rect height="12" width="8" x="75" y="95" />
                      <rect height="10" width="10" x="115" y="120" />
                    </svg>
                    <div className="mt-2 font-mono font-bold text-xs tracking-widest text-on-surface bg-surface-container-low px-2 py-0.5">
                      AUTENTICADOR CLP-AES256
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center text-center gap-1.5">
                    <span className="font-mono text-2xl font-bold tracking-wider text-on-surface">
                      #CLP-8942
                    </span>
                    <p className="font-headline text-xs font-bold text-on-surface uppercase tracking-tight">
                      APROXIME DO TOTEM OU TABLET DO MESTRE DIEGO R.
                    </p>
                    <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold text-live bg-white border border-on-surface px-2.5 py-1 w-full">
                      <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
                      <span>SINCRONIZADO COM O TABLET</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. QUICK 1-CLICK RE-BOOK STRIP */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h3 className="font-headline font-bold text-xl uppercase tracking-tight text-on-surface flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-primary" />
                REAGENDAR COM 1 CLIQUE // SEUS PROFISSIONAIS FAVORITOS
              </h3>
              <span className="font-mono text-xs text-on-surface-variant font-medium">
                Algoritmo detectou que seu corte costuma vencer esta semana.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border-[1.5px] border-on-surface p-6 shadow-[3px_3px_0px_0px_#090D16] flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-primary uppercase">
                        UNIDADE PINHEIROS
                      </span>
                      <h4 className="font-headline font-bold text-lg text-on-surface uppercase tracking-tight">
                        GRID // BARBER LAB 01
                      </h4>
                      <p className="font-mono text-xs font-semibold text-on-surface-variant mt-0.5">
                        Profissional: Mestre Diego R. (Fade &amp; Visagismo)
                      </p>
                    </div>
                    <div className="w-10 h-9 bg-surface-container-low border border-on-surface font-mono font-bold text-xs flex items-center justify-center text-on-surface">
                      ★ 4.9
                    </div>
                  </div>

                  <div className="font-mono text-xs font-bold text-on-surface-variant uppercase mt-1">
                    PRÓXIMAS JANELAS LIVRES:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {['AMANHÃ 10:30', 'SEX 16:00', 'SÁB 11:30'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          handleQuickRebook(
                            'grid-lab-01',
                            'GRID // BARBER LAB 01',
                            'Mestre Diego R.',
                            slot,
                            140,
                            'Fade + Barba',
                          )
                        }
                        className="px-2.5 py-1.5 bg-surface-container-low border border-on-surface text-on-surface font-mono text-xs font-bold hover:bg-on-surface hover:text-white transition-colors cursor-pointer"
                      >
                        [ {slot} ]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-on-surface/15 flex items-center justify-between gap-4">
                  <div className="font-mono text-xs font-bold text-on-surface">
                    ÚLTIMO CORTE: <span className="text-primary">FADE + BARBA</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickRebook(
                        'grid-lab-01',
                        'GRID // BARBER LAB 01',
                        'Mestre Diego R.',
                        'AMANHÃ 10:30',
                        140,
                        'Fade + Barba',
                      )
                    }
                    className="px-5 py-2.5 bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider border border-on-surface shadow-[2px_2px_0px_0px_#090D16] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
                  >
                    Repetir Corte (R$ 140) ↗
                  </button>
                </div>
              </div>

              <div className="bg-white border-[1.5px] border-on-surface p-6 shadow-[3px_3px_0px_0px_#090D16] flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-on-surface-variant uppercase">
                        UNIDADE VILA MADALENA
                      </span>
                      <h4 className="font-headline font-bold text-lg text-on-surface uppercase tracking-tight">
                        KINETIC CUTS HUB
                      </h4>
                      <p className="font-mono text-xs font-semibold text-on-surface-variant mt-0.5">
                        Profissional: Lucas &quot;Navalha&quot; Prado (Mullet &amp; Freestyle)
                      </p>
                    </div>
                    <div className="w-10 h-9 bg-surface-container-low border border-on-surface font-mono font-bold text-xs flex items-center justify-center text-on-surface">
                      ★ 4.8
                    </div>
                  </div>

                  <div className="font-mono text-xs font-bold text-on-surface-variant uppercase mt-1">
                    PRÓXIMAS JANELAS LIVRES:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {['HOJE 18:15', 'AMANHÃ 14:00', 'SÁB 15:00'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          handleQuickRebook(
                            'kinetic-cuts',
                            'KINETIC CUTS HUB',
                            'Lucas Prado',
                            slot,
                            80,
                            'Corte Clássico',
                          )
                        }
                        className="px-2.5 py-1.5 bg-surface-container-low border border-on-surface text-on-surface font-mono text-xs font-bold hover:bg-on-surface hover:text-white transition-colors cursor-pointer"
                      >
                        [ {slot} ]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-on-surface/15 flex items-center justify-between gap-4">
                  <div className="font-mono text-xs font-bold text-on-surface">
                    ÚLTIMO CORTE: <span>CORTE CLÁSSICO</span>
                  </div>
                  <Link
                    to="/barbearia/kinetic-cuts"
                    className="px-5 py-2.5 bg-on-surface text-white font-mono text-xs font-bold uppercase tracking-wider border border-on-surface shadow-[2px_2px_0px_0px_#FF4D00] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    Agendar Novo Horário ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 5. PAST APPOINTMENTS TABLE */}
          <div className="bg-white border-[1.5px] border-on-surface shadow-[4px_4px_0px_0px_#090D16] p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-headline font-bold text-xl uppercase tracking-tight text-on-surface flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-on-surface" />
                HISTÓRICO COMPLETO DE ATENDIMENTOS &amp; RECIBOS
              </h3>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3 py-1.5 border border-on-surface cursor-pointer transition-colors ${
                    historyFilter === 'all'
                      ? 'bg-on-surface text-white shadow-[2px_2px_0px_0px_#FF4D00]'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  [ TODOS ({PAST_APPOINTMENTS.length}) ]
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('90d')}
                  className={`px-3 py-1.5 border border-on-surface cursor-pointer transition-colors ${
                    historyFilter === '90d'
                      ? 'bg-on-surface text-white shadow-[2px_2px_0px_0px_#FF4D00]'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  [ ÚLTIMOS 90 DIAS ]
                </button>
                <span className="px-3 py-1.5 bg-surface-container-low border border-on-surface text-on-surface flex items-center gap-1">
                  <span>[ NOTAS FISCAIS</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>]</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-surface-container-low border-y-[1.5px] border-on-surface text-on-surface uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">DATA &amp; HORA</th>
                    <th className="py-3 px-4">UNIDADE &amp; PROFISSIONAL</th>
                    <th className="py-3 px-4">SERVIÇOS CONTRATADOS</th>
                    <th className="py-3 px-4">VALOR TOTAL</th>
                    <th className="py-3 px-4">STATUS TELEMETRIA</th>
                    <th className="py-3 px-4 text-right">AÇÃO RÁPIDA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-on-surface/15">
                  {filteredHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4 font-bold text-on-surface whitespace-nowrap">
                        {row.dateTime}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-headline font-bold text-sm text-on-surface">
                          {row.shopName}
                        </div>
                        <div className="text-on-surface-variant text-[11px]">{row.barberName}</div>
                      </td>
                      <td className="py-4 px-4 text-on-surface font-medium">{row.services}</td>
                      <td className="py-4 px-4 font-bold text-on-surface whitespace-nowrap">
                        R$ {row.price},00{' '}
                        <span className="text-[11px] font-normal text-on-surface-variant">
                          ({row.paymentMethod})
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-live/10 text-live font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-live" />
                          [ CONCLUÍDO ✓ ]
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickRebook(
                              row.shopId,
                              row.shopName,
                              row.barberName,
                              'AMANHÃ 10:30',
                              row.price,
                              row.services,
                            )
                          }
                          className="px-3 py-1.5 bg-surface-container-low border border-on-surface text-on-surface font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                          Repetir Corte ↗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
