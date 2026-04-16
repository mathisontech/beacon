"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { HurricaneStorm } from "@beacon/data-sources";

export interface WeatherState {
  /** Hours offset from "now" — 0 = current, negative = past, positive = forecast. */
  hoursOffset: number;
  setHoursOffset: (h: number) => void;
  /** Baseline "now" used as reference when computing positions. */
  nowMs: number;
  /** Current effective time = nowMs + hoursOffset*3600000 */
  effectiveTimeMs: number;
  /** Active storms with forecast geometry merged in. */
  storms: HurricaneStorm[];
  stormsLoading: boolean;
  stormsError: string | null;
  refreshStorms: () => Promise<void>;
  /** Enabled overlay ids (wx-hurricane, wx-cloud-cover, wx-radar, wx-wind, wx-temperature) */
  enabled: Set<string>;
  toggle: (id: string) => void;
  setEnabled: (ids: Set<string>) => void;
}

const WeatherContext = createContext<WeatherState | null>(null);

const DEFAULT_ENABLED = new Set<string>(["wx-hurricane"]);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [hoursOffset, setHoursOffset] = useState(0);
  const [nowMs] = useState(() => Date.now());
  const [storms, setStorms] = useState<HurricaneStorm[]>([]);
  const [stormsLoading, setStormsLoading] = useState(false);
  const [stormsError, setStormsError] = useState<string | null>(null);
  const [enabled, setEnabledState] = useState<Set<string>>(DEFAULT_ENABLED);

  const refreshStorms = useCallback(async () => {
    setStormsLoading(true);
    setStormsError(null);
    try {
      const res = await fetch("/api/weather/cyclones");
      if (!res.ok) throw new Error(`cyclones API ${res.status}`);
      const data = (await res.json()) as { storms?: HurricaneStorm[]; errors?: string[] };
      setStorms(data.storms ?? []);
      if (data.errors && data.errors.length > 0) {
        console.warn("[cyclones] partial errors:", data.errors);
      }
    } catch (e) {
      setStormsError(e instanceof Error ? e.message : "Failed to load storms");
      setStorms([]);
    } finally {
      setStormsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStorms();
    const iv = setInterval(refreshStorms, 10 * 60 * 1000);
    return () => clearInterval(iv);
  }, [refreshStorms]);

  const toggle = useCallback((id: string) => {
    setEnabledState((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo<WeatherState>(
    () => ({
      hoursOffset,
      setHoursOffset,
      nowMs,
      effectiveTimeMs: nowMs + hoursOffset * 3600_000,
      storms,
      stormsLoading,
      stormsError,
      refreshStorms,
      enabled,
      toggle,
      setEnabled: setEnabledState,
    }),
    [hoursOffset, nowMs, storms, stormsLoading, stormsError, refreshStorms, enabled, toggle]
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather(): WeatherState {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used inside <WeatherProvider>");
  return ctx;
}
