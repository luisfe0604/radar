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

  return (
    <div className={styles.overlay} aria-hidden="true">
      {scene.hasFog && <div className={styles.fog} />}
      {scene.rainIntensity !== "none" && (
        <div
          className={`${styles.rain} ${styles[`rain-${scene.rainIntensity}`]}`}
        />
      )}
      {scene.hasSnow && <div className={styles.snow} />}
      {scene.hasStorm && <div className={styles.lightning} />}
    </div>
  );
}
