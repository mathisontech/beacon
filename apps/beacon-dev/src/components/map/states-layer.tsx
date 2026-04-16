"use client";

import { useGeoJsonLayer } from "./use-geojson-layer";

// Served through Beacon's cache proxy (see /api/data/states).
const URL = "/api/data/states";

interface Props {
  viewer: unknown;
  enabled: boolean;
}

export default function StatesLayer({ viewer, enabled }: Props) {
  useGeoJsonLayer(viewer, URL, enabled, {
    stroke: "#78716c",
    strokeWidth: 1.2,
    fill: "rgba(120,113,108,0.03)",
    clampToGround: true,
  });
  return null;
}
