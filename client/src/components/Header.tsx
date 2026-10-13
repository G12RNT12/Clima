import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudSun, Laptop, Moon, Star, Sun } from 'lucide-react';
import type { FavoriteCity, Units } from '../types/weather';
import type { ThemeMode } from '../hooks/useTheme';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  onSelectCity: (city: Omit<FavoriteCity, 'id'>) => void;
  onRequestGeolocation: () => void;
  isLocating: boolean;
  units: Units;
  onToggleUnits: () => void;
  theme: ThemeMode;
  onCycleTheme: () => void;
  favoritesCount: number;
  onOpenDrawer: () => void;
}

/**
 * Barra superior del observatorio meteorológico con buscador global,
 * acceso a favoritos (página /favorites y cajón rápido), selector de unidades y tema.
 */
export const Header: React.FC<HeaderProps> = ({
  onSelectCity,
  onRequestGeolocation,
  isLocating,
  units,
  onToggleUnits,
  theme,
  onCycleTheme,
  favoritesCount,
  onOpenDrawer,
}) => {
  const location = useLocation();
  const isFavoritesRoute = location.pathname === '/favorites';

  const themeLabel =
    theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Oscuro' : 'Claro';

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/35 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-400/70 rounded-xl"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/20 border border-sky-300/35 text-sky-300">
              <CloudSun className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight block leading-none">
                Atmos
              </span>
              <span className="text-[11px] text-white/60 block mt-0.5">
                Observatorio climático
              </span>
            </div>
          </Link>

          {/* Controles compactos en móvil */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleUnits}
              aria-label="Cambiar sistema de unidades"
              className="rounded-xl bg-slate-900/50 px-2.5 py-2 text-xs font-semibold text-white border border-white/15 tabular-nums"
            >
              {units === 'metric' ? '°C · km/h' : '°F · mph'}
            </button>
            <button
              type="button"
              onClick={onOpenDrawer}
              aria-label="Abrir cajón de favoritos"
              className="relative rounded-xl bg-slate-900/50 p-2 text-white border border-white/15"
            >
              <Star className="h-4 w-4 text-amber-300" />
              {favoritesCount > 0 && (
                <span className="ml-1 text-xs font-semibold tabular-nums">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador de ciudades con autocompletado */}
        <SearchBar
          onSelectCity={onSelectCity}
          onRequestGeolocation={onRequestGeolocation}
          isLocating={isLocating}
        />

        {/* Controles de escritorio: Navegación, Favoritos, Unidades y Tema */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            to={isFavoritesRoute ? '/' : '/favorites'}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-medium border transition ${
              isFavoritesRoute
                ? 'bg-sky-400/25 border-sky-300/45 text-white'
                : 'bg-slate-900/45 border-white/15 text-white/85 hover:bg-slate-900/65 hover:text-white'
            }`}
          >
            <Star className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            <span>
              {isFavoritesRoute ? 'Ver observatorio' : 'Página de favoritos'}
            </span>
          </Link>

          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Abrir panel lateral de ciudades favoritas"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900/45 px-3 py-2 text-xs font-medium text-white/85 border border-white/15 hover:bg-slate-900/65 hover:text-white transition"
          >
            <span>Acceso rápido</span>
            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">
              {favoritesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleUnits}
            aria-label={`Cambiar unidades (actual: ${
              units === 'metric' ? 'Métrico' : 'Imperial'
            })`}
            className="rounded-2xl bg-slate-900/45 px-3.5 py-2 text-xs font-semibold text-white border border-white/15 hover:bg-slate-900/65 transition tabular-nums"
          >
            {units === 'metric' ? '°C, km/h' : '°F, mph'}
          </button>

          <button
            type="button"
            onClick={onCycleTheme}
            title={`Apariencia: ${themeLabel}`}
            aria-label={`Cambiar apariencia (actual: ${themeLabel})`}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900/45 px-3 py-2 text-xs font-medium text-white/85 border border-white/15 hover:bg-slate-900/65 hover:text-white transition"
          >
            {theme === 'system' ? (
              <Laptop className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
            ) : theme === 'dark' ? (
              <Moon className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            )}
            <span>{themeLabel}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
