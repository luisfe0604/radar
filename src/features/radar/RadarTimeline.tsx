"use client";

import { useMemo, type CSSProperties } from "react";
import { useLayers } from "@/features/layers/layers-context";
import { useRadar } from "./radar-context";
import styles from "./radar-timeline.module.css";

function formatFrameTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(unixSeconds * 1000));
}

export function RadarTimeline() {
  const {
    frames,
    currentFrame,
    selectedIndex,
    lastPastIndex,
    isLive,
    isPlaying,
    isLoading,
    selectIndex,
    goLive,
    togglePlay,
  } = useRadar();
  const { isActive } = useLayers();

  const livePercent = useMemo(() => {
    if (frames.length <= 1 || lastPastIndex < 0) return 100;
    return (lastPastIndex / (frames.length - 1)) * 100;
  }, [frames.length, lastPastIndex]);

  if (!isActive("precipitation") || isLoading || frames.length === 0) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <button
          type="button"
          className={`${styles.liveButton} ${isLive ? styles.liveActive : ""}`}
          onClick={goLive}
        >
          <span className={styles.liveDot} />
          Ao vivo
        </button>

        <div className={styles.timeLabel}>
          {currentFrame ? formatFrameTime(currentFrame.time) : "--:--"}
        </div>
      </div>

      <input
        type="range"
        className={styles.slider}
        min={0}
        max={frames.length - 1}
        step={1}
        value={selectedIndex}
        onChange={(event) => selectIndex(Number(event.target.value))}
        style={{ "--live-percent": `${livePercent}%` } as CSSProperties}
        aria-label="Linha do tempo do radar"
      />
    </div>
  );
}
