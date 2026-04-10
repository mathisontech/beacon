"use client";

import { useState, useEffect, useCallback } from "react";
import type { FeedEvent } from "@beacon/data-sources";

export interface FeedStatus {
  feedId: string;
  lastFetchedAt: string | null;
  lastError: string | null;
  count: number;
}

interface Snapshot {
  at: string;
  feeds: FeedStatus[];
  events: FeedEvent[];
}

export function useFeedEvents(intervalMs = 60_000) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [feeds, setFeeds] = useState<FeedStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const snap = (await res.json()) as Snapshot;
      setEvents(snap.events);
      setFeeds(snap.feeds);
      setLastFetched(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, intervalMs);
    return () => clearInterval(timer);
  }, [refresh, intervalMs]);

  return { events, feeds, loading, error, lastFetched, refresh };
}
