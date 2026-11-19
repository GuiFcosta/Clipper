import { useState } from 'react';

export function B2BPartnerSection() {
  const [requested, setRequested] = useState(false);

  return (
    <section id="parceiros" className="w-full bg-on-surface text-white p-8 sm:p-12 lg:p-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <span>PARCERIA B2B // BARBEARIAS DA CIDADE</span>
          </div>

          <h2 className="font-headline font-bold text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
            É dono de barbearia? Conecte seu espaço ao Hub CLIPPER e zere horários ociosos.
          </h2>

          <p className="font-body text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
            Elimine buracos na grade de segunda a quinta. Conecte sua barbearia à maior rede de agendamento
            instantâneo do país e receba clientes qualificados sem atrito, sem comissão predatória e sem
            complicação.
          </p>

          {/* Métricas B2B em Bloco de Alto Impacto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <div className="font-headline font-bold text-2xl sm:text-3xl text-live">+38%</div>
              <div className="font-mono text-xs text-slate-300 font-medium">
                Taxa de Ocupação da Cadeira
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <div className="font-headline font-bold text-2xl sm:text-3xl text-primary">0 Minutos</div>
              <div className="font-mono text-xs text-slate-300 font-medium">
                Perdidos respondendo WhatsApp
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <div className="font-headline font-bold text-2xl sm:text-3xl text-white">10 Minutos</div>
              <div className="font-mono text-xs text-slate-300 font-medium">
                Setup e integração da bancada
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-center space-y-4 bg-white/5 border border-white/15 p-6 sm:p-8">
          <div className="font-mono text-xs text-slate-400 uppercase tracking-widest">
            // INTEGRAÇÃO IMEDIATA
          </div>
          <div className="font-headline font-bold text-xl uppercase text-white">
            Pronto para plugar sua barbearia?
          </div>
          <p className="font-body text-xs text-slate-300 leading-relaxed">
            Nossa equipe realiza a ponte com o seu sistema de agendamento atual em menos de 24 horas úteis.
          </p>

          <button
            type="button"
            onClick={() => setRequested(true)}
            className={`w-full py-4 px-6 font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              requested
                ? 'bg-live text-white'
                : 'bg-primary hover:bg-[#e04400] text-white shadow-[3px_3px_0px_#FFFFFF]'
            }`}
          >
            <span>
              {requested ? 'SOLICITAÇÃO REGISTRADA ✓' : 'CREDENCIAR MINHA BARBEARIA ↗'}
            </span>
          </button>

          <div className="font-mono text-[10px] text-slate-400 text-center uppercase tracking-wide">
            {requested
              ? 'Protocolo B2B iniciado • Equipe técnica em contato'
              : 'Sem mensalidade de adesão • Cancele quando quiser'}
          </div>
        </div>
      </div>
    </section>
  );
}
