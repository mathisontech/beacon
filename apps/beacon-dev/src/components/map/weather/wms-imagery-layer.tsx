"use client";

import { useEffect, useRef } from "react";
import type { WmsServiceSpec } from "@beacon/data-sources";

interface Props {
  viewer: unknown;
  enabled: boolean;
  spec: WmsServiceSpec;
  alpha?: number;
  /** A stable key that forces re-add when it changes (e.g. time). */
  refreshKey?: string | number;
}

/**
 * Generic WMS imagery overlay. Adds a Cesium WebMapServiceImageryProvider
 * on top of the existing imagery stack — does not touch the base layer
 * owned by the imagery provider managed elsewhere.
 */
export default function WmsImageryLayer({ viewer, enabled, spec, alpha = 0.7, refreshKey }: Props) {
  const layerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!viewer) return;

    let cancelled = false;

    (async () => {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      // Always remove previous first
      if (layerRef.current) {
        try {
          v.imageryLayers.remove(
            layerRef.current as InstanceType<typeof Cesium.ImageryLayer>,
            true,
          );
        } catch {}
        layerRef.current = null;
      }

      if (!enabled) return;

      const provider = new Cesium.WebMapServiceImageryProvider({
        url: spec.url,
        layers: spec.layers,
        parameters: {
          service: "WMS",
          version: "1.3.0",
          request: "GetMap",
          format: "image/png",
          transparent: true,
          styles: "",
        },
        tileWidth: 512,
        tileHeight: 512,
        enablePickFeatures: false,
      });

      provider.errorEvent.addEventListener((err: unknown) => {
        console.warn(`[WMS ${spec.credit}] tile error:`, err);
      });

      if (cancelled || v.isDestroyed?.()) return;

      const layer = v.imageryLayers.addImageryProvider(provider);
      layer.alpha = alpha;
      layerRef.current = layer;
    })();

    return () => {
      cancelled = true;
    };
  }, [viewer, enabled, spec, alpha, refreshKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      (async () => {
        if (!layerRef.current || !viewer) return;
        const Cesium = await import("cesium");
        const v = viewer as InstanceType<typeof Cesium.Viewer>;
        if (v.isDestroyed?.()) return;
        try {
          v.imageryLayers.remove(
            layerRef.current as InstanceType<typeof Cesium.ImageryLayer>,
            true,
          );
        } catch {}
        layerRef.current = null;
      })();
    };
  }, [viewer]);

  return null;
}
