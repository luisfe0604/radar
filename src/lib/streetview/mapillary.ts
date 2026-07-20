import "server-only";
import type { MapillaryNearbyImage } from "./types";

interface MapillaryImageFeature {
  id: string;
  geometry: { coordinates: [number, number] };
  compass_angle?: number;
  is_pano?: boolean;
}

interface MapillaryImagesResponse {
  data: MapillaryImageFeature[];
}

const METERS_PER_DEGREE_LAT = 111320;

// Uma bbox maior que ~150m de raio faz a API da Mapillary recusar o pedido
// ("Please reduce the amount of data you're asking for"). Para ampliar o
// alcance da busca sem esbarrar nesse limite, combinamos várias células
// menores dispostas em grade ao redor do ponto, em anéis crescentes.
const CELL_RADIUS_METERS = 140;
const CELL_STEP_METERS = 240;
const MAX_RING = 1; // anel 0 (centro) + anel 1 (8 vizinhos) = raio efetivo ~380m

function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusMeters = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(a));
}

function boundingBox(lat: number, lon: number, radiusMeters: number) {
  const latDelta = radiusMeters / METERS_PER_DEGREE_LAT;
  const lonDelta =
    radiusMeters / (METERS_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180));

  return {
    minLon: lon - lonDelta,
    minLat: lat - latDelta,
    maxLon: lon + lonDelta,
    maxLat: lat + latDelta,
  };
}

function cellCenter(lat: number, lon: number, dx: number, dy: number) {
  const latDelta = (dy * CELL_STEP_METERS) / METERS_PER_DEGREE_LAT;
  const lonDelta =
    (dx * CELL_STEP_METERS) / (METERS_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + latDelta, lon: lon + lonDelta };
}

function ringOffsets(ring: number): Array<[number, number]> {
  if (ring === 0) return [[0, 0]];
  const offsets: Array<[number, number]> = [];
  for (let dx = -ring; dx <= ring; dx++) {
    for (let dy = -ring; dy <= ring; dy++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) === ring) offsets.push([dx, dy]);
    }
  }
  return offsets;
}

async function searchCell(
  token: string,
  lat: number,
  lon: number,
): Promise<MapillaryImageFeature[]> {
  const bbox = boundingBox(lat, lon, CELL_RADIUS_METERS);
  const url = new URL("https://graph.mapillary.com/images");
  url.searchParams.set("access_token", token);
  url.searchParams.set("fields", "id,geometry,compass_angle,is_pano");
  url.searchParams.set(
    "bbox",
    `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`,
  );
  url.searchParams.set("limit", "10");

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as MapillaryImagesResponse;
  return data.data;
}

export async function findNearestMapillaryImage(
  lat: number,
  lon: number,
): Promise<MapillaryNearbyImage | null> {
  const token = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN;
  if (!token) return null;

  for (let ring = 0; ring <= MAX_RING; ring++) {
    const offsets = ringOffsets(ring);
    const results = await Promise.all(
      offsets.map(([dx, dy]) => {
        const center = cellCenter(lat, lon, dx, dy);
        return searchCell(token, center.lat, center.lon);
      }),
    );

    const seen = new Map<string, MapillaryImageFeature>();
    for (const features of results) {
      for (const feature of features) seen.set(feature.id, feature);
    }
    if (seen.size === 0) continue;

    const withDistance = Array.from(seen.values()).map((feature) => {
      const [imgLon, imgLat] = feature.geometry.coordinates;
      return {
        source: "mapillary" as const,
        id: feature.id,
        lat: imgLat,
        lon: imgLon,
        compassAngle: feature.compass_angle ?? 0,
        isPanoramic: feature.is_pano ?? false,
        distanceMeters: haversineDistanceMeters(lat, lon, imgLat, imgLon),
      };
    });

    withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return withDistance[0];
  }

  return null;
}
