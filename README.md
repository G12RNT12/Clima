# Atmos — Observatorio Meteorológico Full-Stack

## Despliegue en Netlify

Conecta el repositorio y selecciona la rama `main`. El archivo `netlify.toml`
configura la compilación y la API automáticamente:

- Directorio base: raíz del repositorio (`.`).
- Comando de compilación: `npm run build`.
- Directorio de publicación: `client/dist`.
- Funciones: `server/netlify/functions`.

La API Express se ejecuta mediante Netlify Functions y las rutas de React
usan `index.html` como fallback. Mantén `VITE_API_BASE_URL=/api` (o sin definir).
Para este despliegue no necesitas alojar el servidor por separado.

Si ya configuraste otro directorio base en Netlify, cámbialo a la raíz y
vuelve a desplegar desde GitHub. Subir solamente `client/dist` de forma manual
publica la interfaz, pero no instala las funciones de la API.

Aplicación web moderna de pronóstico meteorológico y calidad del aire en tiempo real, construida con **React 18**, **TypeScript**, **Tailwind CSS**, **Framer Motion** y **Recharts** en el frontend, junto con un servidor intermedio en **Node.js + Express** que implementa caché en memoria (TTL), limitación de peticiones (rate limiting) y el patrón de diseño **Adapter / Strategy (`WeatherProvider`)**.

Funciona de forma inmediata sin necesidad de configurar claves API gracias a la integración predeterminada con **Open-Meteo**.

---

## Características Principales

