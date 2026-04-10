// Shared types for the regional quake-feed router.
//
// Every source (USGS, INGV, GeoNet, IPGP, etc.) normalizes its feed
// into the same `Quake` shape so the detail panel does not care
// which observatory the data came from.

export interface Quake {
  id: string;
  mag: number | null;
  place: string | null;
  time: number;
  depthKm: number;
  lat: number;
  lng: number;
  url: string;
  source: string;
}

export interface QuakeFetchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  days: number;
  minMag: number;
}

export interface QuakeSource {
  id: string;
  name: string;
  operatorUrl: string;
  covers(lat: number, lng: number): boolean;
  fetch(params: QuakeFetchParams, signal?: AbortSignal): Promise<Quake[]>;
}

export interface QuakeFetchResult {
  at: number;
  center: { lat: number; lng: number };
  radiusKm: number;
  days: number;
  source: { id: string; name: string; url: string };
  count: number;
  quakes: Quake[];
}
