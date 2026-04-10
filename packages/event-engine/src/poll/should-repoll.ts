// Throttle helper: given a feed's last-fetched time and its pollIntervalMs,
// decide whether we're allowed to hit the upstream again.

import type { Feed } from "@beacon/data-sources";
import { getFeed } from "../store/event-cache";

export function shouldRepoll(feed: Feed, now = Date.now()): boolean {
  const entry = getFeed(feed.id);
  if (!entry || !entry.lastFetchedAt) return true;
  const age = now - new Date(entry.lastFetchedAt).getTime();
  return age >= feed.pollIntervalMs;
}
