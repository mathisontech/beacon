import type { AlertLevel } from "./types";

// Returns a Leaflet divIcon for a given alert level.
// Shape is pure HTML+CSS — see playground.css TWEAK ZONE 3 to restyle.
// Typed against a minimal Leaflet shape so we don't import leaflet
// types at module-load (Leaflet is loaded from CDN in the browser).
type LeafletLike = {
  divIcon: (opts: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  }) => unknown;
};

export function makePinIcon(L: LeafletLike, level: AlertLevel) {
  return L.divIcon({
    className: "",
    html: `<div class="volcano-pin level-${level}"></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}