### Experiencia Visual e Interfaz (Frontend)
- ** Escenario Atmosférico Dinámico (`<DynamicBackground />`)**: Lienzo HTML5 Canvas + gradientes de cielo que reaccionan automáticamente al estado del clima (`clear`, `cloudy`, `rain`, `snow`, `storm`, `fog`) y al ciclo diurno/nocturno (`isDay`), renderizando lluvia, copos de nieve, estrellas parpadeantes, bruma o relámpagos.
- **Iconografía Meteorológica Animada (`<AnimatedWeatherIcon />`)**: Iconos SVG vectoriales animados con Framer Motion que respetan la preferencia del sistema `prefers-reduced-motion`.
- **Lecturas con Precisión Instrumental (`<AnimatedTemperature />`)**: Transiciones numéricas interpoladas al cambiar de ciudad o de unidades (`°C` ↔ `°F`) empleando tipografía `tabular-nums` para evitar saltos horizontales.
- **Buscador con Autocompletado y Teclado (`<SearchBar />`)**: Búsqueda geográfica con debounce de 300 ms, soporte completo de teclado (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`) y botón de geolocalización directa (**Mi ubicación**).
- **Pronóstico Horario de 24 Horas (`<HourlyForecast />`)**: Curva de área suave en **Recharts** con tooltip glassmórfico personalizado y carrusel horizontal arrastrable con el ratón o táctil.
- **Pronóstico de 7 Días (`<DailyForecast />`)**: Lista semanal con barras proporcionales de amplitud térmica que comparan la mínima y máxima de cada día respecto al rango extremo de la semana.
- **Cuadrícula de 8 Instrumentos Atmosféricos (`<WeatherDetailsGrid />`)**:
  1. **Humedad relativa** con barra de progreso.
  2. **Viento y dirección** con brújula vectorial SVG que rota según los grados meteorológicos (`windDirection`) y punto cardinal (`windCompass`).
  3. **Presión atmosférica** en `hPa` con referencia barométrica estándar (`1013 hPa`).
  4. **Índice UV** con barra de escala cromática, clasificación de riesgo y recomendación en español.
  5. **Visibilidad horizontal** en kilómetros.
  6. **Probabilidad de lluvia** porcentual.
  7. **Ciclo solar** con arco solar SVG interactivo que posiciona el sol entre la hora de amanecer y atardecer.
  8. **Calidad del aire** con insignia **AQI**, categoría y desglose de micropartículas (`PM2.5`, `PM10`, `O₃`, `NO₂`).
- **Gestión de Ciudades Favoritas con Drag & Drop**: Disponible tanto desde el cajón lateral rápido (`<FavoritesDrawer />`) como desde la ruta dedicada `/favorites` (`<FavoritesPage />`), con persistencia en `localStorage` y reordenamiento mediante arrastrar y soltar (`Framer Motion Reorder`).

### Arquitectura y Seguridad (Backend)
- **Patrón `WeatherProvider` (Adapter/Strategy)**: Desacopla por completo los controladores Express del proveedor externo de datos climáticos.
- **Caché en Memoria con TTL**: Reduce la latencia y evita saturar las APIs externas almacenando respuestas de clima, geocodificación y calidad del aire.
- **Seguridad y Validación**: Cabeceras HTTP seguras con `helmet`, control de orígenes con `cors`, protección contra abuso mediante `express-rate-limit` y validación estricta de parámetros con `zod`.

---

## Dirección de Diseño (`frontend-design`)

El diseño visual sigue los principios de **precisión meteorológica e inmersión atmosférica**:
- **Identidad de Observatorio**: El cielo en vivo actúa como lienzo principal mientras las tarjetas de instrumentos emplean paneles translúcidos (`backdrop-filter: blur(20px)`) con bordes especulares de `1px` (`rgba(255, 255, 255, 0.14)`).
- **Tipografía Intencional**: Fuente **Inter** con escala tipográfica contrastada (lectura principal ligera en `font-light` y datos auxiliares en `tabular-nums`), etiquetas en español natural (tipo oración, sin abusar de mayúsculas sostenidas ni adornos artificiales).
- **Accesibilidad**: Roles ARIA en el buscador (`combobox`, `listbox`, `option`), foco de teclado visible, contraste cuidado y pausa automática de animaciones de Canvas y SVG cuando el usuario activa `prefers-reduced-motion: reduce`.

---

## Estructura del Proyecto

```text
App del clima/
├── client/                         # Frontend (React 18 + Vite + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedTemperature.tsx
│   │   │   ├── AnimatedWeatherIcon.tsx
│   │   │   ├── CurrentWeather.tsx
│   │   │   ├── DailyForecast.tsx
│   │   │   ├── DynamicBackground.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── FavoritesDrawer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HourlyForecast.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── WeatherDetailCard.tsx
│   │   │   └── WeatherDetailsGrid.tsx
│   │   ├── hooks/
│   │   │   ├── useFavorites.ts
│   │   │   ├── useGeocode.ts
│   │   │   ├── useGeolocation.ts
│   │   │   ├── useReducedMotion.ts
│   │   │   ├── useTheme.ts
│   │   │   ├── useUnits.ts
│   │   │   └── useWeather.ts
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── FavoritesPage.tsx
│   │   ├── services/
│   │   │   └── weatherApi.ts
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── types/
│   │   │   └── weather.ts
│   │   ├── utils/
│   │   │   └── formatters.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                         # Backend (Node.js + Express + TypeScript + Vitest)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── providers/
│   │   │   ├── WeatherProvider.interface.ts
│   │   │   └── OpenMeteoProvider.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   │   └── weather.ts
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## Instalación y Puesta en Marcha

### Requisitos Previos
- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0`

### 1. Configurar e iniciar el Backend (`/server`)

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

El servidor quedará escuchando en `http://localhost:3001`.

### 2. Configurar e iniciar el Frontend (`/client`)

En una nueva terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Abre tu navegador en `http://localhost:5173`. Vite redirigirá automáticamente las peticiones `/api/*` hacia `http://localhost:3001`.

### 3. Comandos de Compilación y Pruebas

- **Ejecutar tests del servidor**:
  ```bash
  cd server && npm test
  ```
- **Compilar el servidor a producción**:
  ```bash
  cd server && npm run build
  ```
- **Compilar el cliente a producción**:
  ```bash
  cd client && npm run build
  ```

---

## Lista de Endpoints de la API (`/api`)

| Método | Endpoint | Parámetros Query | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Ninguno | Devuelve el estado de salud del servidor, proveedor activo y estadísticas de caché. |
| `GET` | `/api/weather` | `lat` (number), `lon` (number), `units` (`metric` \| `imperial`, opcional) | Devuelve el clima actual (`current`), pronóstico horario de 24h (`hourly`) y pronóstico de 7 días (`daily`). |
| `GET` | `/api/geocode` | `q` (string, mín. 2 caracteres) | Busca ciudades por nombre y devuelve coordenadas, país, código ISO, región y zona horaria. |
| `GET` | `/api/air-quality` | `lat` (number), `lon` (number) | Devuelve el índice de calidad del aire (`aqi`, `europeanAqi`), categoría en español y niveles `pm25`, `pm10`, `no2`, `o3`. |

---

## Guía Paso a Paso: Cómo Cambiar a Otro Proveedor de Clima (`WeatherProvider`)

El backend fue diseñado siguiendo el principio de inversión de dependencias mediante la interfaz `WeatherProvider`. Si en el futuro deseas cambiar **Open-Meteo** por **OpenWeatherMap**, **WeatherAPI** o **Tomorrow.io**, el frontend y los controladores no requieren ningún cambio.

### Paso 1: Revisar el contrato `WeatherProvider`

En `server/src/providers/WeatherProvider.interface.ts` (o archivo de interfaz correspondiente), todo proveedor implementa tres métodos:

```typescript
import type {
  AirQualityResponse,
  GeocodingResult,
  Units,
  WeatherResponse,
} from '../types/weather.js';

export interface WeatherProvider {
  getWeather(lat: number, lon: number, units: Units): Promise<WeatherResponse>;
  searchCities(query: string): Promise<GeocodingResult[]>;
  getAirQuality(lat: number, lon: number): Promise<AirQualityResponse>;
}
```

### Paso 2: Crear la nueva clase adaptadora

Crea un nuevo archivo en `server/src/providers/OpenWeatherMapProvider.ts` que implemente `WeatherProvider` y transforme la respuesta cruda del nuevo proveedor al esquema normalizado (`WeatherResponse`, `GeocodingResult[]`, `AirQualityResponse`):

```typescript
import type { WeatherProvider } from './WeatherProvider.interface.js';
import type {
  AirQualityResponse,
  GeocodingResult,
  Units,
  WeatherResponse,
} from '../types/weather.js';

export class OpenWeatherMapProvider implements WeatherProvider {
  constructor(private readonly apiKey: string) {}

  async getWeather(lat: number, lon: number, units: Units): Promise<WeatherResponse> {
    // 1. Llamar a la API de OpenWeatherMap usando this.apiKey
    // 2. Mapear los campos al contrato normalizado WeatherResponse
    throw new Error('Pendiente de implementar');
  }

  async searchCities(query: string): Promise<GeocodingResult[]> {
    // Mapear resultados de geocodificación al tipo GeocodingResult[]
    throw new Error('Pendiente de implementar');
  }

  async getAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
    // Mapear contaminantes al tipo AirQualityResponse
    throw new Error('Pendiente de implementar');
  }
}
```

### Paso 3: Inyectar el nuevo proveedor en el servicio/contenedor

En el punto donde se instancia `OpenMeteoProvider` (por ejemplo, según una variable de entorno `WEATHER_PROVIDER=openweathermap` y `WEATHER_API_KEY=...` en `server/.env`), sustituye la instancia:

```typescript
const provider: WeatherProvider =
  process.env.WEATHER_PROVIDER === 'openweathermap'
    ? new OpenWeatherMapProvider(process.env.WEATHER_API_KEY ?? '')
    : new OpenMeteoProvider();
```

¡Listo! La caché en memoria, la validación con Zod, los endpoints `/api/*` y todos los componentes de React seguirán funcionando de forma transparente.
