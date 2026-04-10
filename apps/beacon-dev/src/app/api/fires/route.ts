import { NextResponse } from "next/server";

const NIFC_PERIMETERS =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Current_WildlandFire_Perimeters/FeatureServer/0/query";
const NIFC_PERIMETERS_FALLBACK =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters/FeatureServer/0/query";
const NIFC_POINTS =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query";

async function queryNIFC(url: string, fields: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: fields,
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
    resultRecordCount: "500",
    ...extra,
  });
  const res = await fetch(`${url}?${params}`, { next: { revalidate: 300 } });
  if (!res.ok) return { error: `${res.status} ${res.statusText}`, features: [] };
  const data = await res.json();
  if (data.error) return { error: JSON.stringify(data.error), features: [] };
  return { error: null, features: data.features || [] };
}

function centroid(geom: GeoJSON.Geometry): [number, number] {
  const coords = flat(geom);
  if (!coords.length) return [0, 0];
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  return [lat, lng];
}

function flat(g: GeoJSON.Geometry): number[][] {
  if (!g) return [];
  if (g.type === "Point") return [g.coordinates as number[]];
  if (g.type === "MultiPoint") return g.coordinates as number[][];
  if (g.type === "Polygon") return (g.coordinates as number[][][]).flat();
  if (g.type === "MultiPolygon") return (g.coordinates as number[][][][]).flat(2);
  if (g.type === "LineString") return g.coordinates as number[][];
  if (g.type === "MultiLineString") return (g.coordinates as number[][][]).flat();
  return [];
}

function hasPolygon(geom: GeoJSON.Geometry | null): boolean {
  if (!geom) return false;
  return geom.type === "Polygon" || geom.type === "MultiPolygon";
}

// ArcGIS returns dates as epoch ms (numbers). Normalize to ISO string.
function toISODate(val: unknown): string {
  if (!val) return "";
  if (typeof val === "number") return new Date(val).toISOString();
  if (typeof val === "string") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return "";
}

