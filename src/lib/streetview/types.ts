export interface MapillaryNearbyImage {
  source: "mapillary";
  id: string;
  lat: number;
  lon: number;
  compassAngle: number;
  isPanoramic: boolean;
  distanceMeters: number;
}

export interface KartaViewNearbyPhoto {
  source: "kartaview";
  imageUrl: string;
  lat: number;
  lon: number;
  headingDegrees: number;
  distanceMeters: number;
}

export type NearbyStreetImage = MapillaryNearbyImage | KartaViewNearbyPhoto;
