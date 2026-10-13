import React from 'react';
import { ArrowDown, ArrowUp, MapPin, Star } from 'lucide-react';
import type { CurrentWeather as CurrentWeatherType, Units } from '../types/weather';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import { AnimatedTemperature } from './AnimatedTemperature';
import { formatLocalDateTime } from '../utils/formatters';

interface CurrentWeatherProps {
  cityName: string;
  country: string;
  region?: string;
  current: CurrentWeatherType;
  units: Units;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

/**
 * Cabecera de instrumento meteorológico principal: muestra ciudad, país,
 * fecha y hora local de esa ubicación, temperatura escultural animada,
 * sensación térmica, máxima/mínima del día e icono climático animado.
 */
export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  cityName,
  country,
  region,
  current,
  units,
  isFavorite,
  onToggleFavorite,
}) => {
  const formattedLocalTime = formatLocalDateTime(current.localTime, current.timezone);
  const unitLabel = units === 'metric' ? 'C' : 'F';

  return (
    <section
      aria-label="Clima actual"
      className="glass-panel rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Columna izquierda: Ubicación, hora local y temperatura principal */}
        <div className="space-y-4">
          <div className="flex items-start justify-between md:justify-start gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <MapPin className="h-5 w-5 text-sky-300 shrink-0" aria-hidden="true" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
                  {cityName}
                </h1>
                {country && (
                  <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs sm:text-sm font-medium text-white/85 border border-white/10">
                    {region && region !== cityName ? `${region}, ${country}` : country}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-white/70">
                Hora local en estación: <span className="text-white/90 font-medium">{formattedLocalTime}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={
                isFavorite
                  ? `Quitar ${cityName} de ciudades favoritas`
                  : `Guardar ${cityName} en ciudades favoritas`
              }
              aria-pressed={isFavorite}
              className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-sky-400/70 ${
                isFavorite
                  ? 'bg-amber-400/20 border-amber-300/45 text-amber-200 hover:bg-amber-400/30'
                  : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Star
                className={`h-4 w-4 ${
                  isFavorite ? 'fill-amber-300 text-amber-300' : 'text-white/75'
                }`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">
                {isFavorite ? 'En favoritos' : 'Guardar ciudad'}
              </span>
            </button>
          </div>

          {/* Lectura térmica escultural */}
          <div className="flex items-baseline gap-4 pt-1">
            <div className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tighter text-white leading-none">
              <AnimatedTemperature value={current.temperature} suffix="°" />
              <span className="text-3xl sm:text-4xl font-normal text-white/65 ml-0.5">
                {unitLabel}
              </span>
            </div>

            <div className="space-y-1 border-l border-white/15 pl-4">
              <p className="text-base sm:text-lg font-medium text-white">
                {current.condition.description}
              </p>
              <p className="text-xs sm:text-sm text-white/75">
                Sensación térmica de{' '}
                <span className="font-semibold text-white tabular-nums">
                  <AnimatedTemperature value={current.feelsLike} suffix={`°${unitLabel}`} />
                </span>
              </p>
            </div>
          </div>

          {/* Rango térmico del día */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs sm:text-sm text-white/90 border border-white/10">
              <ArrowUp className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>Máxima</span>
              <span className="font-semibold text-white tabular-nums">
                <AnimatedTemperature value={current.tempMax} suffix="°" />
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs sm:text-sm text-white/90 border border-white/10">
              <ArrowDown className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
              <span>Mínima</span>
              <span className="font-semibold text-white tabular-nums">
                <AnimatedTemperature value={current.tempMin} suffix="°" />
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs sm:text-sm text-white/80 border border-white/10">
              <span>Zona horaria:</span>
              <span className="font-medium text-white/95">{current.timezone}</span>
            </div>
          </div>
        </div>

        {/* Columna derecha: Icono meteorológico animado de gran formato */}
        <div className="flex items-center justify-center md:justify-end">
          <div className="relative flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-inner">
            <AnimatedWeatherIcon
              category={current.condition.category}
              isDay={current.isDay}
              size={112}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
