import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import type { FavoriteCity } from './types/weather';
import { useWeather, useAirQuality } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { buildCityId, useFavorites } from './hooks/useFavorites';
import { useUnits } from './hooks/useUnits';
import { useTheme } from './hooks/useTheme';
import { DynamicBackground } from './components/DynamicBackground';
import { Header } from './components/Header';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { GeolocationBanner } from './components/ErrorState';
import { DashboardPage } from './pages/DashboardPage';
import { FavoritesPage } from './pages/FavoritesPage';

const DEFAULT_CITY: FavoriteCity = {
  id: '-12.0432_-77.0282',
  name: 'Lima',
  country: 'Perú',
  countryCode: 'PE',
  region: 'Provincia de Lima',
  latitude: -12.0432,
  longitude: -77.0282,
  timezone: 'America/Lima',
};

const ACTIVE_CITY_STORAGE_KEY = 'atmos_active_city_peru_v4';
const PERU_MIGRATION_KEY = 'atmos_peru_lima_v4';

function loadInitialCity(): FavoriteCity {
  if (typeof window === 'undefined') return DEFAULT_CITY;
  try {
    if (window.localStorage.getItem(PERU_MIGRATION_KEY) !== 'true') {
      return DEFAULT_CITY;
    }
    const raw = window.localStorage.getItem(ACTIVE_CITY_STORAGE_KEY);
    if (!raw) return DEFAULT_CITY;
    const parsed = JSON.parse(raw) as FavoriteCity;
    if (
      parsed &&
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      typeof parsed.name === 'string'
    ) {
      return parsed;
    }
  } catch {
    // Fallback a Lima, Perú
  }
  return DEFAULT_CITY;
}

export const App: React.FC = () => {
  const [activeCity, setActiveCity] = useState<FavoriteCity>(loadInitialCity);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const { units, toggleUnits } = useUnits();
  const { theme, resolvedTheme, cycleTheme } = useTheme();
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    reorderFavorites,
  } = useFavorites();

  const {
    loading: isLocating,
    error: geoError,
    requestGeolocation,
    clearError: clearGeoError,
  } = useGeolocation();

  // Garantiza que tanto al abrir como en recarga en caliente (HMR) se aplique Lima, Perú inmediatamente
  useEffect(() => {
    try {
      if (window.localStorage.getItem(PERU_MIGRATION_KEY) !== 'true') {
        window.localStorage.removeItem('atmos_active_city_v1');
        window.localStorage.removeItem('atmos_active_city_v2');
        window.localStorage.removeItem('atmos_active_city_peru_v3');
        window.localStorage.setItem(PERU_MIGRATION_KEY, 'true');
        window.localStorage.setItem(
          ACTIVE_CITY_STORAGE_KEY,
          JSON.stringify(DEFAULT_CITY)
        );
        setActiveCity(DEFAULT_CITY);
      }
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ACTIVE_CITY_STORAGE_KEY,
        JSON.stringify(activeCity)
      );
    } catch {
      // Ignorar errores de cuota
    }
  }, [activeCity]);

  const weatherQuery = useWeather(
    activeCity.latitude,
    activeCity.longitude,
    units
  );
  const airQualityQuery = useAirQuality(
    activeCity.latitude,
    activeCity.longitude
  );

  const handleSelectCity = (city: Omit<FavoriteCity, 'id'> & { id?: string }) => {
    const id = city.id ?? buildCityId(city.latitude, city.longitude);
    setActiveCity({ ...city, id });
    navigate('/');
  };

  const handleRequestGeolocation = () => {
    requestGeolocation((coords) => {
      handleSelectCity({
        name: 'Mi ubicación actual',
        country: `${coords.latitude.toFixed(2)}°, ${coords.longitude.toFixed(2)}°`,
        countryCode: 'GPS',
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    });
  };

  const currentCategory =
    weatherQuery.data?.current.condition.category ?? 'clear';
  const currentIsDay = weatherQuery.data?.current.isDay ?? true;

  return (
    <div className="min-h-screen flex flex-col text-white selection:bg-sky-400/30">
      <DynamicBackground
        category={currentCategory}
        isDay={currentIsDay}
        themeMode={resolvedTheme}
      />

      <Header
        onSelectCity={handleSelectCity}
        onRequestGeolocation={handleRequestGeolocation}
        isLocating={isLocating}
        units={units}
        onToggleUnits={toggleUnits}
        theme={theme}
        onCycleTheme={cycleTheme}
        favoritesCount={favorites.length}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {geoError && (
          <GeolocationBanner message={geoError} onDismiss={clearGeoError} />
        )}

        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                activeCity={activeCity}
                weather={weatherQuery.data}
                airQuality={airQualityQuery.data}
                units={units}
                isLoading={weatherQuery.isLoading}
                error={weatherQuery.error}
                onRetry={() => {
                  void weatherQuery.refetch();
                  void airQualityQuery.refetch();
                }}
                isFavorite={isFavorite(
                  activeCity.latitude,
                  activeCity.longitude
                )}
                onToggleFavorite={() => toggleFavorite(activeCity)}
              />
            }
          />
          <Route
            path="/favorites"
            element={
              <FavoritesPage
                favorites={favorites}
                units={units}
                onSelectCity={handleSelectCity}
                onRemoveFavorite={removeFavorite}
                onReorderFavorites={reorderFavorites}
              />
            }
          />
        </Routes>
      </main>

      <footer className="mt-auto border-t border-white/10 bg-slate-950/25 backdrop-blur-md py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/60">
          <span>
            Atmos — Observatorio Meteorológico con datos en tiempo real de Open-Meteo
          </span>
          <span className="tabular-nums">
            Coordenadas activas: {activeCity.latitude.toFixed(4)}°,{' '}
            {activeCity.longitude.toFixed(4)}°
          </span>
        </div>
      </footer>

      <FavoritesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        favorites={favorites}
        onSelectCity={handleSelectCity}
        onRemoveFavorite={removeFavorite}
        onReorderFavorites={reorderFavorites}
        units={units}
      />
    </div>
  );
};
