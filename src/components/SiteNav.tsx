import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Database,
  Film,
  Info,
  Menu,
  Shield,
  Terminal,
  Tv,
  X,
} from 'lucide-react';
import { useCompactWhenOverflow } from '../hooks/useCompactWhenOverflow';
import { useBelowBreakpoint } from '../hooks/useBelowBreakpoint';

interface SiteNavProps {
  backTo?: { label: string; path: string };
  title?: string;
  /** Renders before nav links (e.g. Share on calculator) */
  actions?: React.ReactNode;
  /** Always use menu below this breakpoint (matches calculator single-column layout at lg) */
  forceMenuBelow?: 'lg' | 'xl';
}

const SiteNav: React.FC<SiteNavProps> = ({ backTo, title, actions, forceMenuBelow }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const navAreaRef = useRef<HTMLDivElement>(null);
  const navMeasureRef = useRef<HTMLDivElement>(null);
  const belowForcedBreakpoint = useBelowBreakpoint(forceMenuBelow ?? null);
  const overflowMenu = useCompactWhenOverflow(navAreaRef, navMeasureRef);
  const useMenu = belowForcedBreakpoint || overflowMenu;

  const navLinks = [
    { to: '/', label: 'Calculator', icon: Film },
    { to: '/streaming-services', label: 'Spec Library', icon: Tv },
    { to: '/codec-data', label: 'Database', icon: Database },
    { to: '/about-ffmpeg', label: 'FFmpeg', icon: Terminal },
    { to: '/about', label: 'About', icon: Info },
    { to: '/privacy', label: 'Privacy', icon: Shield },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!useMenu) {
      setMenuOpen(false);
    }
  }, [useMenu]);

  const linkClass = (path: string) =>
    `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
      isActive(path)
        ? 'bg-blue-500/20 text-blue-200'
        : 'bg-dark-secondary hover:bg-gray-700 text-gray-300'
    }`;

  const actionWrapperClass = 'flex items-center shrink-0';

  return (
    <header className="border-b border-gray-800 bg-dark-secondary/50 backdrop-blur-sm relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 shrink">
            {backTo ? (
              <Link
                to={backTo.path}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base hidden sm:inline">{backTo.label}</span>
              </Link>
            ) : (
              <Link to="/" className="flex items-center space-x-2 shrink-0 min-w-0">
                <Film className="h-6 w-6 text-blue-400 shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-white truncate hidden sm:inline">
                  VideoCalc
                </span>
              </Link>
            )}
            {title && (
              <span className="text-sm sm:text-base text-gray-300 truncate hidden md:inline">
                {title}
              </span>
            )}
          </div>

          <div
            ref={navAreaRef}
            className="relative flex flex-1 items-center justify-end min-w-0 h-full gap-2"
          >
            <div
              ref={navMeasureRef}
              aria-hidden
              className="pointer-events-none invisible absolute right-0 top-1/2 flex -translate-y-1/2 items-center space-x-2"
            >
              {actions && <span className={actionWrapperClass}>{actions}</span>}
              {navLinks.map(({ to, label, icon: Icon }) => (
                <span key={to} className={linkClass(to)}>
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </span>
              ))}
            </div>

            {useMenu ? (
              <>
                {actions && <div className={actionWrapperClass}>{actions}</div>}
                <button
                  type="button"
                  onClick={() => setMenuOpen(open => !open)}
                  className="p-2 rounded-lg bg-dark-secondary hover:bg-gray-700 transition-colors shrink-0"
                  aria-expanded={menuOpen}
                  aria-controls="site-nav-menu"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                >
                  {menuOpen ? (
                    <X className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Menu className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </>
            ) : (
              <nav aria-label="Main" className="flex items-center space-x-2 shrink-0">
                {actions && <div className={actionWrapperClass}>{actions}</div>}
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={linkClass(to)}>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>

        {useMenu && menuOpen && (
          <nav
            id="site-nav-menu"
            aria-label="Main"
            className="absolute top-full left-0 right-0 bg-dark-secondary border-b border-gray-800 shadow-lg z-40"
          >
            <div className="px-4 py-3 space-y-1 max-w-7xl mx-auto">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive(to)
                      ? 'bg-blue-500/15 text-blue-200'
                      : 'hover:bg-dark-primary text-gray-300'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className={`h-5 w-5 ${isActive(to) ? 'text-blue-300' : 'text-gray-400'}`} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default SiteNav;
