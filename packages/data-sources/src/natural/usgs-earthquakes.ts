// USGS earthquakes — past day, magnitude 2.5+. Public, no auth.
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php

import type { Feed, FeedEvent, FeedSeverity } from "../types";

const URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

const FEED_ID = "usgs-earthquakes";

function severityFromMag(mag: number): FeedSeverity {
  if (mag >= 7) return "extreme";
  if (mag >= 6) return "severe";
  if (mag >= 5) return "moderate";
  if (mag >= 4) return "minor";
  return "info";
}

async function fetchEarthquakes(): Promise<FeedEvent[]> {
  const res = await fetch(URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`USGS earthquakes ${res.status}`);
  const data = (await res.json()) as {
    features?: Array<{
      id?: string;
      geometry?: { coordinates?: [number, number, number] };
      properties?: {
        mag?: number;
        place?: string;
        time?: number;
        url?: string;
      };
    }>;
  };
  const out: FeedEvent[] = [];
  for (const f of data.features ?? []) {
    const coords = f.geometry?.coordinates;
    if (!coords) continue;
    const mag = f.properties?.mag ?? 0;
    out.push({
      id: `${FEED_ID}:${f.id ?? `${coords[1]},${coords[0]},${f.properties?.time}`}`,
      feedId: FEED_ID,
      category: "natural",
      lat: coords[1],
      lng: coords[0],
      title: `M${mag.toFixed(1)} — ${f.properties?.place ?? "Unknown"}`,
      severity: severityFromMag(mag),
      timestamp: f.properties?.time
        ? new Date(f.properties.time).toISOString()
        : new Date().toISOString(),
      url: f.properties?.url,
      meta: { mag, depthKm: coords[2] },
    });
  }
  return out;
}

export const usgsEarthquakes: Feed = {
  id: FEED_ID,
  name: "USGS Earthquakes (M2.5+, past day)",
  category: "natural",
  pollIntervalMs: 5 * 60_000,
  fetch: fetchEarthquakes,
};
