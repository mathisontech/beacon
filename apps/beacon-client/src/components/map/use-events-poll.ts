// Client hook: fetch /api/events on mount and on an interval.
// Server does all the real work — this is dumb.

"use client";

import { useEffect, useState } from "react";
import type { FeedEvent } from "@beacon/data-sources";

export interface FeedStatus {
  feedId: string;
  lastFetchedAt: string | null;
  lastError: string | null;
  count: number;
}

export interface EventsSnapshot {
  at: string;
  events: FeedEvent[];
  feeds: FeedStatus[];
}

export interface UseEventsPollState {
  snapshot: EventsSnapshot | null;
  loading: boolean;
  error: string | null;
}

export function useEventsPoll(intervalMs = 30_000): UseEventsPollState {
  const [snapshot, setSnapshot] = useState<EventsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        if (!res.ok) throw new Error(`/api/events ${res.status}`);
        const data = (await res.json()) as EventsSnapshot;
        if (!alive) return;
        setSnapshot(data);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { snapshot, loading, error };
}
