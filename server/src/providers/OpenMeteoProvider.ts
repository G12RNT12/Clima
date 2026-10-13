import {
  AirQualityResponse,
  DailyForecastItem,
  GeocodingResult,
  HourlyForecastItem,
  Units,
  WeatherResponse,
} from '../types/weather.js';
import {
  degreesToCompass,
  resolveAqiCategory,
  resolveWeatherCondition,
} from '../utils/weatherCodes.js';
import { WeatherProvider } from './WeatherProvider.js';

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    country_code?: string;
    admin1?: string;
    timezone?: string;
  }>;
}

interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weather_code: number[];
    visibility: number[];
    wind_speed_10m: number[];
    uv_index: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
}

interface OpenMeteoAirQualityResponse {
  current?: {
    us_aqi?: number;
    european_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    nitrogen_dioxide?: number;
    ozone?: number;
  };
}

/**
 * Error personalizado para fallos de comunicación con proveedores externos.
 */
export class ExternalProviderError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 502, code = 'PROVIDER_ERROR') {
    super(message);
    this.name = 'ExternalProviderError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Implementación de WeatherProvider utilizando las APIs gratuitas de Open-Meteo.
 * No requiere API key y ofrece alta precisión global.
 */
export class OpenMeteoProvider implements WeatherProvider {
  private readonly geocodingBaseUrl = 'https://geocoding-api.open-meteo.com/v1/search';
  private readonly forecastBaseUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly airQualityBaseUrl = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  private readonly timeoutMs = 8000;

