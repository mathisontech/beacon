"use client";

import { useGeoJsonLayer } from "./use-geojson-layer";

// Served through Beacon's cache proxy so the browser (and CDN) can hold
// it for a day and upstream outages don't break the map.
const URL = "/api/data/countries";

interface Props {
  viewer: unknown;
  enabled: boolean;
}

export default function CountryBordersLayer({ viewer, enabled }: Props) {
  useGeoJsonLayer(viewer, URL, enabled, {
    stroke: "#64748b",
    strokeWidth: 1.5,
    fill: "rgba(100,116,139,0.04)",
    clampToGround: true,
  });
  return null;
}
