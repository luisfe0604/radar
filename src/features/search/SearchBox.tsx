"use client";

import { useEffect, useRef, useState } from "react";
import { useMapInstance } from "@/features/map/map-context";
import { useLocation } from "@/features/location/location-context";
import type { GeocodeResult } from "@/lib/geocoding/types";
import styles from "./search-box.module.css";

const DEBOUNCE_MS = 400;
const RESULT_ZOOM = 11;

export function SearchBox() {
  const map = useMapInstance();
  const { selectLocation } = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data: { results: GeocodeResult[] }) => {
          setResults(data.results);
          setIsOpen(true);
        })
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_MS);
  }

  function selectResult(result: GeocodeResult) {
    map?.flyTo({
      center: [result.lon, result.lat],
      zoom: RESULT_ZOOM,
      duration: 1200,
    });

    selectLocation({
      lat: result.lat,
      lon: result.lon,
      label: result.label,
      secondaryLabel: result.secondaryLabel,
    });

    setQuery(result.label);
    setIsOpen(false);
  }

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="text"
        placeholder="Buscar cidade, endereço, CEP ou coordenadas"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
      />

      {isOpen && (results.length > 0 || isLoading) && (
        <ul className={styles.results}>
          {isLoading && <li className={styles.status}>Buscando...</li>}
          {!isLoading &&
            results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  className={styles.resultButton}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectResult(result)}
                >
                  <span className={styles.resultLabel}>{result.label}</span>
                  {result.secondaryLabel && (
                    <span className={styles.resultSecondary}>
                      {result.secondaryLabel}
                    </span>
                  )}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
