import "server-only";
import type { KartaViewNearbyPhoto } from "./types";

interface KartaViewPhoto {
  lat: string;
  lng: string;
  heading?: string;
  distance?: string;
  fileurlProc?: string;
  fileurl?: string;
}

interface KartaViewResponse {
  status: { apiCode: number };
  result: { data: KartaViewPhoto[] | null } | null;
}

// A API rejeita raios grandes com timeout ("Query timeout. Narrow your
// filter..."); 200m é o maior raio que responde de forma confiável.
const SEARCH_RADIUS_METERS = 200;
const REQUEST_TIMEOUT_MS = 12000;

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

// KartaView é usada como fallback quando a Mapillary não tem cobertura no
// local: sem token, mas mais lenta (8-12s) e sem navegação por sequência
// pronta, então retornamos só a foto mais próxima (visualização estática).
export async function findNearestKartaViewPhoto(
  lat: number,
  lon: number,
): Promise<KartaViewNearbyPhoto | null> {
  const url = new URL("https://api.openstreetcam.org/2.0/photo/");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lon));
  url.searchParams.set("radius", String(SEARCH_RADIUS_METERS));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as KartaViewResponse;
    const photos = data.result?.data;
    if (!photos || photos.length === 0) return null;

    const withDistance = photos
      .map((photo) => {
        const photoLat = Number(photo.lat);
        const photoLon = Number(photo.lng);
        const imageUrl = photo.fileurlProc ?? photo.fileurl;
        if (!Number.isFinite(photoLat) || !Number.isFinite(photoLon) || !imageUrl) {
          return null;
        }
        return {
          source: "kartaview" as const,
          imageUrl,
          lat: photoLat,
          lon: photoLon,
          headingDegrees: Number(photo.heading) || 0,
          distanceMeters: haversineDistanceMeters(lat, lon, photoLat, photoLon),
        };
      })
      .filter((photo): photo is KartaViewNearbyPhoto => photo !== null);

    if (withDistance.length === 0) return null;

    withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return withDistance[0];
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
