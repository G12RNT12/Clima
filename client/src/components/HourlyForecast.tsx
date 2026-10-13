import React, { useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import type { HourlyForecastItem, Units } from '../types/weather';
import { AnimatedWeatherIcon } from './AnimatedWeatherIcon';
import { formatHour, formatWindSpeed } from '../utils/formatters';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  units: Units;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: HourlyForecastItem & { formattedHour: string };
  }>;
  units: Units;
}

const HourlyChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  units,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  const unitSymbol = units === 'metric' ? '°C' : '°F';

  return (
    <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/20 px-3.5 py-2.5 text-xs text-white shadow-glass space-y-1">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-sky-300 tabular-nums">
          {item.formattedHour}
        </span>
        <span className="text-white/75">{item.condition.description}</span>
      </div>
      <div className="flex items-baseline gap-3 pt-0.5 tabular-nums">
        <span className="text-base font-semibold text-white">
          {Math.round(item.temperature)}
          {unitSymbol}
        </span>
        <span className="text-white/65">
          Sensación {Math.round(item.feelsLike)}
          {unitSymbol}
        </span>
      </div>
      <div className="flex items-center gap-3 text-white/70 tabular-nums pt-0.5">
        <span>Lluvia: {Math.round(item.precipitationProb)}%</span>
        <span>Viento: {formatWindSpeed(item.windSpeed, units)}</span>
      </div>
    </div>
  );
};

/**
 * Pronóstico horario para las próximas 24 horas:
 * Incluye curva térmica suave en Recharts con tooltip de cristal y carrusel horizontal desplazable.
 */
export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  units,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const items = hourly.slice(0, 24).map((item, idx) => ({
    ...item,
    formattedHour: idx === 0 ? 'Ahora' : formatHour(item.time),
    roundedTemp: Math.round(item.temperature),
  }));

  const scrollByOffset = (offset: number) => {
    scrollContainerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.4;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  return (
    <section
      aria-label="Pronóstico para las próximas 24 horas"
      className="glass-panel rounded-3xl p-6 sm:p-7 space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Pronóstico para las próximas 24 horas
          </h2>
          <p className="text-xs sm:text-sm text-white/65">
            Evolución térmica horaria y probabilidad de precipitación
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollByOffset(-320)}
            aria-label="Desplazar horas hacia la izquierda"
            className="rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white border border-white/10 transition focus:outline-none focus:ring-2 focus:ring-sky-400/70"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByOffset(320)}
            aria-label="Desplazar horas hacia la derecha"
            className="rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white border border-white/10 transition focus:outline-none focus:ring-2 focus:ring-sky-400/70"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Curva térmica de 24 horas con Recharts */}
      <div className="h-44 w-full" aria-label="Gráfico de curva de temperatura de 24 horas">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={items}
            margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempCurveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="formattedHour"
              stroke="rgba(255,255,255,0.45)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              stroke="rgba(255,255,255,0.45)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(val: number) => `${Math.round(val)}°`}
            />
            <Tooltip content={<HourlyChartTooltip units={units} />} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#38BDF8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#tempCurveGrad)"
              isAnimationActive={false}
              activeDot={{
                r: 5,
                fill: '#FDE047',
                stroke: '#0F172A',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Carrusel horizontal arrastrable de tarjetas por hora */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`flex gap-3 overflow-x-auto pb-2 pt-1 custom-scrollbar select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {items.map((hour, index) => (
          <div
            key={hour.time}
            className={`flex flex-col items-center justify-between min-w-[86px] rounded-2xl px-3 py-3.5 border transition shrink-0 ${
              index === 0
                ? 'bg-sky-400/20 border-sky-300/40 shadow-sm'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span
              className={`text-xs font-medium tabular-nums ${
                index === 0 ? 'text-sky-200 font-semibold' : 'text-white/75'
              }`}
            >
              {hour.formattedHour}
            </span>

            <div className="my-2">
              <AnimatedWeatherIcon
                category={hour.condition.category}
                isDay={hour.isDay}
                size={36}
              />
            </div>

            <span className="text-base font-semibold text-white tabular-nums">
              {hour.roundedTemp}°
            </span>

            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-sky-300 tabular-nums">
              <Droplets className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{Math.round(hour.precipitationProb)}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
