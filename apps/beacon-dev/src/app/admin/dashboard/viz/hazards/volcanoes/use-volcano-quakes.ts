"use client";

import { useEffect, useState } from "react";

export interface VolcanoQuake {
  id: string;
  mag: number | null;
  place: string | null;
  time: number;
  depthKm: number;
  lat: number;
  lng: number;
  url: string;
  source?: string;
}

export interface QuakeSourceInfo {
  id: string;
  name: string;
  url: string;
}

interface QuakesResponse {
  at: number;
  center: { lat: number; lng: number };
  radiusKm: number;
  days: number;
  source: QuakeSourceInfo;
  count: number;
  quakes: VolcanoQuake[];
}

interface State {
  quakes: VolcanoQuake[];
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
  source: QuakeSourceInfo | null;
}

// Fetches recent quakes within radiusKm of (lat,lng) for the last
// `days` days. The backend picks the best regional feed (INGV,
// GeoNet, IPGP, …) and falls back to USGS globally. Null args
// disable the fetch.
export function useVolcanoQuakes(
  lat: number | null,
  lng: number | null,
  opts?: { radiusKm?: number; days?: number },
): State {
  const [state, setState] = useState<State>({
    quakes: [],
    loading: false,
    error: null,
    fetchedAt: null,
    source: null,
  });

  useEffect(() => {
    if (lat == null || lng == null) {
      setState({ quakes: [], loading: false, error: null, fetchedAt: null, source: null });
      return;
    }
    const controller = new AbortController();
    const radiusKm = opts?.radiusKm ?? 20;
    const days = opts?.days ?? 30;
    const qs = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radiusKm: String(radiusKm),
      days: String(days),
    });

    setState((s) => ({ ...s, loading: true, error: null }));

    fetch(`/api/volcano-quakes?${qs.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as QuakesResponse;
      })
      .then((data) => {
        setState({
          quakes: data.quakes,
          loading: false,
          error: null,
          fetchedAt: data.at,
          source: data.source,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({
          quakes: [],
          loading: false,
          error: err instanceof Error ? err.message : "fetch failed",
          fetchedAt: null,
          source: null,
        });
      });

    return () => controller.abort();
  }, [lat, lng, opts?.radiusKm, opts?.days]);

  return state;
}
