"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { NearbyStreetImage } from "@/lib/streetview/types";

export interface StreetViewTarget {
  lat: number;
  lon: number;
  label: string;
  image: NearbyStreetImage;
  weatherCode: number;
  precipitation: number;
  isDay: boolean;
}

interface StreetViewContextValue {
  target: StreetViewTarget | null;
  open: (target: StreetViewTarget) => void;
  close: () => void;
}

const StreetViewContext = createContext<StreetViewContextValue | null>(null);

export function useStreetView(): StreetViewContextValue {
  const ctx = useContext(StreetViewContext);
  if (!ctx) {
    throw new Error("useStreetView deve ser usado dentro de StreetViewProvider");
  }
  return ctx;
}

export function StreetViewProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<StreetViewTarget | null>(null);

  const open = useCallback((next: StreetViewTarget) => setTarget(next), []);
  const close = useCallback(() => setTarget(null), []);

  return (
    <StreetViewContext.Provider value={{ target, open, close }}>
      {children}
    </StreetViewContext.Provider>
  );
}
