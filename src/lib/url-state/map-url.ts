export interface MapCameraState {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export function parseMapStateFromSearchParams(
  params: URLSearchParams,
): MapCameraState | null {
  if (!params.has("lat") || !params.has("lng") || !params.has("z")) {
    return null;
  }

  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const zoom = Number(params.get("z"));

  if (![lat, lng, zoom].every(Number.isFinite)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  const bearing = Number(params.get("b")) || 0;
  const pitch = Number(params.get("p")) || 0;

  return { center: [lng, lat], zoom, bearing, pitch };
}

export function serializeMapStateToParams(
  state: MapCameraState,
): URLSearchParams {
  const params = new URLSearchParams();

  params.set("lat", state.center[1].toFixed(5));
  params.set("lng", state.center[0].toFixed(5));
  params.set("z", state.zoom.toFixed(2));

  if (Math.abs(state.bearing) > 0.5) {
    params.set("b", state.bearing.toFixed(1));
  }
  if (Math.abs(state.pitch) > 0.5) {
    params.set("p", state.pitch.toFixed(1));
  }

  return params;
}

export function getInitialMapState(): MapCameraState | null {
  if (typeof window === "undefined") return null;
  return parseMapStateFromSearchParams(
    new URLSearchParams(window.location.search),
  );
}
