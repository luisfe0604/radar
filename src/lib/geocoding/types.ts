export interface GeocodeResult {
  id: string;
  label: string;
  secondaryLabel?: string;
  lat: number;
  lon: number;
  source: "coordinates" | "open-meteo" | "photon";
}
