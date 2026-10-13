import {
  AirQualityResponse,
  GeocodingResult,
  Units,
  WeatherResponse,
} from '../types/weather.js';

/**
 * Interfaz del proveedor de datos climáticos (Patrón Adapter).
 * Permite cambiar de API externa (Open-Meteo, OpenWeatherMap, WeatherAPI)
 * sin alterar los controladores ni el frontend.
 */
export interface WeatherProvider {
  /**
   * Busca ciudades por nombre o texto parcial.
   */
  searchCities(query: string): Promise<GeocodingResult[]>;

  /**
   * Obtiene el clima actual, horario (24h) y diario (7 días) para las coordenadas indicadas.
   */
  getWeather(lat: number, lon: number, units: Units): Promise<WeatherResponse>;

  /**
   * Obtiene el índice de calidad del aire y contaminantes principales.
   */
  getAirQuality(lat: number, lon: number): Promise<AirQualityResponse>;
}
