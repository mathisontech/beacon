'use client';

import { useEffect, useRef } from 'react';
import { altitudeToZoom, zoomToAltitude } from '@/lib/camera-state';
import type { OverlayType } from './overlay-toolbar';

const SF = { lat: 37.7749, lng: -122.4194, altitude: 30000 };

interface Props {
  overlays: OverlayType[];
}

const SATELLITE_TILES = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
];

export default function Satellite2D({ overlays }: Props) {
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
            'satellite': {
              type: 'raster',
              tiles: SATELLITE_TILES,
              tileSize: 256,
              attribution: '&copy; Esri, Maxar, Earthstar Geographics',
              maxzoom: 19,
            },
            'labels': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
              ],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: 'satellite-base',
              type: 'raster',
              source: 'satellite',
            },
            {
              id: 'satellite-labels',
              type: 'raster',
              source: 'labels',
              paint: { 'raster-opacity': 0.8 },
            },
          ],
        },
        center: [cam.lng, cam.lat],
        zoom: altitudeToZoom(cam.altitude),
      });

      mapRef.current = map;

      map.on('moveend', () => {});

      // Toggle reference labels + force resize after layout settles
      map.on('load', () => {
        map.setLayoutProperty('satellite-labels', 'visibility',
          overlays.includes('labels') ? 'visible' : 'none'
        );
        map.resize();
      });
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
  }, [overlays]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
}
