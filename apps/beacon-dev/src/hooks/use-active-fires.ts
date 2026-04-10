"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActiveFire } from "@/types/fire";
import { fetchAllFires } from "@/lib/fire-data";

export function useActiveFires(intervalMs = 300000) {
  const [fires, setFires] = useState<ActiveFire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllFires();
      setFires(data);
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

  return { fires, loading, error, lastFetched, refresh };
}
