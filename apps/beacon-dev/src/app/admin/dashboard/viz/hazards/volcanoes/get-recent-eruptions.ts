// Find volcanoes with an eruption in the last 12 months (or ongoing).
//
// A volcano counts as "recent" if ANY of these are true:
//   - Its most recent EruptionRecord.year >= cutoff year
//   - Its most recent EruptionRecord.display contains "present"
//     (our convention for ongoing eruptions, e.g. "2021–present")
//   - Its alert level is "warning" (USGS HANS: eruption in progress)

import type { Volcano } from "./types";
import { VOLCANOES } from "./volcano-data";
import { VOLCANO_HISTORY, type VolcanoHistory } from "./volcano-history";

export interface RecentEruption {
  volcano: Volcano;
  history?: VolcanoHistory;
  mostRecentYear: number | null;
  mostRecentDisplay: string;
  ongoing: boolean;
}

const DEFAULT_WINDOW_YEARS = 1; // "last 12 months"

export function getRecentlyErupting(
  now: Date = new Date(),
  windowYears: number = DEFAULT_WINDOW_YEARS
): RecentEruption[] {
  const cutoffYear = now.getUTCFullYear() - windowYears;
  const out: RecentEruption[] = [];

  for (const v of VOLCANOES) {
    const h = VOLCANO_HISTORY[v.id];
    const latest = h?.eruptions[0];
    const ongoing =
      v.level === "warning" ||
      (latest?.display?.toLowerCase().includes("present") ?? false);
    const inWindow = (latest?.year ?? Number.NEGATIVE_INFINITY) >= cutoffYear;

    if (ongoing || inWindow) {
      out.push({
        volcano: v,
        history: h,
        mostRecentYear: latest?.year ?? null,
        mostRecentDisplay: latest?.display ?? "—",
        ongoing,
      });
    }
  }

  // Ongoing first, then by most recent year descending.
  out.sort((a, b) => {
    if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1;
    return (b.mostRecentYear ?? 0) - (a.mostRecentYear ?? 0);
  });

  return out;
}
