export type MapView = "photo" | "clay" | "lowdata";

export interface LayerConfig {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  opacity: number;
  zIndex: number;
  source: string;
  updateInterval: number; // seconds
  lastUpdated: string | null;
  status: "fresh" | "stale" | "error" | "loading";
}

export interface NWSAlert {
  id: string;
  event: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: string;
  headline: string;
  description: string;
  areaDesc: string;
  onset: string;
  expires: string;
  geometry: GeoJSON.Geometry | null;
  affectedZones: string[];
}

export interface InspectorData {
  raw: unknown;
  processed: unknown;
  source: string;
  fetchedAt: string;
}

export type DevTab =
  | "map"
  | "pipeline"
  | "observability"
  | "simulation"
  | "changelog"
  | "settings";
