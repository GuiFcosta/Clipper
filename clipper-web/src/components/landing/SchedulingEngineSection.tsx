import { ArrowLeftRight, BellRing, Hourglass } from 'lucide-react';
import { ENGINE_MODULES, type EngineModule } from '../../data/mockLandingData';

function ModuleIcon({ icon }: { icon: EngineModule['icon'] }) {
  if (icon === 'sync') return <ArrowLeftRight className="w-6 h-6 text-on-surface" />;
  if (icon === 'hourglass') return <Hourglass className="w-6 h-6 text-on-surface" />;
  return <BellRing className="w-6 h-6 text-on-surface" />;
}

export function SchedulingEngineSection() {
  return (
    <section
      id="motor"
      className="w-full bg-white p-6 sm:p-10 lg:p-14 space-y-12 border-b-[1.5px] border-outline"
    >
      <div className="space-y-3 max-w-3xl">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
          [ MOTOR OPERACIONAL CLIPPER.OS ]
        </div>
        <h2 className="font-headline font-bold text-3xl sm:text-5xl uppercase tracking-tight text-on-surface">
          Arquitetura de Sincronia Zero Atualização Manual
        </h2>
        <p className="font-body text-base text-slate-600">
          Eliminamos as falhas clássicas de agendamento por WhatsApp, agendas de papel e apps legados. Uma
          rede distribuída que garante tolerância zero a overbooking.
        </p>
      </div>

      {/* Bento Grid de 3 Módulos Técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ENGINE_MODULES.map((mod) => (
          <div
            key={mod.code}
            className="p-8 bg-surface-container-low border-[1.5px] border-outline shadow-[4px_4px_0px_#090D16] flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary bg-white border border-outline px-2.5 py-1">
                  {mod.code}
                </span>
                <ModuleIcon icon={mod.icon} />
              </div>
              <h3 className="font-headline font-bold text-xl uppercase tracking-tight text-on-surface">
                {mod.title}
              </h3>
              <p className="font-body text-sm text-slate-600 leading-relaxed">{mod.description}</p>
            </div>

            <div className="p-3 bg-white border border-outline-variant font-mono text-[11px] text-slate-700 space-y-1">
              <div className="text-slate-400 font-bold uppercase tracking-wider">{mod.detailsTitle}</div>
              {mod.details.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Diagnostic Line */}
      <div className="p-4 bg-surface-variant border border-outline flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-live shrink-0" />
          <span className="font-bold text-on-surface">
            ARQUITETURA DE TOLERÂNCIA A CONFLITO: ZERO DUPLICIDADE DETECTADA HOJE
          </span>
        </div>
        <div className="text-slate-500 font-medium">SLOT COMPLIANCE SCORE: 99.98% • REST API v2.4</div>
      </div>
    </section>
  );
}
