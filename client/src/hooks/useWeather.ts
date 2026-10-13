import { useQuery } from '@tanstack/react-query';
import { fetchAirQuality, fetchWeather } from '../services/weatherApi';
import type { AirQualityResponse, Units, WeatherResponse } from '../types/weather';

/**
 * Hook de TanStack Query para consultar el pronóstico meteorológico completo.
 */
export function useWeather(lat: number | null, lon: number | null, units: Units) {
  return useQuery<WeatherResponse, Error>({
    queryKey: ['weather', lat, lon, units],
    queryFn: ({ signal }) => {
      if (lat === null || lon === null) {
        throw new Error('Coordenadas no especificadas.');
      }
      return fetchWeather(lat, lon, units, signal);
    },
    enabled: lat !== null && lon !== null,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });
}

/**
 * Hook de TanStack Query para consultar la calidad del aire (AQI y partículas).
 */
export function useAirQuality(lat: number | null, lon: number | null) {
  return useQuery<AirQualityResponse, Error>({
    queryKey: ['air-quality', lat, lon],
    queryFn: ({ signal }) => {
      if (lat === null || lon === null) {
        throw new Error('Coordenadas no especificadas.');
      }
      return fetchAirQuality(lat, lon, signal);
    },
    enabled: lat !== null && lon !== null,
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: 1,
  });
}