  private async fetchJson<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'WeatherAppPro/1.0',
        },
      });

      if (!response.ok) {
        throw new ExternalProviderError(
          `El proveedor meteorológico respondió con estado ${response.status}`,
          502,
          'UPSTREAM_HTTP_ERROR'
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ExternalProviderError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ExternalProviderError(
          'Tiempo de espera agotado al consultar el servicio meteorológico.',
          504,
          'UPSTREAM_TIMEOUT'
        );
      }
      throw new ExternalProviderError(
        'No se pudo conectar con el proveedor meteorológico externo.',
        502,
        'UPSTREAM_NETWORK_ERROR'
      );
    } finally {
      clearTimeout(timer);
    }
  }

  public async searchCities(query: string): Promise<GeocodingResult[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const params = new URLSearchParams({
      name: trimmed,
      count: '8',
      language: 'es',
      format: 'json',
    });

    const data = await this.fetchJson<OpenMeteoGeocodingResponse>(
      `${this.geocodingBaseUrl}?${params.toString()}`
    );

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    const mapped = data.results.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country ?? 'Desconocido',
      countryCode: (item.country_code ?? 'XX').toUpperCase(),
      region: item.admin1,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone ?? 'UTC',
    }));

    // Priorizar localidades de Perú (PE) al inicio de los resultados
    return mapped.sort((a, b) => {
      if (a.countryCode === 'PE' && b.countryCode !== 'PE') return -1;
      if (a.countryCode !== 'PE' && b.countryCode === 'PE') return 1;
      return 0;
    });
  }

  public async getWeather(lat: number, lon: number, units: Units): Promise<WeatherResponse> {
    const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
    const windUnit = units === 'imperial' ? 'mph' : 'kmh';

    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'weather_code',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'apparent_temperature',
        'precipitation_probability',
        'weather_code',
        'visibility',
        'wind_speed_10m',
        'uv_index',
        'is_day',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_probability_max',
        'wind_speed_10m_max',
      ].join(','),
      timezone: 'auto',
      forecast_days: '7',
      temperature_unit: tempUnit,
      wind_speed_unit: windUnit,
    });

    const data = await this.fetchJson<OpenMeteoForecastResponse>(
      `${this.forecastBaseUrl}?${params.toString()}`
    );

    const isDay = data.current.is_day === 1;
    const currentTimeStr = data.current.time;

    // Encontrar el índice horario más cercano a la hora actual de la ciudad
    let startIndex = data.hourly.time.findIndex((t) => t >= currentTimeStr);
    if (startIndex === -1) {
      startIndex = 0;
    }

    const currentVisibilityMeters = data.hourly.visibility[startIndex] ?? 10000;
    const currentUvIndex = data.hourly.uv_index[startIndex] ?? 0;
    const currentPrecipProb = data.hourly.precipitation_probability[startIndex] ?? 0;

    // Extraer las próximas 24 horas desde la hora local actual
    const hourlySliceEnd = Math.min(startIndex + 24, data.hourly.time.length);
    const hourly: HourlyForecastItem[] = [];

    for (let i = startIndex; i < hourlySliceEnd; i++) {
      const itemIsDay = (data.hourly.is_day[i] ?? 1) === 1;
      const code = data.hourly.weather_code[i] ?? 0;
      hourly.push({
        time: data.hourly.time[i] ?? '',
        temperature: Math.round((data.hourly.temperature_2m[i] ?? 0) * 10) / 10,
        feelsLike: Math.round((data.hourly.apparent_temperature[i] ?? 0) * 10) / 10,
        precipitationProb: Math.round(data.hourly.precipitation_probability[i] ?? 0),
        windSpeed: Math.round((data.hourly.wind_speed_10m[i] ?? 0) * 10) / 10,
        isDay: itemIsDay,
        condition: resolveWeatherCondition(code, itemIsDay),
      });
    }

    // Extraer los 7 días de pronóstico
    const daily: DailyForecastItem[] = data.daily.time.map((dateStr, idx) => {
      const code = data.daily.weather_code[idx] ?? 0;
      return {
        date: dateStr,
        tempMax: Math.round((data.daily.temperature_2m_max[idx] ?? 0) * 10) / 10,
        tempMin: Math.round((data.daily.temperature_2m_min[idx] ?? 0) * 10) / 10,
        precipitationProb: Math.round(data.daily.precipitation_probability_max[idx] ?? 0),
        uvIndexMax: Math.round((data.daily.uv_index_max[idx] ?? 0) * 10) / 10,
        sunrise: data.daily.sunrise[idx] ?? '',
        sunset: data.daily.sunset[idx] ?? '',
        windSpeedMax: Math.round((data.daily.wind_speed_10m_max[idx] ?? 0) * 10) / 10,
        condition: resolveWeatherCondition(code, true),
      };
    });

    const todayMax = daily[0]?.tempMax ?? data.current.temperature_2m;
    const todayMin = daily[0]?.tempMin ?? data.current.temperature_2m;
    const todaySunrise = daily[0]?.sunrise ?? '';
    const todaySunset = daily[0]?.sunset ?? '';

    return {
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      },
      units,
      current: {
        temperature: Math.round(data.current.temperature_2m * 10) / 10,
        feelsLike: Math.round(data.current.apparent_temperature * 10) / 10,
        tempMax: todayMax,
        tempMin: todayMin,
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
        windDirection: Math.round(data.current.wind_direction_10m),
        windCompass: degreesToCompass(data.current.wind_direction_10m),
        pressure: Math.round(data.current.surface_pressure),
        uvIndex: Math.round(currentUvIndex * 10) / 10,
        visibility: Math.round((currentVisibilityMeters / 1000) * 10) / 10,
        precipitationProb: Math.round(currentPrecipProb),
        isDay,
        sunrise: todaySunrise,
        sunset: todaySunset,
        localTime: currentTimeStr,
        timezone: data.timezone,
        condition: resolveWeatherCondition(data.current.weather_code, isDay),
      },
      hourly,
      daily,
      cachedAt: new Date().toISOString(),
    };
  }

  public async getAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'us_aqi,european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone',
      timezone: 'auto',
    });

    const data = await this.fetchJson<OpenMeteoAirQualityResponse>(
      `${this.airQualityBaseUrl}?${params.toString()}`
    );

    const aqi = Math.round(data.current?.us_aqi ?? 0);
    const europeanAqi = Math.round(data.current?.european_aqi ?? 0);
    const { category, description } = resolveAqiCategory(aqi);

    return {
      aqi,
      europeanAqi,
      category,
      description,
      pm25: Math.round((data.current?.pm2_5 ?? 0) * 10) / 10,
      pm10: Math.round((data.current?.pm10 ?? 0) * 10) / 10,
      no2: Math.round((data.current?.nitrogen_dioxide ?? 0) * 10) / 10,
      o3: Math.round((data.current?.ozone ?? 0) * 10) / 10,
      cachedAt: new Date().toISOString(),
    };
  }
}
