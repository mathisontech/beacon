// Shared shaded-volcano SVG used by map pins, legend swatches,
// and the recent-eruptions fly-out.
//
// Shape: a dark triangular mountain with a notched crater, a
// brighter lit face on the left, a darker shaded face on the
// right, and a small plume above the summit. The fill color of
// the lit face is driven by CSS via currentColor — callers set
// `color: var(--alert-...)` on the wrapping element.

import type { AlertLevel } from "./types";

// Returns the raw SVG markup string at the requested pixel size.
// The icon is square; callers should size their container the
// same to avoid layout shift.
export function volcanoSvg(level: AlertLevel, size: number = 26): string {
  const plume = level === "warning" || level === "watch";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
         width="${size}" height="${size}"
         class="vp-volcano-svg vp-volcano-${level}${plume ? " vp-volcano-active" : ""}"
         aria-hidden="true">
      ${plume ? `<g class="vp-volcano-plume">
        <ellipse cx="16" cy="4" rx="4" ry="2" opacity="0.7"/>
        <ellipse cx="18" cy="2" rx="3" ry="1.5" opacity="0.5"/>
        <ellipse cx="14" cy="3" rx="2.5" ry="1.2" opacity="0.6"/>
      </g>` : ""}
      <!-- dark back/right face -->
      <path d="M16 7 L28 27 L4 27 Z" class="vp-volcano-dark"/>
      <!-- lit left face -->
      <path d="M16 7 L4 27 L12 27 L18 14 Z" class="vp-volcano-lit"/>
      <!-- crater notch -->
      <path d="M14 9 L16 7 L18 9 L17 11 L15 11 Z" class="vp-volcano-crater"/>
      <!-- ring outline -->
      <path d="M16 7 L28 27 L4 27 Z" class="vp-volcano-ring"/>
    </svg>
  `.trim();
}
