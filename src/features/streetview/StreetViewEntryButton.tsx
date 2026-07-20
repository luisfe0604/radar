"use client";

import { useEffect, useState } from "react";
import { useStreetView } from "./streetview-context";
import type { NearbyStreetImage } from "@/lib/streetview/types";
import styles from "./street-view-entry-button.module.css";

interface StreetViewEntryButtonProps {
  lat: number;
  lon: number;
  label: string;
  weatherCode: number;
  precipitation: number;
  isDay: boolean;
}

export function StreetViewEntryButton({
  lat,
  lon,
  label,
  weatherCode,
  precipitation,
  isDay,
}: StreetViewEntryButtonProps) {
  const { open } = useStreetView();
  const [nearbyImage, setNearbyImage] = useState<
    NearbyStreetImage | null | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/streetview/nearby?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((data: { image: NearbyStreetImage | null }) => {
        if (!cancelled) setNearbyImage(data.image);
      })
      .catch(() => {
        if (!cancelled) setNearbyImage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  if (nearbyImage === undefined) {
    return <p className={styles.status}>Procurando imagens de rua...</p>;
  }

  if (!nearbyImage) return null;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() =>
        open({
          lat,
          lon,
          label,
          image: nearbyImage,
          weatherCode,
          precipitation,
          isDay,
        })
      }
    >
      🚶 Explorar nas ruas
    </button>
  );
}
