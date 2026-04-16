"use client";

import { useEffect, useRef, useState } from "react";
import { fetchForecastGrid, type WeatherSample } from "@beacon/data-sources";

interface Props {
  viewer: unknown;
  enabled: boolean;
  hoursAhead: number;
}

/**
 * Coarse wind grid. Samples ~24 points across the current camera view via
 * Open-Meteo and renders an arrow glyph at each using a polyline pair.
 *
 * Open-Meteo rate limit is ~10k req/day, so samples are throttled and only
 * refreshed on demand or when hoursAhead changes by a large margin.
 */
export default function WindLayer({ viewer, enabled, hoursAhead }: Props) {
  const dataSourceRef = useRef<unknown>(null);
  const [samples, setSamples] = useState<WeatherSample[] | null>(null);
  const lastFetchKey = useRef<string>("");

  // Fetch grid when enabled / hoursAhead bucket changes
  useEffect(() => {
    if (!enabled || !viewer) return;

    const bucket = Math.round(hoursAhead / 6); // refresh every 6h of scrubber
    const key = `${bucket}`;
    if (lastFetchKey.current === key && samples) return;
    lastFetchKey.current = key;

    let cancelled = false;

    (async () => {
      try {
        // Default bbox: CONUS + Atlantic — covers typical Atlantic hurricane scenarios
        const grid = await fetchForecastGrid({
          bbox: [-100, 10, -50, 45],
          cols: 6,
          rows: 4,
          hoursAhead: Math.max(0, Math.min(168, hoursAhead)),
        });
        if (!cancelled) setSamples(grid);
      } catch {
        if (!cancelled) setSamples([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, viewer, hoursAhead, samples]);

  // Render arrows
  useEffect(() => {
    if (!viewer) return;

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

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

      const ds = new Cesium.CustomDataSource("wind");

      for (const s of samples) {
        if (s.windSpeedMs == null || s.windDirectionDeg == null) continue;
        const lengthDeg = Math.min(3, 0.2 + s.windSpeedMs * 0.2);
        // Wind direction is where it's coming FROM; arrow points where it's going.
        const toRad = ((s.windDirectionDeg + 180) * Math.PI) / 180;
        const dLat = Math.cos(toRad) * lengthDeg;
        const dLng = Math.sin(toRad) * lengthDeg / Math.max(0.3, Math.cos((s.lat * Math.PI) / 180));
        const tailLng = s.lng;
        const tailLat = s.lat;
        const headLng = s.lng + dLng;
        const headLat = s.lat + dLat;

        const color = s.windSpeedMs > 20 ? "#dc2626"
                    : s.windSpeedMs > 10 ? "#ea580c"
                    : s.windSpeedMs > 5  ? "#eab308"
                                         : "#22c55e";

        ds.entities.add({
          polyline: {
            positions: [
              Cesium.Cartesian3.fromDegrees(tailLng, tailLat),
              Cesium.Cartesian3.fromDegrees(headLng, headLat),
            ],
            width: 2,
            material: new Cesium.PolylineArrowMaterialProperty(
              Cesium.Color.fromCssColorString(color).withAlpha(0.85),
            ),
            clampToGround: true,
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
  }, [viewer, enabled, samples]);

  return null;
}
