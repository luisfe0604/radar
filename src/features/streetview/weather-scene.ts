export type RainIntensity = "none" | "light" | "moderate" | "heavy";
export type Cloudiness = "clear" | "partly" | "overcast";

export interface WeatherScene {
  rainIntensity: RainIntensity;
  hasSnow: boolean;
  hasFog: boolean;
  hasStorm: boolean;
  cloudiness: Cloudiness;
  isDay: boolean;
}

const STORM_CODES = new Set([95, 96, 99]);
const FOG_CODES = new Set([45, 48]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
const HEAVY_RAIN_CODES = new Set([65, 82]);
const MODERATE_RAIN_CODES = new Set([63, 81]);

export function classifyWeatherScene(params: {
  weatherCode: number;
  precipitation: number;
  isDay: boolean;
}): WeatherScene {
  const { weatherCode, precipitation, isDay } = params;

  const hasStorm = STORM_CODES.has(weatherCode);
  const hasFog = FOG_CODES.has(weatherCode);
  const hasSnow = SNOW_CODES.has(weatherCode);
  const isRainCode = RAIN_CODES.has(weatherCode);

  let rainIntensity: RainIntensity = "none";
  if (hasStorm || HEAVY_RAIN_CODES.has(weatherCode) || precipitation > 7.5) {
    rainIntensity = "heavy";
  } else if (MODERATE_RAIN_CODES.has(weatherCode) || precipitation > 2.5) {
    rainIntensity = "moderate";
  } else if (isRainCode || precipitation > 0) {
    rainIntensity = "light";
  }

  let cloudiness: Cloudiness = "clear";
  if (weatherCode === 1 || weatherCode === 2) cloudiness = "partly";
  if (weatherCode >= 3) cloudiness = "overcast";
  if (hasFog || hasStorm) cloudiness = "overcast";

  return { rainIntensity, hasSnow, hasFog, hasStorm, cloudiness, isDay };
}

export function getAtmosphereFilter(scene: WeatherScene): string {
  let saturate = 1;
  let brightness = 1;
  let contrast = 1;

  if (scene.cloudiness === "partly") {
    saturate = 0.9;
    brightness = 0.95;
  }
  if (scene.cloudiness === "overcast") {
    saturate = 0.7;
    brightness = 0.82;
    contrast = 0.95;
  }
  if (scene.hasFog) {
    saturate = 0.5;
    brightness = 0.9;
    contrast = 0.85;
  }
  if (scene.hasStorm) {
    saturate = 0.55;
    brightness = 0.6;
    contrast = 1.05;
  }
  if (!scene.isDay) {
    saturate *= 0.6;
    brightness *= 0.55;
  }

  return `saturate(${saturate.toFixed(2)}) brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)})`;
}