export async function GET() {
  try {
    const [perimResult, pointResult] = await Promise.allSettled([
      queryNIFC(NIFC_PERIMETERS, "*"),
      queryNIFC(NIFC_POINTS, "*"),
    ]);

    let perimFeatures =
      perimResult.status === "fulfilled" ? perimResult.value.features : [];
    const perimError =
      perimResult.status === "fulfilled" ? perimResult.value.error : "rejected";

    // Fallback: try all-time perimeters if current returned nothing
    if (perimFeatures.length === 0) {
      const fallback = await queryNIFC(NIFC_PERIMETERS_FALLBACK, "*", {
        where: "attr_FireDiscoveryDateTime > TIMESTAMP '2025-01-01'",
      });
      perimFeatures = fallback.features;
    }

    const pointFeatures =
      pointResult.status === "fulfilled" ? pointResult.value.features : [];
    const pointError =
      pointResult.status === "fulfilled" ? pointResult.value.error : "rejected";

    const fires: Array<Record<string, unknown>> = [];
    const seen = new Set<string>();

    // Parse perimeters (polygon geometry)
    // NIFC uses attr_ prefix (formerly irwin_), poly_ for polygon-specific fields
    for (let i = 0; i < perimFeatures.length; i++) {
      const f = perimFeatures[i];
      const p = f.properties || {};
      const name =
        p.poly_IncidentName || p.attr_IncidentName || p.IncidentName || p.incidentname || `Fire ${i}`;
      if (!hasPolygon(f.geometry)) continue;
      const [lat, lng] = centroid(f.geometry);
      seen.add(name.toLowerCase());

      const discoveryRaw = p.attr_FireDiscoveryDateTime || p.irwin_FireDiscoveryDateTime || p.FireDiscoveryDateTime || "";
      const updatedRaw = p.attr_ModifiedOnDateTime_dt || p.poly_DateCurrent || "";

      fires.push({
        id: `nifc-perim-${i}`,
        name,
        lat,
        lng,
        acres: p.poly_GISAcres || p.poly_Acres_AutoCalc || p.GISAcres || p.DailyAcres || 0,
        containment: p.attr_PercentContained || p.poly_PercentContained || p.PercentContained || 0,
        discovered: toISODate(discoveryRaw),
        updated: toISODate(updatedRaw),
        cause: p.attr_FireCause || p.irwin_FireCause || p.FireCause || "Unknown",
        geometry: f.geometry,
        hasPerimeter: true,
        source: "nifc",
        discoveryDate: toISODate(discoveryRaw),
        containmentDate: toISODate(p.attr_ContainmentDateTime || p.irwin_ContainmentDateTime || p.ContainmentDateTime || ""),
        controlDate: toISODate(p.attr_ControlDateTime || p.irwin_ControlDateTime || p.ControlDateTime || ""),
        fireOutDate: toISODate(p.attr_FireOutDateTime || p.irwin_FireOutDateTime || p.FireOutDateTime || ""),
        behavior: p.attr_FireBehaviorGeneral || p.irwin_FireBehaviorGeneral || p.FireBehaviorGeneral || p.FireBehaviorGeneral1 || "",
        behavior2: p.attr_FireBehaviorGeneral2 || p.irwin_FireBehaviorGeneral2 || p.FireBehaviorGeneral2 || "",
        behavior3: p.attr_FireBehaviorGeneral3 || p.irwin_FireBehaviorGeneral3 || p.FireBehaviorGeneral3 || "",
        initialAcres: p.attr_InitialResponseAcres || p.irwin_InitialResponseAcres || p.DiscoveryAcres || 0,
        incidentType: p.attr_IncidentTypeCategory || p.irwin_IncidentTypeCategory || p.IncidentTypeCategory || "",
        state: p.attr_POOState || p.irwin_POOState || p.POOState || "",
        county: p.attr_POOCounty || p.irwin_POOCounty || p.POOCounty || "",
      });
    }

    // Parse points (fill gaps for fires without perimeters)
    for (let i = 0; i < pointFeatures.length; i++) {
      const f = pointFeatures[i];
      const p = f.properties || {};
      const name =
        p.IncidentName || p.poly_IncidentName || p.attr_IncidentName || p.incidentname || `Fire Pt ${i}`;
      if (seen.has(name.toLowerCase())) continue;
      const geom = f.geometry;
      const coords = geom?.coordinates || [0, 0];

      const discoveryRaw = p.FireDiscoveryDateTime || p.attr_FireDiscoveryDateTime || "";
      const updatedRaw = p.ModifiedOnDateTime_dt || p.attr_ModifiedOnDateTime_dt || "";

      fires.push({
        id: `nifc-pt-${i}`,
        name,
        lat: coords[1],
        lng: coords[0],
        acres: p.DailyAcres || p.GISAcres || p.poly_Acres_AutoCalc || 0,
        containment: p.PercentContained || p.attr_PercentContained || 0,
        discovered: toISODate(discoveryRaw),
        updated: toISODate(updatedRaw),
        cause: p.FireCause || p.attr_FireCause || "Unknown",
        geometry: geom,
        hasPerimeter: false,
        source: "nifc",
        discoveryDate: toISODate(discoveryRaw),
        containmentDate: toISODate(p.ContainmentDateTime || p.attr_ContainmentDateTime || ""),
        controlDate: toISODate(p.ControlDateTime || p.attr_ControlDateTime || ""),
        fireOutDate: toISODate(p.FireOutDateTime || p.attr_FireOutDateTime || ""),
        behavior: p.FireBehaviorGeneral || p.attr_FireBehaviorGeneral || p.FireBehaviorGeneral1 || "",
        behavior2: p.FireBehaviorGeneral2 || p.attr_FireBehaviorGeneral2 || "",
        behavior3: p.FireBehaviorGeneral3 || p.attr_FireBehaviorGeneral3 || "",
        initialAcres: p.InitialResponseAcres || p.attr_InitialResponseAcres || p.DiscoveryAcres || 0,
        incidentType: p.IncidentTypeCategory || p.attr_IncidentTypeCategory || "",
        state: p.POOState || p.attr_POOState || "",
        county: p.POOCounty || p.attr_POOCounty || "",
      });
    }

    // Sort: active wildfires first, then active Rx, then stale/done, then by acres
    const STALE_MS = 30 * 24 * 3600000;
    fires.sort((a, b) => {
      const isDone = (f: Record<string, unknown>) =>
        f.fireOutDate || f.controlDate || f.containmentDate || (f.containment as number) >= 100;
      const isRx = (f: Record<string, unknown>) =>
        (f.name as string)?.toUpperCase().startsWith("RX ") || f.incidentType === "RX";
      const isStale = (f: Record<string, unknown>) => {
        const ref = (f.updated || f.discoveryDate || f.discovered) as string;
        if (!ref) return false;
        return Date.now() - new Date(ref).getTime() > STALE_MS;
      };

      const aRank = isDone(a) ? 3 : (isRx(a) && isStale(a)) ? 2 : isRx(a) ? 1 : 0;
      const bRank = isDone(b) ? 3 : (isRx(b) && isStale(b)) ? 2 : isRx(b) ? 1 : 0;
      if (aRank !== bRank) return aRank - bRank;
      return ((b.acres as number) || 0) - ((a.acres as number) || 0);
    });

    return NextResponse.json({
      fires,
      meta: {
        perimCount: perimFeatures.length,
        pointCount: pointFeatures.length,
        totalFires: fires.length,
        perimError,
        pointError,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { fires: [], meta: { error: String(err) } },
      { status: 500 }
    );
  }
}
