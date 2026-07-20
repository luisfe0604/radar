import { classifyWeatherScene } from "./weather-scene";
import styles from "./weather-simulation-overlay.module.css";

interface WeatherSimulationOverlayProps {
  weatherCode: number;
  precipitation: number;
  isDay: boolean;
}

export function WeatherSimulationOverlay({
  weatherCode,
  precipitation,
  isDay,
}: WeatherSimulationOverlayProps) {
  const scene = classifyWeatherScene({ weatherCode, precipitation, isDay });
  const showVignette = scene.hasStorm || scene.rainIntensity === "heavy" || !isDay;

  return (
    <div className={styles.overlay} aria-hidden="true">
      {scene.hasFog && <div className={styles.fog} />}
      {showVignette && <div className={styles.vignette} />}
      {scene.hasStorm && <div className={styles.lightning} />}
    </div>
  );
}
