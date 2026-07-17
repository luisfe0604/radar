"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface SelectedLocation {
  lat: number;
  lon: number;
  label: string;
  secondaryLabel?: string;
}

interface LocationContextValue {
  selectedLocation: SelectedLocation | null;
  selectLocation: (location: SelectedLocation) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation deve ser usado dentro de LocationProvider");
  }
  return ctx;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const selectLocation = useCallback((location: SelectedLocation) => {
    setSelectedLocation(location);
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  return (
    <LocationContext.Provider
      value={{ selectedLocation, selectLocation, clearLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}
