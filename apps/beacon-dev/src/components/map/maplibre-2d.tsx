"use client";

import { useEffect, useRef } from "react";
import { getCameraState, setCameraState, altitudeToZoom, zoomToAltitude } from "@/lib/camera-state";

interface Props {
  onMapClick?: (data: {
    position: { lat: number; lng: number; alt: number };
  }) => void;
}

export default function MapLibre2D({ onMapClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    async function init() {
      const maplibregl = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (cancelled || !containerRef.current) return;

      const camState = getCameraState();

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            "osm-tiles": {
              type: "raster",
              tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm-base",
              type: "raster",
              source: "osm-tiles",
              paint: {
                "raster-saturation": -1,
                "raster-brightness-max": 0.6,
              },
            },
          ],
        },
        center: [camState.lng, camState.lat],
        zoom: altitudeToZoom(camState.altitude),
      });

      mapRef.current = map;

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

      if (onMapClick) {
        map.on("click", (e: { lngLat: { lat: number; lng: number } }) => {
          onMapClick({
            position: { lat: e.lngLat.lat, lng: e.lngLat.lng, alt: 0 },
          });
        });
      }
    }

    init();

    return () => {
      cancelled = true;
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
  }, [onMapClick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
