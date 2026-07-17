interface WeatherCodeInfo {
  label: string;
  emoji: string;
}

const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { label: "Céu limpo", emoji: "☀️" },
  1: { label: "Predominantemente limpo", emoji: "🌤️" },
  2: { label: "Parcialmente nublado", emoji: "⛅" },
  3: { label: "Nublado", emoji: "☁️" },
  45: { label: "Nevoeiro", emoji: "🌫️" },
  48: { label: "Nevoeiro com geada", emoji: "🌫️" },
  51: { label: "Garoa fraca", emoji: "🌦️" },
  53: { label: "Garoa moderada", emoji: "🌦️" },
  55: { label: "Garoa forte", emoji: "🌦️" },
  56: { label: "Garoa congelante fraca", emoji: "🌦️" },
  57: { label: "Garoa congelante forte", emoji: "🌦️" },
  61: { label: "Chuva fraca", emoji: "🌧️" },
  63: { label: "Chuva moderada", emoji: "🌧️" },
  65: { label: "Chuva forte", emoji: "🌧️" },
  66: { label: "Chuva congelante fraca", emoji: "🌧️" },
  67: { label: "Chuva congelante forte", emoji: "🌧️" },
  71: { label: "Neve fraca", emoji: "🌨️" },
  73: { label: "Neve moderada", emoji: "🌨️" },
  75: { label: "Neve forte", emoji: "🌨️" },
  77: { label: "Grãos de neve", emoji: "🌨️" },
  80: { label: "Pancadas de chuva fracas", emoji: "🌦️" },
  81: { label: "Pancadas de chuva moderadas", emoji: "🌧️" },
  82: { label: "Pancadas de chuva violentas", emoji: "⛈️" },
  85: { label: "Pancadas de neve fracas", emoji: "🌨️" },
  86: { label: "Pancadas de neve fortes", emoji: "🌨️" },
  95: { label: "Tempestade", emoji: "⛈️" },
  96: { label: "Tempestade com granizo fraco", emoji: "⛈️" },
  99: { label: "Tempestade com granizo forte", emoji: "⛈️" },
};

const FALLBACK: WeatherCodeInfo = { label: "Condição desconhecida", emoji: "🌡️" };

export function describeWeatherCode(code: number): WeatherCodeInfo {
  return WEATHER_CODE_MAP[code] ?? FALLBACK;
}
