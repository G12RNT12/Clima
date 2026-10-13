import { useCallback, useEffect, useState } from 'react';
import type { FavoriteCity } from '../types/weather';

const FAVORITES_STORAGE_KEY = 'atmos_favorite_cities_peru_v4';
const FAVORITES_MIGRATION_KEY = 'atmos_favorites_migrated_peru_v4';

const DEFAULT_FAVORITES: FavoriteCity[] = [
  {
    id: '-12.0432_-77.0282',
    name: 'Lima',
    country: 'Perú',
    countryCode: 'PE',
    region: 'Provincia de Lima',
    latitude: -12.0432,
    longitude: -77.0282,
    timezone: 'America/Lima',
  },
  {
    id: '-13.5226_-71.9673',
    name: 'Cusco',
    country: 'Perú',
    countryCode: 'PE',
    region: 'Cusco',
    latitude: -13.5226,
    longitude: -71.9673,
    timezone: 'America/Lima',
  },
  {
    id: '-16.3989_-71.5350',
    name: 'Arequipa',
    country: 'Perú',
    countryCode: 'PE',
    region: 'Arequipa',
    latitude: -16.3989,
    longitude: -71.535,
    timezone: 'America/Lima',
  },
];

/**
 * Genera un identificador estable a partir de latitud y longitud.
 */
export function buildCityId(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
}

function loadFavorites(): FavoriteCity[] {
  if (typeof window === 'undefined') return DEFAULT_FAVORITES;
  try {
    if (window.localStorage.getItem(FAVORITES_MIGRATION_KEY) !== 'true') {
      return DEFAULT_FAVORITES;
    }
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return DEFAULT_FAVORITES;
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as FavoriteCity[];
    }
    return DEFAULT_FAVORITES;
  } catch {
    return DEFAULT_FAVORITES;
  }
}

/**
 * Hook para gestionar ciudades favoritas en localStorage con soporte de reordenamiento drag-and-drop.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(loadFavorites);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(FAVORITES_MIGRATION_KEY) !== 'true') {
        window.localStorage.removeItem('atmos_favorite_cities_v1');
        window.localStorage.removeItem('atmos_favorite_cities_v2');
        window.localStorage.removeItem('atmos_favorite_cities_peru_v3');
        window.localStorage.setItem(FAVORITES_MIGRATION_KEY, 'true');
        window.localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(DEFAULT_FAVORITES)
        );
        setFavorites(DEFAULT_FAVORITES);
        return;
      }
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignorar errores de cuota de almacenamiento
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (latitude: number, longitude: number): boolean => {
      const targetId = buildCityId(latitude, longitude);
      return favorites.some(
        (item) =>
          item.id === targetId ||
          (Math.abs(item.latitude - latitude) < 0.02 &&
            Math.abs(item.longitude - longitude) < 0.02)
      );
    },
    [favorites]
  );

  const addFavorite = useCallback((city: Omit<FavoriteCity, 'id'> & { id?: string }) => {
    const id = city.id ?? buildCityId(city.latitude, city.longitude);
    setFavorites((prev) => {
      if (
        prev.some(
          (item) =>
            item.id === id ||
            (Math.abs(item.latitude - city.latitude) < 0.02 &&
              Math.abs(item.longitude - city.longitude) < 0.02)
        )
      ) {
        return prev;
      }
      return [{ ...city, id }, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((idOrCoords: string | { latitude: number; longitude: number }) => {
    setFavorites((prev) =>
      prev.filter((item) => {
        if (typeof idOrCoords === 'string') {
          return item.id !== idOrCoords;
        }
        return !(
          Math.abs(item.latitude - idOrCoords.latitude) < 0.02 &&
          Math.abs(item.longitude - idOrCoords.longitude) < 0.02
        );
      })
    );
  }, []);

  const toggleFavorite = useCallback(
    (city: Omit<FavoriteCity, 'id'> & { id?: string }) => {
      if (isFavorite(city.latitude, city.longitude)) {
        removeFavorite({ latitude: city.latitude, longitude: city.longitude });
      } else {
        addFavorite(city);
      }
    },
    [isFavorite, removeFavorite, addFavorite]
  );

  const reorderFavorites = useCallback((newOrder: FavoriteCity[]) => {
    setFavorites(newOrder);
  }, []);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    reorderFavorites,
  };
}
