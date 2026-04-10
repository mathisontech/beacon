export interface ActiveFire {
  id: string;
  name: string;
  lat: number;
  lng: number;
  acres: number;
  containment: number;
  discovered: string;
  updated: string;
  cause: string;
  geometry: GeoJSON.Geometry | null;
  hasPerimeter?: boolean;
  source: "nifc" | "firms" | "irwin";
  discoveryDate?: string;
  containmentDate?: string;
  controlDate?: string;
  fireOutDate?: string;
  behavior?: string;
  behavior2?: string;
  behavior3?: string;
  initialAcres?: number;
  estimatedCostToDate?: number;
  incidentType?: string;
  state?: string;
  county?: string;
}

export interface FireTimelineEntry {
  date: string;
  acres: number;
  containment: number;
  geometry: GeoJSON.Geometry | null;
  source: string;
}

export interface FIRMSHotspot {
  lat: number;
  lng: number;
  brightness: number;
  frp: number;
  confidence: string;
  acq_date: string;
  acq_time: string;
  satellite: string;
  daynight: "D" | "N";
}
