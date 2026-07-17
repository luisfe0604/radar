"use client";

import { useEffect, useRef } from "react";
import { useMapInstance } from "@/features/map/map-context";
import { useLayers } from "@/features/layers/layers-context";
import { useRadar } from "./radar-context";
import {
  RADAR_FADE_DURATION_MS,
  RADAR_MAX_ZOOM,
  RADAR_OPACITY,
  RADAR_TILE_SIZE,
  buildRadarTileUrl,
} from "./radar-constants";

export function RadarLayer() {
  const map = useMapInstance();
  const { currentFrame, host } = useRadar();
  const { isActive } = useLayers();
  const precipitationActive = isActive("precipitation");
  const activeLayerIdRef = useRef<string | null>(null);
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

    if (!precipitationActive) {
      const previousLayerId = activeLayerIdRef.current;
      if (previousLayerId && map.getLayer(previousLayerId)) {
        map.setPaintProperty(previousLayerId, "raster-opacity", 0);
        const previousSourceId = previousLayerId.replace(/-layer$/, "");

        setTimeout(() => {
          if (map.getLayer(previousLayerId)) map.removeLayer(previousLayerId);
          if (map.getSource(previousSourceId)) map.removeSource(previousSourceId);
        }, RADAR_FADE_DURATION_MS + 50);

        activeLayerIdRef.current = null;
      }
      return;
    }

    if (!currentFrame || !host) return;

    const sourceId = `radar-${currentFrame.time}`;
    const layerId = `${sourceId}-layer`;
    const previousLayerId = activeLayerIdRef.current;

    if (previousLayerId === layerId) return;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "raster",
        tiles: [buildRadarTileUrl(host, currentFrame.path)],
        tileSize: RADAR_TILE_SIZE,
        maxzoom: RADAR_MAX_ZOOM,
        attribution: "RainViewer",
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer(
        {
          id: layerId,
          type: "raster",
          source: sourceId,
          paint: {
            "raster-opacity": 0,
            "raster-opacity-transition": {
              duration: RADAR_FADE_DURATION_MS,
              delay: 0,
            },
            "raster-resampling": "linear",
          },
        },
        beforeIdRef.current,
      );
    }

    const fadeInTimeout = setTimeout(() => {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, "raster-opacity", RADAR_OPACITY);
      }
    }, 0);

    if (previousLayerId && map.getLayer(previousLayerId)) {
      map.setPaintProperty(previousLayerId, "raster-opacity", 0);
      const previousSourceId = previousLayerId.replace(/-layer$/, "");

      setTimeout(() => {
        if (map.getLayer(previousLayerId)) map.removeLayer(previousLayerId);
        if (map.getSource(previousSourceId)) map.removeSource(previousSourceId);
      }, RADAR_FADE_DURATION_MS + 50);
    }

    activeLayerIdRef.current = layerId;

    return () => clearTimeout(fadeInTimeout);
  }, [map, currentFrame, host, precipitationActive]);

  return null;
}
