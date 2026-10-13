import React from 'react';
import {
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Sunrise,
  Wind,
} from 'lucide-react';
import type {
  AirQualityResponse,
  CurrentWeather,
  Units,
} from '../types/weather';
import { WeatherDetailCard } from './WeatherDetailCard';
import {
  formatHour,
  formatWindSpeed,
  getUvRiskInfo,
} from '../utils/formatters';

interface WeatherDetailsGridProps {
  current: CurrentWeather;
  airQuality?: AirQualityResponse | null;
  units: Units;
}

function getAqiBadgeStyle(aqi: number): string {
  if (aqi <= 50) return 'bg-emerald-400/20 text-emerald-200 border-emerald-300/40';
  if (aqi <= 100) return 'bg-amber-400/20 text-amber-200 border-amber-300/40';
  if (aqi <= 150) return 'bg-orange-400/20 text-orange-200 border-orange-300/40';
  if (aqi <= 200) return 'bg-rose-400/20 text-rose-200 border-rose-300/40';
  return 'bg-purple-400/20 text-purple-200 border-purple-300/40';
}

function calculateSunProgress(
  localTime: string,
  sunrise: string,
  sunset: string
): number {
  const toMinutes = (iso: string): number | null => {
    const timePart = iso.includes('T') ? iso.split('T')[1] : iso;
    if (!timePart) return null;
    const [h, m] = timePart.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const nowMin = toMinutes(localTime);
  const riseMin = toMinutes(sunrise);
  const setMin = toMinutes(sunset);

  if (nowMin === null || riseMin === null || setMin === null || setMin <= riseMin) {
    return 0.5;
  }
  if (nowMin <= riseMin) return 0;
  if (nowMin >= setMin) return 1;
  return (nowMin - riseMin) / (setMin - riseMin);
}

/**
 * Cuadrícula de 8 instrumentos meteorológicos detallados:
 * 1. Humedad (con barra de progreso)
 * 2. Viento (velocidad + brújula SVG interactiva rotando a windDirection + windCompass)
 * 3. Presión atmosférica (hPa)
 * 4. Índice UV (barra de escala + nivel de riesgo)
 * 5. Visibilidad (km)
 * 6. Probabilidad de lluvia (%)
 * 7. Amanecer y atardecer (arco solar visual + horarios formateados)
 * 8. Calidad del aire (insignia AQI, PM2.5, PM10, O3, NO2)
 */
export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({
  current,
  airQuality,
  units,
}) => {
  const uvInfo = getUvRiskInfo(current.uvIndex);
  const sunProgress = calculateSunProgress(
    current.localTime,
    current.sunrise,
    current.sunset
  );

  // Coordenadas del sol a lo largo del arco cuadrático (M 12 46 Q 60 6 108 46)
  const t = sunProgress;
  const sunX = (1 - t) * (1 - t) * 12 + 2 * (1 - t) * t * 60 + t * t * 108;
  const sunY = (1 - t) * (1 - t) * 46 + 2 * (1 - t) * t * 6 + t * t * 46;

  return (
    <section aria-label="Condiciones atmosféricas detalladas" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          Instrumentos y variables atmosféricas
        </h2>
        <span className="text-xs text-white/60">
          Mediciones en tiempo real
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Humedad */}
        <WeatherDetailCard
          title="Humedad relativa"
          icon={<Droplets className="h-5 w-5" />}
          value={`${Math.round(current.humidity)}%`}
          subtitle={
            current.humidity >= 75
              ? 'Ambiente húmedo con mayor sensación térmica.'
              : current.humidity <= 30
              ? 'Ambiente seco; se recomienda hidratación.'
              : 'Nivel de humedad confortable.'
          }
        >
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, current.humidity))}%` }}
            />
          </div>
        </WeatherDetailCard>

        {/* 2. Viento + Brújula SVG */}
        <WeatherDetailCard
          title="Viento y dirección"
          icon={<Compass className="h-5 w-5" />}
          value={formatWindSpeed(current.windSpeed, units)}
          subtitle={`Dirección ${current.windCompass} (${Math.round(current.windDirection)}°)`}
        >
          <div className="flex items-center gap-3 pt-1">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/15 shrink-0">
              <span className="absolute top-0.5 text-[9px] font-semibold text-white/65">
                N
              </span>
              <span className="absolute bottom-0.5 text-[9px] font-medium text-white/45">
                S
              </span>
              <span className="absolute right-1 text-[9px] font-medium text-white/45">
                E
              </span>
              <span className="absolute left-1 text-[9px] font-medium text-white/45">
                O
              </span>
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                className="transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${current.windDirection}deg)` }}
                aria-label={`Brújula apuntando a ${current.windDirection} grados`}
              >
                <polygon points="14,3 17.5,15 14,13 10.5,15" fill="#38BDF8" />
                <polygon
                  points="14,25 17,15 14,16.5 11,15"
                  fill="rgba(255,255,255,0.35)"
                />
              </svg>
            </div>
            <div className="text-xs text-white/75">
              Rumbo predominante del flujo de aire hacia{' '}
              <span className="font-semibold text-white">{current.windCompass}</span>.
            </div>
          </div>
        </WeatherDetailCard>

        {/* 3. Presión atmosférica */}
        <WeatherDetailCard
          title="Presión atmosférica"
          icon={<Gauge className="h-5 w-5" />}
          value={`${Math.round(current.pressure)} hPa`}
          subtitle={
            current.pressure > 1018
              ? 'Alta presión asociada a tiempo estable.'
              : current.pressure < 1008
              ? 'Baja presión; posible frente nuboso o precipitación.'
              : 'Presión barométrica dentro del promedio estándar (1013 hPa).'
          }
        >
          <div className="flex items-center justify-between text-xs text-white/60 pt-1 tabular-nums">
            <span>980 hPa</span>
            <span className="text-sky-300 font-medium">1013 hPa</span>
            <span>1040 hPa</span>
          </div>
        </WeatherDetailCard>

        {/* 4. Índice UV */}
        <WeatherDetailCard
          title="Índice UV"
          icon={<Sun className="h-5 w-5" />}
          value={
            <div className="flex items-baseline gap-2">
              <span>{current.uvIndex.toFixed(1)}</span>
              <span className={`text-sm font-medium ${uvInfo.colorClass}`}>
                {uvInfo.label}
              </span>
            </div>
          }
          subtitle={uvInfo.advice}
        >
          <div className="relative h-2 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-500">
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-slate-900 shadow"
              style={{ left: `${uvInfo.percent}%` }}
            />
          </div>
        </WeatherDetailCard>

        {/* 5. Visibilidad */}
        <WeatherDetailCard
          title="Visibilidad horizontal"
          icon={<Eye className="h-5 w-5" />}
          value={`${current.visibility.toFixed(1)} km`}
          subtitle={
            current.visibility >= 10
              ? 'Horizonte completamente despejado.'
              : current.visibility >= 4
              ? 'Bruma ligera en el horizonte.'
              : 'Visibilidad reducida por niebla o precipitación.'
          }
        />

        {/* 6. Probabilidad de lluvia */}
        <WeatherDetailCard
          title="Probabilidad de lluvia"
          icon={<CloudRain className="h-5 w-5" />}
          value={`${Math.round(current.precipitationProb)}%`}
          subtitle={
            current.precipitationProb >= 60
              ? 'Alta probabilidad de chubascos en las próximas horas.'
              : current.precipitationProb >= 25
              ? 'Posibilidad moderada de lloviznas dispersas.'
              : 'Baja probabilidad de precipitaciones.'
          }
        >
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, current.precipitationProb))}%`,
              }}
            />
          </div>
        </WeatherDetailCard>

        {/* 7. Amanecer y atardecer (Arco solar visual) */}
        <WeatherDetailCard
          title="Ciclo solar"
          icon={<Sunrise className="h-5 w-5" />}
          value={formatHour(current.sunrise)}
          subtitle={`Atardecer a las ${formatHour(current.sunset)}`}
        >
          <div className="pt-1">
            <svg
               viewBox="0 0 120 54"
              className="w-full h-14 overflow-visible"
              aria-label={`Arco solar: amanecer ${formatHour(
                current.sunrise
              )}, atardecer ${formatHour(current.sunset)}`}
            >
              {/* Línea de horizonte */}
              <line
                x1="6"
                y1="46"
                x2="114"
                y2="46"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Arco completo */}
              <path
                d="M 12 46 Q 60 6 108 46"
                fill="none"
                stroke="rgba(253, 224, 71, 0.35)"
                strokeWidth="2"
              />
              {/* Posición actual del sol */}
              <circle
                cx={sunX}
                cy={sunY}
                r="5"
                fill={current.isDay ? '#FDE047' : '#94A3B8'}
                stroke="rgba(15, 23, 42, 0.8)"
                strokeWidth="1.5"
              />
            </svg>
            <div className="flex items-center justify-between text-[11px] text-white/70 tabular-nums -mt-1">
              <span>Salida {formatHour(current.sunrise)}</span>
              <span>Puesta {formatHour(current.sunset)}</span>
            </div>
          </div>
        </WeatherDetailCard>

        {/* 8. Calidad del aire */}
        <WeatherDetailCard
          title="Calidad del aire"
          icon={<Wind className="h-5 w-5" />}
          value={
            airQuality ? (
              <div className="flex items-center gap-2.5 flex-wrap">
                <span>AQI {Math.round(airQuality.aqi)}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${getAqiBadgeStyle(
                    airQuality.aqi
                  )}`}
                >
                  {airQuality.category}
                </span>
              </div>
            ) : (
              <span className="text-lg text-white/60">Sin datos</span>
            )
          }
          subtitle={
            airQuality
              ? airQuality.description
              : 'Información de partículas no disponible en esta estación.'
          }
        >
          {airQuality && (
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-[11px] tabular-nums">
              <div className="rounded-lg bg-white/5 px-2 py-1 border border-white/10">
                <span className="block text-white/55">PM2.5</span>
                <span className="font-semibold text-white">
                  {airQuality.pm25.toFixed(1)}
                </span>
              </div>
              <div className="rounded-lg bg-white/5 px-2 py-1 border border-white/10">
                <span className="block text-white/55">PM10</span>
                <span className="font-semibold text-white">
                  {airQuality.pm10.toFixed(1)}
                </span>
              </div>
              <div className="rounded-lg bg-white/5 px-2 py-1 border border-white/10">
                <span className="block text-white/55">O₃</span>
                <span className="font-semibold text-white">
                  {Math.round(airQuality.o3)}
                </span>
              </div>
              <div className="rounded-lg bg-white/5 px-2 py-1 border border-white/10">
                <span className="block text-white/55">NO₂</span>
                <span className="font-semibold text-white">
                  {airQuality.no2.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </WeatherDetailCard>
      </div>
    </section>
  );
};
