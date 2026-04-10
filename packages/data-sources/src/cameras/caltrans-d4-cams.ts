// Caltrans District 4 (Bay Area) CCTV camera feed — public JSON, no auth.
// https://cwwp2.dot.ca.gov/data/d4/cctv/cctvStatusD04.json
// Each entry has location + still image URL + streaming URL.

import type { Feed, FeedEvent } from "../types";

const URL = "https://cwwp2.dot.ca.gov/data/d4/cctv/cctvStatusD04.json";
const FEED_ID = "caltrans-d4-cams";

interface RawCam {
  cctv?: {
    index?: string;
    recordTimestamp?: { recordDate?: string; recordTime?: string };
    location?: {
      locationName?: string;
      nearbyPlace?: string;
      longitude?: string | number;
      latitude?: string | number;
      route?: string;
    };
    imageData?: {
      static?: { currentImageURL?: string };
      streamingVideoURL?: string;
    };
  };
}

async function fetchCaltrans(): Promise<FeedEvent[]> {
  const res = await fetch(URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Caltrans D4 ${res.status}`);
  const data = (await res.json()) as { data?: RawCam[] };
  const out: FeedEvent[] = [];
  for (const row of data.data ?? []) {
    const c = row.cctv;
    if (!c?.location) continue;
    const lat = Number(c.location.latitude);
    const lng = Number(c.location.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;
    out.push({
      id: `${FEED_ID}:${c.index ?? `${lat},${lng}`}`,
      feedId: FEED_ID,
      category: "cameras",
      lat,
      lng,
      title: c.location.nearbyPlace ?? c.location.locationName ?? "CCTV",
      severity: "info",
      timestamp: new Date().toISOString(),
      url: c.imageData?.static?.currentImageURL,
      meta: {
        route: c.location.route,
        streamUrl: c.imageData?.streamingVideoURL,
      },
    });
  }
  return out;
}

export const caltransD4Cams: Feed = {
  id: FEED_ID,
  name: "Caltrans D4 Cameras (Bay Area)",
  category: "cameras",
  pollIntervalMs: 5 * 60_000,
  fetch: fetchCaltrans,
};
