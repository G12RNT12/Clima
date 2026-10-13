import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGeocoding } from '../services/weatherApi';
import type { GeocodingResult } from '../types/weather';

/**
 * Hook de autocompletado de ciudades con debounce de 300ms.
 */
export function useGeocode(query: string, debounceMs = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setDebouncedQuery('');
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, debounceMs]);

  const queryResult = useQuery<GeocodingResult[], Error>({
    queryKey: ['geocode', debouncedQuery],
    queryFn: ({ signal }) => fetchGeocoding(debouncedQuery, signal),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return {
    ...queryResult,
    debouncedQuery,
    isDebouncing: query.trim().length >= 2 && query.trim() !== debouncedQuery,
  };
}
