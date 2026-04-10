// GDELT 2.0 geo API — global human events (protests, violence, unrest).
// Public, no auth. Returns GeoJSON FeatureCollection of mapped articles.
// http://api.gdeltproject.org/api/v2/geo/geo

import type { Feed, FeedEvent, FeedSeverity } from "../types";

const URL =
  "https://api.gdeltproject.org/api/v2/geo/geo" +
  "?query=(protest%20OR%20riot%20OR%20shooting%20OR%20attack%20OR%20evacuation)" +
  "&format=GeoJSON&timespan=1d&mode=PointData&maxrecords=200";
const FEED_ID = "gdelt-events";

function severityFromTone(tone: number): FeedSeverity {
  // GDELT tone is roughly -10 (very negative) to +10 (very positive).
  const t = -tone; // negative tone = more severe
  if (t >= 8) return "extreme";
  if (t >= 5) return "severe";
  if (t >= 2) return "moderate";
  if (t >= 0) return "minor";
  return "info";
}

async function fetchGdelt(): Promise<FeedEvent[]> {
  const res = await fetch(URL, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`GDELT ${res.status}`);
  const data = (await res.json()) as {
    features?: Array<{
      properties?: {
        name?: string;
        html?: string;
        url?: string;
        tone?: number;
        shareimage?: string;
        count?: number;
      };
      geometry?: { coordinates?: [number, number] };
    }>;
  };
  const out: FeedEvent[] = [];
  let i = 0;
  for (const f of data.features ?? []) {
    const c = f.geometry?.coordinates;
    if (!c) continue;
    const p = f.properties ?? {};
    const title = (p.name ?? "").split("<br")[0] || "News event";
    out.push({
      id: `${FEED_ID}:${c[1]},${c[0]}:${i++}`,
      feedId: FEED_ID,
      category: "human",
      lat: c[1],
      lng: c[0],
      title,
      severity: severityFromTone(p.tone ?? 0),
      timestamp: new Date().toISOString(),
      url: p.url,
      meta: { tone: p.tone, count: p.count },
    });
  }
  return out;
}

export const gdeltEvents: Feed = {
  id: FEED_ID,
  name: "GDELT Global Events (past 24h)",
  category: "human",
  pollIntervalMs: 10 * 60_000,
  fetch: fetchGdelt,
};
