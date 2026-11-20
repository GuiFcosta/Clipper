import { Clock, Crosshair, Navigation, Scissors } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InternalNavbar } from '../components/layout/InternalNavbar';
import { RADAR_BARBERSHOPS, type RadarBarbershop } from '../data/mockRadarData';
import type { CheckoutBookingState } from '../types/booking';

export function RadarPage() {
  const navigate = useNavigate();

  const [radiusKm, setRadiusKm] = useState<3 | 5>(3);
  const [selectedService, setSelectedService] = useState('Corte + Barba [45 min]');
  const [liveOnly, setLiveOnly] = useState(true);
  const [filterRating, setFilterRating] = useState(false);
  const [filterLate, setFilterLate] = useState(false);
  const [filterPix, setFilterPix] = useState(false);
  const [sortBy, setSortBy] = useState<'slot' | 'distance' | 'rating'>('slot');

  const [selectedShopId, setSelectedShopId] = useState<string>('grid-lab-01');
  const [mapZoom, setMapZoom] = useState<number>(1);

  const filteredShops = useMemo(() => {
    const list = RADAR_BARBERSHOPS.filter((shop) => {
      if (shop.distanceKm > radiusKm) return false;
      if (filterRating && shop.rating < 4.95) return false;
      if (filterLate && !shop.openLate) return false;
      if (filterPix && !shop.acceptsPix1Click) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.estimatedCheckinMin - b.estimatedCheckinMin;
    });
  }, [radiusKm, filterRating, filterLate, filterPix, sortBy]);

  const activeShop: RadarBarbershop =
    filteredShops.find((s) => s.id === selectedShopId) ??
    filteredShops[0] ??
    RADAR_BARBERSHOPS[0];

  const totalOpenBenches = filteredShops.reduce((acc, s) => acc + s.availableBenches, 0);

  function handleQuickSlotCheckout(shop: RadarBarbershop, time: string) {
    const state: CheckoutBookingState = {
      shopId: shop.id,
      shopName: shop.name,
      shopAddress: `${shop.neighborhood}, São Paulo - SP`,
      barberName: shop.featuredBarber,
      barberInitials: shop.barberInitials?.[0] ?? 'MB',
      barberBench: 'BANCADA #01',
      barberRating: String(shop.rating),
      barberCutsCount: Number(shop.reviewsCount.replace('.', '')),
      dateLabel: 'HOJE • QUI 19 NOV',
      startTime: time,
      endTime: time,
      totalDuration: 45,
      totalPrice: 135,
      services: [{ id: 'corte-barba', name: selectedService, durationMin: 45, price: 135 }],
    };
    navigate('/checkout', { state });
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <InternalNavbar activeTab="radar" />

      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* 1. BARRA TÉCNICA DE FILTROS SUPERIOR */}
        <section className="w-full bg-white border-b-[1.5px] border-on-surface">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y-[1.5px] md:divide-y-0 md:divide-x-[1.5px] divide-on-surface">
            {/* Célula 1: Local & Raio */}
            <div className="lg:col-span-3 p-3.5 flex flex-col justify-between bg-white hover:bg-surface-container-low transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase">
                  <Crosshair className="w-3.5 h-3.5 text-primary" />
                  LOCAL &amp; RAIO
                </span>
                <button
                  type="button"
                  onClick={() => setRadiusKm((r) => (r === 3 ? 5 : 3))}
                  className="px-1.5 py-0.5 bg-surface-container-high text-on-surface border-[1.5px] border-on-surface font-mono text-[10px] font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  [GPS: {radiusKm}km]
                </button>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-headline font-bold text-xs uppercase tracking-tight truncate text-on-surface">
                  Pinheiros, São Paulo
                </span>
                <span className="text-[10px] font-mono text-on-surface-variant shrink-0">
                  ±15m prec.
                </span>
              </div>
            </div>

            {/* Célula 2: Serviço Desejado */}
            <div className="lg:col-span-3 p-3.5 flex flex-col justify-between bg-white hover:bg-surface-container-low transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase">
                  <Scissors className="w-3.5 h-3.5" />
                  SERVIÇO DESEJADO
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant">AUTO-MATCH</span>
              </div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-transparent font-headline font-bold text-xs uppercase cursor-pointer focus:outline-none text-on-surface"
              >
                <option>Corte + Barba [45 min]</option>
                <option>Corte Masculino Fade [30 min]</option>
                <option>Barba Terapia com Toalha [30 min]</option>
                <option>Cabelo + Visagismo [50 min]</option>
              </select>
            </div>

            {/* Célula 3: Disponibilidade Imediata */}
            <button
              type="button"
              onClick={() => setLiveOnly((v) => !v)}
              className="lg:col-span-2 p-3.5 flex flex-col justify-between bg-surface-container-low text-left cursor-pointer"
            >
              <div className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase mb-1">
                JANELA TEMPORAL
              </div>
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${liveOnly ? 'bg-live animate-ping' : 'bg-slate-400'}`}
                  />
                  <span className="font-mono text-xs font-bold text-on-surface">
                    {liveOnly ? 'LIVRE AGORA' : 'HOJE TODO'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-on-surface text-white font-mono text-[10px] font-bold tracking-wider">
                  &lt; 60 MIN
                </span>
              </div>
            </button>

            {/* Célula 4: Filtros Rápidos */}
            <div className="lg:col-span-2 p-3.5 flex flex-col justify-between bg-white">
              <div className="text-[10px] font-mono font-bold tracking-widest text-on-surface-variant uppercase mb-1.5">
                FILTROS ATIVOS
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterRating((v) => !v)}
                  className={`px-2 py-0.5 border-[1.5px] border-on-surface font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                    filterRating ? 'bg-on-surface text-white' : 'bg-white hover:bg-surface-variant'
                  }`}
                >
                  ★ 4.95+
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLate((v) => !v)}
                  className={`px-2 py-0.5 border-[1.5px] border-on-surface font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                    filterLate ? 'bg-on-surface text-white' : 'bg-white hover:bg-surface-variant'
                  }`}
                >
                  Até 22h
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPix((v) => !v)}
                  className={`px-2 py-0.5 border-[1.5px] border-on-surface font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                    filterPix ? 'bg-on-surface text-white' : 'bg-white hover:bg-surface-variant'
                  }`}
                >
                  Pix 1-Click
                </button>
              </div>
            </div>

            {/* Célula 5: Ordenação & Telemetria */}
            <div className="lg:col-span-2 p-3.5 flex flex-col justify-between bg-white">
              <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant uppercase mb-1">
                <span>CLASSIFICAÇÃO</span>
                <span className="text-live font-bold">{filteredShops.length} LOCAIS</span>
              </div>
              <div className="flex items-center justify-between gap-2 font-mono text-xs">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'slot' | 'distance' | 'rating')}
                  className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer text-xs"
                >
                  <option value="slot">Próximo Slot</option>
                  <option value="distance">Menor Distância</option>
                  <option value="rating">Melhor Nota</option>
                </select>
                <span className="text-[10px] font-mono bg-surface-container-high px-1.5 py-0.5 font-bold border-[1.5px] border-on-surface shrink-0">
                  {totalOpenBenches} CADEIRAS
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WORKSPACE PRINCIPAL DIVIDIDO (55% Feed / 45% Radar) */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[calc(100vh-140px)]">
          {/* COLUNA ESQUERDA: Feed de Barbearias */}
          <div className="lg:col-span-7 bg-white border-b-[1.5px] lg:border-b-0 lg:border-r-[1.5px] border-on-surface flex flex-col">
            <div className="h-10 px-4 bg-surface-container-low border-b-[1.5px] border-on-surface flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 font-bold tracking-tight text-on-surface">
                <span className="text-primary">■</span>
                <span>BANCADAS COM SLOT IMEDIATO // PINHEIROS &amp; ADJACÊNCIAS</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-bold">
                <span className="w-2 h-2 rounded-full bg-live" />
                <span>WEBSOCKET ATIVO [5ms]</span>
              </div>
            </div>

            <div className="flex flex-col divide-y-[1.5px] divide-on-surface">
              {filteredShops.map((shop) => {
                const isSelected = shop.id === activeShop.id;
                return (
                  <article
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`p-5 relative transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-surface-container-low/70 border-l-4 border-l-primary'
                        : 'bg-white hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface bg-surface-container-low px-2 py-0.5 border-[1.5px] border-on-surface">
                          {shop.hubCode}
                        </span>
                        <span className="text-on-surface-variant font-medium">
                          {shop.neighborhood} • {shop.distanceLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="bg-primary text-white font-bold text-[10px] px-2 py-0.5 tracking-wider">
                            ATIVO NO RADAR
                          </span>
                        )}
                        <span className="border-[1.5px] border-on-surface px-2 py-0.5 font-bold flex items-center gap-1 text-[11px] bg-white">
                          ★ {shop.rating}{' '}
                          <span className="text-on-surface-variant font-normal">
                            ({shop.reviewsCount})
                          </span>
                        </span>
                        <span
                          className={`border-[1.5px] border-on-surface px-2 py-0.5 font-bold text-[11px] flex items-center gap-1 ${
                            shop.isLastSpot
                              ? 'bg-primary-container text-on-primary-container'
                              : 'bg-surface-container-low text-live'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              shop.isLastSpot ? 'bg-primary' : 'bg-live'
                            }`}
                          />
                          {shop.availableBenches}/{shop.totalBenches}{' '}
                          {shop.isLastSpot ? 'LIVRE [ÚLTIMA VAGA]' : 'LIVRES AGORA'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <h2 className="font-headline font-bold text-xl tracking-tight uppercase text-on-surface">
                        {shop.name}
                      </h2>
                      <span
                        className={`font-mono text-xs font-bold tracking-wider shrink-0 ${
                          isSelected ? 'text-primary' : 'text-on-surface-variant'
                        }`}
                      >
                        CHECK-IN ESTIMADO: {shop.estimatedCheckinMin} MIN
                      </span>
                    </div>

                    <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed max-w-2xl">
                      {shop.address}
                    </p>

                    {/* Tabela de Preços */}
                    <div
                      className={`grid gap-2 p-2 bg-surface-container-low border-[1.5px] border-on-surface mb-4 font-mono text-xs ${
                        shop.prices.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                      }`}
                    >
                      {shop.prices.map((p, idx) => (
                        <div
                          key={p.label}
                          className={`flex flex-col ${
                            idx === 1 && shop.prices.length === 3
                              ? 'border-x-[1.5px] border-on-surface px-2'
                              : idx === 1 && shop.prices.length === 2
                                ? 'border-l-[1.5px] border-on-surface pl-2'
                                : idx === 2
                                  ? 'pl-1'
                                  : ''
                          }`}
                        >
                          <span
                            className={`text-[10px] ${
                              p.highlight ? 'text-primary font-bold' : 'text-on-surface-variant'
                            }`}
                          >
                            {p.label}
                          </span>
                          <span className="font-bold text-on-surface">
                            {p.price} <span className="font-normal text-[10px]">{p.duration}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Slots Imediatos */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant mb-2">
                        <span className="font-bold uppercase tracking-wider text-on-surface flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {shop.slotsTitle}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-on-surface-variant">
                            Trava garantida por 5 min após clique
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 font-mono">
                        {shop.slots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickSlotCheckout(shop, slot.time);
                            }}
                            className={`px-3 py-1.5 font-bold text-xs border-[1.5px] border-on-surface transition-all cursor-pointer flex items-center gap-1.5 ${
                              slot.variant === 'primary' || slot.variant === 'last'
                                ? 'bg-primary text-white shadow-[2px_2px_0px_#090D16] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                                : slot.variant === 'live'
                                  ? 'bg-live text-white shadow-[2px_2px_0px_#090D16] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                                  : 'bg-white text-on-surface hover:bg-on-surface hover:text-white'
                            }`}
                          >
                            <span>{slot.time}</span>
                            {slot.barberTag && (
                              <span className="text-[10px] opacity-90">{slot.barberTag}</span>
                            )}
                          </button>
                        ))}
                        {shop.extraSlotsLabel && (
                          <Link
                            to={`/barbearia/${shop.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1.5 text-[11px] font-mono text-on-surface-variant hover:text-on-surface border-[1.5px] border-transparent hover:border-on-surface"
                          >
                            {shop.extraSlotsLabel}
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="pt-3 border-t-[1.5px] border-on-surface/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {shop.barberInitials && (
                          <div className="flex -space-x-1.5">
                            {shop.barberInitials.map((ini) => (
                              <span
                                key={ini}
                                className="w-6 h-6 rounded-full bg-on-surface text-white text-[10px] font-mono font-bold flex items-center justify-center border-[1.5px] border-white"
                              >
                                {ini}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-[11px] font-mono text-on-surface-variant">
                          {shop.footerNote}
                        </span>
                      </div>

                      <Link
                        to={`/barbearia/${shop.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-white border-[1.5px] border-on-surface text-xs font-mono font-bold hover:bg-on-surface hover:text-white transition-colors flex items-center gap-1 shadow-[1.5px_1.5px_0px_#090D16]"
                      >
                        VER BANCADAS &amp; BARBEIROS →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* COLUNA DIREITA: Mapa de Radar Urbano Interativo */}
          <div className="lg:col-span-5 bg-surface-container-low relative flex flex-col justify-between overflow-hidden min-h-[540px] lg:sticky lg:top-16 lg:h-[calc(100vh-140px)]">
            {/* Telemetria Flutuante Superior */}
            <div className="z-20 w-full p-4 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm border-[1.5px] border-on-surface p-2.5 flex items-center justify-between font-mono text-xs shadow-[2px_2px_0px_#090D16] pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-live animate-pulse" />
                  <span className="font-bold tracking-tight text-on-surface">
                    RADAR_SYNC // LIVE WEBSOCKET
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                  <span>PING 11ms</span>
                  <span className="hidden sm:inline">LAT: -23.5614° | LNG: -46.6912°</span>
                </div>
              </div>
            </div>

            {/* MAPA VETORIAL NEO-BRUTALISTA */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden select-none">
              <svg
                className="w-full h-full transition-transform duration-300"
                style={{ transform: `scale(${mapZoom})` }}
                preserveAspectRatio="xMidYMid slice"
                viewBox="0 0 800 900"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern height="40" id="archGrid" patternUnits="userSpaceOnUse" width="40">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#090D16"
                      strokeOpacity="0.08"
                      strokeWidth="0.5"
                    />
                    <circle cx="0" cy="0" fill="#090D16" fillOpacity="0.2" r="1.5" />
                  </pattern>
                  <radialGradient cx="50%" cy="50%" id="radarSweep" r="50%">
                    <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.15" />
                    <stop offset="60%" stopColor="#FF4D00" stopOpacity="0.04" />
                    <stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect fill="#F8FAFC" height="100%" width="100%" />
                <rect fill="url(#archGrid)" height="100%" width="100%" />

                {/* Círculos de Alcance */}
                <circle
                  cx="360"
                  cy="460"
                  fill="none"
                  r="120"
                  stroke="#090D16"
                  strokeDasharray="4 4"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />
                <text
                  fill="#090D16"
                  fillOpacity="0.4"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="9"
                  fontWeight="700"
                  x="365"
                  y="345"
                >
                  RAIO 1.0 KM
                </text>
                <circle
                  cx="360"
                  cy="460"
                  fill="none"
                  r="230"
                  stroke="#090D16"
                  strokeDasharray="6 6"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                />
                <text
                  fill="#090D16"
                  fillOpacity="0.4"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="9"
                  fontWeight="700"
                  x="365"
                  y="235"
                >
                  RAIO 2.0 KM
                </text>
                <circle
                  cx="360"
                  cy="460"
                  fill="none"
                  r="340"
                  stroke="#090D16"
                  strokeOpacity="0.2"
                  strokeWidth="1.5"
                />
                <text
                  fill="#090D16"
                  fillOpacity="0.4"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="9"
                  fontWeight="700"
                  x="365"
                  y="125"
                >
                  RAIO {radiusKm}.0 KM (LIMITE BUSCA)
                </text>

                <circle cx="360" cy="460" fill="url(#radarSweep)" r="85" />

                {/* Vias Principais */}
                <path
                  d="M 80 -50 L 140 300 L 190 600 L 220 950"
                  fill="none"
                  stroke="#090D16"
                  strokeOpacity="0.12"
                  strokeWidth="8"
                />
                <path
                  d="M 120 720 L 380 430 L 680 180"
                  fill="none"
                  stroke="#090D16"
                  strokeOpacity="0.75"
                  strokeWidth="5"
                />
                <text
                  fill="#090D16"
                  fillOpacity="0.7"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  fontWeight="700"
                  transform="rotate(-48 230 605)"
                  x="230"
                  y="605"
                >
                  AV. BRIG. FARIA LIMA
                </text>
                <path
                  d="M 280 880 L 460 410 L 610 80"
                  fill="none"
                  stroke="#090D16"
                  strokeOpacity="0.7"
                  strokeWidth="4.5"
                />
                <path
                  d="M 330 700 L 420 450 L 510 250"
                  fill="none"
                  stroke="#FF4D00"
                  strokeOpacity="0.85"
                  strokeWidth="3"
                />
                <text
                  fill="#FF4D00"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="9"
                  fontWeight="700"
                  transform="rotate(-68 440 400)"
                  x="440"
                  y="400"
                >
                  R. DOS PINHEIROS
                </text>
                <path
                  d="M 430 220 L 760 350"
                  fill="none"
                  stroke="#090D16"
                  strokeOpacity="0.5"
                  strokeWidth="3"
                />
                <path
                  d="M 220 280 L 340 180 L 420 120"
                  fill="none"
                  stroke="#090D16"
                  strokeOpacity="0.5"
                  strokeWidth="2.5"
                />
                <path
                  d="M 290 680 L 560 760"
                  fill="none"
                  stroke="#090D16"
                  strokeOpacity="0.5"
                  strokeWidth="3"
                />

                {/* Pin do Usuário */}
                <g transform="translate(360, 460)">
                  <circle cx="0" cy="0" fill="#090D16" r="14" />
                  <circle cx="0" cy="0" fill="#FFFFFF" r="5" />
                  <circle cx="0" cy="0" fill="#FF4D00" r="2" />
                  <rect fill="#090D16" height="18" width="76" x="-38" y="18" />
                  <text
                    fill="#FFFFFF"
                    fontFamily="'JetBrains Mono', monospace"
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                    x="0"
                    y="30"
                  >
                    VOCÊ AQUI
                  </text>
                </g>

                {/* Pins das Barbearias */}
                {filteredShops.map((shop) => {
                  const isActive = shop.id === activeShop.id;
                  return (
                    <g
                      key={shop.id}
                      transform={`translate(${shop.mapCoords.x}, ${shop.mapCoords.y})`}
                      onClick={() => setSelectedShopId(shop.id)}
                      className="cursor-pointer"
                    >
                      <line
                        stroke={isActive ? '#FF4D00' : '#090D16'}
                        strokeWidth={isActive ? '2.5' : '1.5'}
                        x1="0"
                        x2="0"
                        y1="0"
                        y2={isActive ? '-30' : '-20'}
                      />
                      {isActive && (
                        <circle
                          cx="0"
                          cy="0"
                          fill="#FF4D00"
                          r="6"
                          stroke="#090D16"
                          strokeWidth="1.5"
                        />
                      )}
                      <rect
                        fill={isActive ? '#FF4D00' : '#FFFFFF'}
                        height={isActive ? '24' : '20'}
                        stroke="#090D16"
                        strokeWidth="1.5"
                        width="116"
                        x="-58"
                        y={isActive ? '-52' : '-38'}
                      />
                      {!isActive && (
                        <rect
                          fill={shop.isLastSpot ? '#FF4D00' : '#10B981'}
                          height="14"
                          width="6"
                          x="-55"
                          y="-35"
                        />
                      )}
                      <text
                        fill={isActive ? '#FFFFFF' : '#090D16'}
                        fontFamily="'Space Grotesk', sans-serif"
                        fontSize={isActive ? '10.5' : '9.5'}
                        fontWeight="700"
                        textAnchor="middle"
                        x={isActive ? '0' : '3'}
                        y={isActive ? '-36' : '-24'}
                      >
                        {shop.pinLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Popover Flutuante sobre o Pin Selecionado */}
              <div className="absolute left-1/2 top-[44%] -translate-x-1/2 sm:translate-x-0 sm:left-[30%] z-20 w-72 bg-white border-[1.5px] border-on-surface p-3.5 shadow-[4px_4px_0px_#090D16]">
                <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant mb-1">
                  <span className="flex items-center gap-1 font-bold text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    UNIDADE SELECIONADA
                  </span>
                  <span className="font-bold text-on-surface">{activeShop.hubCode}</span>
                </div>
                <div className="font-headline font-bold text-sm uppercase text-on-surface mb-0.5">
                  {activeShop.name}
                </div>
                <div className="font-mono text-xs text-on-surface-variant mb-3">
                  {activeShop.featuredBarber} • {activeShop.featuredSpecialty}
                </div>
                <div className="flex items-center justify-between pt-2 border-t-[1.5px] border-on-surface/30">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-live">
                    <span className="w-2 h-2 rounded-full bg-live" />
                    <span>{activeShop.slots[0]?.time} LIVRE</span>
                  </div>
                  <Link
                    to={`/barbearia/${activeShop.id}`}
                    className="px-2.5 py-1 bg-on-surface text-white font-mono text-[11px] font-bold border-[1.5px] border-on-surface hover:bg-primary transition-colors flex items-center gap-1"
                  >
                    TRAVAR CADEIRA ↗
                  </Link>
                </div>
              </div>
            </div>

            {/* Controles e Legenda Flutuantes */}
            <div className="z-20 p-4 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm border-[1.5px] border-on-surface p-2.5 font-mono text-[11px] flex flex-col gap-1.5 shadow-[2px_2px_0px_#090D16] pointer-events-auto max-w-xs">
                <div className="font-bold text-on-surface border-b-[1.5px] border-on-surface/30 pb-1 mb-0.5 flex justify-between gap-4">
                  <span>LEGENDA TELEMETRIA</span>
                  <span className="text-on-surface-variant">SÃO PAULO [OESTE]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary border-[1.5px] border-on-surface shrink-0" />
                  <span className="text-on-surface">Barbearia Selecionada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-white border-[1.5px] border-on-surface shrink-0" />
                  <span className="text-on-surface-variant">Bancadas Livres (&lt;60m)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant pt-1 border-t-[1.5px] border-on-surface/20">
                  <span className="w-2 h-2 rounded-full bg-live shrink-0" />
                  <span>Sincronia automática a cada 5s</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto self-end">
                <button
                  type="button"
                  onClick={() => setMapZoom((z) => Math.min(1.4, Number((z + 0.15).toFixed(2))))}
                  className="w-8 h-8 bg-white border-[1.5px] border-on-surface font-mono font-bold text-sm flex items-center justify-center hover:bg-on-surface hover:text-white shadow-[2px_2px_0px_#090D16] transition-all cursor-pointer"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
                  className="w-8 h-8 bg-white border-[1.5px] border-on-surface font-mono font-bold text-sm flex items-center justify-center hover:bg-on-surface hover:text-white shadow-[2px_2px_0px_#090D16] transition-all cursor-pointer"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom(1)}
                  className="h-8 px-2.5 bg-white border-[1.5px] border-on-surface font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-on-surface hover:text-white shadow-[2px_2px_0px_#090D16] transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-primary" />
                  <span>CENTRALIZAR GPS</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BARRA INFERIOR DE STATUS TÉCNICO */}
        <footer className="w-full bg-surface-container-low border-t-[1.5px] border-on-surface px-4 py-2.5 flex flex-wrap items-center justify-between gap-y-2 text-[11px] font-mono text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-on-surface font-bold">
              <span className="text-primary font-bold">[CLIPPER OS // RADAR CORE]</span>
              <span>ALGORITMO PREDITIVO DE OCUPAÇÃO: ZERO_OVERBOOKING</span>
            </div>
            <span className="hidden md:inline text-on-surface">•</span>
            <div className="flex items-center gap-1">
              <span>VARREDURA:</span>
              <span className="text-on-surface font-bold">RAIO {radiusKm}.000M</span>
            </div>
            <span className="hidden md:inline text-on-surface">•</span>
            <div className="flex items-center gap-1">
              <span>ZONA:</span>
              <span className="text-on-surface font-bold">SÃO PAULO [OESTE &amp; SUL]</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-live font-bold">● SLOT BUFFER: 100% GARANTIDO</span>
            <span className="px-2 py-0.5 bg-white border-[1.5px] border-on-surface font-bold text-on-surface">
              VERSÃO: v2.4.1
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
