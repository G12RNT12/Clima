import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Reorder } from 'framer-motion';
import {
  ArrowLeft,
  GripVertical,
  MapPin,
  Star,
  Trash2,
  Wind,
  Droplets,
} from 'lucide-react';
import type { FavoriteCity, Units } from '../types/weather';
import { useWeather } from '../hooks/useWeather';
import { AnimatedWeatherIcon } from '../components/AnimatedWeatherIcon';
import { formatWindSpeed } from '../utils/formatters';

interface FavoritesPageProps {
  favorites: FavoriteCity[];
  units: Units;
  onSelectCity: (city: FavoriteCity) => void;
  onRemoveFavorite: (id: string) => void;
  onReorderFavorites: (newOrder: FavoriteCity[]) => void;
}

interface FavoriteCityFullCardProps {
  city: FavoriteCity;
  units: Units;
  onSelect: () => void;
  onRemove: () => void;
}

const FavoriteCityFullCard: React.FC<FavoriteCityFullCardProps> = ({
  city,
  units,
  onSelect,
  onRemove,
}) => {
  const { data, isLoading } = useWeather(city.latitude, city.longitude, units);

  return (
    <div className="glass-panel glass-panel-interactive rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-xl text-white/45 hover:text-white/80 hover:bg-white/10 transition shrink-0"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="h-5 w-5" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={onSelect}
          className="flex-1 text-left min-w-0 focus:outline-none"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin className="h-4 w-4 text-sky-300 shrink-0" aria-hidden="true" />
            <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
              {city.name}
            </h2>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/75">
              {city.country}
            </span>
          </div>

          {isLoading ? (
            <div className="mt-2 h-4 w-40 rounded bg-white/10 animate-pulse" />
          ) : data ? (
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/75 tabular-nums">
              <span className="font-medium text-white/90">
                {data.current.condition.description}
              </span>
              <span className="inline-flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-sky-300" />
                Humedad {Math.round(data.current.humidity)}%
              </span>
              <span className="inline-flex items-center gap-1">
                <Wind className="h-3.5 w-3.5 text-sky-300" />
                {formatWindSpeed(data.current.windSpeed, units)}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-xs text-white/55">
              Pulsa para consultar el pronóstico completo
            </p>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
        {isLoading ? (
          <div className="h-12 w-24 rounded-2xl bg-white/10 animate-pulse" />
        ) : data ? (
          <button
            type="button"
            onClick={onSelect}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <AnimatedWeatherIcon
              category={data.current.condition.category}
              isDay={data.current.isDay}
              size={48}
            />
            <div className="tabular-nums">
              <div className="text-3xl font-light text-white leading-none">
                {Math.round(data.current.temperature)}°
                <span className="text-base text-white/65 ml-0.5">
                  {units === 'metric' ? 'C' : 'F'}
                </span>
              </div>
              <div className="text-[11px] text-white/65 mt-1">
                Máx {Math.round(data.current.tempMax)}° / Mín{' '}
                {Math.round(data.current.tempMin)}°
              </div>
            </div>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Eliminar ${city.name} de favoritos`}
          className="rounded-2xl p-2.5 text-white/60 hover:text-rose-300 hover:bg-rose-500/20 border border-transparent hover:border-rose-400/30 transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Vista dedicada (/favorites) para gestionar todas las estaciones guardadas
 * con reordenamiento Drag & Drop (Framer Motion Reorder) y resumen climático en vivo.
 */
export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favorites,
  units,
  onSelectCity,
  onRemoveFavorite,
  onReorderFavorites,
}) => {
  const navigate = useNavigate();

  const handleSelect = (city: FavoriteCity) => {
    onSelectCity(city);
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300 hover:text-sky-200 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al observatorio principal</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Star className="h-6 w-6 text-amber-300 fill-amber-300" aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              Ciudades favoritas
            </h1>
          </div>
          <p className="mt-1 text-sm text-white/70">
            Arrastra cualquier estación para organizar tu lista prioritaria o selecciónala para abrir su pronóstico detallado.
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center max-w-lg mx-auto space-y-4">
          <Star className="h-10 w-10 text-amber-300/70 mx-auto" />
          <h2 className="text-lg font-semibold text-white">
            Tu lista de ciudades favoritas está vacía
          </h2>
          <p className="text-sm text-white/70">
            Busca cualquier localidad en la barra superior y pulsa «Guardar ciudad» para compararla aquí en tiempo real.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold px-5 py-2.5 text-sm transition"
          >
            Explorar el clima actual
          </Link>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={favorites}
          onReorder={onReorderFavorites}
          className="space-y-3.5"
        >
          {favorites.map((city) => (
            <Reorder.Item key={city.id} value={city}>
              <FavoriteCityFullCard
                city={city}
                units={units}
                onSelect={() => handleSelect(city)}
                onRemove={() => onRemoveFavorite(city.id)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
};
