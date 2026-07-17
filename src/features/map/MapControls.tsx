"use client";

import { useEffect, useState } from "react";
import {
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  ScaleControl,
} from "maplibre-gl";
import { useMapInstance } from "./map-context";
import { getInitialMapState } from "@/lib/url-state/map-url";
import { useLocation } from "@/features/location/location-context";
import type { GeocodeResult } from "@/lib/geocoding/types";
import styles from "./geolocate-error.module.css";

const GEOLOCATE_TRIGGER_MAX_ATTEMPTS = 20;
const GEOLOCATE_TRIGGER_RETRY_MS = 50;
const GEOLOCATE_ERROR_MESSAGES: Record<number, string> = {
  1: "Permissão de localização negada. Você pode habilitá-la nas configurações do navegador.",
  2: "Não foi possível determinar sua localização.",
  3: "A busca pela sua localização demorou demais.",
};

/**
 * GeolocateControl termina seu setup interno de forma assíncrona
 * (checkGeolocationSupport().then(...)); chamar trigger() antes disso
 * falha silenciosamente. Tenta novamente até o controle ficar pronto.
 */
function triggerGeolocateWhenReady(
  geolocate: GeolocateControl,
  attempt = 0,
) {
  const started = geolocate.trigger();
  if (!started && attempt < GEOLOCATE_TRIGGER_MAX_ATTEMPTS) {
    setTimeout(
      () => triggerGeolocateWhenReady(geolocate, attempt + 1),
      GEOLOCATE_TRIGGER_RETRY_MS,
    );
  }
}

/** Adiciona os controles nativos do MapLibre (zoom, rotação, tela cheia, localização, escala). */
export function MapControls() {
  const map = useMapInstance();
  const { selectLocation } = useLocation();
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!map) return;

    const navigation = new NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    });
    const geolocate = new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserLocation: false,
    });
    const fullscreen = new FullscreenControl({});
    const scale = new ScaleControl({ unit: "metric" });

    map.addControl(navigation, "top-right");
    map.addControl(geolocate, "top-right");
    map.addControl(fullscreen, "top-right");
    map.addControl(scale, "bottom-left");

    function handleGeolocate(position: GeolocationPosition) {
      setGeoError(null);
      const { latitude, longitude } = position.coords;

      fetch(`/api/geocode/reverse?lat=${latitude}&lon=${longitude}`)
        .then((res) => res.json())
        .then((data: { result: GeocodeResult | null }) => {
          selectLocation({
            lat: latitude,
            lon: longitude,
            label: data.result?.label ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            secondaryLabel: data.result?.secondaryLabel,
          });
        })
        .catch(() => {
          selectLocation({
            lat: latitude,
            lon: longitude,
            label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
        });
    }

    function handleGeolocateError(error: GeolocationPositionError) {
      setGeoError(
        GEOLOCATE_ERROR_MESSAGES[error.code] ??
          "Não foi possível obter sua localização.",
      );
    }

    geolocate.on("geolocate", handleGeolocate);
    geolocate.on("error", handleGeolocateError);

    if (!getInitialMapState()) {
      triggerGeolocateWhenReady(geolocate);
    }

    return () => {
      geolocate.off("geolocate", handleGeolocate);
      geolocate.off("error", handleGeolocateError);
      map.removeControl(navigation);
      map.removeControl(geolocate);
      map.removeControl(fullscreen);
      map.removeControl(scale);
    };
  }, [map, selectLocation]);

  useEffect(() => {
    if (!geoError) return;
    const timeoutId = setTimeout(() => setGeoError(null), 6000);
    return () => clearTimeout(timeoutId);
  }, [geoError]);

  if (!geoError) return null;

  return <div className={styles.banner}>{geoError}</div>;
}
