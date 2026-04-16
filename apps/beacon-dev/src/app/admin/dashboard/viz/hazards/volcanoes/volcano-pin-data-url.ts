import type { AlertLevel } from "./types";

// Inline-styled copy of volcanoSvg suitable for <img>/Cesium billboards
// (no external CSS; colors baked in). Mirrors the shapes in volcano-svg.ts
// and the color scheme in playground.css.

const LIT: Record<AlertLevel, string> = {
  warning: "#ff1744",
  watch: "#ff9100",
  advisory: "#ffd600",
  normal: "#4fc3f7",
  unknown: "#9e9e9e",
};
const DARK = "#1a1a1a";
const CRATER = "#ffeb3b";
const RING = "#000";

const SIZE: Record<AlertLevel, number> = {
  warning: 34,
  watch: 30,
  advisory: 26,
  normal: 22,
  unknown: 22,
};

export function volcanoPinSize(level: AlertLevel): number {
  return SIZE[level];
}

export function volcanoPinSvg(level: AlertLevel, size = SIZE[level]): string {
  const lit = LIT[level];
  const plume = level === "warning" || level === "watch";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">`,
    plume
      ? '<g fill="#fff">'
        + '<ellipse cx="16" cy="4" rx="4" ry="2" opacity="0.7"/>'
        + '<ellipse cx="18" cy="2" rx="3" ry="1.5" opacity="0.5"/>'
        + '<ellipse cx="14" cy="3" rx="2.5" ry="1.2" opacity="0.6"/>'
        + '</g>'
      : "",
    `<path d="M16 7 L28 27 L4 27 Z" fill="${DARK}"/>`,
    `<path d="M16 7 L4 27 L12 27 L18 14 Z" fill="${lit}"/>`,
    `<path d="M14 9 L16 7 L18 9 L17 11 L15 11 Z" fill="${CRATER}"/>`,
    `<path d="M16 7 L28 27 L4 27 Z" fill="none" stroke="${RING}" stroke-width="1"/>`,
    "</svg>",
  ].join("");
}

export function volcanoPinDataUrl(level: AlertLevel, size?: number): string {
  const svg = volcanoPinSvg(level, size);
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
