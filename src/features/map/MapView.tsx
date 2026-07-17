"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { MapInstanceContext } from "./map-context";
import {
  DEFAULT_BEARING,
  DEFAULT_CENTER,
  DEFAULT_PITCH,
  DEFAULT_ZOOM,
  MAP_STYLE_URL,
} from "./map-constants";
import { getInitialMapState } from "@/lib/url-state/map-url";
import styles from "./map-view.module.css";

interface MapViewProps {
  children?: ReactNode;
}

export function MapView({ children }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialState = getInitialMapState();

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: initialState?.center ?? DEFAULT_CENTER,
      zoom: initialState?.zoom ?? DEFAULT_ZOOM,
      bearing: initialState?.bearing ?? DEFAULT_BEARING,
      pitch: initialState?.pitch ?? DEFAULT_PITCH,
      attributionControl: { compact: true },
    });

    mapRef.current = instance;
    instance.once("load", () => setMap(instance));

    return () => {
      instance.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.map} />
      <MapInstanceContext.Provider value={map}>
        <div className={styles.overlay}>{children}</div>
      </MapInstanceContext.Provider>
    </div>
  );
}
