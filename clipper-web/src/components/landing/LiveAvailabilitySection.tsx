import { ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import { FILTER_CHIPS, PARTNER_BARBERSHOPS } from '../../data/mockLandingData';

interface LiveAvailabilitySectionProps {
  onSelectSlot?: (shopName: string, time: string) => void;
}

export function LiveAvailabilitySection({ onSelectSlot }: LiveAvailabilitySectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

  const visibleShops = PARTNER_BARBERSHOPS.filter((shop) => shop.categories.includes(activeFilter));

  function handleSlotClick(shopId: string, shopName: string, time: string) {
    setSelectedSlots((prev) => ({ ...prev, [shopId]: time }));
    onSelectSlot?.(shopName, time);
  }

  return (
    <section
      id="barbearias"
      className="w-full bg-surface-container-low p-6 sm:p-10 lg:p-14 space-y-8 border-b-[1.5px] border-outline"
    >
      {/* Header da Seção & Filtros */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-primary uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            [ FEED AO VIVO • ZONA URBANA ]
          </div>
          <h2 className="font-headline font-bold text-3xl sm:text-4xl uppercase tracking-tight text-on-surface">
            Disponibilidade Imediata no Radar
          </h2>
          <p className="font-body text-sm text-slate-600 max-w-xl">
            Cadeiras sincronizadas com atualização a cada 5 segundos. Clique num slot para pré-reservar
            instantaneamente.
          </p>
        </div>

        {/* Quick Chips Filter Neo-Brutalist */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3 py-1.5 font-mono text-xs uppercase border border-outline transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-on-surface text-white font-bold'
                    : 'bg-white hover:bg-slate-100 text-on-surface font-medium'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade 4 Colunas com Cards Técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleShops.map((shop) => {
          const occupancyPct = Math.round((shop.availableBenches / shop.totalBenches) * 100);
          const chosenSlot = selectedSlots[shop.id];

          return (
            <div
              key={shop.id}
              className="bg-white border-[1.5px] border-outline p-5 flex flex-col justify-between shadow-[4px_4px_0px_#090D16] hover:shadow-[6px_6px_0px_#090D16] transition-all group"
            >
              <div>
                {/* Top Card Meta */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-bold text-white bg-on-surface px-2 py-0.5">
                    {shop.hubCode}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold flex items-center gap-1 ${
                      shop.isUrgentDistance ? 'text-primary' : 'text-live'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        shop.isUrgentDistance ? 'bg-primary animate-pulse' : 'bg-live'
                      }`}
                    />
                    {shop.distanceLabel}
                  </span>
                </div>

                {/* Barber Shop Image */}
                <div className="w-full h-40 bg-slate-200 border border-outline mb-4 overflow-hidden relative">
                  <img
                    src={shop.imageUrl}
                    alt={shop.imageAlt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 bg-on-surface/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 backdrop-blur-sm">
                    {shop.neighborhood}
                  </span>
                </div>

                <h3 className="font-headline font-bold text-lg text-on-surface uppercase tracking-tight">
                  {shop.name}
                </h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">{shop.address}</p>

                {/* Ocupação e Indicador */}
                <div className={`mt-4 p-2.5 border border-outline-variant ${shop.isLastSpot ? 'bg-[#FFF5F0]' : 'bg-surface-container-low'}`}>
                  <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                    <span className={shop.isLastSpot ? 'text-primary font-bold' : 'text-slate-600 font-semibold'}>
                      {shop.isLastSpot ? 'ÚLTIMA VAGA HOJE:' : 'Ocupação Atual:'}
                    </span>
                    <span className={shop.isLastSpot ? 'text-primary font-bold' : 'text-live font-bold'}>
                      {shop.availableBenches}/{shop.totalBenches} {shop.isLastSpot ? 'Livre' : 'Livres'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 overflow-hidden flex">
                    <div className="bg-live h-full" style={{ width: `${occupancyPct}%` }} />
                    <div className="bg-primary h-full" style={{ width: `${100 - occupancyPct}%` }} />
                  </div>
                </div>

                {/* Tags Técnicas */}
                <div className="flex items-center justify-between font-mono text-xs mt-3 pt-3 border-t border-slate-100">
                  <span className="font-bold text-on-surface">{shop.priceLabel}</span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    {shop.rating} ({shop.reviewsCount})
                  </span>
                </div>

                {/* Chips de Horários Imediatos */}
                <div className="mt-4">
                  <div
                    className={`font-mono text-[10px] uppercase font-bold mb-2 ${
                      shop.isLastSpot ? 'text-primary' : 'text-slate-500'
                    }`}
                  >
                    {shop.isLastSpot ? 'Horários Quase Esgotados:' : 'Slots Livres Hoje:'}
                  </div>
                  <div
                    className={`grid gap-2 font-mono text-xs font-bold text-center ${
                      shop.slots.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                    }`}
                  >
                    {shop.slots.map((slot) => {
                      const isChosen = chosenSlot === slot.time;
                      const variantClass = isChosen
                        ? 'bg-on-surface text-white border-on-surface'
                        : slot.variant === 'primary'
                          ? 'bg-primary text-white hover:bg-[#e04400] border-outline'
                          : slot.variant === 'live'
                            ? 'bg-live text-white hover:bg-emerald-600 border-outline font-black'
                            : 'bg-slate-100 text-on-surface hover:bg-slate-200 border-outline-variant';

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => handleSlotClick(shop.id, shop.name, slot.time)}
                          className={`py-2 border transition-colors cursor-pointer ${variantClass}`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() =>
                  handleSlotClick(shop.id, shop.name, chosenSlot ?? shop.slots[0]?.time ?? '15:15')
                }
                className="w-full mt-5 py-3 bg-on-surface text-white hover:bg-primary font-mono text-xs uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{chosenSlot ? `Cadeira Travada (${chosenSlot})` : 'Travar Cadeira'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
