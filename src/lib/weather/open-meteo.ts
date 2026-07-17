import "server-only";
import type { WeatherData } from "./types";
import { calculateMoonPhase } from "./moon-phase";

interface OpenMeteoResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    uv_index: number[];
    visibility: number[];
    dew_point_2m: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
  };
}

const CURRENT_VARS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "weather_code",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "is_day",
].join(",");

const HOURLY_VARS = [
  "temperature_2m",
  "precipitation_probability",
  "precipitation",
  "weather_code",
  "uv_index",
  "visibility",
  "dew_point_2m",
].join(",");

const DAILY_VARS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "precipitation_probability_max",
  "uv_index_max",
].join(",");

function findHourlyIndexForTime(hourlyTimes: string[], targetIso: string): number {
  const exactIndex = hourlyTimes.indexOf(targetIso);
  if (exactIndex >= 0) return exactIndex;

  const targetHour = targetIso.slice(0, 13);
  const fallbackIndex = hourlyTimes.findIndex((t) => t.slice(0, 13) === targetHour);
  return fallbackIndex >= 0 ? fallbackIndex : 0;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toFixed(4));
  url.searchParams.set("longitude", lon.toFixed(4));
  url.searchParams.set("current", CURRENT_VARS);
  url.searchParams.set("hourly", HOURLY_VARS);
  url.searchParams.set("daily", DAILY_VARS);
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) {
    throw new Error(`Open-Meteo respondeu ${res.status}`);
  }

  const data = (await res.json()) as OpenMeteoResponse;
  const nowIndex = findHourlyIndexForTime(data.hourly.time, data.current.time);

  return {
    latitude: lat,
    longitude: lon,
    timezone: data.timezone,
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.pressure_msl,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      windGusts: data.current.wind_gusts_10m,
      precipitation: data.current.precipitation,
      uvIndex: data.hourly.uv_index?.[nowIndex] ?? null,
      visibility: data.hourly.visibility?.[nowIndex] ?? null,
      dewPoint: data.hourly.dew_point_2m?.[nowIndex] ?? null,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
    },
    hourly: data.hourly.time.slice(nowIndex, nowIndex + 24).map((time, i) => ({
      time,
      temperature: data.hourly.temperature_2m[nowIndex + i],
      precipitationProbability: data.hourly.precipitation_probability[nowIndex + i],
      precipitation: data.hourly.precipitation[nowIndex + i],
      weatherCode: data.hourly.weather_code[nowIndex + i],
    })),
    daily: data.daily.time.map((date, i) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      temperatureMax: data.daily.temperature_2m_max[i],
      temperatureMin: data.daily.temperature_2m_min[i],
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
      precipitationProbabilityMax: data.daily.precipitation_probability_max[i],
      uvIndexMax: data.daily.uv_index_max?.[i] ?? null,
    })),
    moon: calculateMoonPhase(new Date()),
  };
}
