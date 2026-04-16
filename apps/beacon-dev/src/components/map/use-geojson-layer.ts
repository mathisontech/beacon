"use client";

import { useEffect, useRef } from "react";

export interface GeoJsonStyle {
  stroke: string;
  strokeWidth: number;
  fill?: string; // css color with alpha
  clampToGround?: boolean;
}

// Shared useEffect that loads a GeoJSON URL into a Cesium viewer as a
// GeoJsonDataSource, with style, and cleans up on enable/url change or
// unmount. Preserves the current camera pose (avoids Cesium's default
// "fly to the new data" jump).
export function useGeoJsonLayer(
  viewer: unknown,
  url: string,
  enabled: boolean,
  style: GeoJsonStyle
) {
  const dsRef = useRef<unknown>(null);

  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;

    async function run() {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      // Remove previous data source.
      if (dsRef.current) {
        try {
          v.dataSources.remove(
            dsRef.current as InstanceType<typeof Cesium.GeoJsonDataSource>,
            true
          );
        } catch {}
        dsRef.current = null;
      }
      if (!enabled || cancelled) return;

      const cam = {
        pos: v.camera.position.clone(),
        dir: v.camera.direction.clone(),
        up: v.camera.up.clone(),
      };

      try {
        const ds = await Cesium.GeoJsonDataSource.load(url, {
          clampToGround: style.clampToGround ?? true,
          stroke: Cesium.Color.fromCssColorString(style.stroke),
          strokeWidth: style.strokeWidth,
          fill: style.fill
            ? Cesium.Color.fromCssColorString(style.fill)
            : Cesium.Color.TRANSPARENT,
        });
        if (cancelled || v.isDestroyed?.()) return;

        v.dataSources.add(ds);
        dsRef.current = ds;
        // Restore camera: prevent auto-fly.
        v.camera.setView({
          destination: cam.pos,
          orientation: { direction: cam.dir, up: cam.up },
        });
      } catch (err) {
        console.warn(`GeoJSON layer failed (${url}):`, err);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [viewer, url, enabled, style.stroke, style.strokeWidth, style.fill, style.clampToGround]);

  // Unmount cleanup.
  useEffect(() => {
    return () => {
      const ds = dsRef.current;
      const v = viewer as {
        dataSources?: { remove: (x: unknown, b: boolean) => void };
        isDestroyed?: () => boolean;
      } | null;
      if (!ds || !v || v.isDestroyed?.()) return;
      try {
        v.dataSources?.remove(ds, true);
      } catch {}
    };
  }, [viewer]);
}
