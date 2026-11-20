import { CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { B2BPartnerSection } from '../components/landing/B2BPartnerSection';
import { Footer } from '../components/landing/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { LiveAvailabilitySection } from '../components/landing/LiveAvailabilitySection';
import { Navbar } from '../components/landing/Navbar';
import { SchedulingEngineSection } from '../components/landing/SchedulingEngineSection';

interface SlotToast {
  target: string;
  time: string;
}

export function LandingPage() {
  const [slotToast, setSlotToast] = useState<SlotToast | null>(null);

  function handleSlotLock(target: string, time: string) {
    setSlotToast({ target, time });
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <Navbar />

      <main className="w-full pt-16 flex-1">
        <HeroSection onSlotQuickBook={handleSlotLock} />
        <LiveAvailabilitySection onSelectSlot={handleSlotLock} />
        <SchedulingEngineSection />
        <B2BPartnerSection />
      </main>

      <Footer />

      {slotToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-on-surface text-white border-[1.5px] border-outline shadow-[4px_4px_0px_#FF4D00] p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-live uppercase">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>SLOT PRÉ-TRAVADO POR 05:00</span>
            </div>
            <button
              type="button"
              onClick={() => setSlotToast(null)}
              aria-label="Fechar aviso"
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="font-mono text-xs text-slate-200">
            <strong className="text-white">{slotToast.target}</strong> • Horário{' '}
            <strong className="text-primary">{slotToast.time}</strong> reservado temporariamente na grade.
          </p>
          <Link
            to="/checkout"
            className="block w-full py-2.5 px-4 bg-primary hover:bg-[#e04400] text-white text-center font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Confirmar Reserva (15s) ↗
          </Link>
        </div>
      )}
    </div>
  );
}
