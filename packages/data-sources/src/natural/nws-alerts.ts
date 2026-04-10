// NOAA / National Weather Service active alerts across the US.
// https://api.weather.gov/alerts/active — public, User-Agent required.

import type { Feed, FeedEvent, FeedSeverity } from "../types";
import { centroidOf } from "../geo/centroid-of";

const URL = "https://api.weather.gov/alerts/active";
const USER_AGENT = "Beacon/0.1 (beacon@mathison.dev)";
const FEED_ID = "nws-alerts";

function mapSeverity(s: string | undefined): FeedSeverity {
  switch ((s ?? "").toLowerCase()) {
    case "extreme":
      return "extreme";
    case "severe":
      return "severe";
    case "moderate":
      return "moderate";
    case "minor":
      return "minor";
    default:
      return "info";
  }
}

async function fetchNwsAlerts(): Promise<FeedEvent[]> {
  const res = await fetch(URL, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`NWS ${res.status}`);
  const data = (await res.json()) as {
    features?: Array<{
      id?: string;
      geometry?: unknown;
      properties?: Record<string, unknown>;
    }>;
  };
  const out: FeedEvent[] = [];
  for (const f of data.features ?? []) {
    const c = centroidOf(f.geometry);
    if (!c) continue; // skip zone-only alerts for now — C1 uses geometry only
    const p = f.properties ?? {};
    const id = (p.id as string) ?? f.id ?? `${c[0]},${c[1]},${p.sent}`;
    out.push({
      id: `${FEED_ID}:${id}`,
      feedId: FEED_ID,
      category: "natural",
      lat: c[0],
      lng: c[1],
      title: (p.event as string) ?? "NWS Alert",
      severity: mapSeverity(p.severity as string | undefined),
      timestamp:
        (p.sent as string) ??
        (p.effective as string) ??
        new Date().toISOString(),
      url: p.web as string | undefined,
      meta: {
        urgency: p.urgency,
        area: p.areaDesc,
        headline: p.headline,
      },
    });
  }
  return out;
}

export const nwsAlerts: Feed = {
  id: FEED_ID,
  name: "NWS Active Alerts",
  category: "natural",
  pollIntervalMs: 60_000,
  fetch: fetchNwsAlerts,
};
