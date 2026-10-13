import { WeatherCategory, WeatherCondition } from '../types/weather.js';

interface WmoEntry {
  description: string;
  dayIcon: string;
  nightIcon: string;
  category: WeatherCategory;
}

/**
 * Diccionario completo de códigos meteorológicos WMO (0-99)
 * traducidos al español con iconos y categorías visuales.
 */
const WMO_CODES: Record<number, WmoEntry> = {
  0: {
    description: 'Cielo despejado',
    dayIcon: 'sun',
    nightIcon: 'moon',
    category: 'clear',
  },
  1: {
    description: 'Mayormente despejado',
    dayIcon: 'partly-cloudy-day',
    nightIcon: 'partly-cloudy-night',
    category: 'clear',
  },
  2: {
    description: 'Parcialmente nublado',
    dayIcon: 'partly-cloudy-day',
    nightIcon: 'partly-cloudy-night',
    category: 'cloudy',
  },
  3: {
    description: 'Nublado',
    dayIcon: 'cloud',
    nightIcon: 'cloud',
    category: 'cloudy',
  },
  45: {
    description: 'Niebla',
    dayIcon: 'fog',
    nightIcon: 'fog',
    category: 'fog',
  },
  48: {
    description: 'Niebla escarchada',
    dayIcon: 'fog',
    nightIcon: 'fog',
    category: 'fog',
  },
  51: {
    description: 'Llovizna ligera',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    category: 'rain',
  },
  53: {
    description: 'Llovizna moderada',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    category: 'rain',
  },
  55: {
    description: 'Llovizna densa',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    category: 'rain',
  },
  56: {
    description: 'Llovizna helada ligera',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    category: 'rain',
  },
  57: {
    description: 'Llovizna helada densa',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    category: 'rain',
  },
  61: {
    description: 'Lluvia ligera',
    dayIcon: 'rain',
    nightIcon: 'rain',
    category: 'rain',
  },
  63: {
    description: 'Lluvia moderada',
    dayIcon: 'rain',
    nightIcon: 'rain',
    category: 'rain',
  },
  65: {
    description: 'Lluvia fuerte',
    dayIcon: 'heavy-rain',
    nightIcon: 'heavy-rain',
    category: 'rain',
  },
  66: {
    description: 'Lluvia helada ligera',
    dayIcon: 'rain',
    nightIcon: 'rain',
    category: 'rain',
  },
  67: {
    description: 'Lluvia helada fuerte',
    dayIcon: 'heavy-rain',
    nightIcon: 'heavy-rain',
    category: 'rain',
  },
  71: {
    description: 'Nevada ligera',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
  },
  73: {
    description: 'Nevada moderada',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
  },
  75: {
    description: 'Nevada intensa',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
  },
  77: {
    description: 'Granizo fino',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
  },
  80: {
    description: 'Chubascos ligeros',
    dayIcon: 'rain',
    nightIcon: 'rain',
    category: 'rain',
  },
  81: {
    description: 'Chubascos moderados',
    dayIcon: 'rain',
    nightIcon: 'rain',
    category: 'rain',
  },
  82: {
    description: 'Chubascos violentos',
    dayIcon: 'heavy-rain',
    nightIcon: 'heavy-rain',
    category: 'rain',
  },
  85: {
    description: 'Chubascos de nieve ligeros',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
  },
  86: {
    description: 'Chubascos de nieve intensos',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
  },
  95: {
    description: 'Tormenta eléctrica',
    dayIcon: 'thunderstorm',
    nightIcon: 'thunderstorm',
    category: 'storm',
  },
  96: {
    description: 'Tormenta con granizo ligero',
    dayIcon: 'thunderstorm',
    nightIcon: 'thunderstorm',
    category: 'storm',
  },
  99: {
    description: 'Tormenta con granizo fuerte',
    dayIcon: 'thunderstorm',
    nightIcon: 'thunderstorm',
    category: 'storm',
  },
};

/**
 * Convierte un código WMO en un objeto WeatherCondition normalizado.
 * @param code Código numérico WMO (0-99)
 * @param isDay Booleano indicando si es de día (por defecto true)
 */
export function resolveWeatherCondition(code: number, isDay = true): WeatherCondition {
  const entry = WMO_CODES[code];
  if (!entry) {
    return {
      code,
      description: 'Condición desconocida',
      icon: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night',
      category: 'cloudy',
    };
  }

  return {
    code,
    description: entry.description,
    icon: isDay ? entry.dayIcon : entry.nightIcon,
    category: entry.category,
  };
}

/**
 * Convierte grados meteorológicos (0-360) en dirección cardinal en español.
 */
export function degreesToCompass(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(normalized / 45) % 8;
  return directions[index] ?? 'N';
}

/**
 * Clasifica el índice de calidad del aire (US AQI) en categoría y recomendación en español.
 */
export function resolveAqiCategory(aqi: number): { category: string; description: string } {
  if (aqi <= 50) {
    return {
      category: 'Buena',
      description: 'La calidad del aire es satisfactoria y representa poco o ningún riesgo.',
    };
  }
  if (aqi <= 100) {
    return {
      category: 'Moderada',
      description: 'Calidad aceptable; personas muy sensibles deben limitar esfuerzos prolongados.',
    };
  }
  if (aqi <= 150) {
    return {
      category: 'Dañina para grupos sensibles',
      description: 'Personas con enfermedades respiratorias o cardíacas deben reducir actividades al aire libre.',
    };
  }
  if (aqi <= 200) {
    return {
      category: 'Dañina',
      description: 'Cualquier persona puede empezar a experimentar efectos adversos en la salud.',
    };
  }
  if (aqi <= 300) {
    return {
      category: 'Muy dañina',
      description: 'Advertencia sanitaria de emergencia; evite actividades físicas al aire libre.',
    };
  }
  return {
    category: 'Peligrosa',
    description: 'Alerta sanitaria grave: toda la población puede verse seriamente afectada.',
  };
}
