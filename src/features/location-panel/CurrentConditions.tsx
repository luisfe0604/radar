import { describeWeatherCode } from "@/lib/weather/weather-codes";
import type { WeatherData } from "@/lib/weather/types";
import { formatTemperature, formatWindDirection } from "./format";
import styles from "./current-conditions.module.css";

export function CurrentConditions({ weather }: { weather: WeatherData }) {
  const { current } = weather;
  const info = describeWeatherCode(current.weatherCode);

  const stats = [
    { label: "Sensação", value: formatTemperature(current.apparentTemperature) },
    { label: "Umidade", value: `${Math.round(current.humidity)}%` },
    { label: "Pressão", value: `${Math.round(current.pressure)} hPa` },
    {
      label: "Vento",
      value: `${Math.round(current.windSpeed)} km/h ${formatWindDirection(current.windDirection)}`,
    },
    { label: "Rajadas", value: `${Math.round(current.windGusts)} km/h` },
    {
      label: "Índice UV",
      value: current.uvIndex !== null ? current.uvIndex.toFixed(1) : "—",
    },
    { label: "Precipitação", value: `${current.precipitation.toFixed(1)} mm` },
    {
      label: "Visibilidade",
      value:
        current.visibility !== null
          ? `${(current.visibility / 1000).toFixed(1)} km`
          : "—",
    },
    {
      label: "Ponto de orvalho",
      value: current.dewPoint !== null ? formatTemperature(current.dewPoint) : "—",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.headline}>
        <span className={styles.emoji}>{info.emoji}</span>
        <div>
          <div className={styles.temperature}>
            {formatTemperature(current.temperature)}
          </div>
          <div className={styles.description}>{info.label}</div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
