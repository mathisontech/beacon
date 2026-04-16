// NOAA National Hurricane Center — active tropical cyclones.
// Public-domain (17 U.S.C. §105). Commercial use permitted.
//
// Primary feeds:
//   https://www.nhc.noaa.gov/CurrentStorms.json
//     → list of active storms with track/cone/forecast URLs
//   https://www.nhc.noaa.gov/storm_graphics/api/<STORM_ID>_*.geojson
//     → per-storm geometries (cone, forecast line, forecast points, best track)
//
// The JSON/GeoJSON structure is not formally documented; field names below
// reflect observed structure as of 2024-2025. Guard every field access.

import type { HurricaneStorm, HurricaneForecastPoint } from "./types";

const CURRENT_STORMS_URL = "https://www.nhc.noaa.gov/CurrentStorms.json";
const USER_AGENT = "Beacon/0.1 (beacon@mathison.dev)";

interface NhcCurrentStorm {
  id: string;
  binNumber?: string;
  name?: string;
  classification?: string;
  intensity?: string;
  pressure?: string;
  latitude?: string;
  latitudeNumeric?: number;
  longitude?: string;
  longitudeNumeric?: number;
  movementDir?: number;
  movementSpeed?: number;
  lastUpdate?: string;
  publicAdvisory?: { advNum?: string; issuance?: string; url?: string };
  forecastTrack?: { kmzFile?: string; zipFile?: string };
  forecastCone?: { kmzFile?: string; zipFile?: string };
  bestTrack?: { kmzFile?: string; zipFile?: string };
  trackCone?: { kmzFile?: string; zipFile?: string };
}

interface CurrentStormsResponse {
  activeStorms?: NhcCurrentStorm[];
}

function basinFromId(id: string): HurricaneStorm["basin"] {
  const prefix = id.slice(0, 2).toUpperCase();
  if (prefix === "AL" || prefix === "EP" || prefix === "CP" ||
      prefix === "WP" || prefix === "IO" || prefix === "SH") {
    return prefix;
  }
  return "AL";
}

function ktFromIntensity(intensity: string | undefined): number | undefined {
  if (!intensity) return undefined;
  const n = parseInt(intensity, 10);
  return Number.isFinite(n) ? n : undefined;
}

function mbFromPressure(pressure: string | undefined): number | undefined {
  if (!pressure) return undefined;
  const n = parseInt(pressure, 10);
  return Number.isFinite(n) ? n : undefined;
}

function categoryFromKt(kt: number | undefined): number | undefined {
  if (kt == null) return undefined;
  if (kt >= 137) return 5;
  if (kt >= 113) return 4;
  if (kt >= 96) return 3;
  if (kt >= 83) return 2;
  if (kt >= 64) return 1;
  return 0;
}

/**
 * Fetch the current active storms list. This is the entry point; per-storm
 * forecast geometry requires a second call to fetchStormGeometry().
 */
export async function fetchActiveStorms(): Promise<HurricaneStorm[]> {
  const res = await fetch(CURRENT_STORMS_URL, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`NHC CurrentStorms ${res.status}`);
  const data = (await res.json()) as CurrentStormsResponse;

  const out: HurricaneStorm[] = [];
  for (const s of data.activeStorms ?? []) {
    const lat = s.latitudeNumeric;
    const lng = s.longitudeNumeric;
    if (lat == null || lng == null) continue;
    const kt = ktFromIntensity(s.intensity);
    out.push({
      id: s.id,
      name: s.name ?? "UNNAMED",
      basin: basinFromId(s.id),
      classification: s.classification ?? "TC",
      currentLat: lat,
      currentLng: lng,
      currentWindKt: kt,
      currentPressureMb: mbFromPressure(s.pressure),
      movement: s.movementDir != null && s.movementSpeed != null
        ? `${s.movementDir}° at ${s.movementSpeed} kt`
        : undefined,
      advisoryTime: s.lastUpdate ?? new Date().toISOString(),
      forecastTrack: [{
        time: s.lastUpdate ?? new Date().toISOString(),
        lat,
        lng,
        maxWindKt: kt,
        minPressureMb: mbFromPressure(s.pressure),
        category: categoryFromKt(kt),
      }],
    });
  }
  return out;
}

