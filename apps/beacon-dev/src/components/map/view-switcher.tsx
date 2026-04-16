"use client";

import dynamic from "next/dynamic";
import type { MapView } from "@/types/map";

const CesiumGlobe = dynamic(() => import("./cesium-globe"), { ssr: false });
const MapLibre2D = dynamic(() => import("./maplibre-2d"), { ssr: false });

interface Props {
  activeView: MapView;
  onMapClick?: (data: {
    position: { lat: number; lng: number; alt: number };
  }) => void;
  onViewerReady?: (viewer: unknown) => void;
  onMapReady?: (map: unknown) => void;
}

export default function ViewSwitcher({
  activeView,
  onMapClick,
  onViewerReady,
  onMapReady,
}: Props) {
  if (activeView === "lowdata") {
    return <MapLibre2D onMapClick={onMapClick} onMapReady={onMapReady} />;
  }
  return (
    <CesiumGlobe
      view={activeView}
      onMapClick={onMapClick}
      onViewerReady={onViewerReady}
    />
  );
}
