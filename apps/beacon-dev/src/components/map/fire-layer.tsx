"use client";

import { useEffect, useRef } from "react";
import type { ActiveFire } from "@/types/fire";
import { fireColor } from "@/lib/fire-data";

interface Props {
  viewer: unknown;
  fires: ActiveFire[];
  enabled: boolean;
  timelineGeometry?: GeoJSON.Geometry | null;
}

export default function FireLayer({
  viewer,
  fires,
  enabled,
  timelineGeometry,
}: Props) {
  const perimRef = useRef<unknown>(null);
  const pointRef = useRef<unknown>(null);
  const tlRef = useRef<unknown>(null);

  // Render polygon perimeters
  useEffect(() => {
    if (!viewer || !enabled) return;
    let cancelled = false;

    async function render() {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      const cam = {
        pos: v.camera.position.clone(),
        dir: v.camera.direction.clone(),
        up: v.camera.up.clone(),
      };

      if (perimRef.current) {
        try {
          v.dataSources.remove(
            perimRef.current as InstanceType<typeof Cesium.GeoJsonDataSource>,
            true
          );
        } catch {}
      }

      const polys = fires.filter(
        (f) =>
          f.geometry &&
          (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
      );
      if (polys.length === 0) return;

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: polys.map((fire) => ({
          type: "Feature",
          geometry: fire.geometry!,
          properties: { id: fire.id, name: fire.name, acres: fire.acres },
        })),
      };

      if (cancelled) return;

      try {
        const ds = await Cesium.GeoJsonDataSource.load(geojson, {
          clampToGround: true,
          stroke: Cesium.Color.fromCssColorString("#ff4400").withAlpha(0.9),
          strokeWidth: 2,
        });
        if (cancelled || v.isDestroyed?.()) return;

        ds.entities.values.forEach((entity) => {
          const acres =
            (entity.properties?.acres?.getValue() as number) || 0;
          const color = Cesium.Color.fromCssColorString(
            fireColor(acres)
          ).withAlpha(0.4);
          if (entity.polygon) {
            entity.polygon.material = new Cesium.ColorMaterialProperty(color);
          }
        });

        v.dataSources.add(ds);
        perimRef.current = ds;
        v.camera.setView({
          destination: cam.pos,
          orientation: { direction: cam.dir, up: cam.up },
        });
      } catch (err) {
        console.warn("Fire perimeter render failed:", err);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [viewer, fires, enabled]);

  // Render point-only fires as circles
  useEffect(() => {
    if (!viewer || !enabled) return;
    let cancelled = false;

    async function render() {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      if (pointRef.current) {
        try {
          v.dataSources.remove(
            pointRef.current as InstanceType<typeof Cesium.GeoJsonDataSource>,
            true
          );
        } catch {}
      }

      const pts = fires.filter(
        (f) => f.geometry && f.geometry.type === "Point"
      );
      if (pts.length === 0) return;

      if (cancelled) return;

      const ds = new Cesium.CustomDataSource("fire-points");

      pts.forEach((fire) => {
        const c = Cesium.Color.fromCssColorString(fireColor(fire.acres));
        ds.entities.add({
          position: Cesium.Cartesian3.fromDegrees(fire.lng, fire.lat),
          point: {
            pixelSize: Math.min(14, Math.max(6, Math.log2(fire.acres + 1) * 2)),
            color: c.withAlpha(0.85),
            outlineColor: Cesium.Color.WHITE.withAlpha(0.7),
            outlineWidth: 1,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
          properties: { name: fire.name, acres: fire.acres } as unknown as InstanceType<typeof Cesium.PropertyBag>,
        });
      });

      if (cancelled || v.isDestroyed?.()) return;
      v.dataSources.add(ds);
      pointRef.current = ds;
    }

    render();
    return () => { cancelled = true; };
  }, [viewer, fires, enabled]);

  // Render timeline perimeter overlay (selected historical snapshot)
  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;

    async function render() {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      if (tlRef.current) {
        try {
          v.dataSources.remove(
            tlRef.current as InstanceType<typeof Cesium.GeoJsonDataSource>,
            true
          );
        } catch {}
        tlRef.current = null;
      }

      if (!timelineGeometry) return;

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: timelineGeometry,
            properties: { kind: "timeline" },
          },
        ],
      };

      if (cancelled) return;

      try {
        const ds = await Cesium.GeoJsonDataSource.load(geojson, {
          clampToGround: true,
          stroke: Cesium.Color.CYAN.withAlpha(0.9),
          strokeWidth: 3,
        });
        if (cancelled || v.isDestroyed?.()) return;

        ds.entities.values.forEach((entity) => {
          if (entity.polygon) {
            entity.polygon.material = new Cesium.ColorMaterialProperty(
              Cesium.Color.CYAN.withAlpha(0.2)
            );
          }
        });

        v.dataSources.add(ds);
        tlRef.current = ds;
      } catch (err) {
        console.warn("Timeline perimeter render failed:", err);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [viewer, timelineGeometry]);

  return null;
}
