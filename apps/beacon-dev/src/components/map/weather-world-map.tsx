"use client";

import { useCallback, useState } from "react";
import type { MapView } from "@/types/map";
import ViewSwitcher from "./view-switcher";
import MapViewToggle from "./map-view-toggle";
import MapZoomControls from "./map-zoom-controls";
import {
  WeatherProvider,
  WeatherOverlays,
  WeatherTimeScrubber,
  WeatherLayerPanel,
  WeatherAttribution,
  ActiveStormsPanel,
} from "./weather";

/**
 * Standalone weather dashboard — a self-contained map + weather overlays UI,
 * independent of the live-world-map so it can iterate without touching
 * code that the base-map tile session is modifying.
 */
export default function WeatherWorldMap() {
  const [activeView, setActiveView] = useState<MapView>("photo");
  const [viewer, setViewer] = useState<unknown>(null);

  const flyTo = useCallback(async (lat: number, lng: number) => {
    if (!viewer) return;
    const { flyTo } = await import("@/lib/cesium-init");
    flyTo(viewer, lat, lng, null, 1_500_000);
  }, [viewer]);

  return (
    <WeatherProvider>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <ViewSwitcher
          activeView={activeView}
          onMapClick={() => {}}
          onViewerReady={setViewer}
        />

        {activeView !== "lowdata" && <WeatherOverlays viewer={viewer} />}

        <ActiveStormsPanel onFly={flyTo} />
        <WeatherLayerPanel />
        <WeatherTimeScrubber />
        <WeatherAttribution />
        <MapViewToggle active={activeView} onChange={setActiveView} />
        <MapZoomControls viewer={viewer} />
      </div>
    </WeatherProvider>
  );
}
