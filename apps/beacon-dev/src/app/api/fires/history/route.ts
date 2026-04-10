import { NextResponse } from "next/server";

const PERIM_ALL =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters/FeatureServer/0/query";
const HIST_URL =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/InterAgencyFirePerimeterHistory_All_Years_View/FeatureServer/0/query";

function toISODate(val: unknown): string {
  if (!val) return "";
  if (typeof val === "number") return new Date(val).toISOString();
  if (typeof val === "string") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return "";
}

type TimelineEntry = {
  date: string;
  acres: number;
  containment: number;
  geometry: GeoJSON.Geometry | null;
  centroidLat: number;
  centroidLng: number;
  source: string;
};

type Projection = {
  spreadRateAcresPerHour: number;
  movementBearingDeg: number;
  movementLabel: string;
  movementDistKmPerDay: number;
  projectedAcres24h: number;
  projectedAcres48h: number;
  confidence: "high" | "medium" | "low";
};

function flat(g: GeoJSON.Geometry): number[][] {
  if (!g) return [];
  if (g.type === "Point") return [g.coordinates as number[]];
  if (g.type === "Polygon") return (g.coordinates as number[][][]).flat();
  if (g.type === "MultiPolygon") return (g.coordinates as number[][][][]).flat(2);
  return [];
}

function centroid(geom: GeoJSON.Geometry): [number, number] {
  const coords = flat(geom);
  if (!coords.length) return [0, 0];
  return [
    coords.reduce((s, c) => s + c[1], 0) / coords.length,
    coords.reduce((s, c) => s + c[0], 0) / coords.length,
  ];
}

function bearingDeg(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingToLabel(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function computeProjection(entries: TimelineEntry[]): Projection | null {
  if (entries.length < 2) return null;
  const valid = entries.filter((e) => !isNaN(new Date(e.date).getTime()));
  if (valid.length < 2) return null;

  const prev = valid[valid.length - 2];
  const last = valid[valid.length - 1];
  const t1 = new Date(prev.date).getTime();
  const t2 = new Date(last.date).getTime();
  const hoursElapsed = (t2 - t1) / 3600000;
  if (hoursElapsed <= 0) return null;

  const acresGrowth = last.acres - prev.acres;
  const ratePerHour = Math.max(0, acresGrowth / hoursElapsed);
  const bearing = bearingDeg(prev.centroidLat, prev.centroidLng, last.centroidLat, last.centroidLng);
  const distKm = haversineKm(prev.centroidLat, prev.centroidLng, last.centroidLat, last.centroidLng);
  const distPerDay = (distKm / hoursElapsed) * 24;

  const confidence: "high" | "medium" | "low" =
    valid.length >= 5 ? "high" : valid.length >= 3 ? "medium" : "low";

  return {
    spreadRateAcresPerHour: Math.round(ratePerHour * 10) / 10,
    movementBearingDeg: Math.round(bearing),
    movementLabel: bearingToLabel(bearing),
    movementDistKmPerDay: Math.round(distPerDay * 10) / 10,
    projectedAcres24h: Math.round(last.acres + ratePerHour * 24),
    projectedAcres48h: Math.round(last.acres + ratePerHour * 48),
    confidence,
  };
}

async function safeQuery(url: string, params: Record<string, string>): Promise<Record<string, unknown>[]> {
  try {
    const qs = new URLSearchParams(params);
    const res = await fetch(`${url}?${qs}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.error) return [];
    return data.features || [];
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const year = searchParams.get("year");

  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  try {
    const safeName = name.replace(/'/g, "''");
    const upperName = safeName.toUpperCase();

    // Query WFIGS all-time perimeters (case-insensitive)
    const perimFeatures = await safeQuery(PERIM_ALL, {
      where: `UPPER(poly_IncidentName)='${upperName}' OR UPPER(attr_IncidentName)='${upperName}'`,
      outFields: "*",
      returnGeometry: "true",
      outSR: "4326",
      f: "geojson",
      resultRecordCount: "200",
    });

    // Query historical archive (case-insensitive, different field names)
    const histWhere = year
      ? `(UPPER(INCIDENT)='${upperName}' OR UPPER(FIRE_NAME)='${upperName}') AND FIRE_YEAR=${year}`
      : `UPPER(INCIDENT)='${upperName}' OR UPPER(FIRE_NAME)='${upperName}'`;

    const histFeatures = await safeQuery(HIST_URL, {
      where: histWhere,
      outFields: "*",
      returnGeometry: "true",
      outSR: "4326",
      f: "geojson",
      resultRecordCount: "200",
    });

    const timeline: TimelineEntry[] = [];

    for (const f of perimFeatures) {
      const p = (f as { properties: Record<string, unknown> }).properties || {};
      const geom = (f as { geometry: GeoJSON.Geometry }).geometry;
      if (!geom) continue;
      const [cLat, cLng] = centroid(geom);

      const date = toISODate(
        p.attr_ModifiedOnDateTime_dt || p.poly_DateCurrent ||
        p.attr_CreateDate || p.poly_CreateDate || p.CreateDate || ""
      );

      timeline.push({
        date,
        acres: (p.poly_GISAcres as number) || (p.poly_Acres_AutoCalc as number) || (p.GISAcres as number) || (p.attr_IncidentSize as number) || 0,
        containment: (p.attr_PercentContained as number) || (p.poly_PercentContained as number) || 0,
        geometry: geom,
        centroidLat: cLat,
        centroidLng: cLng,
        source: "current",
      });
    }

    for (const f of histFeatures) {
      const p = (f as { properties: Record<string, unknown> }).properties || {};
      const geom = (f as { geometry: GeoJSON.Geometry }).geometry;
      if (!geom) continue;
      const [cLat, cLng] = centroid(geom);

      timeline.push({
        date: toISODate(p.ALARM_DATE || "") || (p.FIRE_YEAR ? `${p.FIRE_YEAR}-01-01T00:00:00Z` : ""),
        acres: (p.GIS_ACRES as number) || 0,
        containment: 100,
        geometry: geom,
        centroidLat: cLat,
        centroidLng: cLng,
        source: "history",
      });
    }

    // Sort chronologically by date
    timeline.sort((a, b) => {
      const da = new Date(a.date).getTime() || 0;
      const db = new Date(b.date).getTime() || 0;
      return da - db;
    });

    const projection = computeProjection(timeline);

    return NextResponse.json({
      name,
      timeline,
      projection,
      meta: {
        perimCount: perimFeatures.length,
        historyCount: histFeatures.length,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { name, timeline: [], projection: null, meta: { error: String(err) } },
      { status: 500 }
    );
  }
}
