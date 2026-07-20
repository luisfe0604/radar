"use client";

import { useEffect, useRef, useState } from "react";
import { Viewer, isSupported } from "mapillary-js";
import "mapillary-js/dist/mapillary.css";
import { WeatherSimulationOverlay } from "./WeatherSimulationOverlay";
import { classifyWeatherScene, getAtmosphereFilter } from "./weather-scene";
import styles from "./street-view-viewer.module.css";

interface StreetViewViewerProps {
  imageId: string;
  weatherCode: number;
  precipitation: number;
  isDay: boolean;
}

export function StreetViewViewer({
  imageId,
  weatherCode,
  precipitation,
  isDay,
}: StreetViewViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [supported] = useState(() => isSupported());

  useEffect(() => {
    if (!containerRef.current || !supported) return;

    const accessToken = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN;
    if (!accessToken) return;

    const viewer = new Viewer({
      accessToken,
      container: containerRef.current,
      imageId,
    });

    viewerRef.current = viewer;

    return () => {
      viewer.remove();
      viewerRef.current = null;
    };
  }, [imageId, supported]);

  if (!supported) {
    return (
      <div className={styles.stage}>
        <p className={styles.unsupported}>
          Seu navegador não tem suporte a WebGL, necessário para a navegação
          imersiva.
        </p>
      </div>
    );
  }

  const scene = classifyWeatherScene({ weatherCode, precipitation, isDay });
  const filterStyle = getAtmosphereFilter(scene);

  return (
    <div className={styles.stage}>
      <div
        ref={containerRef}
        className={styles.viewer}
        style={{ filter: filterStyle }}
      />
      <WeatherSimulationOverlay
        weatherCode={weatherCode}
        precipitation={precipitation}
        isDay={isDay}
      />
    </div>
  );
}
