"use client";

import { useEffect, useState } from "react";
import { useLocation } from "@/features/location/location-context";
import type { WeatherData } from "@/lib/weather/types";

interface UseLocationWeatherResult {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

export function useLocationWeather(): UseLocationWeatherResult {
  const { selectedLocation } = useLocation();
  const lat = selectedLocation?.lat;
  const lon = selectedLocation?.lon;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === undefined || lon === undefined) {
      // Reset sync when the external location is cleared, not a cascading update.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeather(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar dados meteorológicos");
        return res.json();
      })
      .then((data: WeatherData) => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Não foi possível carregar os dados deste local.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return { weather, isLoading, error };
}
