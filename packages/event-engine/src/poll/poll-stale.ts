// Only re-poll feeds whose cache entry is older than their pollIntervalMs.
// Used by the /api/events route so client requests don't hammer upstreams.

import { ALL_FEEDS } from "@beacon/data-sources";
import { pollAll, type PollAllSummary } from "./poll-all";
import { shouldRepoll } from "./should-repoll";

export async function pollStale(): Promise<PollAllSummary> {
  const due = ALL_FEEDS.filter((f) => shouldRepoll(f));
  if (due.length === 0) {
    return { at: new Date().toISOString(), results: [], totalEvents: 0 };
  }
  return pollAll(due);
}
