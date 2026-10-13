/**
 * Categorías climáticas principales para adaptar fondos dinámicos e iconos.
 */
export type WeatherCategory = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog';

/**
 * Unidades de medida soportadas por la aplicación.
 * - metric: °C, km/h, hPa
 * - imperial: °F, mph, hPa
 */
export type Units = 'metric' | 'imperial';

/**
 * Resultado de búsqueda geográfica (autocompletado de ciudades).
 */
export interface GeocodingResult {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Condición meteorológica normalizada a partir de códigos WMO.
 */
export interface WeatherCondition {
  code: number;
  description: string;
  icon: string;
  category: WeatherCategory;
}

/**
 * Estado meteorológico actual de una ubicación.
 */
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windCompass: string;
  pressure: number;
  uvIndex: number;
  visibility: number;
  precipitationProb: number;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  localTime: string;
  timezone: string;
  condition: WeatherCondition;
}

/**
 * Pronóstico horario individual (próximas 24 horas).
 */
export interface HourlyForecastItem {
  time: string;
  temperature: number;
  feelsLike: number;
  precipitationProb: number;
  windSpeed: number;
  isDay: boolean;
  condition: WeatherCondition;
}

/**
 * Pronóstico diario individual (7 días).
 */
export interface DailyForecastItem {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationProb: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
  condition: WeatherCondition;
}

/**
 * Respuesta completa normalizada del endpoint /api/weather.
 */
export interface WeatherResponse {
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  units: Units;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  cachedAt: string;
}

/**
 * Respuesta normalizada de calidad del aire del endpoint /api/air-quality.
 */
export interface AirQualityResponse {
  aqi: number;
  europeanAqi: number;
  category: string;
  description: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  cachedAt: string;
}

/**
 * Ciudad guardada en favoritos o seleccionada activamente.
 */
export interface FavoriteCity {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}
