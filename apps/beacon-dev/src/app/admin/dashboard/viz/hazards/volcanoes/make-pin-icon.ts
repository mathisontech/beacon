import type { AlertLevel } from "./types";
import { volcanoSvg } from "./volcano-svg";

// Returns a Leaflet divIcon for a given alert level.
// Shape is the shared shaded-volcano SVG — see volcano-svg.ts.
// TWEAK ZONE 3 in playground.css controls color + pulse.
type LeafletLike = {
  divIcon: (opts: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  }) => unknown;
};

// Pin size per alert level. Higher alert = larger icon.
const SIZE: Record<AlertLevel, number> = {
  warning: 34,
  watch: 30,
  advisory: 26,
  normal: 22,
  unknown: 22,
};

export function makePinIcon(L: LeafletLike, level: AlertLevel) {
  const s = SIZE[level];
  const svg = volcanoSvg(level, s);
  return L.divIcon({
    className: "",
    html: `<div class="volcano-pin level-${level}">${svg}</div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s - 3],
  });
}
