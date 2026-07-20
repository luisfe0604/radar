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
  let hueRotate = 0;

  if (scene.cloudiness === "clear" && scene.isDay) {
    saturate = 1.08;
    brightness = 1.03;
    contrast = 1.02;
  }
  if (scene.cloudiness === "partly") {
    saturate = 0.92;
    brightness = 0.97;
  }
  if (scene.cloudiness === "overcast") {
    saturate = 0.74;
    brightness = 0.86;
    contrast = 0.96;
    hueRotate = -4;
  }
  if (scene.rainIntensity !== "none") {
    saturate -= 0.08;
    brightness -= 0.05;
    hueRotate -= 3;
  }
  if (scene.hasSnow) {
    saturate -= 0.15;
    brightness += 0.05;
  }
  if (scene.hasFog) {
    saturate = 0.58;
    brightness = 0.93;
    contrast = 0.88;
  }
  if (scene.hasStorm) {
    saturate = 0.52;
    brightness = 0.6;
    contrast = 1.06;
    hueRotate = -6;
  }
  if (!scene.isDay) {
    saturate *= 0.55;
    brightness *= 0.5;
    hueRotate -= 8;
  }

  return `saturate(${saturate.toFixed(2)}) brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)}) hue-rotate(${hueRotate.toFixed(0)}deg)`;
}
