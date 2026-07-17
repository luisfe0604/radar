export const RADAR_TILE_SIZE = 256;
export const RADAR_MAX_ZOOM = 7;
export const RADAR_OPACITY = 0.85;
export const RADAR_COLOR_SCHEME = 2;
export const RADAR_SMOOTH_SNOW = "1_1";
export const RADAR_FADE_DURATION_MS = 300;
export const RADAR_POLL_INTERVAL_MS = 2 * 60 * 1000;
export const RADAR_PLAYBACK_INTERVAL_MS = 600;

export function buildRadarTileUrl(host: string, path: string): string {
  return `${host}${path}/${RADAR_TILE_SIZE}/{z}/{x}/{y}/${RADAR_COLOR_SCHEME}/${RADAR_SMOOTH_SNOW}.png`;
}
