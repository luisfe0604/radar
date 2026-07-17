"use client";

import { createContext, useContext } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

export const MapInstanceContext = createContext<MapLibreMap | null>(null);

/** Mapa MapLibre atual, ou `null` enquanto ainda está sendo inicializado. */
export function useMapInstance() {
  return useContext(MapInstanceContext);
}
