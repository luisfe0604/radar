"use client";

import { useLayers } from "@/features/layers/layers-context";
import { useRadar } from "./radar-context";
import styles from "./radar-legend.module.css";

export function RadarLegend() {
  const { isLoading, frames } = useRadar();
  const { isActive } = useLayers();

  if (!isActive("precipitation") || isLoading || frames.length === 0) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <span className={styles.title}>Intensidade da chuva</span>
      <div className={styles.gradient} />
      <div className={styles.labels}>
        <span>Fraca</span>
        <span>Extrema</span>
      </div>
    </div>
  );
}
