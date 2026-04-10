'use client';

import { useEffect, useRef } from 'react';
import { altitudeToZoom, zoomToAltitude } from '@/lib/camera-state';
import type { OverlayType } from './overlay-toolbar';

// SF default: ~12.5 zoom covers the city nicely
const SF = { lat: 37.7749, lng: -122.4194, altitude: 30000 };

interface Props {
  overlays: OverlayType[];
}

export default function Flat2D({ overlays }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    async function init() {
      const maplibregl = await import('maplibre-gl');
      try { await import('maplibre-gl/dist/maplibre-gl.css'); } catch {}

      if (cancelled || !containerRef.current) return;
      const cam = SF;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap',
            },
          },
          layers: [
            {
              id: 'osm-base',
              type: 'raster',
              source: 'osm',
              paint: {
                'raster-saturation': -0.8,
                'raster-brightness-max': 0.55,
              },
            },
          ],
        },
        center: [cam.lng, cam.lat],
        zoom: altitudeToZoom(cam.altitude),
      });

      mapRef.current = map;

      // Force resize after layout settles
      map.on('load', () => { map.resize(); });
      setTimeout(() => { if (mapRef.current) (mapRef.current as { resize: () => void }).resize(); }, 100);
      setTimeout(() => { if (mapRef.current) (mapRef.current as { resize: () => void }).resize(); }, 500);
    }

    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        const m = mapRef.current as { remove: () => void };
        m.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
}
