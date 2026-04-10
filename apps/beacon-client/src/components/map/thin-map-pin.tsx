// Single pin on the thin map. SVG circle sized by severity.

import type { FeedEvent } from "@beacon/data-sources";
import { projectLonLat } from "./project-lonlat";
import { pinColorFor, pinRadiusFor } from "./pin-color-for";

interface Props {
  event: FeedEvent;
  width: number;
  height: number;
}

export function ThinMapPin({ event, width, height }: Props) {
  const { x, y } = projectLonLat(event.lat, event.lng, { width, height });
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return (
    <circle
      cx={x}
      cy={y}
      r={pinRadiusFor(event.severity)}
      fill={pinColorFor(event.category, event.severity)}
      fillOpacity={0.8}
      stroke="#ffffff"
      strokeWidth={0.5}
    >
      <title>{event.title}</title>
    </circle>
  );
}
