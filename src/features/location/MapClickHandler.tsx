"use client";

import { useEffect } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { useMapInstance } from "@/features/map/map-context";
import { useLocation } from "./location-context";

interface ReverseGeocodeResponse {
  result: { label: string; secondaryLabel?: string } | null;
}

export function MapClickHandler() {
  const map = useMapInstance();
  const { selectLocation } = useLocation();

  useEffect(() => {
    if (!map) return;

    function handleClick(event: MapMouseEvent) {
      const { lat, lng } = event.lngLat;
      selectLocation({
        lat,
        lon: lng,
        label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });

      fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data: ReverseGeocodeResponse) => {
          if (data.result) {
            selectLocation({
              lat,
              lon: lng,
              label: data.result.label,
              secondaryLabel: data.result.secondaryLabel,
            });
          }
        })
        .catch(() => {});
    }

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, selectLocation]);

  return null;
}
