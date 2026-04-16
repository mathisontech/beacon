"use client";

import type { Layer } from "@deck.gl/core";
import DeckCesiumOverlay from "./deck-cesium-overlay";
import DeckMapLibreOverlay from "./deck-maplibre-overlay";

interface Props {
  /** Cesium Viewer (mutually exclusive with `map`) */
  viewer?: unknown;
  /** MapLibre Map (mutually exclusive with `viewer`) */
  map?: unknown;
  /** deck.gl layers — same instances render into either renderer */
  layers: Layer[];
}

/**
 * Single overlay component that delegates to the right bridge based on
 * which underlying renderer is active. Lets feature code stay agnostic:
 *
 *   <DeckOverlay viewer={cesiumViewer} layers={layers} />
 *   <DeckOverlay map={maplibreMap} layers={layers} />
 *
 * The same `layers` array can be passed to both — visual output is identical.
 */
export default function DeckOverlay({ viewer, map, layers }: Props) {
  if (viewer) return <DeckCesiumOverlay viewer={viewer} layers={layers} />;
  if (map) return <DeckMapLibreOverlay map={map} layers={layers} />;
  return null;
}
