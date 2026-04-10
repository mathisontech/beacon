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
}

interface QuakesResponse {
  at: number;
  center: { lat: number; lng: number };
  radiusKm: number;
  days: number;
  count: number;
  quakes: VolcanoQuake[];
}

interface State {
  quakes: VolcanoQuake[];
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
}

// Fetches recent quakes within radiusKm of (lat,lng) for the last
// `days` days. Null args disable the fetch.
export function useVolcanoQuakes(
  lat: number | null,
  lng: number | null,
  opts?: { radiusKm?: number; days?: number }
): State {
  const [state, setState] = useState<State>({
    quakes: [],
    loading: false,
    error: null,
    fetchedAt: null,
  });

  useEffect(() => {
    if (lat == null || lng == null) {
      setState({ quakes: [], loading: false, error: null, fetchedAt: null });
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
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({
          quakes: [],
          loading: false,
          error: err instanceof Error ? err.message : "fetch failed",
          fetchedAt: null,
        });
      });

    return () => controller.abort();
  }, [lat, lng, opts?.radiusKm, opts?.days]);

  return state;
}
