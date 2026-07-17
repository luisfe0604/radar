"use client";

import { OWM_LAYER_MAP, type LayerId } from "./layer-definitions";
import { WeatherOverlayLayer } from "./WeatherOverlayLayer";

export function WeatherOverlayLayers() {
  return (
    <>
      {Object.entries(OWM_LAYER_MAP).map(([layerId, owmLayer]) => (
        <WeatherOverlayLayer
          key={layerId}
          layerId={layerId as LayerId}
          owmLayer={owmLayer}
        />
      ))}
    </>
  );
}
