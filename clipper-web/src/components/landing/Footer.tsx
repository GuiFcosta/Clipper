import { CITIES_COVERAGE } from '../../data/mockLandingData';

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t-[1.5px] border-outline">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4 p-8 border-b md:border-b-0 lg:border-r-[1.5px] border-outline flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="font-headline font-bold text-lg uppercase tracking-tight text-on-surface">
              [CLIPPER // HUB.v2]
            </div>
            <p className="font-mono text-xs text-on-surface-variant leading-relaxed max-w-sm">
              Arquitetura operacional de alta precisão para barbearias metropolitanas. Despacho dinâmico de
              horários e sincronização milimétrica de demanda.
            </p>
          </div>
          <div className="p-3 bg-surface-variant border border-outline space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-on-surface-variant">SISTEMA DISPATCH:</span>
              <span className="font-bold text-live flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-live" />
                ONLINE 99.98%
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-on-surface-variant">PROTOCOLO:</span>
              <span className="font-bold text-on-surface">SLOT-SYNC v2.4</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 p-8 border-b md:border-b-0 md:border-r-[1.5px] border-outline">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface mb-4">
            [ REDE &amp; CIDADES ]
          </div>
          <ul className="space-y-2.5 font-mono text-xs text-on-surface-variant">
            {CITIES_COVERAGE.map((item) => (
              <li key={item.city} className="flex items-center justify-between">
                <span>{item.city}</span>
                <span className="text-on-surface font-semibold">{item.slots} slots</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 p-8 border-b lg:border-b-0 lg:border-r-[1.5px] border-outline">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface mb-4">
            [ TECNOLOGIA &amp; API ]
          </div>
          <ul className="space-y-2.5 font-mono text-xs text-on-surface-variant">
            <li>
              <a href="#motor" className="hover:text-primary transition-colors">
                Documentação API REST ↗
              </a>
            </li>
            <li>
              <a href="#motor" className="hover:text-primary transition-colors">
                Webhooks de Concorrência
              </a>
            </li>
            <li>
              <a href="#motor" className="hover:text-primary transition-colors">
                SDK Node / Python / Go
              </a>
            </li>
            <li>
              <a href="#radar" className="hover:text-primary transition-colors">
                Telemetria de Disponibilidade
              </a>
            </li>
            <li>
              <a href="#parceiros" className="hover:text-primary transition-colors">
                Criptografia Zero-Knowledge
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2 p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface mb-4">
              [ COMPLIANCE ]
            </div>
            <ul className="space-y-2 font-mono text-xs text-on-surface-variant">
              <li>
                <a href="#parceiros" className="hover:text-on-surface transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#parceiros" className="hover:text-on-surface transition-colors">
                  LGPD &amp; Dados
                </a>
              </li>
              <li>
                <a href="#parceiros" className="hover:text-on-surface transition-colors">
                  Contrato SLA 99.9%
                </a>
              </li>
              <li>
                <a href="#parceiros" className="hover:text-on-surface transition-colors">
                  Status SOC-2
                </a>
              </li>
            </ul>
          </div>
          <div className="font-mono text-[10px] text-on-surface-variant border-t border-outline-variant pt-4">
            © 2026 CLIPPER TECH LTD.
            <br />
            PRECISION SCHEDULING INFRA.
          </div>
        </div>
      </div>
    </footer>
  );
}
