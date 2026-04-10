// Process-level in-memory event cache, keyed by feed id.
// Each entry records the last fetch time, the events, and the last error (if any).
// C1: single-process Next.js dev server. Later checkpoints swap this for
// something persistent, but the interface stays the same.

import type { FeedEvent } from "@beacon/data-sources";

export interface FeedCacheEntry {
  feedId: string;
  lastFetchedAt: string | null;
  lastError: string | null;
  events: FeedEvent[];
}

const cache = new Map<string, FeedCacheEntry>();

export function putFeed(feedId: string, events: FeedEvent[]): void {
  cache.set(feedId, {
    feedId,
    lastFetchedAt: new Date().toISOString(),
    lastError: null,
    events,
  });
}

export function putError(feedId: string, err: unknown): void {
  const prev = cache.get(feedId);
  cache.set(feedId, {
    feedId,
    lastFetchedAt: prev?.lastFetchedAt ?? null,
    lastError: err instanceof Error ? err.message : String(err),
    events: prev?.events ?? [],
  });
}

export function getFeed(feedId: string): FeedCacheEntry | null {
  return cache.get(feedId) ?? null;
}

export function getAllEntries(): FeedCacheEntry[] {
  return Array.from(cache.values());
}

export function getAllEvents(): FeedEvent[] {
  const out: FeedEvent[] = [];
  for (const entry of cache.values()) out.push(...entry.events);
  return out;
}

export function clearCache(): void {
  cache.clear();
}
