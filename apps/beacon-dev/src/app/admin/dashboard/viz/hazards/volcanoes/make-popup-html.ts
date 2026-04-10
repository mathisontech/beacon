import type { Volcano } from "./types";
import { LEVELS } from "./volcano-levels";

// HTML string for a Leaflet popup card. Edit here to restyle the card.
export function makePopupHtml(v: Volcano): string {
  const lvl = LEVELS.find((l) => l.id === v.level) || LEVELS[4];
  return `
    <div class="vcard-name">${v.name}</div>
    <div class="vcard-sub">${v.region} · ${v.obs}</div>
    <div class="vcard-row"><span>Elevation</span><span>${v.elevation_m.toLocaleString()} m</span></div>
    <div class="vcard-row"><span>Last eruption</span><span>${v.last_eruption}</span></div>
    <div class="vcard-row"><span>Lat / Lng</span><span>${v.lat.toFixed(3)}, ${v.lng.toFixed(3)}</span></div>
    <div class="vcard-chip level-${v.level}">${lvl.label}</div>
  `;
}
