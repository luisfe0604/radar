const WIND_DIRECTIONS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`;
}

export function formatWindDirection(degrees: number): string {
  const index = Math.round(degrees / 45) % 8;
  return WIND_DIRECTIONS[index];
}

export function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatWeekday(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
  });
}
