"use client";

import { useEffect, useRef } from "react";
import { useAllVolcanoes } from "@/app/admin/dashboard/viz/hazards/volcanoes/use-all-volcanoes";
import {
  volcanoPinDataUrl,
  volcanoPinSize,
} from "@/app/admin/dashboard/viz/hazards/volcanoes/volcano-pin-data-url";
import type { AlertLevel } from "@/app/admin/dashboard/viz/hazards/volcanoes/types";
import { LEVELS } from "@/app/admin/dashboard/viz/hazards/volcanoes/volcano-levels";
import {
  volcanoFootprint,
  FOOTPRINT_FILL,
  FOOTPRINT_STROKE,
} from "@/app/admin/dashboard/viz/hazards/volcanoes/volcano-footprint";

interface Props {
  viewer: unknown;
  enabled: boolean;
}

// Renders every known volcano (static list + GVP Holocene fetch) as
// a billboard pin plus a ground-clamped circular footprint polygon
// colored by alert level.
export default function VolcanoLayer({ viewer, enabled }: Props) {
  const dsRef = useRef<unknown>(null);
  const volcanoes = useAllVolcanoes();

  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;

    async function render() {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      if (dsRef.current) {
        try {
          v.dataSources.remove(
            dsRef.current as InstanceType<typeof Cesium.CustomDataSource>,
            true
          );
        } catch {}
        dsRef.current = null;
      }

      if (!enabled || cancelled) return;

      const iconFor: Record<AlertLevel, string> = {
        warning: volcanoPinDataUrl("warning"),
        watch: volcanoPinDataUrl("watch"),
        advisory: volcanoPinDataUrl("advisory"),
        normal: volcanoPinDataUrl("normal"),
        unknown: volcanoPinDataUrl("unknown"),
      };

      const ds = new Cesium.CustomDataSource("volcanoes");
      const knownLevels = new Set(LEVELS.map((l) => l.id));

      for (const vol of volcanoes) {
        const level: AlertLevel = knownLevels.has(vol.level)
          ? vol.level
          : ("unknown" as AlertLevel);
        const size = volcanoPinSize(level);

        // Ground polygon footprint.
        const ring = volcanoFootprint(vol.lat, vol.lng, level, vol.elevation_m);
        ds.entities.add({
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(
              Cesium.Cartesian3.fromDegreesArray(ring)
            ),
            material: Cesium.Color.fromCssColorString(FOOTPRINT_FILL[level]),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString(
              FOOTPRINT_STROKE[level]
            ),
            outlineWidth: 1,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        });

        // Pin billboard.
        ds.entities.add({
          position: Cesium.Cartesian3.fromDegrees(vol.lng, vol.lat),
          billboard: {
            image: iconFor[level],
            width: size,
            height: size,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          properties: {
            id: vol.id,
            name: vol.name,
            region: vol.region,
            level: vol.level,
            elevation_m: vol.elevation_m,
            last_eruption: vol.last_eruption,
          } as unknown as InstanceType<typeof Cesium.PropertyBag>,
        });
      }

      if (cancelled || v.isDestroyed?.()) return;
      v.dataSources.add(ds);
      dsRef.current = ds;
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [viewer, enabled, volcanoes]);

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

  return null;
}
