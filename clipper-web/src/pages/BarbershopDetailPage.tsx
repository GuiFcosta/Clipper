import { MapPin, ShieldCheck, Timer, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { InternalNavbar } from '../components/layout/InternalNavbar';
import { getBarbershopById, type BarbershopDetail } from '../data/mockBarbershopDetail';
import type { CheckoutBookingState } from '../types/booking';

function addMinutes(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = timeStr.split(':');
  const total = Number(hStr) * 60 + Number(mStr) + minutesToAdd;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function BarbershopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const shop = useMemo(() => getBarbershopById(id), [id]);

  return <BarbershopDetailContent key={shop.id} shop={shop} />;
}

function BarbershopDetailContent({ shop }: { shop: BarbershopDetail }) {
  const navigate = useNavigate();
  const firstBarberId = shop.barbers[0].id;
  const firstAvailableSlot =
    shop.slotsByBarber[firstBarberId]?.find((s) => s.status !== 'occupied')?.time ?? '15:15';

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() =>
    shop.services.filter((s) => s.defaultSelected).map((s) => s.id),
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string>(firstBarberId);
  const [selectedDateId, setSelectedDateId] = useState<string>(shop.dates[0].id);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>(firstAvailableSlot);
  const [lockSeconds, setLockSeconds] = useState<number>(292); // 04:52
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);

  // Countdown timer for slot lock
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLockSeconds((prev) => (prev > 0 ? prev - 1 : 292));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedServices = shop.services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.durationMin, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

  const selectedBarber =
    shop.barbers.find((b) => b.id === selectedBarberId) ?? shop.barbers[0];
  const selectedDate = shop.dates.find((d) => d.id === selectedDateId) ?? shop.dates[0];
  const barberSlots = shop.slotsByBarber[selectedBarber.id] ?? shop.slotsByBarber['diego-r'];

  const effectiveDuration = totalDuration > 0 ? totalDuration : 30;
  const endTime = addMinutes(selectedSlotTime, effectiveDuration);

  const lockMin = String(Math.floor(lockSeconds / 60)).padStart(2, '0');
  const lockSec = String(lockSeconds % 60).padStart(2, '0');

  function toggleService(serviceId: string) {
    const clickedService = shop.services.find((s) => s.id === serviceId);
    if (!clickedService) return;

    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        if (prev.length === 1) return prev; // Keep at least 1 service selected
        return prev.filter((item) => item !== serviceId);
      }

      // If selecting a combo, deselect individual services included in it
      if (clickedService.includesServiceIds?.length) {
        const included = new Set(clickedService.includesServiceIds);
        return [...prev.filter((id) => !included.has(id)), serviceId];
      }

      // If selecting an individual service, deselect any combo that already includes it
      const next = prev.filter((id) => {
        const existing = shop.services.find((s) => s.id === id);
        return !existing?.includesServiceIds?.includes(serviceId);
      });
      return [...next, serviceId];
    });
  }

  function handleSelectBarber(barberId: string) {
    setSelectedBarberId(barberId);
    const firstAvailable = shop.slotsByBarber[barberId]?.find((s) => s.status !== 'occupied');
    if (firstAvailable) {
      setSelectedSlotTime(firstAvailable.time);
    }
  }

  function handleProceedToCheckout() {
    const checkoutState: CheckoutBookingState = {
      shopId: shop.id,
      shopName: shop.name,
      shopAddress: shop.address,
      barberName: selectedBarber.name,
      barberInitials: selectedBarber.initials,
      barberBench: selectedBarber.bench,
      barberRating: selectedBarber.rating,
      barberCutsCount: selectedBarber.cutsCount,
      dateLabel: selectedDate.label,
      startTime: selectedSlotTime,
      endTime,
      totalDuration: effectiveDuration,
      totalPrice,
      services: selectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        durationMin: s.durationMin,
        price: s.price,
      })),
    };
    navigate('/checkout', { state: checkoutState });
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <InternalNavbar activeTab="barbearias" />

      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* BREADCRUMB & REALTIME TELEMETRY METRIC BAR */}
        <section className="w-full bg-white border-b-[1.5px] border-on-surface">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 tracking-tight text-on-surface">
              <Link
                to="/"
                className="text-on-surface-variant hover:text-on-surface transition-colors uppercase"
              >
                RADAR AO VIVO
              </Link>
              <span className="text-on-surface-variant">/</span>
              <span className="text-on-surface-variant uppercase">{shop.cityLabel}</span>
              <span className="text-on-surface-variant">/</span>
              <span className="font-bold text-on-surface bg-surface-variant px-2 py-0.5 border-[1.5px] border-on-surface">
                {shop.name} [{shop.hubCode}]
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-bold">
              <div className="flex items-center gap-1.5 bg-surface-variant px-2 py-0.5 border-[1.5px] border-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-live animate-ping" />
                <span className="text-on-surface uppercase">WEBSOCKET ATIVO [5ms]</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-on-surface-variant">
                <span>LATÊNCIA:</span>
                <span className="text-on-surface font-mono">11ms</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-on-surface uppercase">
                  {shop.availableBenches} BANCADAS DISPONÍVEIS AGORA
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* BARBERSHOP HERO HEADER (EXPOSED SWISS-GRID BANNER) */}
        <section className="w-full bg-surface-container-low border-b-[1.5px] border-on-surface">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column Details */}
            <div className="lg:col-span-8 p-6 lg:p-8 bg-white lg:border-r-[1.5px] border-on-surface flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Tag Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-live/10 text-live border-[1.5px] border-live px-2.5 py-1 font-mono text-[11px] font-bold tracking-tight uppercase">
                    <span className="w-2 h-2 rounded-full bg-live" />
                    ABERTO ATÉ {shop.openUntil}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-surface-variant text-on-surface border-[1.5px] border-on-surface px-2.5 py-1 font-mono text-[11px] font-bold tracking-tight uppercase">
                    {shop.availableBenches}/{shop.totalBenches} BANCADAS LIVRES AGORA
                  </span>
                  <span className="inline-flex items-center gap-1 bg-surface-variant text-on-surface border-[1.5px] border-on-surface px-2.5 py-1 font-mono text-[11px] font-bold tracking-tight">
                    ★ {shop.rating} ({shop.reviewsCount} AVALIAÇÕES)
                  </span>
                  <span className="inline-flex items-center gap-1 bg-primary text-white border-[1.5px] border-on-surface px-2.5 py-1 font-mono text-[11px] font-bold tracking-tight uppercase">
                    CHECK-IN ESTIMADO: {shop.estimatedCheckin}
                  </span>
                </div>

                {/* Main Title */}
                <div>
                  <h1 className="font-headline font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight uppercase text-on-surface leading-none">
                    {shop.name}
                  </h1>
                  <p className="font-mono text-xs sm:text-sm text-on-surface-variant mt-2 tracking-tight flex flex-wrap items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{shop.address}</span>
                    <span className="bg-on-surface text-white px-1.5 py-0.5 text-[10px] font-bold">
                      {shop.distanceLabel}
                    </span>
                  </p>
                </div>

                {/* Architectural Description */}
                <p className="font-body text-sm sm:text-base text-on-surface/90 max-w-2xl leading-relaxed border-l-2 border-primary pl-3">
                  {shop.description}
                </p>
              </div>

              {/* Amenities Footnote Chips */}
              <div className="pt-4 border-t-[1.5px] border-on-surface/10 flex flex-wrap gap-2 font-mono text-xs text-on-surface">
                {shop.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="bg-surface-variant px-2.5 py-1 border-[1.5px] border-on-surface font-bold"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column Photo Frame */}
            <div className="lg:col-span-4 relative bg-on-surface min-h-[280px] lg:min-h-full overflow-hidden flex items-end">
              <img
                src={shop.heroImageUrl}
                alt={shop.heroImageAlt}
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-90 transition-all duration-500 hover:scale-105 hover:grayscale-0"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-on-surface text-white font-mono text-[11px] font-bold px-2 py-1 border-[1.5px] border-white uppercase tracking-wider">
                  BANCADA TECH #01-#0{shop.totalBenches}
                </span>
              </div>
              <div className="relative z-10 w-full p-4 bg-gradient-to-t from-on-surface via-on-surface/80 to-transparent flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-live" />
                  CAMERA 01 • VISTA SALÃO
                </span>
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="bg-white text-on-surface hover:bg-primary hover:text-white border-[1.5px] border-on-surface px-3 py-1 font-mono text-xs font-bold transition-all shadow-[2px_2px_0px_#090D16] cursor-pointer"
                >
                  VER 12 FOTOS DA UNIDADE ↗
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN 2-COLUMN BOOKING WORKSPACE */}
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Step-by-Step Selection Engine */}
            <div className="lg:col-span-8 space-y-10">
              {/* ETAPA 01 // ESCOLHA OS SERVIÇOS */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-on-surface pb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-on-surface text-white font-mono text-xs font-bold px-2 py-0.5 uppercase tracking-wide">
                      ETAPA 01
                    </span>
                    <h2 className="font-headline font-bold text-lg sm:text-xl uppercase tracking-tight text-on-surface">
                      ESCOLHA OS SERVIÇOS DESEJADOS
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant font-medium">
                    Multi-seleção com cálculo automático de tempo
                  </span>
                </div>

                <div className="space-y-3">
                  {shop.services.map((service) => {
                    const isSelected = selectedServiceIds.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`group relative border-[1.5px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-[2px_2px_0px_#FF4D00]'
                            : 'bg-white border-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            className={`mt-1 sm:mt-0 px-2.5 py-1 border-[1.5px] border-on-surface font-mono text-xs font-bold flex items-center gap-1.5 uppercase transition-colors cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-primary text-white'
                                : 'bg-white group-hover:bg-on-surface group-hover:text-white text-on-surface'
                            }`}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{isSelected ? 'SELECIONADO' : 'ADICIONAR'}</span>
                          </button>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-headline font-bold text-base text-on-surface uppercase">
                                {service.name}
                              </h3>
                              {service.badge && (
                                <span
                                  className={`font-mono text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider ${
                                    service.badge === 'MAIS PEDIDO'
                                      ? 'bg-on-surface text-white'
                                      : 'bg-primary/10 text-primary border border-primary'
                                  }`}
                                >
                                  {service.badge}
                                </span>
                              )}
                            </div>
                            <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-on-surface/10 shrink-0">
                          <span className="bg-white border-[1.5px] border-on-surface px-2 py-0.5 font-mono text-xs font-bold text-on-surface">
                            {service.durationMin} MIN
                          </span>
                          <span className="font-mono text-lg font-bold text-on-surface tracking-tight">
                            {formatBRL(service.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ETAPA 02 // ESCOLHA O PROFISSIONAL */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-on-surface pb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-on-surface text-white font-mono text-xs font-bold px-2 py-0.5 uppercase tracking-wide">
                      ETAPA 02
                    </span>
                    <h2 className="font-headline font-bold text-lg sm:text-xl uppercase tracking-tight text-on-surface">
                      ESCOLHA O PROFISSIONAL
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant font-medium">
                    Bancadas monitoradas por telemetria
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shop.barbers.map((barber) => {
                    const isSelected = barber.id === selectedBarber.id;
                    return (
                      <div
                        key={barber.id}
                        onClick={() => handleSelectBarber(barber.id)}
                        className={`relative p-4 space-y-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-2 border-primary shadow-[3px_3px_0px_#FF4D00]'
                            : barber.isFastestMatch
                              ? 'bg-surface-variant border-[1.5px] border-on-surface hover:bg-white'
                              : 'bg-white border-[1.5px] border-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span
                              className={`font-mono text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 border ${
                                isSelected
                                  ? 'text-primary bg-primary/10 border-primary'
                                  : barber.isFastestMatch
                                    ? 'bg-on-surface text-white border-on-surface'
                                    : 'text-on-surface-variant bg-surface-variant border-on-surface/40'
                              }`}
                            >
                              {barber.bench}
                              {isSelected ? ' • ATIVA' : ''}
                            </span>
                            <h4 className="font-headline font-bold text-base text-on-surface mt-1">
                              {barber.name}
                            </h4>
                            {barber.rating ? (
                              <span className="font-mono text-xs text-on-surface-variant">
                                ★ {barber.rating} ({barber.cutsCount} cortes)
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-primary font-bold">
                                {barber.tags[0]}
                              </span>
                            )}
                          </div>

                          <div
                            className={`w-10 h-10 border-[1.5px] border-on-surface flex items-center justify-center font-headline font-bold text-sm ${
                              isSelected
                                ? 'bg-primary text-white'
                                : barber.isFastestMatch
                                  ? 'bg-live text-white text-lg'
                                  : 'bg-surface-variant text-on-surface'
                            }`}
                          >
                            {barber.initials}
                          </div>
                        </div>

                        {barber.description ? (
                          <p className="font-mono text-xs text-on-surface-variant">
                            {barber.description}
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {barber.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-surface-variant px-1.5 py-0.5 border border-on-surface/30"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t-[1.5px] border-on-surface/10 flex items-center justify-between">
                          <span
                            className={`font-mono text-xs font-bold flex items-center gap-1.5 ${
                              isSelected || barber.isFastestMatch
                                ? 'text-live'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected || barber.isFastestMatch ? 'bg-live' : 'bg-on-surface'
                              }`}
                            />
                            {barber.nextAvailable}
                          </span>

                          {isSelected ? (
                            <span className="bg-primary text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                              SELECIONADO
                            </span>
                          ) : (
                            <span className="border-[1.5px] border-on-surface bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                              SELECIONAR
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ETAPA 03 // GRADE DE HORÁRIOS EM TEMPO REAL */}
              <section id="grade-horarios" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-on-surface pb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-on-surface text-white font-mono text-xs font-bold px-2 py-0.5 uppercase tracking-wide">
                      ETAPA 03
                    </span>
                    <h2 className="font-headline font-bold text-lg sm:text-xl uppercase tracking-tight text-on-surface">
                      GRADE DE HORÁRIOS DINÂMICA • {selectedBarber.name.toUpperCase()}
                    </h2>
                  </div>
                </div>

                <div className="bg-surface-container-low border-[1.5px] border-on-surface p-3 font-mono text-xs text-on-surface flex items-center gap-2">
                  <Timer className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    Tempo de atendimento total calculado:{' '}
                    <strong className="font-bold">{effectiveDuration} minutos</strong> (+ 5 min
                    buffer de higienização entre atendimentos)
                  </span>
                </div>

                {/* Date Strip Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 font-mono text-xs">
                  {shop.dates.map((d) => {
                    const isActive = d.id === selectedDate.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDateId(d.id)}
                        className={`border-[1.5px] border-on-surface px-4 py-2 font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-on-surface text-white shadow-[2px_2px_0px_#FF4D00]'
                            : 'bg-white text-on-surface hover:bg-surface-variant'
                        }`}
                      >
                        {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
                        {d.label}
                      </button>
                    );
                  })}
                </div>

                {/* Slots Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {barberSlots.map((slot) => {
                    const slotEnd = addMinutes(slot.time, effectiveDuration);
                    const isSelected = slot.time === selectedSlotTime;

                    if (slot.status === 'occupied') {
                      return (
                        <div
                          key={slot.time}
                          className="bg-surface-container-high border-[1.5px] border-on-surface/40 p-3 text-left space-y-1 opacity-60 cursor-not-allowed"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] font-bold text-on-surface/60 tracking-wider uppercase">
                            <span>INDISPONÍVEL</span>
                            <span>BLOQUEADO</span>
                          </div>
                          <div className="font-headline font-bold text-xl tracking-tight line-through text-on-surface/50">
                            {slot.time}
                          </div>
                          <div className="font-mono text-[11px] text-on-surface-variant">
                            {slot.time} — {slotEnd}
                          </div>
                          <div className="pt-1 text-[10px] font-mono text-on-surface-variant text-center py-0.5 mt-1 bg-surface-variant">
                            {slot.time} OCUPADO
                          </div>
                        </div>
                      );
                    }

                    if (isSelected) {
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedSlotTime(slot.time)}
                          className="bg-primary text-white border-[1.5px] border-on-surface p-3 text-left space-y-1 shadow-[3px_3px_0px_#090D16] transition-transform cursor-pointer"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] font-bold tracking-wider uppercase">
                            <span>{slot.label ?? 'SLOT SELECIONADO'}</span>
                            <span>[TRAVADO]</span>
                          </div>
                          <div className="font-headline font-bold text-xl tracking-tight">
                            {slot.time}
                          </div>
                          <div className="font-mono text-[11px] opacity-90">
                            {slot.time} — {slotEnd}
                          </div>
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider bg-on-surface text-white text-center py-0.5 mt-1">
                            SELECIONADO (VAGA TRAVADA)
                          </div>
                        </button>
                      );
                    }

                    const isLast = slot.status === 'last';
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedSlotTime(slot.time)}
                        className="bg-white hover:bg-surface-container-low text-on-surface border-[1.5px] border-on-surface p-3 text-left space-y-1 transition-all group cursor-pointer"
                      >
                        <div
                          className={`flex items-center justify-between font-mono text-[10px] font-bold tracking-wider uppercase ${
                            isLast ? 'text-primary' : 'text-live'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLast ? 'bg-primary' : 'bg-live'
                              }`}
                            />
                            {isLast ? 'ÚLTIMA VAGA' : 'DISPONÍVEL'}
                          </span>
                          <span>{isLast ? 'NOTURNO' : 'LIVRE'}</span>
                        </div>
                        <div className="font-headline font-bold text-xl tracking-tight text-on-surface group-hover:text-primary">
                          {slot.time}
                        </div>
                        <div className="font-mono text-[11px] text-on-surface-variant">
                          {slot.time} — {slotEnd}
                        </div>
                        <div
                          className={`text-[10px] font-mono text-center py-0.5 mt-1 border ${
                            isLast
                              ? 'text-primary font-bold bg-primary/10 border-primary'
                              : 'text-on-surface-variant border-on-surface/20'
                          }`}
                        >
                          {isLast ? 'ÚLTIMA VAGA DO TURNO' : 'DISPONÍVEL IMEDIATO'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Technical Footnote */}
                <div className="pt-2 font-mono text-[11px] text-on-surface-variant flex items-start gap-2">
                  <span className="text-primary font-bold">⚡</span>
                  <span>
                    GRADE SINCRONIZADA EM TEMPO REAL VIA WEBSOCKET • BUFFER DE 5 MIN DE HIGIENIZAÇÃO
                    E ESTERILIZAÇÃO DE NAVALHA INCLUSO ENTRE CADA ATENDIMENTO.
                  </span>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Sticky Technical Booking Summary Drawer */}
            <aside className="lg:col-span-4 lg:sticky lg:top-20">
              <div className="bg-white border-[1.5px] border-on-surface shadow-[4px_4px_0px_#090D16]">
                {/* Summary Header */}
                <div className="bg-on-surface text-white p-4 border-b-[1.5px] border-on-surface">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-wider text-primary uppercase">
                      RESUMO DA RESERVA
                    </span>
                    <span className="bg-primary/20 text-primary border border-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
                      TRAVA ATIVA: {lockMin}:{lockSec}
                    </span>
                  </div>
                  <div className="font-headline font-bold text-lg text-white uppercase mt-1">
                    {selectedBarber.bench} • CONFIRMAÇÃO
                  </div>
                </div>

                {/* Metadata Spec Sheet */}
                <div className="p-5 space-y-4 font-mono text-xs">
                  <div className="space-y-2 pb-4 border-b-[1.5px] border-on-surface/10">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-on-surface-variant">UNIDADE:</span>
                      <span className="font-bold text-on-surface text-right">{shop.name}</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-on-surface-variant">ENDEREÇO:</span>
                      <span className="text-on-surface text-right truncate max-w-[200px]">
                        {shop.address.split('—')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-on-surface-variant">PROFISSIONAL:</span>
                      <span className="font-bold text-on-surface text-right">
                        {selectedBarber.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-on-surface-variant">DATA &amp; HORA:</span>
                      <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 text-right">
                        {selectedDate.label} • {selectedSlotTime} às {endTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-on-surface-variant">DURAÇÃO TOTAL:</span>
                      <span className="font-bold text-on-surface">{effectiveDuration} MINUTOS</span>
                    </div>
                  </div>

                  {/* Itemized Receipt with Dotted Leaders */}
                  <div className="space-y-2 py-2">
                    {selectedServices.map((srv) => (
                      <div key={srv.id} className="flex items-center justify-between text-xs">
                        <span className="text-on-surface font-medium truncate max-w-[190px]">
                          {srv.name} [{srv.durationMin}m]
                        </span>
                        <span className="border-b border-dotted border-on-surface/40 flex-1 mx-2" />
                        <span className="font-bold text-on-surface">{formatBRL(srv.price)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>Buffer Técnico Higienização [5m]</span>
                      <span className="border-b border-dotted border-on-surface/40 flex-1 mx-2" />
                      <span className="font-bold text-live">GRÁTIS</span>
                    </div>
                  </div>

                  {/* Heavy Separator Line */}
                  <div className="border-t-2 border-on-surface pt-4 space-y-1">
                    <div className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">
                      VALOR TOTAL ESTIMADO
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="font-headline font-bold text-3xl sm:text-4xl text-on-surface tracking-tight">
                        {formatBRL(totalPrice)}
                      </div>
                      <span className="text-[11px] text-live font-bold bg-live/10 border border-live px-1.5 py-0.5">
                        SEM TAXAS EXTRAS
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant">
                      PAGAMENTO 1-CLICK PIX OU CARTÃO NO CHECK-IN
                    </p>
                  </div>

                  {/* Action CTAs */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      className="w-full border-[1.5px] border-on-surface py-3.5 px-4 font-headline font-bold text-sm uppercase tracking-wider transition-all shadow-[3px_3px_0px_#090D16] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 cursor-pointer bg-primary hover:bg-on-surface text-white"
                    >
                      <span>AVANÇAR PARA CHECKOUT 15S</span>
                      <span>↗</span>
                    </button>

                    <a
                      href="#grade-horarios"
                      className="block w-full text-center bg-white hover:bg-surface-variant text-on-surface border-[1.5px] border-on-surface py-2 font-mono text-xs font-bold uppercase transition-colors"
                    >
                      [ESCOLHER OUTRO HORÁRIO]
                    </a>
                  </div>

                  {/* Security & SLA Protocol Badge */}
                  <div className="pt-3 border-t-[1.5px] border-on-surface/10">
                    <div className="bg-surface-container-low border border-on-surface/20 p-2.5 space-y-1 text-[10px] leading-tight text-on-surface-variant">
                      <div className="flex items-center gap-1.5 font-bold text-on-surface">
                        <ShieldCheck className="w-4 h-4 text-live shrink-0" />
                        <span>PROTOCOLO ANTI-CONFLITO CLIPPER</span>
                      </div>
                      <p>
                        Cadeira garantida com bloqueio instantâneo no sistema da barbearia. Sem
                        atrasos, sem fila de espera física.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* INTERNAL FOOTER */}
      <footer className="w-full bg-surface-variant border-t-[1.5px] border-on-surface mt-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-[1.5px] border-on-surface">
            <div className="flex flex-col gap-1">
              <span className="font-headline font-bold text-sm tracking-tight uppercase text-on-surface">
                CLIPPER PULSE // URBAN TECH SCHEDULING
              </span>
              <span className="font-mono text-xs text-on-surface-variant">
                LATÊNCIA DO PROTOCOLO: 24MS | SERVIDOR REGIONAL: GRU-01
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white border-[1.5px] border-on-surface">
                <span className="w-2 h-2 rounded-full bg-live" />
                <span className="text-on-surface font-bold">REDE OPERACIONAL</span>
              </div>
              <span className="text-on-surface-variant">SLOT RADAR v2.4.9</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 font-mono text-[11px] text-on-surface-variant">
            <p>© 2026 CLIPPER TECH INC. ARQUITETURA NEO-BRUTALISTA DE ALTA PRECISÃO.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-on-surface cursor-pointer uppercase">SLA 99.98%</span>
              <span className="hover:text-on-surface cursor-pointer uppercase">
                SEGURANÇA TELEMETRIA
              </span>
              <span className="hover:text-on-surface cursor-pointer uppercase">DOCS PROTOCOLO</span>
            </div>
          </div>
        </div>
      </footer>

      {/* GALLERY MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/80 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-on-surface shadow-[6px_6px_0px_#FF4D00] max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b-[1.5px] border-on-surface pb-3">
              <span className="font-mono text-xs font-bold uppercase text-on-surface">
                GALERIA TÉCNICA // {shop.name}
              </span>
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="p-1 border border-on-surface hover:bg-on-surface hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={shop.heroImageUrl}
              alt={shop.heroImageAlt}
              className="w-full h-72 object-cover border-[1.5px] border-on-surface"
            />
            <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
              <span>VISTA PRINCIPAL DAS BANCADAS #01–#0{shop.totalBenches}</span>
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="px-3 py-1.5 bg-on-surface text-white font-bold uppercase cursor-pointer"
              >
                FECHAR [ESC]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
