"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RadarFrame, RadarFramesResponse } from "@/lib/radar/types";
import {
  RADAR_PLAYBACK_INTERVAL_MS,
  RADAR_POLL_INTERVAL_MS,
} from "./radar-constants";

interface RadarContextValue {
  frames: RadarFrame[];
  host: string | null;
  currentFrame: RadarFrame | null;
  selectedIndex: number;
  lastPastIndex: number;
  isLive: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  selectIndex: (index: number) => void;
  goLive: () => void;
  togglePlay: () => void;
}

const RadarContext = createContext<RadarContextValue | null>(null);

export function useRadar(): RadarContextValue {
  const ctx = useContext(RadarContext);
  if (!ctx) {
    throw new Error("useRadar deve ser usado dentro de RadarProvider");
  }
  return ctx;
}

export function RadarProvider({ children }: { children: ReactNode }) {
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [host, setHost] = useState<string | null>(null);
  const [lastPastIndex, setLastPastIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLive, setIsLive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isLiveRef = useRef(isLive);
  const selectedIndexRef = useRef(selectedIndex);
  const framesRef = useRef(frames);

  useEffect(() => {
    isLiveRef.current = isLive;
    selectedIndexRef.current = selectedIndex;
    framesRef.current = frames;
  }, [isLive, selectedIndex, frames]);

  const fetchFrames = useCallback(async () => {
    try {
      const res = await fetch("/api/radar/frames");
      const data = (await res.json()) as RadarFramesResponse;
      const combined = [...data.past, ...data.nowcast];
      const newLastPastIndex = data.past.length - 1;

      if (isLiveRef.current) {
        setSelectedIndex(newLastPastIndex);
      } else {
        const previousTime = framesRef.current[selectedIndexRef.current]?.time;
        const matchedIndex = combined.findIndex((f) => f.time === previousTime);
        if (matchedIndex >= 0) {
          setSelectedIndex(matchedIndex);
        } else {
          setSelectedIndex(newLastPastIndex);
          setIsLive(true);
        }
      }

      setFrames(combined);
      setHost(data.host);
      setLastPastIndex(newLastPastIndex);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Data-fetching sync effect: setState calls happen asynchronously
    // after the fetch resolves, not synchronously during this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchFrames();
    const intervalId = setInterval(() => void fetchFrames(), RADAR_POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchFrames]);

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const intervalId = setInterval(() => {
      setSelectedIndex((prev) => {
        const next = prev + 1 >= frames.length ? 0 : prev + 1;
        setIsLive(next === lastPastIndex);
        return next;
      });
    }, RADAR_PLAYBACK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isPlaying, frames.length, lastPastIndex]);

  const selectIndex = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      setIsLive(index === lastPastIndex);
      setIsPlaying(false);
    },
    [lastPastIndex],
  );

  const goLive = useCallback(() => {
    setIsPlaying(false);
    setIsLive(true);
    setSelectedIndex(lastPastIndex);
  }, [lastPastIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const currentFrame = frames[selectedIndex] ?? null;

  return (
    <RadarContext.Provider
      value={{
        frames,
        host,
        currentFrame,
        selectedIndex,
        lastPastIndex,
        isLive,
        isPlaying,
        isLoading,
        selectIndex,
        goLive,
        togglePlay,
      }}
    >
      {children}
    </RadarContext.Provider>
  );
}
