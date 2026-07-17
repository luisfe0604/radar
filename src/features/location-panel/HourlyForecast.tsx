import type { HourlyEntry } from "@/lib/weather/types";
import { describeWeatherCode } from "@/lib/weather/weather-codes";
import { formatHour } from "./format";
import { Sparkline } from "./Sparkline";
import styles from "./hourly-forecast.module.css";

export function HourlyForecast({ hourly }: { hourly: HourlyEntry[] }) {
  if (hourly.length === 0) return null;

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Próximas horas</h3>

      <Sparkline values={hourly.map((hour) => hour.temperature)} />

      <div className={styles.row}>
        {hourly.map((hour) => {
          const info = describeWeatherCode(hour.weatherCode);
          return (
            <div key={hour.time} className={styles.hourCard}>
              <span className={styles.hourLabel}>{formatHour(hour.time)}</span>
              <span className={styles.hourEmoji}>{info.emoji}</span>
              <span className={styles.hourTemp}>
                {Math.round(hour.temperature)}°
              </span>
              {hour.precipitationProbability > 0 && (
                <span className={styles.hourPrecip}>
                  {hour.precipitationProbability}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
