import "server-only";
import type { GeocodeResult } from "./types";

const COORDINATES_PATTERN =
  /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;
const BR_POSTAL_CODE_PATTERN = /^\d{5}-?\d{3}$/;

const MAX_RESULTS = 8;

interface OpenMeteoGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  admin2?: string;
}

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

interface PhotonFeature {
  properties: {
    osm_id?: number;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

function parseCoordinates(query: string): GeocodeResult | null {
  const match = query.match(COORDINATES_PATTERN);
  if (!match) return null;

  const lat = Number(match[1]);
  const lon = Number(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return {
    id: `coordinates:${lat},${lon}`,
    label: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    secondaryLabel: "Coordenadas",
    lat,
    lon,
    source: "coordinates",
  };
}

function isPostalCode(query: string): boolean {
  return BR_POSTAL_CODE_PATTERN.test(query.trim());
}

function looksLikeAddress(query: string): boolean {
  return /\d/.test(query) || query.includes(",");
}

async function searchOpenMeteo(query: string): Promise<GeocodeResult[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "pt");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as OpenMeteoGeocodingResponse;

  return (data.results ?? []).map((r) => ({
    id: `open-meteo:${r.id}`,
    label: r.name,
    secondaryLabel: [r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude,
    source: "open-meteo" as const,
  }));
}

function photonLabel(properties: PhotonFeature["properties"]): {
  label: string;
  secondaryLabel: string;
} {
  const streetLine = [properties.street, properties.housenumber]
    .filter(Boolean)
    .join(", ");
  const label = streetLine || properties.name || properties.postcode || "";
  const secondaryLabel = [properties.city, properties.state, properties.country]
    .filter(Boolean)
    .join(", ");

  return { label: label || secondaryLabel, secondaryLabel };
}

async function searchPhoton(query: string): Promise<GeocodeResult[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as PhotonResponse;

  return data.features.map((feature, index) => {
    const { label, secondaryLabel } = photonLabel(feature.properties);
    const [lon, lat] = feature.geometry.coordinates;
    return {
      id: `photon:${feature.properties.osm_id ?? `${index}:${lat},${lon}`}`,
      label,
      secondaryLabel,
      lat,
      lon,
      source: "photon" as const,
    };
  });
}

function dedupe(results: GeocodeResult[]): GeocodeResult[] {
  const seen: GeocodeResult[] = [];

  for (const result of results) {
    const isDuplicate = seen.some(
      (existing) =>
        Math.abs(existing.lat - result.lat) < 0.01 &&
        Math.abs(existing.lon - result.lon) < 0.01,
    );
    if (!isDuplicate) seen.push(result);
  }

  return seen;
}

export async function geocode(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const coordinates = parseCoordinates(trimmed);
  if (coordinates) return [coordinates];

  if (isPostalCode(trimmed)) {
    const results = await searchPhoton(trimmed);
    return dedupe(results).slice(0, MAX_RESULTS);
  }

  const openMeteoResults = await searchOpenMeteo(trimmed);

  if (openMeteoResults.length > 0 && !looksLikeAddress(trimmed)) {
    return dedupe(openMeteoResults).slice(0, MAX_RESULTS);
  }

  const photonResults = await searchPhoton(trimmed);
  return dedupe([...openMeteoResults, ...photonResults]).slice(0, MAX_RESULTS);
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<GeocodeResult | null> {
  const url = new URL("https://photon.komoot.io/reverse");
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lon.toString());

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const data = (await res.json()) as PhotonResponse;
  const feature = data.features[0];
  if (!feature) return null;

  const { label, secondaryLabel } = photonLabel(feature.properties);
  const [featureLon, featureLat] = feature.geometry.coordinates;

  return {
    id: `photon:${feature.properties.osm_id ?? `${featureLat},${featureLon}`}`,
    label,
    secondaryLabel,
    lat: featureLat,
    lon: featureLon,
    source: "photon",
  };
}
