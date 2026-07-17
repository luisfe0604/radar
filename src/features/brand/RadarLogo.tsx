import styles from "./radar-logo.module.css";

interface RadarLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export function RadarLogo({ size = 22, animated = false, className }: RadarLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="radar-logo-sweep"
          x1="32"
          y1="32"
          x2="56"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF8A3D" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FF8A3D" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="31" fill="#0B1220" />

      <g className={animated ? styles.sweep : undefined}>
        <path
          d="M32 32 L32 6 A26 26 0 0 1 56.1 22.3 Z"
          fill="url(#radar-logo-sweep)"
        />
      </g>

      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke="#45C4F0"
        strokeOpacity="0.28"
        strokeWidth="1"
      />
      <circle
        cx="32"
        cy="32"
        r="10"
        fill="none"
        stroke="#45C4F0"
        strokeOpacity="0.24"
        strokeWidth="1"
      />
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="#45C4F0"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />

      <circle cx="22" cy="41" r="2.2" fill="#45C4F0" />
      <circle cx="42" cy="24" r="1.5" fill="#45C4F0" opacity="0.8" />

      <circle cx="32" cy="32" r="2.8" fill="#FF8A3D" />
    </svg>
  );
}
