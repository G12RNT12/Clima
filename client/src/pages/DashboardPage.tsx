import React from 'react';
import type {
  AirQualityResponse,
  FavoriteCity,
  Units,
  WeatherResponse,
} from '../types/weather';
import { CurrentWeather } from '../components/CurrentWeather';
import { HourlyForecast } from '../components/HourlyForecast';
import { DailyForecast } from '../components/DailyForecast';
import { WeatherDetailsGrid } from '../components/WeatherDetailsGrid';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';

interface DashboardPageProps {
  activeCity: FavoriteCity;
  weather?: WeatherResponse;
  airQuality?: AirQualityResponse | null;
  units: Units;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

/**
 * Vista principal del observatorio meteorológico:
 * Integra clima actual, curva horaria de 24h, pronóstico de 7 días y cuadrícula de 8 instrumentos.
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeCity,
  weather,
  airQuality,
  units,
  isLoading,
  error,
  onRetry,
  isFavorite,
  onToggleFavorite,
}) => {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error || !weather) {
    return (
      <ErrorState
        message={
          error?.message ||
          'No pudimos establecer conexión con el servicio meteorológico. Verifica tu conexión a internet e inténtalo nuevamente.'
        }
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CurrentWeather
        cityName={activeCity.name}
        country={activeCity.country}
        region={activeCity.region}
        current={weather.current}
        units={units}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <HourlyForecast hourly={weather.hourly} units={units} />
        </div>
        <div className="lg:col-span-5">
          <DailyForecast daily={weather.daily} />
        </div>
      </div>

      <WeatherDetailsGrid
        current={weather.current}
        airQuality={airQuality}
        units={units}
      />
    </div>
  );
};
