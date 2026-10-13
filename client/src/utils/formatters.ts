import type { Units } from '../types/weather';

/**
 * Formatea una temperatura redondeada con su símbolo de unidad.
 */
export function formatTemp(value: number, units?: Units): string {
  const rounded = Math.round(value);
  if (!units) return `${rounded}°`;
  return `${rounded}°${units === 'metric' ? 'C' : 'F'}`;
}

/**
 * Formatea velocidad del viento según el sistema de unidades.
 */
export function formatWindSpeed(value: number, units: Units): string {
  const rounded = Math.round(value);
  return `${rounded} ${units === 'metric' ? 'km/h' : 'mph'}`;
}

/**
 * Formatea una cadena ISO de hora ("2026-10-13T14:00") a formato legible ("14:00").
 */
export function formatHour(isoTime: string): string {
  if (!isoTime) return '--:--';
  const timePart = isoTime.includes('T') ? isoTime.split('T')[1] : isoTime;
  return timePart ? timePart.slice(0, 5) : '--:--';
}

/**
 * Formatea la fecha y hora local de una ciudad en español natural.
 */
export function formatLocalDateTime(localTimeIso: string, timezone?: string): string {
  try {
    // Open-Meteo devuelve localTime como "YYYY-MM-DDTHH:mm" en la zona horaria del lugar
    const [datePart, timePart] = localTimeIso.split('T');
    if (datePart && timePart) {
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      const dateObj = new Date(year, month - 1, day, hour, minute);
      const formattedDate = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(dateObj);
      const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const capitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
      return `${capitalized}, ${formattedTime}`;
    }

    const now = new Date();
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone || undefined,
    }).format(now);
  } catch {
    return localTimeIso.replace('T', ' ');
  }
}

/**
 * Devuelve el nombre del día de la semana para el pronóstico de 7 días.
 */
export function formatDayName(dateStr: string, index: number): string {
  if (index === 0) return 'Hoy';
  if (index === 1) return 'Mañana';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  } catch {
    return dateStr;
  }
}

/**
 * Devuelve fecha corta ("14 oct") para acompañar el día de la semana.
 */
export function formatShortDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Clasifica el índice UV en nivel de riesgo en español.
 */
export function getUvRiskInfo(uv: number): {
  label: string;
  advice: string;
  colorClass: string;
  percent: number;
} {
  const percent = Math.min(100, Math.max(4, Math.round((uv / 11) * 100)));
  if (uv <= 2) {
    return {
      label: 'Bajo',
      advice: 'No requiere protección especial al aire libre.',
      colorClass: 'text-emerald-300',
      percent,
    };
  }
  if (uv <= 5) {
    return {
      label: 'Moderado',
      advice: 'Usa gafas de sol y protector solar si estás al mediodía.',
      colorClass: 'text-amber-300',
      percent,
    };
  }
  if (uv <= 7) {
    return {
      label: 'Alto',
      advice: 'Reduce la exposición entre las 12:00 y las 16:00.',
      colorClass: 'text-orange-300',
      percent,
    };
  }
  if (uv <= 10) {
    return {
      label: 'Muy alto',
      advice: 'Busca sombra y aplica factor de protección alto.',
      colorClass: 'text-rose-300',
      percent,
    };
  }
  return {
    label: 'Extremo',
    advice: 'Evita la exposición directa al sol durante las horas centrales.',
    colorClass: 'text-purple-300',
    percent: 100,
  };
}
