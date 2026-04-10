// NIFC / WFIGS active wildfire points. US-only. Lightweight version of the
// fire route that already exists in beacon-dev — this one only needs pins.
// https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query

import type { Feed, FeedEvent, FeedSeverity } from "../types";

const URL =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query";
const FEED_ID = "nifc-fires";

function severityFromAcres(acres: number): FeedSeverity {
  if (acres >= 50_000) return "extreme";
  if (acres >= 10_000) return "severe";
  if (acres >= 1_000) return "moderate";
  if (acres >= 100) return "minor";
  return "info";
}

async function fetchNifcFires(): Promise<FeedEvent[]> {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "IncidentName,DailyAcres,PercentContained,FireDiscoveryDateTime,POOState",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
    resultRecordCount: "500",
  });
  const res = await fetch(`${URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`NIFC ${res.status}`);
  const data = (await res.json()) as {
    features?: Array<{
      id?: number | string;
      geometry?: { coordinates?: [number, number] };
      properties?: Record<string, unknown>;
    }>;
  };
  const out: FeedEvent[] = [];
  for (const f of data.features ?? []) {
    const coords = f.geometry?.coordinates;
    if (!coords) continue;
    const p = f.properties ?? {};
    const name = (p.IncidentName as string) ?? "Wildfire";
    const acres = Number(p.DailyAcres) || 0;
    out.push({
      id: `${FEED_ID}:${f.id ?? name}-${coords[1]},${coords[0]}`,
      feedId: FEED_ID,
      category: "natural",
      lat: coords[1],
      lng: coords[0],
      title: `${name}${acres ? ` — ${Math.round(acres).toLocaleString()} ac` : ""}`,
      severity: severityFromAcres(acres),
      timestamp: p.FireDiscoveryDateTime
        ? new Date(p.FireDiscoveryDateTime as string | number).toISOString()
        : new Date().toISOString(),
      meta: {
        acres,
        contained: p.PercentContained,
        state: p.POOState,
      },
    });
  }
  return out;
}

export const nifcFires: Feed = {
  id: FEED_ID,
  name: "NIFC Active Wildfires (US)",
  category: "natural",
  pollIntervalMs: 5 * 60_000,
  fetch: fetchNifcFires,
};
