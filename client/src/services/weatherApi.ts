import type {
  AirQualityResponse,
  GeocodingResult,
  Units,
  WeatherResponse,
} from '../types/weather';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    let errorMessage = `Error ${response.status} al conectar con el servidor meteorológico.`;
    try {
      const data = (await response.json()) as ApiErrorPayload;
      if (data.message || data.error) {
        errorMessage = data.message || data.error || errorMessage;
      }
    } catch {
      // Fallback al mensaje genérico si el cuerpo no es JSON
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

/**
 * Obtiene el pronóstico actual, por hora y de 7 días para las coordenadas indicadas.
 */
export async function fetchWeather(
  lat: number,
  lon: number,
  units: Units = 'metric',
  signal?: AbortSignal
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units,
  });
  return fetchJson<WeatherResponse>(`${API_BASE_URL}/weather?${params.toString()}`, signal);
}

/**
 * Busca ciudades por nombre con autocompletado geográfico.
 */
export async function fetchGeocoding(
  query: string,
  signal?: AbortSignal
): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }
  const params = new URLSearchParams({ q: trimmed });
  const data = await fetchJson<{ results?: GeocodingResult[] } | GeocodingResult[]>(
    `${API_BASE_URL}/geocode?${params.toString()}`,
    signal
  );
  if (Array.isArray(data)) {
    return data;
  }
  return data.results ?? [];
}

/**
 * Obtiene métricas de calidad del aire e índice AQI para las coordenadas indicadas.
 */
export async function fetchAirQuality(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<AirQualityResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  return fetchJson<AirQualityResponse>(`${API_BASE_URL}/air-quality?${params.toString()}`, signal);
}
