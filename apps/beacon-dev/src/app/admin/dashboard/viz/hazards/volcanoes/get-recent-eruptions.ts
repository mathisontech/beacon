// Find volcanoes with an eruption in the last 12 months (or ongoing).
//
// A volcano counts as "recent" if ANY of these are true:
//   - Its most recent EruptionRecord.year >= cutoff year
//   - Its most recent EruptionRecord.display contains "present"
//     (our convention for ongoing eruptions, e.g. "2021–present")
//   - Its alert level is "warning" (USGS HANS: eruption in progress)
//   - (fallback for global entries without VOLCANO_HISTORY) its
//     `last_eruption` string contains "present" / "persistent" or
//     a year >= cutoff.

import type { Volcano } from "./types";
import { ALL_VOLCANOES } from "./all-volcanoes";
import { VOLCANO_HISTORY, type VolcanoHistory } from "./volcano-history";

export interface RecentEruption {
  volcano: Volcano;
  history?: VolcanoHistory;
  mostRecentYear: number | null;
  mostRecentDisplay: string;
  ongoing: boolean;
}

const DEFAULT_WINDOW_YEARS = 1; // "last 12 months"

// Pull the first 4-digit year out of a free-text last-eruption label
// ("2024–present", "1944", "persistent", "70 kya"). Returns null if
// nothing year-like is found.
function parseYearFromLabel(label: string): number | null {
  const m = label.match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}

export function getRecentlyErupting(
  now: Date = new Date(),
  windowYears: number = DEFAULT_WINDOW_YEARS
): RecentEruption[] {
  const cutoffYear = now.getUTCFullYear() - windowYears;
  const out: RecentEruption[] = [];

  for (const v of ALL_VOLCANOES) {
    const h = VOLCANO_HISTORY[v.id];
    const latest = h?.eruptions[0];

    const label = (latest?.display ?? v.last_eruption ?? "").toLowerCase();
    const labelSuggestsOngoing =
      label.includes("present") || label.includes("persistent");

    const labelYear =
      latest?.year ?? parseYearFromLabel(v.last_eruption ?? "");

    const ongoing = v.level === "warning" || labelSuggestsOngoing;
    const inWindow = (labelYear ?? Number.NEGATIVE_INFINITY) >= cutoffYear;

    if (ongoing || inWindow) {
      out.push({
        volcano: v,
        history: h,
        mostRecentYear: labelYear,
        mostRecentDisplay: latest?.display ?? v.last_eruption ?? "—",
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
