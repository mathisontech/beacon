"use client";

import { useEffect, useRef } from "react";
import { getCameraState, setCameraState, altitudeToZoom, zoomToAltitude } from "@/lib/camera-state";
import { beaconStyleUrl, beaconTransformRequest } from "@/lib/tiles/beacon-style";

interface Props {
  onMapClick?: (data: {
    position: { lat: number; lng: number; alt: number };
  }) => void;
  onMapReady?: (map: unknown) => void;
}

export default function MapLibre2D({ onMapClick, onMapReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  // Stash callbacks in refs so the init effect doesn't re-run when the parent
  // passes a fresh inline arrow each render. Without this, every setState in
  // the parent (e.g. setMaplibreMap from onMapReady) would tear down and
  // recreate the entire MapLibre instance — infinite remount loop.
  const onMapClickRef = useRef(onMapClick);
  const onMapReadyRef = useRef(onMapReady);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);
  useEffect(() => { onMapReadyRef.current = onMapReady; }, [onMapReady]);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    async function init() {
      const maplibregl = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (cancelled || !containerRef.current) return;

      const camState = getCameraState();

      // Beacon self-hosted vector style (served from /api/tiles/...).
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: beaconStyleUrl(),
        center: [camState.lng, camState.lat],
        zoom: altitudeToZoom(camState.altitude),
        transformRequest: beaconTransformRequest,
      });

      mapRef.current = map;
      onMapReadyRef.current?.(map);

      // Sync camera state on every move end
      map.on("moveend", () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        setCameraState({
          lat: center.lat,
          lng: center.lng,
          altitude: zoomToAltitude(zoom),
        });
      });

      map.on("click", (e: { lngLat: { lat: number; lng: number } }) => {
        onMapClickRef.current?.({
          position: { lat: e.lngLat.lat, lng: e.lngLat.lng, alt: 0 },
        });
      });
    }

    init();

    return () => {
      cancelled = true;
      onMapReadyRef.current?.(null);
      if (mapRef.current) {
        // Save final state before removing
        const m = mapRef.current as { getCenter: () => { lat: number; lng: number }; getZoom: () => number; remove: () => void };
        const center = m.getCenter();
        const zoom = m.getZoom();
        setCameraState({ lat: center.lat, lng: center.lng, altitude: zoomToAltitude(zoom) });
        m.remove();
        mapRef.current = null;
      }
    };
    // Mount-once: callbacks are read via refs above so identity churn in the
    // parent does not retrigger init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
