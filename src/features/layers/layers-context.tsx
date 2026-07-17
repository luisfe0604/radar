"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_ACTIVE_LAYERS, type LayerId } from "./layer-definitions";

interface LayersContextValue {
  activeLayers: Set<LayerId>;
  toggleLayer: (id: LayerId) => void;
  isActive: (id: LayerId) => boolean;
}

const LayersContext = createContext<LayersContextValue | null>(null);

export function useLayers(): LayersContextValue {
  const ctx = useContext(LayersContext);
  if (!ctx) {
    throw new Error("useLayers deve ser usado dentro de LayersProvider");
  }
  return ctx;
}

export function LayersProvider({ children }: { children: ReactNode }) {
  const [activeLayers, setActiveLayers] = useState<Set<LayerId>>(
    () => new Set(DEFAULT_ACTIVE_LAYERS),
  );

  const toggleLayer = useCallback((id: LayerId) => {
    setActiveLayers((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isActive = useCallback(
    (id: LayerId) => activeLayers.has(id),
    [activeLayers],
  );

  return (
    <LayersContext.Provider value={{ activeLayers, toggleLayer, isActive }}>
      {children}
    </LayersContext.Provider>
  );
}
