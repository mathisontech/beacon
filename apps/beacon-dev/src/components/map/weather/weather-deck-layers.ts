"use client";

import { ScatterplotLayer } from "@deck.gl/layers";
import type { Layer } from "@deck.gl/core";
import type { HurricaneStorm } from "@beacon/data-sources";

/**
 * Build the deck.gl layer array for weather features. Pure function so the
 * same layers render identically in Cesium and MapLibre via DeckOverlay.
 *
 * This is the proof-of-concept for the deck.gl foundation: a single
 * ScatterplotLayer marking active storm centers. Once the bridge is verified
 * across all three views, real layers (cones, tracks, raster cloud field,
 * particle wind) move here too.
 */
export function buildWeatherLayers(opts: {
  storms: HurricaneStorm[];
}): Layer[] {
  const { storms } = opts;

  return [
    new ScatterplotLayer<HurricaneStorm>({
      id: "wx-storm-centers",
      data: storms,
      getPosition: (s) => [s.currentLng, s.currentLat],
      // Radius proportional to wind speed — bigger storms read as bigger dots.
      getRadius: (s) => Math.max(40_000, (s.currentWindKt ?? 30) * 2_000),
      getFillColor: (s) => {
        const kt = s.currentWindKt ?? 0;
        if (kt >= 137) return [124, 58, 237, 200];   // cat 5 — purple
        if (kt >= 113) return [219, 39, 119, 200];   // cat 4 — pink
        if (kt >= 96)  return [220, 38, 38, 200];    // cat 3 — red
        if (kt >= 83)  return [234, 88, 12, 200];    // cat 2 — orange
        if (kt >= 64)  return [245, 158, 11, 200];   // cat 1 — amber
        return [234, 179, 8, 200];                   // TS/TD — yellow
      },
      getLineColor: [255, 255, 255, 220],
      lineWidthMinPixels: 1.5,
      stroked: true,
      filled: true,
      radiusUnits: "meters",
      radiusMinPixels: 6,
      radiusMaxPixels: 80,
      pickable: true,
    }),
  ];
}
