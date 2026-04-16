"use client";

import { useGeoJsonLayer } from "./use-geojson-layer";

// Served through Beacon's cache proxy (see /api/data/faults).
const URL = "/api/data/faults";

interface Props {
  viewer: unknown;
  enabled: boolean;
}

export default function FaultLinesLayer({ viewer, enabled }: Props) {
  useGeoJsonLayer(viewer, URL, enabled, {
    stroke: "#b91c1c",
    strokeWidth: 1.4,
    clampToGround: true,
  });
  return null;
}