/**
 * Fetch and merge per-storm forecast geometry (cone, forecast points, best track).
 * NHC publishes per-storm GeoJSON under storm_graphics/api/<id>_*.geojson.
 * Tolerant of 404s — returns the original storm unmodified if geometry is
 * unavailable, which is normal between advisories.
 */
export async function enrichStormGeometry(storm: HurricaneStorm): Promise<HurricaneStorm> {
  const base = `https://www.nhc.noaa.gov/storm_graphics/api/${storm.id}`;
  const urls = {
    forecastPoints: `${base}_latest_PTS.geojson`,
    cone: `${base}_latest_CONE.geojson`,
    bestTrack: `${base}_latest_TRACK.geojson`,
  };

  const [pts, cone, track] = await Promise.allSettled([
    fetchGeoJson(urls.forecastPoints),
    fetchGeoJson(urls.cone),
    fetchGeoJson(urls.bestTrack),
  ]);

  const out = { ...storm };

  if (pts.status === "fulfilled" && pts.value) {
    const points = extractForecastPoints(pts.value);
    if (points.length > 0) out.forecastTrack = points;
  }
  if (cone.status === "fulfilled" && cone.value) {
    const poly = extractConePolygon(cone.value);
    if (poly) out.cone = poly;
  }
  if (track.status === "fulfilled" && track.value) {
    const best = extractForecastPoints(track.value);
    if (best.length > 0) out.bestTrack = best;
  }
  return out;
}

async function fetchGeoJson(url: string): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return (await res.json()) as GeoJSON.FeatureCollection;
  } catch {
    return null;
  }
}

function extractForecastPoints(fc: GeoJSON.FeatureCollection): HurricaneForecastPoint[] {
  const out: HurricaneForecastPoint[] = [];
  for (const f of fc.features ?? []) {
    if (!f.geometry || f.geometry.type !== "Point") continue;
    const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;
    const p = f.properties ?? {};
    const validTime =
      (p.FLDATELBL as string) ??
      (p.VALIDTIME as string) ??
      (p.ADVDATE as string) ??
      new Date().toISOString();
    const kt = numericProp(p, ["MAXWIND", "maxwind", "WIND"]);
    const mb = numericProp(p, ["MSLP", "mslp", "PRESSURE"]);
    out.push({
      time: parseNhcTime(validTime),
      lat,
      lng,
      maxWindKt: kt,
      minPressureMb: mb,
      category: categoryFromKt(kt),
    });
  }
  // Sort chronologically
  out.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
  return out;
}

function extractConePolygon(fc: GeoJSON.FeatureCollection): GeoJSON.Polygon | GeoJSON.MultiPolygon | null {
  for (const f of fc.features ?? []) {
    if (f.geometry?.type === "Polygon") return f.geometry as GeoJSON.Polygon;
    if (f.geometry?.type === "MultiPolygon") return f.geometry as GeoJSON.MultiPolygon;
  }
  return null;
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

// NHC point labels look like "6:00 AM AST Sep 07" — when present as a plain
// string we fall back to Date.parse and keep whatever it returns. Callers
// should not depend on minute-level accuracy of forecast point times.
function parseNhcTime(s: string): string {
  const d = new Date(s);
  if (Number.isFinite(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

/**
 * Fetch every active storm with forecast geometry merged in. One call for UI.
 */
export async function fetchHurricanesWithForecast(): Promise<HurricaneStorm[]> {
  const storms = await fetchActiveStorms();
  return Promise.all(storms.map(enrichStormGeometry));
}
