import "server-only";
import type { NearbyImage } from "./types";

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

// A bbox maior que ~150m de raio faz a API da Mapillary recusar o pedido
// ("Please reduce the amount of data you're asking for").
const SEARCH_RADII_METERS = [60, 150];

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

export async function findNearestMapillaryImage(
  lat: number,
  lon: number,
): Promise<NearbyImage | null> {
  const token = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN;
  if (!token) return null;

  for (const radius of SEARCH_RADII_METERS) {
    const bbox = boundingBox(lat, lon, radius);
    const url = new URL("https://graph.mapillary.com/images");
    url.searchParams.set("access_token", token);
    url.searchParams.set("fields", "id,geometry,compass_angle,is_pano");
    url.searchParams.set(
      "bbox",
      `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`,
    );
    url.searchParams.set("limit", "10");

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) continue;

    const data = (await res.json()) as MapillaryImagesResponse;
    if (data.data.length === 0) continue;

    const withDistance = data.data.map((feature) => {
      const [imgLon, imgLat] = feature.geometry.coordinates;
      return {
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
