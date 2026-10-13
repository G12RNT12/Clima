import React, { useEffect, useId, useRef, useState } from 'react';
import { Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { useGeocode } from '../hooks/useGeocode';
import type { FavoriteCity, GeocodingResult } from '../types/weather';

interface SearchBarProps {
  onSelectCity: (city: Omit<FavoriteCity, 'id'>) => void;
  onRequestGeolocation: () => void;
  isLocating: boolean;
}

/**
 * Buscador de ciudades con autocompletado (debounce de 300ms),
 * navegación completa por teclado (ArrowDown, ArrowUp, Enter, Escape)
 * y botón de geolocalización directa ("Mi ubicación").
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectCity,
  onRequestGeolocation,
  isLocating,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();

  const { data: results = [], isLoading, isDebouncing, debouncedQuery } = useGeocode(query, 300);

  const showDropdown = isOpen && query.trim().length >= 2;
  const isSearching = isLoading || isDebouncing;

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: GeocodingResult) => {
    onSelectCity({
      name: item.name,
      country: item.country,
      countryCode: item.countryCode,
      region: item.region,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
    });
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' && query.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 && results[activeIndex]
                ? `city-option-${results[activeIndex].id}`
                : undefined
            }
            aria-label="Buscar ciudad"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar ciudad o región (ej. Lima, Cusco, Arequipa)..."
            className="w-full rounded-2xl bg-slate-900/45 pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-white/50 border border-white/15 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-sky-300/50 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onRequestGeolocation}
          disabled={isLocating}
          title="Usar mi ubicación actual"
          aria-label="Usar mi ubicación actual"
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/45 px-3.5 py-2.5 text-sm font-medium text-white border border-white/15 backdrop-blur-xl hover:bg-slate-900/65 hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-sky-400/70 disabled:opacity-60 transition shrink-0"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-sky-300" aria-hidden="true" />
          ) : (
            <LocateFixed className="h-4 w-4 text-sky-300" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">Mi ubicación</span>
        </button>
      </div>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Sugerencias de ciudades"
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-glass"
        >
          {isSearching ? (
            <div className="flex items-center gap-2.5 px-4 py-3.5 text-sm text-white/75">
              <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
              <span>Buscando localidades para «{query.trim()}»...</span>
            </div>
          ) : results.length === 0 && debouncedQuery.length >= 2 ? (
            <div className="px-4 py-4 text-sm text-white/75">
              <p className="font-medium text-white">
                No encontramos ciudades que coincidan con «{debouncedQuery}»
              </p>
              <p className="mt-1 text-xs text-white/60">
                Revisa la ortografía o intenta buscar solo por el nombre de la localidad principal.
              </p>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1.5 custom-scrollbar">
              {results.map((city, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={`${city.id}-${city.latitude}-${city.longitude}`}
                    id={`city-option-${city.id}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      // Evitar que el input pierda foco antes de seleccionar
                      e.preventDefault();
                      handleSelect(city);
                    }}
                    className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-sky-500/25 text-white'
                        : 'text-white/85 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-sky-300' : 'text-white/50'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="truncate">
                        <span className="font-medium text-white">{city.name}</span>
                        {city.region && (
                          <span className="text-white/65">, {city.region}</span>
                        )}
                        <span className="text-white/55"> ({city.country})</span>
                      </div>
                    </div>
                    <span className="ml-3 shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70 tabular-nums">
                      {city.countryCode}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
