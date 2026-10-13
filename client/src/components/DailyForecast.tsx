import React from 'react';
import { Droplets } from 'lucide-react';
import type { DailyForecastItem } from '../types/weather';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import { formatDayName, formatShortDate } from '../utils/formatters';

interface DailyForecastProps {
  daily: DailyForecastItem[];
}

/**
 * Pronóstico extendido de 7 días con barra visual proporcional de rango térmico
 * que compara la mínima y máxima de cada jornada con el extremo semanal.
 */
export const DailyForecast: React.FC<DailyForecastProps> = ({ daily }) => {
  const days = daily.slice(0, 7);

  const weeklyMin =
    days.length > 0 ? Math.min(...days.map((d) => d.tempMin)) : 0;
  const weeklyMax =
    days.length > 0 ? Math.max(...days.map((d) => d.tempMax)) : 30;
  const totalSpan = Math.max(1, weeklyMax - weeklyMin);

  return (
    <section
      aria-label="Pronóstico de 7 días"
      className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Pronóstico de 7 días
          </h2>
          <p className="text-xs sm:text-sm text-white/65">
            Amplitud térmica diaria en relación con la semana
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {days.map((day, index) => {
          const leftPercent = Math.max(
            0,
            Math.min(100, ((day.tempMin - weeklyMin) / totalSpan) * 100)
          );
          const widthPercent = Math.max(
            8,
            Math.min(
              100 - leftPercent,
              ((day.tempMax - day.tempMin) / totalSpan) * 100
            )
          );

          return (
            <div
              key={day.date}
              className="grid grid-cols-12 items-center gap-2 sm:gap-4 py-3.5 first:pt-1 last:pb-1"
            >
              {/* Día y fecha corta */}
              <div className="col-span-4 sm:col-span-3">
                <p
                  className={`text-sm font-medium ${
                    index === 0 ? 'text-sky-300 font-semibold' : 'text-white'
                  }`}
                >
                  {formatDayName(day.date, index)}
                </p>
                <p className="text-xs text-white/55">
                  {formatShortDate(day.date)}
                </p>
              </div>

              {/* Icono y condición + lluvia */}
              <div className="col-span-3 sm:col-span-3 flex items-center gap-2">
                <AnimatedWeatherIcon
                  category={day.condition.category}
                  isDay={true}
                  size={34}
                />
                <div className="min-w-0">
                  <p className="hidden sm:block text-xs text-white/80 truncate">
                    {day.condition.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-sky-300 tabular-nums">
                    <Droplets className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span>{Math.round(day.precipitationProb)}%</span>
                  </div>
                </div>
              </div>

              {/* Barra proporcional de rango térmico (Mín — Barra — Máx) */}
              <div className="col-span-5 sm:col-span-6 flex items-center gap-2.5 sm:gap-3">
                <span className="w-8 text-right text-xs sm:text-sm font-medium text-white/65 tabular-nums">
                  {Math.round(day.tempMin)}°
                </span>

                <div
                  className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden"
                  aria-label={`Rango entre ${Math.round(
                    day.tempMin
                  )}° y ${Math.round(day.tempMax)}°`}
                >
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-orange-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="w-8 text-xs sm:text-sm font-semibold text-white tabular-nums">
                  {Math.round(day.tempMax)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
