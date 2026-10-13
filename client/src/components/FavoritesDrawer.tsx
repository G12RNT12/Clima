import React from 'react';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { GripVertical, MapPin, Star, Trash2, X } from 'lucide-react';
import type { FavoriteCity, Units } from '../types/weather';
import { useWeather } from '../hooks/useWeather';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteCity[];
  onSelectCity: (city: FavoriteCity) => void;
  onRemoveFavorite: (id: string) => void;
  onReorderFavorites: (newOrder: FavoriteCity[]) => void;
  units: Units;
}

interface FavoriteCityMiniCardProps {
  city: FavoriteCity;
  units: Units;
  onSelect: () => void;
  onRemove: () => void;
}

export const FavoriteCityMiniCard: React.FC<FavoriteCityMiniCardProps> = ({
  city,
  units,
  onSelect,
  onRemove,
}) => {
  const { data, isLoading } = useWeather(city.latitude, city.longitude, units);

  return (
    <div className="group flex items-center justify-between gap-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 p-3.5 transition">
      <div className="flex items-center gap-2 text-white/45 cursor-grab active:cursor-grabbing shrink-0">
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center justify-between gap-3 text-left min-w-0 focus:outline-none"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-sky-300 shrink-0" aria-hidden="true" />
            <p className="font-semibold text-white truncate">{city.name}</p>
          </div>
          <p className="text-xs text-white/65 truncate">{city.country}</p>
          {data && (
            <p className="mt-0.5 text-xs text-white/75 truncate">
              {data.current.condition.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLoading ? (
            <div className="h-8 w-14 rounded-lg bg-white/10 animate-pulse" />
          ) : data ? (
            <>
              <AnimatedWeatherIcon
                category={data.current.condition.category}
                isDay={data.current.isDay}
                size={34}
              />
              <span className="text-xl font-semibold text-white tabular-nums">
                {Math.round(data.current.temperature)}°
              </span>
            </>
          ) : (
            <span className="text-xs text-white/50">--°</span>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Eliminar ${city.name} de favoritos`}
        className="rounded-xl p-2 text-white/55 hover:text-rose-300 hover:bg-rose-500/20 transition shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-400/60"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

/**
 * Panel lateral deslizable (Drawer) para consultar, seleccionar, eliminar y reordenar
 * ciudades favoritas mediante arrastrar y soltar (Framer Motion Reorder).
 */
export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectCity,
  onRemoveFavorite,
  onReorderFavorites,
  units,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            aria-label="Ciudades favoritas"
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border-l border-white/15 p-6 flex flex-col justify-between shadow-2xl"
          >
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-300 fill-amber-300" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-white">
                    Ciudades favoritas
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar panel de favoritos"
                  className="rounded-xl p-2 text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-3 text-xs text-white/65">
                Arrastra las tarjetas desde el icono izquierdo para cambiar su orden o pulsa una ciudad para abrir su observatorio.
              </p>

              <div className="mt-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {favorites.length === 0 ? (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center space-y-2 mt-4">
                    <p className="text-sm font-medium text-white">
                      Aún no has guardado ciudades favoritas
                    </p>
                    <p className="text-xs text-white/60">
                      Usa el botón «Guardar ciudad» en el panel principal para tener acceso rápido a tus estaciones frecuentes.
                    </p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={favorites}
                    onReorder={onReorderFavorites}
                    className="space-y-3"
                  >
                    {favorites.map((city) => (
                      <Reorder.Item key={city.id} value={city}>
                        <FavoriteCityMiniCard
                          city={city}
                          units={units}
                          onSelect={() => {
                            onSelectCity(city);
                            onClose();
                          }}
                          onRemove={() => onRemoveFavorite(city.id)}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
