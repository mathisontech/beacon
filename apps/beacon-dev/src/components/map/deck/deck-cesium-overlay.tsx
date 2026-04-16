"use client";

import { useEffect, useRef } from "react";
import { Deck, type Layer } from "@deck.gl/core";

interface Props {
  /** Cesium Viewer instance from ViewSwitcher.onViewerReady */
  viewer: unknown;
  /** deck.gl layers to render */
  layers: Layer[];
}

/**
 * Mounts a transparent deck.gl canvas above the Cesium globe and syncs the
 * deck.gl camera to Cesium's per frame. Lets a single set of deck.gl layers
 * render identically into Cesium 3D and (via deck-cesium camera bridge) MapLibre.
 *
 * Camera sync algorithm:
 *   - Read the Cesium camera's cartographic position (lng, lat, height).
 *   - Convert height → MapView zoom using mercator scale at the current latitude.
 *   - Read heading → bearing, pitch → MapView pitch.
 *   - Push to deck.setProps({ viewState }) every Cesium frame.
 *
 * The conversion is approximate at very steep tilts; deck.gl's MapView is a
 * 2.5D projection so it can't perfectly mirror Cesium's full 6-DOF camera.
 * For "looking down" angles up to ~70° pitch, alignment is pixel-accurate.
 */
export default function DeckCesiumOverlay({ viewer, layers }: Props) {
  const deckRef = useRef<Deck | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const removeListenerRef = useRef<(() => void) | null>(null);

  // Mount/unmount the Deck instance + camera sync
  useEffect(() => {
    if (!viewer) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (cancelled || v.isDestroyed?.()) return;

      // Find Cesium's container; mount our canvas as a sibling on top.
      const cesiumCanvas = v.scene.canvas as HTMLCanvasElement;
      const parent = cesiumCanvas.parentElement;
      if (!parent) return;

      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none"; // let Cesium handle camera input
      canvas.width = cesiumCanvas.width;
      canvas.height = cesiumCanvas.height;
      parent.appendChild(canvas);
      canvasRef.current = canvas;

      const deck = new Deck({
        canvas,
        width: cesiumCanvas.clientWidth,
        height: cesiumCanvas.clientHeight,
        controller: false, // Cesium owns input
        initialViewState: { longitude: 0, latitude: 0, zoom: 1 },
        layers: [],
      });
      deckRef.current = deck;

      const syncCamera = () => {
        if (v.isDestroyed?.()) return;
        const carto = v.camera.positionCartographic;
        if (!carto) return;
        const lng = Cesium.Math.toDegrees(carto.longitude);
        const lat = Cesium.Math.toDegrees(carto.latitude);
        const heightMeters = Math.max(1, carto.height);

        // MapView zoom from camera altitude. Standard Web Mercator formula:
        // 1 zoom level = camera at half the previous height.
        // Equator reference: zoom 0 ≈ 40,075 km altitude with 512px tile.
        const tileSize = 512;
        const earthCircumference = 40_075_016.686;
        const latRad = (lat * Math.PI) / 180;
        const metersPerPixelAtZoom0 = earthCircumference * Math.cos(latRad) / tileSize;
        // Approximation: at altitude H, viewport spans ~H meters per ~screen height.
        const metersPerPixel = heightMeters / cesiumCanvas.clientHeight;
        const zoom = Math.max(0, Math.min(22,
          Math.log2(metersPerPixelAtZoom0 / metersPerPixel),
        ));

        const heading = Cesium.Math.toDegrees(v.camera.heading);
        const pitch = 90 + Cesium.Math.toDegrees(v.camera.pitch); // Cesium pitch: 0 = horizon, -90 = down

        deck.setProps({
          viewState: {
            longitude: lng,
            latitude: lat,
            zoom,
            bearing: heading,
            pitch: Math.max(0, Math.min(85, pitch)),
          },
        });
      };

      // Run every Cesium frame via postRender event (cheap; called once per redraw)
      const remove = v.scene.postRender.addEventListener(syncCamera);
      removeListenerRef.current = () => {
        try { remove(); } catch {}
      };

      // Keep canvas size in sync with Cesium canvas
      resizeObserver = new ResizeObserver(() => {
        if (!canvasRef.current || !deckRef.current) return;
        const w = cesiumCanvas.clientWidth;
        const h = cesiumCanvas.clientHeight;
        canvasRef.current.width = cesiumCanvas.width;
        canvasRef.current.height = cesiumCanvas.height;
        deckRef.current.setProps({ width: w, height: h });
      });
      resizeObserver.observe(cesiumCanvas);

      syncCamera(); // initial
    })();

    return () => {
      cancelled = true;
      removeListenerRef.current?.();
      removeListenerRef.current = null;
      if (resizeObserver) resizeObserver.disconnect();
      if (deckRef.current) {
        try { deckRef.current.finalize(); } catch {}
        deckRef.current = null;
      }
      if (canvasRef.current) {
        try { canvasRef.current.remove(); } catch {}
        canvasRef.current = null;
      }
    };
  }, [viewer]);

  // Push layer changes
  useEffect(() => {
    if (!deckRef.current) return;
    deckRef.current.setProps({ layers });
  }, [layers]);

  return null;
}
