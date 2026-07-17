import "server-only";
import type { RadarFramesResponse } from "./types";

interface RainViewerApiResponse {
  generated: number;
  host: string;
  radar: {
    past: { time: number; path: string }[];
    nowcast: { time: number; path: string }[];
  };
}

export async function fetchRadarFrames(): Promise<RadarFramesResponse> {
  const res = await fetch(
    "https://api.rainviewer.com/public/weather-maps.json",
    { next: { revalidate: 120 } },
  );

  if (!res.ok) {
    throw new Error(`RainViewer respondeu ${res.status}`);
  }

  const data = (await res.json()) as RainViewerApiResponse;

  return {
    host: data.host,
    generatedAt: data.generated,
    past: data.radar.past,
    nowcast: data.radar.nowcast,
  };
}
