// USGS Volcano Hazards Program — currently elevated (non-Normal) volcanoes.
// https://volcanoes.usgs.gov/hans-public/api/volcano/getElevatedVolcanoes

import type { Feed, FeedEvent, FeedSeverity } from "../types";

const URL =
  "https://volcanoes.usgs.gov/hans-public/api/volcano/getElevatedVolcanoes";
const FEED_ID = "usgs-volcanoes";

function severityFromAlert(level: string | undefined): FeedSeverity {
  switch ((level ?? "").toUpperCase()) {
    case "WARNING":
      return "extreme";
    case "WATCH":
      return "severe";
    case "ADVISORY":
      return "moderate";
    case "NORMAL":
      return "info";
    default:
      return "moderate";
  }
}

async function fetchVolcanoes(): Promise<FeedEvent[]> {
  const res = await fetch(URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`USGS HANS ${res.status}`);
  const data = (await res.json()) as Array<{
    volcano_name_appended?: string;
    volcano_name?: string;
    latitude?: number | string;
    longitude?: number | string;
    alert_level?: string;
    color_code?: string;
    synopsis_date?: string;
    vnum?: string | number;
  }>;
  const out: FeedEvent[] = [];
  for (const v of data ?? []) {
    const lat = Number(v.latitude);
    const lng = Number(v.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const name = v.volcano_name_appended ?? v.volcano_name ?? "Volcano";
    out.push({
      id: `${FEED_ID}:${v.vnum ?? name}`,
      feedId: FEED_ID,
      category: "volcano",
      lat,
      lng,
      title: `${name} — ${v.alert_level ?? "UNKNOWN"}`,
      severity: severityFromAlert(v.alert_level),
      timestamp: v.synopsis_date
        ? new Date(v.synopsis_date).toISOString()
        : new Date().toISOString(),
      meta: {
        alertLevel: v.alert_level,
        colorCode: v.color_code,
      },
    });
  }
  return out;
}

export const usgsVolcanoes: Feed = {
  id: FEED_ID,
  name: "USGS Elevated Volcanoes",
  category: "volcano",
  pollIntervalMs: 15 * 60_000,
  fetch: fetchVolcanoes,
};
