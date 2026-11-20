import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface InternalNavbarProps {
  activeTab?: 'radar' | 'barbearias' | 'agendamentos' | 'favoritos';
}

export function InternalNavbar({ activeTab = 'barbearias' }: InternalNavbarProps) {
  const { isAuthenticated, user } = useAuth();

  const navItems: { id: InternalNavbarProps['activeTab']; label: string; to: string }[] = [
    { id: 'radar', label: 'RADAR AO VIVO', to: '/radar' },
    { id: 'barbearias', label: 'BARBEARIAS', to: '/barbearia/grid-lab-01' },
    { id: 'agendamentos', label: 'MEUS AGENDAMENTOS', to: '/dashboard' },
    { id: 'favoritos', label: 'FAVORITOS', to: '/#barbearias' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white border-b-[1.5px] border-on-surface">
      <div className="h-16 max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-3 h-3 bg-primary border-[1.5px] border-on-surface block" />
            <span className="font-headline font-bold text-lg tracking-tighter uppercase text-on-surface">
              CLIPPER<span className="text-primary">//</span>HUB.v2
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-surface-variant border-[1.5px] border-on-surface font-mono text-[11px] font-bold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
            <span className="text-on-surface">84 UNIDADES ONLINE</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 font-mono text-xs tracking-wider">
          {navItems.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`px-3 py-2 transition-colors uppercase ${
                  isActive
                    ? 'bg-on-surface text-white font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border-[1.5px] border-on-surface font-mono text-xs font-bold bg-white text-on-surface">
            <span className="w-1.5 h-1.5 bg-on-surface rounded-full" />
            <span>
              [{isAuthenticated && user ? user.fullName.toUpperCase() : 'GUILHERME B.'} • SP]
            </span>
          </div>

          <a
            href="#grade-horarios"
            className="flex items-center gap-1.5 bg-primary text-on-primary border-[1.5px] border-on-surface px-4 py-2 font-headline font-bold text-xs uppercase tracking-wider hover:bg-on-surface hover:text-white transition-all shadow-[2px_2px_0px_#090D16] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span>AGENDAR RÁPIDO</span>
            <span>↗</span>
          </a>

          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            title={isAuthenticated ? 'Dashboard' : 'Entrar'}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-[1.5px] border-on-surface hover:opacity-90 transition-opacity"
          >
            <User className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    </header>
  );
}
