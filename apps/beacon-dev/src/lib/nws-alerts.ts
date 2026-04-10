import type { NWSAlert } from "@/types/map";

const NWS_API = "https://api.weather.gov/alerts/active";

const SEVERITY_COLORS: Record<string, string> = {
  Extreme: "#ff0000",
  Severe: "#ff6600",
  Moderate: "#ffcc00",
  Minor: "#00cc66",
  Unknown: "#888888",
};

export function getSeverityColor(severity: string): string {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS.Unknown;
}

export async function fetchActiveAlerts(): Promise<NWSAlert[]> {
  const res = await fetch(NWS_API, {
    headers: { "User-Agent": "BeaconDev/0.1 (beacon@mathison.dev)" },
  });
  if (!res.ok) throw new Error(`NWS API ${res.status}`);

  const data = await res.json();
  const features = data.features || [];

  return features
    .filter((f: Record<string, unknown>) => f.geometry || getZones(f))
    .map(parseAlert);
}

function getZones(feature: Record<string, unknown>): string[] {
  const props = feature.properties as Record<string, unknown>;
  return (props?.affectedZones as string[]) || [];
}

function parseAlert(feature: Record<string, unknown>): NWSAlert {
  const props = feature.properties as Record<string, unknown>;
  return {
    id: (props.id as string) || "",
    event: (props.event as string) || "",
    severity: (props.severity as NWSAlert["severity"]) || "Unknown",
    urgency: (props.urgency as string) || "",
    headline: (props.headline as string) || "",
    description: (props.description as string) || "",
    areaDesc: (props.areaDesc as string) || "",
    onset: (props.onset as string) || "",
    expires: (props.expires as string) || "",
    geometry: feature.geometry as GeoJSON.Geometry | null,
    affectedZones: getZones(feature),
  };
}

export async function fetchZoneGeometry(
  zoneUrl: string
): Promise<GeoJSON.Geometry | null> {
  try {
    const res = await fetch(zoneUrl, {
      headers: { "User-Agent": "BeaconDev/0.1 (beacon@mathison.dev)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.geometry || null;
  } catch {
    return null;
  }
}
