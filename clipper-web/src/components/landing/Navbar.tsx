import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface border-b-[1.5px] border-outline">
      <div className="w-full flex h-16">
        <div className="flex items-center gap-3 px-6 border-r-[1.5px] border-outline bg-surface">
          <a
            href="#"
            className="font-headline font-bold text-base tracking-tight text-on-surface whitespace-nowrap"
          >
            CLIPPER
          </a>
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-surface-variant border border-outline font-mono text-[11px] font-semibold text-on-surface uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
            <span>1.428 CADEIRAS LIVRES AGORA</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-stretch flex-1">
          <Link
            to="/radar"
            className="flex items-center px-6 text-xs uppercase tracking-wider font-mono border-r-[1.5px] border-outline transition-colors bg-surface-variant font-bold text-on-surface hover:text-primary"
          >
            Radar Ao Vivo
          </Link>
          <a
            href="#barbearias"
            className="flex items-center px-6 text-xs uppercase tracking-wider font-mono text-on-surface-variant hover:text-on-surface border-r-[1.5px] border-outline transition-colors"
          >
            Barbearias &amp; Profissionais
          </a>
          <a
            href="#motor"
            className="flex items-center px-6 text-xs uppercase tracking-wider font-mono text-on-surface-variant hover:text-on-surface border-r-[1.5px] border-outline transition-colors"
          >
            Motor de Agenda
          </a>
          <a
            href="#parceiros"
            className="flex items-center px-6 text-xs uppercase tracking-wider font-mono text-on-surface-variant hover:text-on-surface border-r-[1.5px] border-outline transition-colors"
          >
            API &amp; Parceiros
          </a>
        </nav>

        <div className="flex items-center ml-auto">
          <div className="hidden sm:flex items-center h-full px-5 border-l-[1.5px] border-outline font-mono text-xs text-on-surface-variant">
            LATÊNCIA: 18ms
          </div>
          <div className="flex items-center h-full px-4 border-l-[1.5px] border-outline">
            <a
              href="#barbearias"
              className="flex items-center justify-center px-5 h-10 bg-primary text-on-primary font-mono text-xs uppercase tracking-wider font-bold border border-outline shadow-[2px_2px_0px_#090D16] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#090D16] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap"
            >
              [ Agendar em 15s ↗ ]
            </a>
          </div>
          <Link
            to={isAuthenticated ? '/meus-agendamentos' : '/login'}
            title={isAuthenticated && user ? `${user.fullName} (Meus Agendamentos)` : 'Entrar no Clipper'}
            className="flex items-center justify-center h-full px-4 border-l-[1.5px] border-outline bg-surface hover:bg-surface-variant transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-on-primary" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
