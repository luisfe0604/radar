"use client";

import { useEffect, useRef, useState } from "react";
import { Viewer, isSupported } from "mapillary-js";
import "mapillary-js/dist/mapillary.css";
import type { NearbyStreetImage } from "@/lib/streetview/types";
import { WeatherSimulationOverlay } from "./WeatherSimulationOverlay";
import { classifyWeatherScene, getAtmosphereFilter } from "./weather-scene";
import styles from "./street-view-viewer.module.css";

interface StreetViewViewerProps {
  image: NearbyStreetImage;
  weatherCode: number;
  precipitation: number;
  isDay: boolean;
}

export function StreetViewViewer({
  image,
  weatherCode,
  precipitation,
  isDay,
}: StreetViewViewerProps) {
  const scene = classifyWeatherScene({ weatherCode, precipitation, isDay });
  const filterStyle = getAtmosphereFilter(scene);

  if (image.source === "kartaview") {
    return (
      <div className={styles.stage}>
        {/* eslint-disable-next-line @next/next/no-img-element -- foto externa da KartaView, sem otimização própria do Next */}
        <img
          src={image.imageUrl}
          alt="Foto de rua mais próxima (KartaView)"
          className={styles.staticPhoto}
          style={{ filter: filterStyle }}
        />
        <WeatherSimulationOverlay
          weatherCode={weatherCode}
          precipitation={precipitation}
          isDay={isDay}
        />
        <p className={styles.staticCaption}>
          Sem cobertura da Mapillary aqui — mostrando a foto mais próxima da
          KartaView (sem navegação entre pontos).
        </p>
      </div>
    );
  }

  return (
    <MapillaryStage imageId={image.id} filterStyle={filterStyle} scene={{ weatherCode, precipitation, isDay }} />
  );
}

function MapillaryStage({
  imageId,
  filterStyle,
  scene,
}: {
  imageId: string;
  filterStyle: string;
  scene: { weatherCode: number; precipitation: number; isDay: boolean };
}) {
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

  return (
    <div className={styles.stage}>
      <div
        ref={containerRef}
        className={styles.viewer}
        style={{ filter: filterStyle }}
      />
      <WeatherSimulationOverlay
        weatherCode={scene.weatherCode}
        precipitation={scene.precipitation}
        isDay={scene.isDay}
      />
    </div>
  );
}
