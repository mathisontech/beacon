"use client";

import { useEffect, useRef } from "react";
import type { NWSAlert } from "@/types/map";
import { getSeverityColor } from "@/lib/nws-alerts";

interface Props {
  viewer: unknown;
  alerts: NWSAlert[];
  opacity: number;
  enabled: boolean;
}

export default function NWSAlertLayer({
  viewer,
  alerts,
  opacity,
  enabled,
}: Props) {
  const dataSourceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!viewer || !enabled) return;

    let cancelled = false;

    async function render() {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;

      // Guard: viewer might be destroyed
      if (v.isDestroyed?.()) return;

      // Snapshot camera so data-source add/remove can't nudge it
      const camPos = v.camera.position.clone();
      const camDir = v.camera.direction.clone();
      const camUp = v.camera.up.clone();

      // Remove previous
      if (dataSourceRef.current) {
        try {
          v.dataSources.remove(
            dataSourceRef.current as InstanceType<typeof Cesium.GeoJsonDataSource>,
            true
          );
        } catch {}
      }

      const alertsWithGeom = alerts.filter((a) => a.geometry);
      if (alertsWithGeom.length === 0) return;

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: alertsWithGeom.map((alert) => ({
          type: "Feature",
          geometry: alert.geometry!,
          properties: {
            id: alert.id,
            event: alert.event,
            severity: alert.severity,
            headline: alert.headline,
          },
        })),
      };

      if (cancelled) return;

      try {
        const ds = await Cesium.GeoJsonDataSource.load(geojson, {
          clampToGround: true,
          stroke: Cesium.Color.WHITE.withAlpha(0.8),
          strokeWidth: 1,
        });

        if (cancelled || v.isDestroyed?.()) return;

        ds.entities.values.forEach((entity) => {
          const severity =
            (entity.properties?.severity?.getValue() as string) || "Unknown";
          const color = Cesium.Color.fromCssColorString(
            getSeverityColor(severity)
          ).withAlpha(opacity);

          if (entity.polygon) {
            entity.polygon.material = new Cesium.ColorMaterialProperty(color);
          }
        });

        v.dataSources.add(ds);
        dataSourceRef.current = ds;

        // Restore camera to pre-update position
        v.camera.setView({
          destination: camPos,
          orientation: { direction: camDir, up: camUp },
        });
      } catch (err) {
        console.warn("NWS alert render failed:", err);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [viewer, alerts, opacity, enabled]);

  return null;
}
