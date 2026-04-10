"use client";

import { useState, useEffect, useCallback } from "react";
import type { NWSAlert } from "@/types/map";
import { fetchActiveAlerts } from "@/lib/nws-alerts";

export function useNWSAlerts(intervalMs = 60000) {
  const [alerts, setAlerts] = useState<NWSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchActiveAlerts();
      setAlerts(data);
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

  return { alerts, loading, error, lastFetched, refresh };
}
