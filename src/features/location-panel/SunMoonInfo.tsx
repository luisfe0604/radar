import type { DailyEntry, MoonPhase } from "@/lib/weather/types";
import { formatHour } from "./format";
import styles from "./sun-moon-info.module.css";

interface SunMoonInfoProps {
  today: DailyEntry;
  moon: MoonPhase;
}

export function SunMoonInfo({ today, moon }: SunMoonInfoProps) {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Sol e lua</h3>

      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.emoji}>🌅</span>
          <div>
            <span className={styles.itemLabel}>Nascer do sol</span>
            <span className={styles.itemValue}>{formatHour(today.sunrise)}</span>
          </div>
        </div>

        <div className={styles.item}>
          <span className={styles.emoji}>🌇</span>
          <div>
            <span className={styles.itemLabel}>Pôr do sol</span>
            <span className={styles.itemValue}>{formatHour(today.sunset)}</span>
          </div>
        </div>

        <div className={styles.item}>
          <span className={styles.emoji}>{moon.emoji}</span>
          <div>
            <span className={styles.itemLabel}>{moon.phaseLabel}</span>
            <span className={styles.itemValue}>
              {Math.round(moon.illumination * 100)}% iluminada
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
