"use client";

import { useLocation } from "@/features/location/location-context";
import { StreetViewEntryButton } from "@/features/streetview/StreetViewEntryButton";
import { useLocationWeather } from "./use-location-weather";
import { CurrentConditions } from "./CurrentConditions";
import { HourlyForecast } from "./HourlyForecast";
import { DailyForecast } from "./DailyForecast";
import { SunMoonInfo } from "./SunMoonInfo";
import styles from "./location-panel.module.css";

export function LocationPanel() {
  const { selectedLocation, clearLocation } = useLocation();
  const { weather, isLoading, error } = useLocationWeather();

  if (!selectedLocation) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.title}>{selectedLocation.label}</span>
          {selectedLocation.secondaryLabel && (
            <span className={styles.subtitle}>
              {selectedLocation.secondaryLabel}
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={clearLocation}
          aria-label="Fechar painel"
        >
          ✕
        </button>
      </div>

      <div className={styles.body}>
        {isLoading && <p className={styles.status}>Carregando...</p>}
        {error && <p className={styles.statusError}>{error}</p>}
        {weather && (
          <>
            <CurrentConditions weather={weather} />
            <StreetViewEntryButton
              lat={selectedLocation.lat}
              lon={selectedLocation.lon}
              label={selectedLocation.label}
              weatherCode={weather.current.weatherCode}
              precipitation={weather.current.precipitation}
              isDay={weather.current.isDay}
            />
            <HourlyForecast hourly={weather.hourly} />
            <DailyForecast daily={weather.daily} />
            {weather.daily[0] && (
              <SunMoonInfo today={weather.daily[0]} moon={weather.moon} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
