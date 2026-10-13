import { useCallback, useEffect, useState } from 'react';
import type { Units } from '../types/weather';

const UNITS_STORAGE_KEY = 'atmos_weather_units_v1';

function loadInitialUnits(): Units {
  if (typeof window === 'undefined') return 'metric';
  try {
    const saved = window.localStorage.getItem(UNITS_STORAGE_KEY);
    if (saved === 'metric' || saved === 'imperial') {
      return saved;
    }
  } catch {
    // Fallback a metric
  }
  return 'metric';
}

/**
 * Hook para alternar y persistir el sistema de unidades (métrico °C / km/h vs imperial °F / mph).
 */
export function useUnits() {
  const [units, setUnits] = useState<Units>(loadInitialUnits);

  useEffect(() => {
    try {
      window.localStorage.setItem(UNITS_STORAGE_KEY, units);
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, [units]);

  const toggleUnits = useCallback(() => {
    setUnits((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  }, []);

  return {
    units,
    setUnits,
    toggleUnits,
  };
}
