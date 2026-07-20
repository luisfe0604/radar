"use client";

import { useState } from "react";
import styles from "./share-button.module.css";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const text = copied ? "Link copiado" : "Compartilhar posição";

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      aria-label={text}
    >
      <span aria-hidden="true">{copied ? "✓" : "🔗"}</span>
      <span className={styles.label}>{text}</span>
    </button>
  );
}
