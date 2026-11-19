import { ArrowRight, Clock, MapPin, Scissors, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { HERO_METRICS, LIVE_BENCH_MATRIX } from '../../data/mockLandingData';

interface HeroSectionProps {
  onSlotQuickBook?: (barberName: string, time: string) => void;
}

export function HeroSection({ onSlotQuickBook }: HeroSectionProps) {
  const [location, setLocation] = useState('Pinheiros, SP (ou 3km)');
  const [service, setService] = useState('Corte + Barba [45m]');
  const [timeWindow, setTimeWindow] = useState('Hoje 17h — 20h');
  const [searchState, setSearchState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [lockedBenchSlot, setLockedBenchSlot] = useState<string | null>(null);

  function handleSearch() {
    if (searchState === 'scanning') return;
    setSearchState('scanning');
    setTimeout(() => {
      setSearchState('done');
      const target = document.getElementById('barbearias');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(() => setSearchState('idle'), 3500);
    }, 600);
  }

  function handleBenchSlotClick(barberName: string, time: string) {
    const key = `${barberName}-${time}`;
    setLockedBenchSlot(key);
    onSlotQuickBook?.(barberName, time);
  }

  return (
    <>
      {/* TOP RUNNING TICKER */}
      <section className="w-full bg-on-surface text-white py-2 px-4 sm:px-6 overflow-hidden flex items-center justify-between font-mono text-[11px] uppercase tracking-wider select-none">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-live font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-live animate-pulse" />
            SISTEMA ATIVO: 84 UNIDADES SINCRONIZADAS
          </span>
          <span className="hidden md:inline text-slate-400">
            PINHEIROS // ITAIM BIBI // VILA MADALENA // JARDINS
          </span>
          <span className="hidden lg:inline text-primary font-bold">
            FLUXO ATUAL: 142 CHECK-INS/MIN
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-300">
          <span>PING CLOUD: 12ms</span>
          <span>BUFFER TOLERÂNCIA: ±0min</span>
          <span className="text-primary">SLOT LOCK: ATIVADO</span>
        </div>
      </section>

      {/* 1. HERO SECTION ARQUITETÔNICA BIPARTIDA */}
      <section id="radar" className="w-full grid grid-cols-1 lg:grid-cols-12 bg-surface border-b-[1.5px] border-outline">
        {/* Coluna Esquerda (Painel de Comando e Proposta de Valor) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between space-y-10 lg:border-r-[1.5px] border-outline">
          <div className="space-y-6">
            {/* Live System Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-surface-variant border border-outline font-mono text-xs text-on-surface font-bold uppercase tracking-wider">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-live" />
              </span>
              <span>[SISTEMA DE DISPONIBILIDADE DINÂMICA • LATÊNCIA ZERO]</span>
            </div>

            {/* Master Headline */}
            <h1 className="font-headline font-bold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-on-surface leading-[0.98]">
              Corte e barba no minuto exato.
              <br />
              <span className="text-primary">Sem ligar. Sem esperar.</span>
            </h1>

            {/* Subtítulo afiado */}
            <p className="font-body text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              O <strong className="text-on-surface font-semibold">CLIPPER</strong> centraliza as barbearias de
              alta performance da capital e sincroniza as bancadas em tempo real. Consulta instantânea de slots
              livres, bloqueios e tempos de serviço para eliminar 100% dos atrasos e da espera em poltrona.
            </p>

            {/* Métricas Chave em Grade Monospace */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {HERO_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="p-3.5 bg-surface-container-low border border-outline-variant"
                >
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                    {metric.label}
                  </div>
                  <div className={`font-mono font-bold text-xl sm:text-2xl mt-1 ${metric.valueColor}`}>
                    {metric.value}
                  </div>
                  <div className={`font-mono text-[9px] mt-0.5 font-semibold ${metric.subColor}`}>
                    {metric.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instant Command Search Box Neo-Brutalista */}
          <div className="bg-surface-container-low border-[1.5px] border-outline p-4 sm:p-6 shadow-[4px_4px_0px_#090D16] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-bold tracking-wider text-on-surface flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                TERMINAL DE BUSCA IMEDIATA
              </span>
              <span className="font-mono text-[11px] text-slate-500">RAIO ATUAL: 5.0 KM</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Campo 1: Localização */}
              <div className="p-3 bg-white border border-outline flex flex-col justify-center">
                <label className="font-mono text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                  01 // Bairro / Local
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Informe o bairro..."
                    className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Campo 2: Serviço */}
              <div className="p-3 bg-white border border-outline flex flex-col justify-center">
                <label className="font-mono text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                  02 // Serviço &amp; Duração
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Scissors className="w-4 h-4 text-primary shrink-0" />
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none cursor-pointer"
                  >
                    <option>Corte Clássico [30m]</option>
                    <option>Corte + Barba [45m]</option>
                    <option>Acabamento &amp; Linhas [15m]</option>
                    <option>Tratamento Capilar [40m]</option>
                  </select>
                </div>
              </div>

              {/* Campo 3: Janela Imediata */}
              <div className="p-3 bg-white border border-outline flex flex-col justify-center">
                <label className="font-mono text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                  03 // Janela Desejada
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-on-surface font-semibold focus:outline-none cursor-pointer"
                  >
                    <option>Próximos 30 min (Express)</option>
                    <option>Hoje 17h — 20h</option>
                    <option>Qualquer horário hoje</option>
                    <option>Amanhã de manhã (09h-12h)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botão CTA Primário */}
            <button
              type="button"
              onClick={handleSearch}
              className={`w-full py-4 text-white font-mono text-xs uppercase font-bold tracking-widest border border-outline shadow-[3px_3px_0px_#090D16] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#090D16] transition-all flex items-center justify-center gap-3 cursor-pointer ${
                searchState === 'done' ? 'bg-live' : 'bg-primary hover:bg-[#e04400]'
              }`}
            >
              {searchState === 'scanning' ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>VARRENDO 84 BANCADAS...</span>
                </>
              ) : searchState === 'done' ? (
                <span>RADAR ATUALIZADO (142 SLOTS ENCONTRADOS) ↗</span>
              ) : (
                <>
                  <span>CONSULTAR RADAR LIVRE EM 15s</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Coluna Direita (Console de Controle e Radar de Bancadas) */}
        <div className="lg:col-span-5 bg-surface-variant p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          {/* Header do Console */}
          <div className="bg-on-surface text-white p-4 border border-outline flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] text-primary font-bold tracking-widest uppercase">
                TERMINAL RADAR // LIVE TELEMETRY
              </div>
              <div className="font-mono text-xs text-white font-semibold">
                SÃO PAULO [ZONA OESTE &amp; SUL]
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-white/10 font-mono text-[10px]">
              <span className="w-2 h-2 rounded-full bg-live animate-ping" />
              <span className="text-live font-bold">12ms PING</span>
            </div>
          </div>

          {/* Radar Gráfico Estilizado Neo-Brutalista */}
          <div className="bg-white p-4 border-[1.5px] border-outline relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                MAPA DE OCIOSIDADE METROPOLITANA
              </span>
              <span className="font-mono text-[10px] text-primary font-bold">
                LAT -23.5615 / LNG -46.6853
              </span>
            </div>

            <div className="relative w-full h-52 bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden">
              <svg
                className="w-full h-full text-slate-200"
                fill="none"
                viewBox="0 0 400 220"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line stroke="currentColor" strokeDasharray="4 4" x1="0" x2="400" y1="55" y2="55" />
                <line stroke="currentColor" x1="0" x2="400" y1="110" y2="110" />
                <line stroke="currentColor" strokeDasharray="4 4" x1="0" x2="400" y1="165" y2="165" />
                <line stroke="currentColor" strokeDasharray="4 4" x1="100" x2="100" y1="0" y2="220" />
                <line stroke="currentColor" x1="200" x2="200" y1="0" y2="220" />
                <line stroke="currentColor" strokeDasharray="4 4" x1="300" x2="300" y1="0" y2="220" />
                <circle cx="200" cy="110" r="40" stroke="#CBD5E1" strokeWidth="1.5" />
                <circle cx="200" cy="110" r="85" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="1.5" />
                <path d="M 200 110 L 280 60 A 90 90 0 0 0 200 20 Z" fill="#FF4D00" fillOpacity="0.12" />
                <line stroke="#FF4D00" strokeWidth="1.5" x1="200" x2="280" y1="110" y2="60" />
              </svg>

              {/* Hotspot Units */}
              <div className="absolute top-[25%] left-[20%] flex flex-col items-center">
                <span className="w-3.5 h-3.5 rounded-full bg-live animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-live -mt-3" />
                <span className="font-mono text-[9px] font-bold bg-on-surface text-white px-1.5 py-0.5 mt-1">
                  LAB 01 [LIVRE]
                </span>
              </div>
              <div className="absolute top-[60%] left-[60%] flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[9px] font-bold bg-on-surface text-white px-1.5 py-0.5 mt-1">
                  VÉRTICE [1 VAGA]
                </span>
              </div>
              <div className="absolute bottom-[18%] left-[28%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-live" />
                <span className="font-mono text-[9px] font-bold bg-on-surface text-white px-1.5 py-0.5 mt-1">
                  KINETIC [LIVRE]
                </span>
              </div>
              <div className="absolute top-[32%] right-[14%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-mono text-[9px] font-bold bg-on-surface text-white px-1.5 py-0.5 mt-1">
                  MONO [LOTANDO]
                </span>
              </div>

              {/* Radar Center Point */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-on-surface flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-500">
              <span>RAIO DE VARREDURA: 3.500m</span>
              <span className="text-live font-semibold">VARREDURA A CADA 5 SEG</span>
            </div>
          </div>

          {/* Matriz de Slots em Tempo Real por Barbeiro */}
          <div className="space-y-2.5 bg-white p-4 border-[1.5px] border-outline">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono text-[10px] uppercase font-bold text-on-surface tracking-wider">
                MATRIZ DE BANCADA DISPONÍVEL
              </span>
              <span className="font-mono text-[10px] text-live font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-live" /> AO VIVO
              </span>
            </div>

            {LIVE_BENCH_MATRIX.map((bench) => (
              <div
                key={bench.id}
                className="p-2.5 bg-surface-container-low border border-outline-variant space-y-2 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-on-surface text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      {bench.initials}
                    </span>
                    <div>
                      <span className="font-headline text-xs font-bold text-on-surface">{bench.name}</span>
                      <span className="font-mono text-[10px] text-slate-500 ml-1.5">{bench.specialty}</span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      bench.benchHighlight ? 'text-live' : 'text-slate-600'
                    }`}
                  >
                    {bench.benchLabel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                  {bench.slots.map((slot) => {
                    const key = `${bench.name}-${slot.time}`;
                    const isLocked = lockedBenchSlot === key;

                    if (slot.status === 'occupied') {
                      return (
                        <div
                          key={slot.time}
                          className="py-1.5 px-2 bg-slate-200 text-slate-400 line-through text-center"
                        >
                          {slot.label}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleBenchSlotClick(bench.name, slot.time)}
                        className={`py-1.5 px-2 font-bold text-center transition-all cursor-pointer ${
                          isLocked
                            ? 'bg-on-surface text-white ring-2 ring-primary'
                            : slot.status === 'highlight'
                              ? 'bg-primary text-white hover:opacity-90'
                              : 'bg-live text-white hover:opacity-90'
                        }`}
                      >
                        {isLocked ? `${slot.time} [TRAVADO]` : slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="font-mono text-[10px] text-slate-500 text-center uppercase tracking-wide">
            Sincronização bidirecional via WebSockets com as bancadas em tempo real.
          </div>
        </div>
      </section>
    </>
  );
}
