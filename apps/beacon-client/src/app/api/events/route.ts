// GET /api/events
// Triggers a "poll stale feeds" pass, then returns the full cached snapshot.
// Keeps the client dumb: it hits this endpoint on an interval and renders
// whatever events come back.

import { NextResponse } from "next/server";
import {
  pollStale,
  getAllEntries,
  type FeedCacheEntry,
} from "@beacon/event-engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const summary = await pollStale();
  const entries: FeedCacheEntry[] = getAllEntries();
  const events = entries.flatMap((e: FeedCacheEntry) => e.events);
  return NextResponse.json({
    at: new Date().toISOString(),
    poll: summary,
    feeds: entries.map((e: FeedCacheEntry) => ({
      feedId: e.feedId,
      lastFetchedAt: e.lastFetchedAt,
      lastError: e.lastError,
      count: e.events.length,
    })),
    events,
  });
}
