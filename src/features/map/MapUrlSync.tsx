"use client";

import { useEffect } from "react";
import { useMapInstance } from "./map-context";
import { serializeMapStateToParams } from "@/lib/url-state/map-url";

/** Mantém lat/lng/zoom/bearing/pitch da URL sincronizados com a câmera do mapa. */
export function MapUrlSync() {
  const map = useMapInstance();

  useEffect(() => {
    if (!map) return;

    function syncUrl() {
      if (!map) return;

      const params = serializeMapStateToParams({
        center: [map.getCenter().lng, map.getCenter().lat],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      });

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    }

    map.on("moveend", syncUrl);
    return () => {
      map.off("moveend", syncUrl);
    };
  }, [map]);

  return null;
}
