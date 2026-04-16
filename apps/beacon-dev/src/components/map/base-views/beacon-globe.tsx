'use client';

import { useEffect, useRef } from 'react';
import { beaconStyleUrl, beaconTransformRequest } from '@/lib/tiles/beacon-style';
import type { OverlayType } from './overlay-toolbar';

// 3D globe rendered from Beacon's self-hosted vector tiles. Uses
// MapLibre GL's globe projection (supported in maplibre-gl >=4.7).
// Tiles come from /api/tiles/basemap/:z/:x/:y, backed by the PMTiles
// archive at apps/beacon-dev/tiles/out/beacon-basemap.pmtiles.

interface Props {
  overlays?: OverlayType[];
}

export default function BeaconGlobe({}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    async function init() {
      const maplibregl = await import('maplibre-gl');
      try { await import('maplibre-gl/dist/maplibre-gl.css'); } catch {}
      if (cancelled || !containerRef.current) return;

      // `projection` requires maplibre-gl >=5.0. Cast to satisfy v4
      // types during the upgrade window; remove once types catch up.
      const opts = {
        container: containerRef.current,
        style: beaconStyleUrl(),
        center: [-98, 39] as [number, number],
        zoom: 2,
        projection: { type: 'globe' },
        transformRequest: beaconTransformRequest,
      } as unknown as ConstructorParameters<typeof maplibregl.Map>[0];

      const map = new maplibregl.Map(opts);

      mapRef.current = map;
      map.on('load', () => { map.resize(); });
      setTimeout(() => { if (mapRef.current) (mapRef.current as { resize: () => void }).resize(); }, 100);
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
