// Run pollOne across every registered feed in parallel.
// Designed to be called from a Next.js route handler on demand
// and from a background interval in the future.

import { ALL_FEEDS, type Feed } from "@beacon/data-sources";
import { pollOne, type PollOneResult } from "./poll-one";

export interface PollAllSummary {
  at: string;
  results: PollOneResult[];
  totalEvents: number;
}

export async function pollAll(
  feeds: Feed[] = ALL_FEEDS,
): Promise<PollAllSummary> {
  const results = await Promise.all(feeds.map(pollOne));
  return {
    at: new Date().toISOString(),
    results,
    totalEvents: results.reduce((n, r) => n + r.count, 0),
  };
}
