// GDACS — Global Disaster Alert and Coordination System.
// Aggregates tropical cyclone data across every basin (Atlantic, E/C/W Pacific,
// Indian Ocean, Southern Hemisphere) from JTWC, NOAA, JMA, and others.
// Data is derived from public-domain government sources; GDACS permits
// free use including commercial with attribution ("Data: GDACS").
//
// Endpoint: https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP
//   eventtypes=TC  → tropical cyclones only
//   alertlevel=Green;Orange;Red  → every currently-active event
//
// Returns a GeoJSON FeatureCollection of current-position points.

import type { HurricaneStorm, HurricaneForecastPoint } from "./types";

const GDACS_LIST_URL =
  "https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=TC&alertlevel=Green;Orange;Red";

function basinFromLngLat(lng: number, lat: number): HurricaneStorm["basin"] {
  if (lat < 0) return "SH";
  if (lng > 100 && lng < 180) return "WP";
  if (lng > 40 && lng <= 100) return "IO";
  if (lng < -140 || lng > 180) return "CP";
  if (lng < -100) return "EP";
  return "AL";
}

interface GdacsPoint {
  time?: string;
  lat?: number;
  lng?: number;
  wind?: number;
  pressure?: number;
}

export async function fetchGdacsCyclones(): Promise<HurricaneStorm[]> {
  const res = await fetch(GDACS_LIST_URL, {
    signal: AbortSignal.timeout(15000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`GDACS ${res.status}`);
  const fc = (await res.json()) as GeoJSON.FeatureCollection;

  const out: HurricaneStorm[] = [];
  for (const f of fc.features ?? []) {
    if (!f.geometry || f.geometry.type !== "Point") continue;
    const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;
    const p = f.properties ?? {};
    const eventId = String(p.eventid ?? "");
    const episodeId = String(p.episodeid ?? "1");
    const name = String(p.name ?? p.eventname ?? "UNNAMED").trim() || "UNNAMED";
    const fromDate = typeof p.fromdate === "string" ? p.fromdate : new Date().toISOString();

    const storm: HurricaneStorm = {
      id: `GDACS${eventId}`,
      name,
      basin: basinFromLngLat(lng, lat),
      classification: typeof p.class === "string" ? p.class : "TC",
      currentLat: lat,
      currentLng: lng,
      advisoryTime: fromDate,
      forecastTrack: [{ time: fromDate, lat, lng }],
    };

    // Try to enrich with full track + cone GeoJSON. Tolerant of 404s.
    if (eventId) {
      const enriched = await enrichFromGdacs(eventId, episodeId);
      if (enriched) {
        if (enriched.forecastTrack.length > 0) storm.forecastTrack = enriched.forecastTrack;
        if (enriched.bestTrack) storm.bestTrack = enriched.bestTrack;
        if (enriched.cone) storm.cone = enriched.cone;
      }
    }

    out.push(storm);
  }
  return out;
}

async function enrichFromGdacs(
  eventId: string,
  episodeId: string,
): Promise<Pick<HurricaneStorm, "forecastTrack" | "bestTrack" | "cone"> | null> {
  const url = `https://www.gdacs.org/datareport/resources/TC/${eventId}/geojson_${eventId}_${episodeId}.geojson`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const fc = (await res.json()) as GeoJSON.FeatureCollection;

    const forecastPoints: HurricaneForecastPoint[] = [];
    const bestPoints: HurricaneForecastPoint[] = [];
    let cone: GeoJSON.Polygon | GeoJSON.MultiPolygon | undefined;

    for (const f of fc.features ?? []) {
      const props = f.properties ?? {};
      const kind = String(props.Class ?? props.type ?? "").toLowerCase();
      const g = f.geometry;

      if (g?.type === "Polygon" || g?.type === "MultiPolygon") {
        // Treat any polygon as the forecast cone
        if (!cone) cone = g as GeoJSON.Polygon | GeoJSON.MultiPolygon;
        continue;
      }

      if (g?.type === "Point") {
        const [lng, lat] = (g as GeoJSON.Point).coordinates;
        const pt: HurricaneForecastPoint = {
          time: normalizeTime(props.trackdate ?? props.date ?? props.time),
          lat,
          lng,
          maxWindKt: numericProp(props, ["wind", "windspeed", "maxwind"]),
          minPressureMb: numericProp(props, ["pressure", "mslp"]),
        };
        if (kind.includes("past") || kind.includes("observed") || kind.includes("best")) {
          bestPoints.push(pt);
        } else {
          forecastPoints.push(pt);
        }
      }
    }

    forecastPoints.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    bestPoints.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));

    return {
      forecastTrack: forecastPoints,
      bestTrack: bestPoints.length > 0 ? bestPoints : undefined,
      cone,
    };
  } catch {
    return null;
  }
}

function numericProp(p: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = p[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = parseFloat(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function normalizeTime(v: unknown): string {
  if (typeof v === "string") {
    const d = new Date(v);
    if (Number.isFinite(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}
