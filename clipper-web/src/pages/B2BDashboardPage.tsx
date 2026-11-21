import { CheckCircle2, ChevronLeft, ChevronRight, LogOut, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface B2BReservation {
  id: string;
  code: string;
  bench: string;
  barberName: string;
  clientName: string;
  visitsLabel: string;
  timeRange: string;
  durationMin: number;
  services: string;
  price: number;
  paymentNote: string;
  clientNote?: string;
  status: 'in_chair' | 'confirmed' | 'completed';
}

interface B2BBarberConfig {
  id: string;
  bench: string;
  name: string;
  schedule: string;
  rating: string;
  commission: string;
  tags: string[];
  online: boolean;
}

interface B2BServiceConfig {
  id: string;
  name: string;
  duration: string;
  buffer: string;
  price: string;
  barbers: string;
  active: boolean;
}

interface B2BTimeBlock {
  id: string;
  target: string;
  windowLabel: string;
  reason: string;
  recurringLabel: string;
}

const INITIAL_RESERVATIONS: B2BReservation[] = [
  {
    id: 'res-1',
    code: '#CLP-8930',
    bench: 'BANCADA #01',
    barberName: 'Mestre Diego R.',
    clientName: 'Rafael Mendes',
    visitsLabel: '6 visitas',
    timeRange: '14:30 → 15:05',
    durationMin: 35,
    services: 'Corte Fade [30m]',
    price: 85,
    paymentNote: 'PAGO (PIX)',
    status: 'in_chair',
  },
  {
    id: 'res-2',
    code: '#CLP-8942',
    bench: 'BANCADA #01',
    barberName: 'Mestre Diego R.',
    clientName: 'Guilherme B.',
    visitsLabel: '14 visitas • Cliente VIP',
    timeRange: '15:15 → 16:05',
    durationMin: 50,
    services: 'Corte Clássico / Fade [30m] + Barboterapia [20m]',
    price: 140,
    paymentNote: 'Pagar na Barbearia',
    clientNote: 'Degradê baixo na 0.5 mantendo volume natural em cima.',
    status: 'confirmed',
  },
  {
    id: 'res-3',
    code: '#CLP-8951',
    bench: 'BANCADA #02',
    barberName: 'Lucas "Navalha"',
    clientName: 'Thiago Alves',
    visitsLabel: '3 visitas',
    timeRange: '15:45 → 16:20',
    durationMin: 35,
    services: 'Corte Freestyle + Linhas [35m]',
    price: 80,
    paymentNote: 'Pagar na Barbearia',
    status: 'confirmed',
  },
  {
    id: 'res-4',
    code: '#CLP-8948',
    bench: 'BANCADA #03',
    barberName: 'Alex Silva',
    clientName: 'Pedro Henrique',
    visitsLabel: '9 visitas',
    timeRange: '14:45 → 15:30',
    durationMin: 45,
    services: 'Barboterapia Real & Vapor [45m]',
    price: 65,
    paymentNote: 'PAGO (PIX)',
    status: 'in_chair',
  },
  {
    id: 'res-5',
    code: '#CLP-8960',
    bench: 'BANCADA #03',
    barberName: 'Alex Silva',
    clientName: 'Marcelo Lima',
    visitsLabel: '5 visitas',
    timeRange: '16:00 → 16:45',
    durationMin: 45,
    services: 'Corte Clássico na Tesoura [45m]',
    price: 90,
    paymentNote: 'Cartão Salvo',
    status: 'confirmed',
  },
  {
    id: 'res-6',
    code: '#CLP-8974',
    bench: 'BANCADA #04',
    barberName: 'Renan Costa',
    clientName: 'André Silva',
    visitsLabel: '2 visitas',
    timeRange: '16:00 → 16:45',
    durationMin: 45,
    services: 'Combo Executivo Completo',
    price: 150,
    paymentNote: 'Pagar na Barbearia',
    status: 'confirmed',
  },
];

const INITIAL_BARBERS: B2BBarberConfig[] = [
  {
    id: 'b1',
    bench: 'BANCADA #01',
    name: 'Mestre Diego R.',
    schedule: 'SEG–SÁB • 09:00–20:00',
    rating: '4.99',
    commission: '50% COMISSÃO',
    tags: ['Fade', 'Visagismo'],
    online: true,
  },
  {
    id: 'b2',
    bench: 'BANCADA #02',
    name: 'Lucas "Navalha"',
    schedule: 'TER–SÁB • 10:00–21:00',
    rating: '4.95',
    commission: '45% COMISSÃO',
    tags: ['Mullet', 'Freestyle'],
    online: true,
  },
  {
    id: 'b3',
    bench: 'BANCADA #03',
    name: 'Alex Silva',
    schedule: 'SEG–SEX • 09:00–19:00',
    rating: '4.97',
    commission: '50% COMISSÃO',
    tags: ['Barboterapia', 'Clássico'],
    online: true,
  },
  {
    id: 'b4',
    bench: 'BANCADA #04',
    name: 'Renan Costa',
    schedule: 'QUA–DOM • 11:00–20:00',
    rating: '4.92',
    commission: '45% COMISSÃO',
    tags: ['Combo', 'Degradê'],
    online: false,
  },
];

const INITIAL_SERVICES: B2BServiceConfig[] = [
  {
    id: 's1',
    name: 'Corte Clássico / Fade de Precisão',
    duration: '30 MIN',
    buffer: '+5 MIN',
    price: 'R$ 85,00',
    barbers: 'Todos (4)',
    active: true,
  },
  {
    id: 's2',
    name: 'Barboterapia & Toalha Quente',
    duration: '20 MIN',
    buffer: '+5 MIN',
    price: 'R$ 55,00',
    barbers: 'Diego, Alex',
    active: true,
  },
  {
    id: 's3',
    name: 'Combo Executivo (Corte + Barba)',
    duration: '50 MIN',
    buffer: '+5 MIN',
    price: 'R$ 140,00',
    barbers: 'Todos (4)',
    active: true,
  },
  {
    id: 's4',
    name: 'Acabamento / Pezinho & Sobrancelha',
    duration: '15 MIN',
    buffer: '+0 MIN',
    price: 'R$ 35,00',
    barbers: 'Todos (4)',
    active: true,
  },
  {
    id: 's5',
    name: 'Platinado / Freestyle Artístico',
    duration: '90 MIN',
    buffer: '+10 MIN',
    price: 'R$ 220,00',
    barbers: 'Lucas',
    active: true,
  },
];

const INITIAL_TIMEBLOCKS: B2BTimeBlock[] = [
  {
    id: 'tb-1',
    target: 'RENAN COSTA',
    windowLabel: '15:00–16:00',
    reason: 'ALMOÇO & HIGIENIZAÇÃO',
    recurringLabel: 'Recorrente',
  },
  {
    id: 'tb-2',
    target: 'MESTRE DIEGO R.',
    windowLabel: '12:00–13:00',
    reason: 'ALMOÇO',
    recurringLabel: 'Concluído',
  },
  {
    id: 'tb-3',
    target: 'TODA A UNIDADE',
    windowLabel: 'DOM 22 NOV • 08:00–11:00',
    reason: 'MANUTENÇÃO ELÉTRICA',
    recurringLabel: 'Agendado',
  },
];

export function B2BDashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'team'>('schedule');
  const [viewMode, setViewMode] = useState<'DIA' | 'SEMANA' | 'LISTA'>('DIA');

  const [reservations, setReservations] = useState<B2BReservation[]>(INITIAL_RESERVATIONS);
  const [selectedResId, setSelectedResId] = useState<string>('res-2');
  const [inspectorActionMsg, setInspectorActionMsg] = useState<string | null>(null);

  const [barbers, setBarbers] = useState<B2BBarberConfig[]>(INITIAL_BARBERS);
  const [services, setServices] = useState<B2BServiceConfig[]>(INITIAL_SERVICES);
  const [timeBlocks, setTimeBlocks] = useState<B2BTimeBlock[]>(INITIAL_TIMEBLOCKS);

  // New TimeBlock form
  const [tbTarget, setTbTarget] = useState('Renan Costa (Bancada #04)');
  const [tbReason, setTbReason] = useState('ALMOÇO');
  const [tbStart, setTbStart] = useState('15:00');
  const [tbEnd, setTbEnd] = useState('16:00');

  const selectedRes =
    reservations.find((r) => r.id === selectedResId) ?? reservations[1] ?? reservations[0];

  function handleValidateCheckin(id: string) {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'in_chair' } : r)),
    );
    setInspectorActionMsg('Check-in QR validado! Cliente encaminhado para a cadeira.');
  }

  function handleCompleteReservation(id: string) {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)),
    );
    setInspectorActionMsg('Atendimento marcado como concluído.');
  }

  function toggleBarberOnline(id: string) {
    setBarbers((prev) => prev.map((b) => (b.id === id ? { ...b, online: !b.online } : b)));
  }

  function toggleServiceActive(id: string) {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }

  function handleAddTimeBlock(e: FormEvent) {
    e.preventDefault();
    const newBlock: B2BTimeBlock = {
      id: `tb-${Date.now()}`,
      target: tbTarget.split('(')[0].trim().toUpperCase(),
      windowLabel: `${tbStart}–${tbEnd}`,
      reason: tbReason,
      recurringLabel: 'Ativo Agora',
    };
    setTimeBlocks((prev) => [newBlock, ...prev]);
  }

  function handleRemoveTimeBlock(id: string) {
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="min-h-screen bg-surface-variant text-on-surface flex flex-col">
      {/* TOP BRAND STATUS BAR */}
      <header className="w-full bg-white border-b-[1.5px] border-on-surface px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-primary" />
            <span className="font-headline font-bold text-base tracking-tight">
              CLIPPER <span className="text-slate-500 font-mono text-sm">//</span> B2B OS
            </span>
          </Link>
          <span className="font-mono text-xs px-2 py-0.5 bg-surface-variant border-[1.5px] border-on-surface text-slate-600 uppercase font-bold tracking-wider">
            v2.4.9 PRO
          </span>
          <div className="hidden sm:flex items-center gap-2 bg-white px-2.5 py-1 border-[1.5px] border-on-surface">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              GRID // BARBER LAB 01
            </span>
            <span className="font-mono text-[11px] text-slate-500">(PINHEIROS, SP)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-white px-2.5 py-1 border-[1.5px] border-on-surface font-mono text-[11px]">
            <span className="text-slate-500 uppercase">RADAR PÚBLICO:</span>
            <span className="font-bold text-live flex items-center gap-1">● VISÍVEL AO VIVO</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white px-2.5 py-1 border-[1.5px] border-on-surface font-mono text-[11px]">
            <span className="text-slate-500 uppercase">SOCKET:</span>
            <span className="font-bold text-on-surface">8ms</span>
          </div>
          <Link
            to="/meus-agendamentos"
            className="px-2.5 py-1 border-[1.5px] border-on-surface bg-white hover:bg-surface-variant font-mono text-xs font-bold uppercase"
          >
            PAINEL CLIENTE
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="px-2.5 py-1 border-[1.5px] border-on-surface bg-on-surface text-white hover:bg-primary font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SAIR</span>
          </button>
        </div>
      </header>

      {/* MAIN SYSTEM VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 1. LEFT PERSISTENT ARCHITECTURAL SIDEBAR */}
        <aside className="w-full lg:w-60 bg-white border-b-[1.5px] lg:border-b-0 lg:border-r-[1.5px] border-on-surface flex flex-col justify-between shrink-0">
          <div>
            <div className="p-3.5 border-b-[1.5px] border-on-surface bg-surface-variant">
              <div className="font-mono text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">
                ESTÚDIO ATIVO • {user?.fullName ?? 'DONO B2B'}
              </div>
              <div className="font-headline font-bold text-sm tracking-tight leading-snug">
                GRID // BARBER LAB 01
              </div>
              <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                4 Bancadas • Pinheiros
              </div>
            </div>

            <nav className="py-2">
              <div className="px-3 py-1 font-mono text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                OPERAÇÃO DE SALÃO
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs transition-colors cursor-pointer my-1 ${
                  activeTab === 'schedule'
                    ? 'bg-on-surface text-white font-bold border-l-4 border-primary'
                    : 'text-on-surface hover:bg-surface-variant font-medium'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={activeTab === 'schedule' ? 'text-primary' : 'text-slate-400'}>
                    ●
                  </span>
                  <span>Agenda &amp; Bancadas</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-primary text-white font-bold">
                  AO VIVO
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs transition-colors cursor-pointer my-1 ${
                  activeTab === 'team'
                    ? 'bg-on-surface text-white font-bold border-l-4 border-primary'
                    : 'text-on-surface hover:bg-surface-variant font-medium'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={activeTab === 'team' ? 'text-primary' : 'text-slate-400'}>
                    □
                  </span>
                  <span>Equipe &amp; Expedientes</span>
                </span>
                <span className="font-mono text-[10px]">{barbers.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className="w-full flex items-center justify-between px-3 py-2 text-on-surface hover:bg-surface-variant font-mono text-xs font-medium transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-slate-400">□</span> Catálogo de Serviços
                </span>
                <span className="font-mono text-[10px] text-slate-500">{services.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className="w-full flex items-center justify-between px-3 py-2 text-on-surface hover:bg-surface-variant font-mono text-xs font-medium transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-slate-400">□</span> Bloqueios (TimeBlocks)
                </span>
                <span className="font-mono text-[10px] text-primary font-bold">
                  {timeBlocks.length} ATIVOS
                </span>
              </button>
            </nav>
          </div>

          <div className="p-3 border-t-[1.5px] border-on-surface bg-surface-variant hidden lg:block">
            <div className="border-[1.5px] border-on-surface bg-white p-2.5 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">WEBSOCKET</span>
                <span className="text-live font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-live" /> 8ms
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">RADAR PÚBLICO</span>
                <span className="text-on-surface font-bold">VISÍVEL</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">BANCADAS</span>
                <span className="text-primary font-bold">
                  {barbers.filter((b) => b.online).length}/{barbers.length} ATIVAS
                </span>
              </div>
            </div>
            <div className="mt-2 text-center font-mono text-[10px] text-slate-500">
              DISPATCH HOST // SÃO PAULO
            </div>
          </div>
        </aside>

        {/* 2. WORKSPACE */}
        {activeTab === 'schedule' ? (
          <main className="flex-1 flex flex-col bg-surface-variant overflow-y-auto">
            {/* TOP COMMAND BAR */}
            <div className="bg-white border-b-[1.5px] border-on-surface px-6 py-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border-[1.5px] border-on-surface bg-white">
                  <button
                    type="button"
                    className="px-2.5 py-1.5 hover:bg-surface-variant border-r-[1.5px] border-on-surface cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary" />
                    HOJE • QUI, 19 NOV 2026
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1.5 hover:bg-surface-variant border-l-[1.5px] border-on-surface cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex border-[1.5px] border-on-surface bg-surface-variant p-0.5">
                  {(['DIA', 'SEMANA', 'LISTA'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 font-mono text-xs cursor-pointer ${
                        viewMode === mode
                          ? 'font-bold bg-on-surface text-white'
                          : 'font-medium text-on-surface hover:bg-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('team')}
                  className="px-3.5 py-2 border-[1.5px] border-on-surface bg-white hover:bg-surface-variant font-mono text-xs font-bold text-on-surface uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>BLOQUEAR HORÁRIO</span>
                </button>
                <Link
                  to="/barbearia/grid-lab-01"
                  className="px-4 py-2 border-[1.5px] border-on-surface bg-primary text-white hover:bg-on-surface font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <span>+ AGENDAMENTO MANUAL ↗</span>
                </Link>
              </div>
            </div>

            {/* 4-COLUMN KPI TELEMETRY STRIP */}
            <section className="border-b-[1.5px] border-on-surface bg-white grid grid-cols-2 lg:grid-cols-4 divide-y-[1.5px] lg:divide-y-0 lg:divide-x-[1.5px] divide-on-surface">
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    OCUPAÇÃO DA GRADE HOJE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
                    87%
                  </span>
                  <span className="font-mono text-xs font-bold text-on-surface">26/30 SLOTS</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-500">
                  <span className="text-live font-bold">▲ +9%</span> vs média histórica de quinta
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    FATURAMENTO PREVISTO (HOJE)
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-live" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
                    R$ 3.420
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">,00</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-500">
                  <span className="text-live font-bold">▲ +18%</span> vs quinta passada
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    EM ATENDIMENTO AGORA
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-live animate-ping" />
                </div>
                <div className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
                  3 CLIENTES
                </div>
                <div className="mt-1 font-mono text-[11px] text-live font-bold">
                  0 MIN ATRASO MÉDIO • SLA 100% OK
                </div>
              </div>

              <div className="p-4 bg-[#FFF5F0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-primary uppercase tracking-wider font-bold">
                    PRÓXIMO CHECK-IN
                  </span>
                  <span className="font-mono text-[10px] bg-primary text-white px-1.5 font-bold">
                    EM 7 MIN
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline font-bold text-2xl lg:text-3xl text-primary">
                    15:15
                  </span>
                  <span className="font-mono text-xs font-bold text-on-surface">#CLP-8942</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-on-surface font-semibold truncate">
                  GUILHERME B. • Bancada #01 (Diego)
                </div>
              </div>
            </section>

            {/* MAIN SPLIT WORKSPACE (72% TIMELINE / 28% INSPECTOR) */}
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* LEFT: MULTI-BARBER TIMELINE */}
              <div className="w-full lg:w-[72%] flex flex-col lg:border-r-[1.5px] border-on-surface bg-white overflow-x-auto">
                {/* Bench Headers */}
                <div className="bg-white border-b-[1.5px] border-on-surface flex min-w-[680px]">
                  <div className="w-16 shrink-0 border-r-[1.5px] border-on-surface bg-surface-variant flex items-center justify-center p-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                      HORA
                    </span>
                  </div>
                  <div className="flex-1 grid grid-cols-4 divide-x-[1.5px] divide-on-surface">
                    {barbers.map((b) => (
                      <div key={b.id} className="p-2.5 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] font-bold text-on-surface">
                            {b.bench}
                          </span>
                          <span
                            className={`font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase text-white ${
                              b.online ? 'bg-live' : 'bg-slate-500'
                            }`}
                          >
                            {b.online ? '● ATIVA' : '⏸ PAUSA'}
                          </span>
                        </div>
                        <div className="font-headline font-bold text-sm tracking-tight text-on-surface truncate mt-0.5">
                          {b.name}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 mt-1">
                          ★ {b.rating}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Body */}
                <div className="relative flex flex-1 min-w-[680px]">
                  <div className="w-16 shrink-0 border-r-[1.5px] border-on-surface bg-surface-variant flex flex-col font-mono text-xs font-semibold text-slate-500">
                    {['14:00', '15:00', '16:00', '17:00'].map((h) => (
                      <div
                        key={h}
                        className={`h-28 p-2 border-b-[1.5px] border-on-surface flex flex-col justify-start ${
                          h === '15:00' ? 'bg-white text-primary font-bold' : ''
                        }`}
                      >
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 grid grid-cols-4 divide-x-[1.5px] divide-on-surface relative">
                    {/* Live Current Time Line */}
                    <div className="absolute left-0 right-0 top-[127px] z-20 pointer-events-none flex items-center">
                      <div className="h-[2px] w-full bg-primary relative">
                        <div className="absolute -left-1 -top-[9px] bg-primary text-white font-mono text-[9px] font-bold px-1.5 py-0.5 border border-on-surface">
                          ● 15:08 AGORA
                        </div>
                      </div>
                    </div>

                    {barbers.map((barber) => {
                      const benchRes = reservations.filter((r) => r.bench === barber.bench);
                      return (
                        <div key={barber.id} className="p-2 bg-white space-y-3 min-h-[448px]">
                          {benchRes.map((res) => {
                            const isSelected = res.id === selectedRes?.id;
                            return (
                              <button
                                key={res.id}
                                type="button"
                                onClick={() => {
                                  setSelectedResId(res.id);
                                  setInspectorActionMsg(null);
                                }}
                                className={`w-full text-left p-2.5 border-[1.5px] transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-primary bg-[#FFF5F0] shadow-[3px_3px_0px_#FF4D00] ring-1 ring-primary'
                                    : res.status === 'in_chair'
                                      ? 'border-on-surface bg-on-surface text-white shadow-[2px_2px_0px_#090D16]'
                                      : res.status === 'completed'
                                        ? 'border-on-surface bg-surface-variant opacity-75'
                                        : 'border-on-surface bg-white shadow-[2px_2px_0px_#090D16] hover:bg-surface-container-low'
                                }`}
                              >
                                <div
                                  className={`flex items-center justify-between text-[10px] font-mono font-bold ${
                                    res.status === 'in_chair' && !isSelected
                                      ? 'text-primary'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  <span>{res.timeRange}</span>
                                  <span>
                                    {res.status === 'in_chair'
                                      ? '● NA CADEIRA'
                                      : res.status === 'completed'
                                        ? '✓ CONCLUÍDO'
                                        : res.code}
                                  </span>
                                </div>
                                <div className="font-headline font-bold text-xs mt-1">
                                  {res.clientName}
                                </div>
                                <div className="font-mono text-[10px] opacity-80 mt-0.5 truncate">
                                  {res.services}
                                </div>
                                <div className="mt-2 pt-1.5 border-t border-current/15 flex items-center justify-between font-mono text-[10px] font-bold">
                                  <span>R$ {res.price},00</span>
                                  <span className="text-live">{res.paymentNote}</span>
                                </div>
                              </button>
                            );
                          })}

                          {barber.bench === 'BANCADA #04' && (
                            <div
                              className="border-[1.5px] border-on-surface p-2.5"
                              style={{
                                backgroundImage:
                                  'repeating-linear-gradient(-45deg, #E2E8F0, #E2E8F0 6px, #F1F5F9 6px, #F1F5F9 12px)',
                              }}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                <span>15:00 → 16:00</span>
                                <span className="bg-on-surface text-white px-1 text-[9px]">
                                  TRAVADO
                                </span>
                              </div>
                              <div className="font-headline font-bold text-xs mt-1">
                                [TIMEBLOCK] ALMOÇO &amp; HIGIENIZAÇÃO
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: SELECTED RESERVATION INSPECTOR */}
              <aside className="w-full lg:w-[28%] bg-white flex flex-col justify-between p-5 space-y-5">
                {selectedRes && (
                  <div className="space-y-4">
                    <div className="bg-on-surface text-white p-3.5 border-[1.5px] border-on-surface">
                      <div className="font-mono text-[10px] text-primary font-bold uppercase tracking-wider">
                        DETALHES DA RESERVA // {selectedRes.code}
                      </div>
                      <div className="font-headline font-bold text-lg mt-0.5">
                        {selectedRes.clientName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-300">
                        {selectedRes.visitsLabel}
                      </div>
                    </div>

                    <div className="space-y-2.5 font-mono text-xs border-b-[1.5px] border-on-surface/15 pb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">PROFISSIONAL:</span>
                        <span className="font-bold">
                          {selectedRes.barberName} ({selectedRes.bench})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">HORÁRIO:</span>
                        <span className="font-bold text-primary">
                          {selectedRes.timeRange} ({selectedRes.durationMin}m)
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500">SERVIÇOS:</span>
                        <span className="font-bold text-right">{selectedRes.services}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">VALOR:</span>
                        <span className="font-bold">
                          R$ {selectedRes.price},00 ({selectedRes.paymentNote})
                        </span>
                      </div>
                    </div>

                    {selectedRes.clientNote && (
                      <div className="p-3 bg-[#FFF5F0] border-[1.5px] border-primary font-mono text-xs">
                        <span className="font-bold text-primary block mb-1">NOTA DO CLIENTE:</span>
                        <span>&quot;{selectedRes.clientNote}&quot;</span>
                      </div>
                    )}

                    {inspectorActionMsg && (
                      <div className="p-3 bg-live/10 border border-live font-mono text-xs font-bold text-live flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{inspectorActionMsg}</span>
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleValidateCheckin(selectedRes.id)}
                        className="w-full py-3 px-4 bg-primary hover:bg-[#e04400] text-white font-mono text-xs font-bold uppercase tracking-wider border-[1.5px] border-on-surface shadow-[3px_3px_0px_#090D16] cursor-pointer"
                      >
                        VALIDAR CHECK-IN (QR) ↗
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCompleteReservation(selectedRes.id)}
                        className="w-full py-3 px-4 bg-on-surface hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase tracking-wider border-[1.5px] border-on-surface cursor-pointer"
                      >
                        FINALIZAR ATENDIMENTO
                      </button>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </main>
        ) : (
          /* TAB 2: EQUIPE, SERVIÇOS & BLOQUEIOS (TIMEBLOCKS) */
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-[1.5px] border-on-surface pb-4">
              <div>
                <div className="font-mono text-[11px] font-bold text-primary uppercase">
                  CONFIGURAÇÃO OPERACIONAL // EQUIPE, SERVIÇOS &amp; TIMEBLOCKS
                </div>
                <h1 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  Gestão de Bancadas &amp; Bloqueios
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className="px-4 py-2 bg-on-surface text-white font-mono text-xs font-bold uppercase cursor-pointer"
              >
                ← VOLTAR PARA GRADE AO VIVO
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* LEFT 8 COLS: EQUIPE + SERVIÇOS */}
              <div className="xl:col-span-8 space-y-6">
                {/* Barbers 2x2 Grid */}
                <div className="bg-white border-[1.5px] border-on-surface p-5 space-y-4 shadow-[3px_3px_0px_#090D16]">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider border-b border-on-surface/15 pb-2">
                    MÓDULO A // EQUIPE &amp; EXPEDIENTES ({barbers.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {barbers.map((b) => (
                      <div
                        key={b.id}
                        className="border-[1.5px] border-on-surface p-4 bg-surface-container-low space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-slate-500">
                              {b.bench}
                            </span>
                            <h3 className="font-headline font-bold text-base">{b.name}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleBarberOnline(b.id)}
                            className={`px-2 py-0.5 border border-on-surface font-mono text-[10px] font-bold cursor-pointer ${
                              b.online ? 'bg-live text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {b.online ? '● ONLINE NO RADAR' : '⏸ EM PAUSA'}
                          </button>
                        </div>
                        <div className="font-mono text-[11px] text-slate-600">
                          <div>{b.schedule}</div>
                          <div className="font-bold text-on-surface mt-0.5">
                            ★ {b.rating} • {b.commission}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {b.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 bg-white border border-on-surface/30 font-mono text-[10px] font-bold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Table */}
                <div className="bg-white border-[1.5px] border-on-surface p-5 space-y-4 shadow-[3px_3px_0px_#090D16]">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider border-b border-on-surface/15 pb-2">
                    MÓDULO B // CATÁLOGO DE SERVIÇOS &amp; DURAÇÕES
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="bg-surface-variant border-y-[1.5px] border-on-surface">
                          <th className="py-2.5 px-3">SERVIÇO</th>
                          <th className="py-2.5 px-3">DURAÇÃO</th>
                          <th className="py-2.5 px-3">BUFFER</th>
                          <th className="py-2.5 px-3">PREÇO</th>
                          <th className="py-2.5 px-3">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-on-surface/15">
                        {services.map((srv) => (
                          <tr key={srv.id}>
                            <td className="py-3 px-3 font-bold">{srv.name}</td>
                            <td className="py-3 px-3">{srv.duration}</td>
                            <td className="py-3 px-3 text-slate-500">{srv.buffer}</td>
                            <td className="py-3 px-3 font-bold">{srv.price}</td>
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => toggleServiceActive(srv.id)}
                                className={`px-2 py-0.5 border border-on-surface font-bold text-[10px] cursor-pointer ${
                                  srv.active ? 'bg-live/15 text-live' : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {srv.active ? '● ATIVO' : 'INATIVO'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT 4 COLS: TIMEBLOCKS */}
              <div className="xl:col-span-4 space-y-6">
                <form
                  onSubmit={handleAddTimeBlock}
                  className="bg-white border-[1.5px] border-on-surface shadow-[3px_3px_0px_#090D16] overflow-hidden"
                >
                  <div className="bg-on-surface text-white px-4 py-3 font-mono text-xs font-bold uppercase">
                    [+ NOVO TIMEBLOCK // BLOQUEIO DE GRADE]
                  </div>
                  <div className="p-4 space-y-4 font-mono text-xs">
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        PROFISSIONAL / UNIDADE
                      </span>
                      <select
                        value={tbTarget}
                        onChange={(e) => setTbTarget(e.target.value)}
                        className="border-[1.5px] border-on-surface p-2 bg-surface-container-low font-bold"
                      >
                        <option>Renan Costa (Bancada #04)</option>
                        <option>Mestre Diego R. (Bancada #01)</option>
                        <option>Lucas &quot;Navalha&quot; (Bancada #02)</option>
                        <option>Alex Silva (Bancada #03)</option>
                        <option>Toda a Unidade</option>
                      </select>
                    </label>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                        MOTIVO DO BLOQUEIO
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {['ALMOÇO', 'FOLGA', 'MANUTENÇÃO', 'TREINAMENTO'].map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => setTbReason(reason)}
                            className={`py-1.5 border-[1.5px] border-on-surface font-bold text-[10px] cursor-pointer ${
                              tbReason === reason
                                ? 'bg-on-surface text-white'
                                : 'bg-white hover:bg-surface-variant'
                            }`}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500">INÍCIO</span>
                        <input
                          type="time"
                          value={tbStart}
                          onChange={(e) => setTbStart(e.target.value)}
                          className="border-[1.5px] border-on-surface p-2 bg-surface-container-low font-bold"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500">FIM</span>
                        <input
                          type="time"
                          value={tbEnd}
                          onChange={(e) => setTbEnd(e.target.value)}
                          className="border-[1.5px] border-on-surface p-2 bg-surface-container-low font-bold"
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-primary hover:bg-[#e04400] text-white font-bold uppercase border-[1.5px] border-on-surface shadow-[2px_2px_0px_#090D16] cursor-pointer"
                    >
                      APLICAR BLOQUEIO NA GRADE ↗
                    </button>
                  </div>
                </form>

                <div className="bg-white border-[1.5px] border-on-surface p-4 space-y-3 shadow-[3px_3px_0px_#090D16]">
                  <div className="font-mono text-xs font-bold uppercase">
                    BLOQUEIOS ATIVOS HOJE ({timeBlocks.length})
                  </div>
                  <div className="space-y-2.5">
                    {timeBlocks.map((tb) => (
                      <div
                        key={tb.id}
                        className="border-[1.5px] border-on-surface p-3 bg-surface-container-low flex items-start justify-between gap-2 font-mono text-xs"
                      >
                        <div>
                          <div className="font-bold text-on-surface">
                            {tb.target} • {tb.windowLabel}
                          </div>
                          <div className="text-[10px] text-primary font-bold mt-0.5">
                            [{tb.reason}] • {tb.recurringLabel}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeBlock(tb.id)}
                          title="Remover bloqueio"
                          className="p-1 border border-on-surface bg-white hover:bg-primary hover:text-white cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
