"use client";

// Renders FeedEvents from @beacon/event-engine as Cesium point entities.
// Mirrors fire-layer's point render pattern. Per-feed enabled gating.

import { useEffect, useRef } from "react";
import type { FeedEvent } from "@beacon/data-sources";
import { pinColorFor } from "./feed-events/pin-color-for";
import { pinSizeFor } from "./feed-events/pin-size-for";

interface Props {
  viewer: unknown;
  events: FeedEvent[];
  feedsEnabled: Record<string, boolean>;
  enabled: boolean;
}

export default function FeedEventsLayer({
  viewer,
  events,
  feedsEnabled,
  enabled,
}: Props) {
  const dsRef = useRef<unknown>(null);

  useEffect(() => {
    if (!viewer || !enabled) return;
    let cancelled = false;

    async function render() {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      const camPos = v.camera.position.clone();
      const camDir = v.camera.direction.clone();
      const camUp = v.camera.up.clone();

      if (dsRef.current) {
        try {
          v.dataSources.remove(
            dsRef.current as InstanceType<typeof Cesium.CustomDataSource>,
            true
          );
        } catch {}
        dsRef.current = null;
      }

      const visible = events.filter(
        (e) => feedsEnabled[e.feedId] !== false &&
               Number.isFinite(e.lat) && Number.isFinite(e.lng)
      );
      if (visible.length === 0) return;

      if (cancelled) return;
      const ds = new Cesium.CustomDataSource("feed-events");

      visible.forEach((ev) => {
        const color = Cesium.Color.fromCssColorString(
          pinColorFor(ev.category, ev.severity)
        );
        ds.entities.add({
          position: Cesium.Cartesian3.fromDegrees(ev.lng, ev.lat),
          point: {
            pixelSize: pinSizeFor(ev.severity),
            color: color.withAlpha(0.85),
            outlineColor: Cesium.Color.WHITE.withAlpha(0.7),
            outlineWidth: 1,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
          name: ev.title,
          description: `${ev.feedId} — ${ev.severity}`,
        });
      });

      if (cancelled || v.isDestroyed?.()) return;
      v.dataSources.add(ds);
      dsRef.current = ds;

      v.camera.setView({
        destination: camPos,
        orientation: { direction: camDir, up: camUp },
      });
    }

    render().catch((err) => console.warn("FeedEventsLayer render failed:", err));
    return () => { cancelled = true; };
  }, [viewer, events, feedsEnabled, enabled]);

  // Clean up when disabled
  useEffect(() => {
    if (enabled || !dsRef.current || !viewer) return;
    (async () => {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;
      try {
        v.dataSources.remove(
          dsRef.current as InstanceType<typeof Cesium.CustomDataSource>,
          true
        );
      } catch {}
      dsRef.current = null;
    })();
  }, [enabled, viewer]);

  return null;
}
