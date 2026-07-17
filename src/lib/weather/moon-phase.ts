import type { MoonPhase } from "./types";

const SYNODIC_MONTH_DAYS = 29.53058867;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);

const PHASES: { max: number; label: string; emoji: string }[] = [
  { max: 0.033, label: "Lua nova", emoji: "🌑" },
  { max: 0.25 - 0.033, label: "Crescente côncava", emoji: "🌒" },
  { max: 0.25 + 0.033, label: "Quarto crescente", emoji: "🌓" },
  { max: 0.5 - 0.033, label: "Crescente gibosa", emoji: "🌔" },
  { max: 0.5 + 0.033, label: "Lua cheia", emoji: "🌕" },
  { max: 0.75 - 0.033, label: "Minguante gibosa", emoji: "🌖" },
  { max: 0.75 + 0.033, label: "Quarto minguante", emoji: "🌗" },
  { max: 1 - 0.033, label: "Minguante côncava", emoji: "🌘" },
  { max: 1, label: "Lua nova", emoji: "🌑" },
];

export function calculateMoonPhase(date: Date): MoonPhase {
  const daysSinceKnownNewMoon = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const cyclePosition =
    ((daysSinceKnownNewMoon % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) %
    SYNODIC_MONTH_DAYS;
  const phaseFraction = cyclePosition / SYNODIC_MONTH_DAYS;
  const illumination = (1 - Math.cos(2 * Math.PI * phaseFraction)) / 2;

  const matched =
    PHASES.find((phase) => phaseFraction <= phase.max) ?? PHASES[PHASES.length - 1];

  return { illumination, phaseLabel: matched.label, emoji: matched.emoji };
}
