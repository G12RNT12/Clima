import { useCallback, useState } from 'react';

export interface GeolocationCoordinatesState {
  latitude: number;
  longitude: number;
}

export interface UseGeolocationReturn {
  coordinates: GeolocationCoordinatesState | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  requestGeolocation: (
    onSuccess?: (coords: GeolocationCoordinatesState) => void
  ) => void;
  clearError: () => void;
}

/**
 * Hook para obtener la ubicación actual del navegador con manejo claro de permisos denegados.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinatesState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    setPermissionDenied(false);
  }, []);

  const requestGeolocation = useCallback(
    (onSuccess?: (coords: GeolocationCoordinatesState) => void) => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        setError('Tu navegador no admite geolocalización. Busca tu ciudad manualmente.');
        return;
      }

      setLoading(true);
      setError(null);
      setPermissionDenied(false);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: Number(position.coords.latitude.toFixed(4)),
            longitude: Number(position.coords.longitude.toFixed(4)),
          };
          setCoordinates(coords);
          setLoading(false);
          onSuccess?.(coords);
        },
        (geoError) => {
          setLoading(false);
          if (geoError.code === geoError.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setError(
              'El acceso a tu ubicación está desactivado en el navegador. Puedes habilitar el permiso en la barra de direcciones o buscar cualquier ciudad en el buscador.'
            );
          } else if (geoError.code === geoError.TIMEOUT) {
            setError('La solicitud de ubicación tardó demasiado. Intenta de nuevo o busca tu ciudad.');
          } else {
            setError('No pudimos determinar tu ubicación actual. Prueba buscando tu ciudad.');
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 1000 * 60 * 5,
        }
      );
    },
    []
  );

  return {
    coordinates,
    loading,
    error,
    permissionDenied,
    requestGeolocation,
    clearError,
  };
}
