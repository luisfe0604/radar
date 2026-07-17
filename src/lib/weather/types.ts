export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  precipitation: number;
  uvIndex: number | null;
  visibility: number | null;
  dewPoint: number | null;
  weatherCode: number;
  isDay: boolean;
}

export interface HourlyEntry {
  time: string;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
}

export interface DailyEntry {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  sunrise: string;
  sunset: string;
  precipitationProbabilityMax: number;
  uvIndexMax: number | null;
}

export interface MoonPhase {
  illumination: number;
  phaseLabel: string;
  emoji: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyEntry[];
  daily: DailyEntry[];
  moon: MoonPhase;
}
