"use client";

import { useState } from "react";
import { LAYER_DEFINITIONS } from "./layer-definitions";
import { useLayers } from "./layers-context";
import styles from "./layers-control.module.css";

export function LayersControl() {
  const { isActive, toggleLayer } = useLayers();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Camadas"
      >
        <span aria-hidden="true">🗂️</span>
        <span className={styles.label}>Camadas</span>
        <span className={styles.chevron}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className={styles.panel}>
          {LAYER_DEFINITIONS.map((layer) => {
            const active = isActive(layer.id);
            return (
              <button
                key={layer.id}
                type="button"
                className={styles.layerRow}
                onClick={() => toggleLayer(layer.id)}
              >
                <span className={styles.layerEmoji}>{layer.emoji}</span>
                <span className={styles.layerLabel}>{layer.label}</span>
                <span
                  className={`${styles.checkbox} ${active ? styles.checkboxActive : ""}`}
                >
                  {active ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
