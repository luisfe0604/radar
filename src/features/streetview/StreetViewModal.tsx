"use client";

import { useEffect } from "react";
import { useStreetView } from "./streetview-context";
import { StreetViewViewer } from "./StreetViewViewer";
import styles from "./street-view-modal.module.css";

export function StreetViewModal() {
  const { target, close } = useStreetView();

  useEffect(() => {
    if (!target) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [target, close]);

  if (!target) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <span className={styles.label}>{target.label}</span>
        <button
          type="button"
          className={styles.closeButton}
          onClick={close}
          aria-label="Fechar navegação imersiva"
        >
          ✕
        </button>
      </div>
      <div className={styles.body}>
        <StreetViewViewer
          image={target.image}
          weatherCode={target.weatherCode}
          precipitation={target.precipitation}
          isDay={target.isDay}
        />
      </div>
    </div>
  );
}
