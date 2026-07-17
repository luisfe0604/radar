"use client";

import { useEffect, useRef } from "react";
import { useMapInstance } from "@/features/map/map-context";
import { useLayers } from "./layers-context";
import type { LayerId } from "./layer-definitions";

const OWM_OPACITY = 0.72;

interface WeatherOverlayLayerProps {
  layerId: LayerId;
  owmLayer: string;
}

export function WeatherOverlayLayer({
  layerId,
  owmLayer,
}: WeatherOverlayLayerProps) {
  const map = useMapInstance();
  const { isActive } = useLayers();
  const active = isActive(layerId);
  const sourceId = `owm-${owmLayer}`;
  const mapLayerId = `${sourceId}-layer`;
  const beforeIdRef = useRef<string | undefined>(undefined);
  const beforeIdResolvedRef = useRef(false);

  useEffect(() => {
    if (!map || beforeIdResolvedRef.current) return;

    const firstSymbolLayer = map
      .getStyle()
      .layers?.find((layer) => layer.type === "symbol");
    beforeIdRef.current = firstSymbolLayer?.id;
    beforeIdResolvedRef.current = true;
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (active) {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "raster",
          tiles: [`/api/layers/openweathermap/${owmLayer}/{z}/{x}/{y}`],
          tileSize: 256,
          attribution: "OpenWeatherMap",
        });
      }

      if (!map.getLayer(mapLayerId)) {
        map.addLayer(
          {
            id: mapLayerId,
            type: "raster",
            source: sourceId,
            paint: { "raster-opacity": OWM_OPACITY },
          },
          beforeIdRef.current,
        );
      }
    } else {
      if (map.getLayer(mapLayerId)) map.removeLayer(mapLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
  }, [map, active, sourceId, mapLayerId, owmLayer]);

  useEffect(() => {
    return () => {
      if (!map) return;
      if (map.getLayer(mapLayerId)) map.removeLayer(mapLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, mapLayerId, sourceId]);

  return null;
}
