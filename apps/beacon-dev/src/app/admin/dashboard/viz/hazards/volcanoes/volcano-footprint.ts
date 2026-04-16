import type { AlertLevel } from "./types";

// Small ring of lon/lat points around a volcano for use as a ground
// polygon on Cesium. Radius scales with alert level (and elevation,
// loosely) so warnings are visually larger than unknowns.

const RADIUS_M: Record<AlertLevel, number> = {
  warning: 6000,
  watch: 4500,
  advisory: 3000,
  normal: 2000,
  unknown: 1500,
};

const EARTH_R = 6378137;

// Returns a flat [lon, lat, lon, lat, ...] array (what Cesium's
// Cartesian3.fromDegreesArray wants).
export function volcanoFootprint(
  lat: number,
  lng: number,
  level: AlertLevel,
  elevationM = 0,
  segments = 24
): number[] {
  const base = RADIUS_M[level] ?? RADIUS_M.unknown;
  const r = base + Math.max(0, elevationM) * 0.25; // taller volcano -> slightly larger ring
  const out: number[] = [];
  const latRad = (lat * Math.PI) / 180;
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const dx = Math.cos(t) * r;
    const dy = Math.sin(t) * r;
    const dLat = (dy / EARTH_R) * (180 / Math.PI);
    const dLng =
      (dx / (EARTH_R * Math.cos(latRad))) * (180 / Math.PI);
    out.push(lng + dLng, lat + dLat);
  }
  return out;
}

// CSS colors for the footprint polygon, keyed by alert level.
export const FOOTPRINT_FILL: Record<AlertLevel, string> = {
  warning: "rgba(255,23,68,0.30)",
  watch: "rgba(255,145,0,0.25)",
  advisory: "rgba(255,214,0,0.22)",
  normal: "rgba(79,195,247,0.18)",
  unknown: "rgba(158,158,158,0.15)",
};
export const FOOTPRINT_STROKE: Record<AlertLevel, string> = {
  warning: "rgba(255,23,68,0.85)",
  watch: "rgba(255,145,0,0.80)",
  advisory: "rgba(255,214,0,0.75)",
  normal: "rgba(79,195,247,0.60)",
  unknown: "rgba(158,158,158,0.50)",
};
