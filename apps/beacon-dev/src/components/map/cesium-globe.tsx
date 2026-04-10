"use client";

import { useEffect, useRef } from "react";
import type { MapView } from "@/types/map";

interface Props {
  view: MapView;
  onMapClick?: (data: {
    position: { lat: number; lng: number; alt: number };
  }) => void;
  onViewerReady?: (viewer: unknown) => void;
}

export default function CesiumGlobe({ view, onMapClick, onViewerReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    // Load Cesium CSS
    if (!document.querySelector('link[href*="cesium"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cesium.com/downloads/cesiumjs/releases/1.125/Build/Cesium/Widgets/widgets.css";
      document.head.appendChild(link);
    }

    async function init() {
      try {
        const { createViewer, setupClickHandler } = await import(
          "@/lib/cesium-init"
        );

        if (cancelled || !containerRef.current) return;

        const viewer = await createViewer(containerRef.current, view);
        if (cancelled) {
          (viewer as { destroy: () => void }).destroy();
          return;
        }

        viewerRef.current = viewer;

        if (onMapClick) {
          setupClickHandler(viewer, onMapClick);
        }
        if (onViewerReady) {
          onViewerReady(viewer);
        }
      } catch (err) {
        console.error("Cesium init failed:", err);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try {
          // Camera state is already synced via saveCamera on every interaction.
          // Do one final sync before destroy in case of programmatic moves.
          const v = viewerRef.current as { isDestroyed: () => boolean; destroy: () => void; camera: unknown };
          if (!v.isDestroyed()) {
            import("@/lib/cesium-init").then((m) => m.saveCameraToState(viewerRef.current)).catch(() => {});
          }
          v.destroy();
        } catch {}
        viewerRef.current = null;
      }
    };
  }, [view]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: "relative" }}
    />
  );
}
