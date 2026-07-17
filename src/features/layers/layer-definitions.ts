export type LayerId =
  | "precipitation"
  | "clouds"
  | "temperature"
  | "wind"
  | "pressure";

export interface LayerDefinition {
  id: LayerId;
  label: string;
  emoji: string;
}

export const LAYER_DEFINITIONS: LayerDefinition[] = [
  { id: "precipitation", label: "Precipitação", emoji: "🌧️" },
  { id: "clouds", label: "Nuvens", emoji: "☁️" },
  { id: "temperature", label: "Temperatura", emoji: "🌡️" },
  { id: "wind", label: "Vento", emoji: "💨" },
  { id: "pressure", label: "Pressão", emoji: "🧭" },
];

export const DEFAULT_ACTIVE_LAYERS: LayerId[] = ["precipitation"];

export const OWM_LAYER_MAP: Partial<Record<LayerId, string>> = {
  clouds: "clouds_new",
  temperature: "temp_new",
  wind: "wind_new",
  pressure: "pressure_new",
};
