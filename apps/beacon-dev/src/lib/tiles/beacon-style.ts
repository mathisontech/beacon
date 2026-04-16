// Helpers for loading Beacon's self-hosted MapLibre style. The tile
// template in the style file uses a root-relative URL
// ("/api/tiles/basemap/{z}/{x}/{y}.pbf"), but MapLibre resolves tile
// URLs inside a Web Worker where `window.location` is unavailable —
// so we rewrite any root-relative URL to an absolute one via
// `transformRequest`.

export function beaconStyleUrl(): string {
  if (typeof window === "undefined") return "/styles/beacon-basemap.json";
  return `${window.location.origin}/styles/beacon-basemap.json`;
}

export function absolutizeRelative(url: string): string {
  if (typeof window === "undefined") return url;
  if (url.startsWith("/")) return `${window.location.origin}${url}`;
  return url;
}

// Drop-in `transformRequest` for maplibregl.Map options.
export function beaconTransformRequest(url: string) {
  return { url: absolutizeRelative(url) };
}
