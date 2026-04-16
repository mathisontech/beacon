"use client";

import { useEffect, useRef } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Layer } from "@deck.gl/core";

interface Props {
  /** MapLibre Map instance */
  map: unknown;
  /** deck.gl layers to render */
  layers: Layer[];
}

/**
 * Renders deck.gl layers as a MapLibre custom layer using the official
 * @deck.gl/mapbox MapboxOverlay control. This works against MapLibre GL
 * because MapLibre is API-compatible with Mapbox at the addControl/Layer level.
 *
 * The MapboxOverlay uses MapLibre's own camera, so there is no camera sync
 * code to write — alignment is pixel-perfect by construction.
 */
export default function DeckMapLibreOverlay({ map, layers }: Props) {
  const overlayRef = useRef<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!map) return;

    // MapLibre Map has a slightly different shape than Mapbox GL — in particular
    // MapLibre's `transform` doesn't expose `getProjection()`, which the
    // interleaved MapboxOverlay code path requires. Use non-interleaved mode
    // so deck.gl renders as its own canvas overlay above the MapLibre canvas.
    const m = map as {
      addControl: (c: unknown) => void;
      removeControl: (c: unknown) => void;
      loaded: () => boolean;
      on: (event: string, cb: () => void) => void;
      off: (event: string, cb: () => void) => void;
    };

    const overlay = new MapboxOverlay({
      interleaved: false,
      layers: [],
    });

    let added = false;
    const attach = () => {
      if (added) return;
      try {
        m.addControl(overlay);
        overlayRef.current = overlay;
        added = true;
      } catch (e) {
        console.warn("[deck-maplibre] addControl failed:", e);
      }
    };

    if (m.loaded?.()) {
      attach();
    } else {
      m.on("load", attach);
    }

    return () => {
      try { m.off?.("load", attach); } catch {}
      if (added) {
        try { m.removeControl(overlay); } catch {}
      }
      overlayRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.setProps({ layers });
  }, [layers]);

  return null;
}
