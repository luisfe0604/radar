"use client";

import { useEffect, useRef } from "react";
import { useMapInstance } from "./map-context";
import {
  MAP_DIMMER_COLOR,
  MAP_DIMMER_LAYER_ID,
  MAP_DIMMER_OPACITY,
} from "./map-constants";

/**
 * Escurece o mapa base (fills, ruas, água) sem afetar os rótulos,
 * para que as camadas de dados (radar, temperatura, vento) se destaquem.
 */
export function MapDimmer() {
  const map = useMapInstance();
  const addedRef = useRef(false);

  useEffect(() => {
    if (!map || addedRef.current || map.getLayer(MAP_DIMMER_LAYER_ID)) return;

    const firstSymbolLayer = map
      .getStyle()
      .layers?.find((layer) => layer.type === "symbol");

    map.addLayer(
      {
        id: MAP_DIMMER_LAYER_ID,
        type: "background",
        paint: {
          "background-color": MAP_DIMMER_COLOR,
          "background-opacity": MAP_DIMMER_OPACITY,
        },
      },
      firstSymbolLayer?.id,
    );

    addedRef.current = true;
  }, [map]);

  return null;
}
