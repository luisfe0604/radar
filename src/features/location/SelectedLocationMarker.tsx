"use client";

import { useEffect, useRef } from "react";
import { Marker } from "maplibre-gl";
import { useMapInstance } from "@/features/map/map-context";
import { useLocation } from "./location-context";

export function SelectedLocationMarker() {
  const map = useMapInstance();
  const { selectedLocation } = useLocation();
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!selectedLocation) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([selectedLocation.lon, selectedLocation.lat]);
    } else {
      markerRef.current = new Marker({ color: "#ff8a3d" })
        .setLngLat([selectedLocation.lon, selectedLocation.lat])
        .addTo(map);
    }
  }, [map, selectedLocation]);

  useEffect(() => {
    return () => {
      markerRef.current?.remove();
    };
  }, []);

  return null;
}
