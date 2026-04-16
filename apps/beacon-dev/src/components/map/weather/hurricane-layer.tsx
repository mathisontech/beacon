"use client";

import { useEffect, useRef } from "react";
import type { HurricaneStorm, HurricaneForecastPoint } from "@beacon/data-sources";

interface Props {
  viewer: unknown;
  storms: HurricaneStorm[];
  effectiveTimeMs: number;
  enabled: boolean;
}

function categoryColor(cat: number | undefined): string {
  if (cat == null) return "#94a3b8";
  if (cat >= 5) return "#7c3aed";
  if (cat >= 4) return "#db2777";
  if (cat >= 3) return "#dc2626";
  if (cat >= 2) return "#ea580c";
  if (cat >= 1) return "#f59e0b";
  return "#eab308";
}

/**
 * Linearly interpolate hurricane position along its forecast track for a
 * given wall-clock time. Returns null if the time falls outside both the
 * best track and the forecast track.
 */
function interpolatePosition(
  storm: HurricaneStorm,
  timeMs: number,
): HurricaneForecastPoint | null {
  const combined: HurricaneForecastPoint[] = [
    ...(storm.bestTrack ?? []),
    ...storm.forecastTrack,
  ].sort((a, b) => Date.parse(a.time) - Date.parse(b.time));

  if (combined.length === 0) return null;
  const first = Date.parse(combined[0].time);
  const last = Date.parse(combined[combined.length - 1].time);
  if (timeMs <= first) return combined[0];
  if (timeMs >= last) return combined[combined.length - 1];

  for (let i = 0; i < combined.length - 1; i++) {
    const a = Date.parse(combined[i].time);
    const b = Date.parse(combined[i + 1].time);
    if (timeMs >= a && timeMs <= b) {
      const t = (timeMs - a) / (b - a || 1);
      return {
        time: new Date(timeMs).toISOString(),
        lat: combined[i].lat + (combined[i + 1].lat - combined[i].lat) * t,
        lng: combined[i].lng + (combined[i + 1].lng - combined[i].lng) * t,
        maxWindKt: combined[i].maxWindKt,
        minPressureMb: combined[i].minPressureMb,
        category: combined[i].category,
      };
    }
  }
  return combined[combined.length - 1];
}

export default function HurricaneLayer({ viewer, storms, effectiveTimeMs, enabled }: Props) {
  const dataSourceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!viewer || !enabled) {
      // Clean up if disabled
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
      return;
    }

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      const camPos = v.camera.position.clone();
      const camDir = v.camera.direction.clone();
      const camUp = v.camera.up.clone();

      // Remove previous
      if (dataSourceRef.current) {
        try {
          v.dataSources.remove(
            dataSourceRef.current as InstanceType<typeof Cesium.CustomDataSource>,
            true,
          );
        } catch {}
      }

      const ds = new Cesium.CustomDataSource("hurricanes");

      for (const storm of storms) {
        // Cone polygon
        if (storm.cone) {
          try {
            const coneGeoJson: GeoJSON.FeatureCollection = {
              type: "FeatureCollection",
              features: [{
                type: "Feature",
                geometry: storm.cone,
                properties: { storm: storm.id, kind: "cone" },
              }],
            };
            const coneDs = await Cesium.GeoJsonDataSource.load(coneGeoJson, {
              stroke: Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.6),
              fill: Cesium.Color.fromCssColorString("#7b1fa2").withAlpha(0.22),
              strokeWidth: 1,
              clampToGround: true,
            });
            for (const e of coneDs.entities.values) {
              ds.entities.add(e);
            }
          } catch {}
        }

        // Forecast track polyline
        if (storm.forecastTrack.length >= 2) {
          const positions = storm.forecastTrack.map((p) =>
            Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
          );
          ds.entities.add({
            polyline: {
              positions,
              width: 2,
              material: Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.9),
              clampToGround: true,
            },
          });
        }

        // Best-track (past) polyline — dashed
        if (storm.bestTrack && storm.bestTrack.length >= 2) {
          const pastPositions = storm.bestTrack.map((p) =>
            Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
          );
          ds.entities.add({
            polyline: {
              positions: pastPositions,
              width: 2,
              material: new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.fromCssColorString("#fbbf24").withAlpha(0.9),
                dashLength: 12,
              }),
              clampToGround: true,
            },
          });
        }

        // Forecast-point markers
        for (const p of storm.forecastTrack) {
          const col = Cesium.Color.fromCssColorString(categoryColor(p.category));
          ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
            point: {
              pixelSize: 7,
              color: col.withAlpha(0.85),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1,
            },
          });
        }

        // Current/interpolated position for this effective time
        const pos = interpolatePosition(storm, effectiveTimeMs);
        if (pos) {
          const col = Cesium.Color.fromCssColorString(categoryColor(pos.category));
          ds.entities.add({
            position: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat),
            point: {
              pixelSize: 18,
              color: col,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
            },
            label: {
              text: `${storm.name} ${pos.maxWindKt ? `${pos.maxWindKt}kt` : ""}`,
              font: "12px sans-serif",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -14),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString("#000000").withAlpha(0.55),
              backgroundPadding: new Cesium.Cartesian2(6, 3),
            },
          });
        }
      }

      if (cancelled || v.isDestroyed?.()) return;
      v.dataSources.add(ds);
      dataSourceRef.current = ds;

      v.camera.setView({
        destination: camPos,
        orientation: { direction: camDir, up: camUp },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [viewer, storms, effectiveTimeMs, enabled]);

  return null;
}
