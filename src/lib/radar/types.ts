export interface RadarFrame {
  time: number;
  path: string;
}

export interface RadarFramesResponse {
  host: string;
  generatedAt: number;
  past: RadarFrame[];
  nowcast: RadarFrame[];
}
