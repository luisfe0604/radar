import { RadarLogo } from "./RadarLogo";
import styles from "./brand-mark.module.css";

export function BrandMark() {
  return (
    <div className={styles.pill}>
      <RadarLogo size={26} animated />
      <div className={styles.wordmark}>
        <span className={styles.title}>RADAR</span>
        <span className={styles.subtitle}>METEOROLÓGICO</span>
      </div>
    </div>
  );
}
