import type { DailyEntry } from "@/lib/weather/types";
import { describeWeatherCode } from "@/lib/weather/weather-codes";
import { formatWeekday } from "./format";
import styles from "./daily-forecast.module.css";

export function DailyForecast({ daily }: { daily: DailyEntry[] }) {
  if (daily.length === 0) return null;

  const weekMin = Math.min(...daily.map((day) => day.temperatureMin));
  const weekMax = Math.max(...daily.map((day) => day.temperatureMax));
  const weekRange = weekMax - weekMin || 1;

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Próximos dias</h3>

      <div className={styles.list}>
        {daily.map((day, index) => {
          const info = describeWeatherCode(day.weatherCode);
          const barStart = ((day.temperatureMin - weekMin) / weekRange) * 100;
          const barWidth =
            ((day.temperatureMax - day.temperatureMin) / weekRange) * 100;

          return (
            <div key={day.date} className={styles.row}>
              <span className={styles.weekday}>
                {index === 0 ? "Hoje" : formatWeekday(day.date)}
              </span>
              <span className={styles.emoji}>{info.emoji}</span>
              <span className={styles.tempMin}>
                {Math.round(day.temperatureMin)}°
              </span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ marginLeft: `${barStart}%`, width: `${barWidth}%` }}
                />
              </div>
              <span className={styles.tempMax}>
                {Math.round(day.temperatureMax)}°
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
