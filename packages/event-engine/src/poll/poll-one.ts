// Fetch a single feed and write the result (or the error) to the cache.
// Never throws — failures are captured as lastError so one bad feed
// doesn't break the whole poll.

import type { Feed } from "@beacon/data-sources";
import { putFeed, putError } from "../store/event-cache";

export interface PollOneResult {
  feedId: string;
  ok: boolean;
  count: number;
  error: string | null;
  durationMs: number;
}

export async function pollOne(feed: Feed): Promise<PollOneResult> {
  const t0 = Date.now();
  try {
    const events = await feed.fetch();
    putFeed(feed.id, events);
    return {
      feedId: feed.id,
      ok: true,
      count: events.length,
      error: null,
      durationMs: Date.now() - t0,
    };
  } catch (err) {
    putError(feed.id, err);
    return {
      feedId: feed.id,
      ok: false,
      count: 0,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - t0,
    };
  }
}
