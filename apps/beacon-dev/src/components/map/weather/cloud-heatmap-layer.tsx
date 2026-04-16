"use client";

import { useEffect, useRef, useState } from "react";
import { fetchForecastGrid, type WeatherSample } from "@beacon/data-sources";

interface Props {
  viewer: unknown;
  enabled: boolean;
  hoursAhead: number;
  /** Grid resolution; default 18×9 (20° cells globally). Larger grids
   *  push the Open-Meteo GET URL over the 8KB server limit and 414. */
  cols?: number;
  rows?: number;
}

/**
 * Cloud-cover heatmap rendered as colored rectangles. Samples Open-Meteo
 * cloudcover (%) on a global lat/lng grid in a single batched request,
 * then draws each cell as a translucent rectangle on the globe.
 *
 * Re-fetches when `hoursAhead` changes (rounded to nearest hour) so the
 * time scrubber drives smooth visible change.
 */
export default function CloudHeatmapLayer({
  viewer,
  enabled,
  hoursAhead,
  cols = 18,
  rows = 9,
}: Props) {
  const dataSourceRef = useRef<unknown>(null);
  const [samples, setSamples] = useState<WeatherSample[] | null>(null);
  const lastFetchKeyRef = useRef<string>("");

  // Fetch grid when enabled or hour-bucket changes (1h granularity)
  useEffect(() => {
    if (!enabled) return;
    const bucket = Math.round(hoursAhead);
    const key = `${cols}x${rows}@${bucket}`;
    if (lastFetchKeyRef.current === key) return;
    lastFetchKeyRef.current = key;

    let cancelled = false;
    (async () => {
      try {
        console.log(`[cloud-heatmap] fetching ${cols}x${rows} grid @ +${bucket}h`);
        const grid = await fetchForecastGrid({
          bbox: [-180, -85, 180, 85],
          cols,
          rows,
          hoursAhead: Math.max(0, Math.min(168, bucket)),
        });
        console.log(`[cloud-heatmap] received ${grid.length} samples`);
        if (!cancelled) setSamples(grid);
      } catch (e) {
        console.warn("[cloud-heatmap] grid fetch failed:", e);
        if (!cancelled) setSamples([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, hoursAhead, cols, rows]);

  // Render
  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      // Always remove previous
      if (dataSourceRef.current) {
        try {
          v.dataSources.remove(
            dataSourceRef.current as InstanceType<typeof Cesium.CustomDataSource>,
            true,
          );
        } catch {}
        dataSourceRef.current = null;
      }

      if (!enabled || !samples || samples.length === 0) return;

      const ds = new Cesium.CustomDataSource("cloud-heatmap");
      const cellW = 360 / cols;
      const cellH = 170 / rows; // -85..85

      const colorFor = (pct: number) => {
        if (pct < 25) return Cesium.Color.fromCssColorString("#60a5fa");
        if (pct < 50) return Cesium.Color.fromCssColorString("#cbd5e1");
        if (pct < 75) return Cesium.Color.fromCssColorString("#e5e7eb");
        return Cesium.Color.fromCssColorString("#ffffff");
      };

      for (const s of samples) {
        if (s.cloudCoverPct == null) continue;
        const pct = Math.max(0, Math.min(100, s.cloudCoverPct));
        if (pct < 5) continue; // skip near-clear cells for visual clarity

        const alpha = 0.15 + (pct / 100) * 0.65;
        const color = colorFor(pct).withAlpha(alpha);

        ds.entities.add({
          rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(
              s.lng - cellW / 2,
              s.lat - cellH / 2,
              s.lng + cellW / 2,
              s.lat + cellH / 2,
            ),
            material: new Cesium.ColorMaterialProperty(color),
            height: 0,
          },
        });
      }

      if (cancelled || v.isDestroyed?.()) return;
      v.dataSources.add(ds);
      dataSourceRef.current = ds;
    })();

    return () => {
      cancelled = true;
    };
  }, [viewer, enabled, samples, cols, rows]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      (async () => {
        if (!dataSourceRef.current || !viewer) return;
        const Cesium = await import("cesium");
        const v = viewer as InstanceType<typeof Cesium.Viewer>;
        if (v.isDestroyed?.()) return;
        try {
          v.dataSources.remove(
            dataSourceRef.current as InstanceType<typeof Cesium.CustomDataSource>,
            true,
          );
        } catch {}
        dataSourceRef.current = null;
      })();
    };
  }, [viewer]);

  return null;
}

