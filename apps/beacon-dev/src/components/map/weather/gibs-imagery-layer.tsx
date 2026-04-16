"use client";

import { useEffect, useRef } from "react";

interface Props {
  viewer: unknown;
  enabled: boolean;
  /** GIBS layer id, e.g. VIIRS_SNPP_CorrectedReflectance_TrueColor */
  layer: string;
  /** GIBS Web Mercator tile matrix set: "GoogleMapsCompatible_Level{N}".
   *  Common values: Level9 (250m), Level8 (500m), Level7 (1km), Level6 (2km). */
  tileMatrixSet: string;
  /** Image format extension: "jpg" or "png" */
  format: "jpg" | "png";
  /** ISO date YYYY-MM-DD — defaults to yesterday (most recent full mosaic) */
  date?: string;
  alpha?: number;
  /** Forces re-mount when changed */
  refreshKey?: string | number;
}

// Latest date GIBS is known to have imagery for. Clamp the default date to
// no later than this so a future-dated dev machine clock can't request dates
// outside the archive (which returns HTTP 400).
const GIBS_LATEST_KNOWN_DATE = "2024-12-01";

function defaultDate(): string {
  // Real production: yesterday's mosaic is usually processed by T-2 days.
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 2);
  const candidate = d.toISOString().slice(0, 10);
  return candidate < GIBS_LATEST_KNOWN_DATE ? candidate : GIBS_LATEST_KNOWN_DATE;
}

// Max zoom-level INDEX for GIBS Web Mercator (GoogleMapsCompatible) grids.
// Tile matrix set names encode max level: Level9 → max index 8, Level8 → 7, etc.
function maxLevelOf(tileMatrixSet: string): number {
  const m = tileMatrixSet.match(/Level(\d+)/);
  if (m) return Math.max(0, parseInt(m[1], 10) - 1);
  return 8;
}

/**
 * NASA GIBS WMTS imagery overlay.
 * Public domain. CORS-enabled. https://nasa-gibs.github.io/gibs-api-docs/
 *
 * Adds an imagery layer on top of the existing imagery stack — does not
 * touch base layer settings.
 */
export default function GibsImageryLayer({
  viewer,
  enabled,
  layer,
  tileMatrixSet,
  format,
  date,
  alpha = 0.7,
  refreshKey,
}: Props) {
  const layerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!viewer) return;

    let cancelled = false;
    const time = date ?? defaultDate();

    (async () => {
      const Cesium = await import("cesium");
      const v = viewer as InstanceType<typeof Cesium.Viewer>;
      if (v.isDestroyed?.()) return;

      // Always remove previous before doing anything
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

      // GIBS Web Mercator (EPSG:3857) endpoint. Standard Google-style XYZ tiling
      // with power-of-2 doubling — matches Cesium's WebMercatorTilingScheme.
      // Avoids the non-power-of-2 grid quirk of the EPSG:4326 endpoint.
      const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${time}/${tileMatrixSet}/{z}/{y}/{x}.${format}`;

      const provider = new Cesium.UrlTemplateImageryProvider({
        url,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        tileWidth: 256,
        tileHeight: 256,
        maximumLevel: maxLevelOf(tileMatrixSet),
        credit: new Cesium.Credit("NASA EOSDIS GIBS"),
      });

      provider.errorEvent.addEventListener((err: unknown) => {
        console.warn(`[GIBS ${layer}] tile error:`, err);
      });

      if (cancelled || v.isDestroyed?.()) return;

      const imageryLayer = v.imageryLayers.addImageryProvider(provider);
      imageryLayer.alpha = alpha;
      layerRef.current = imageryLayer;
    })();

    return () => {
      cancelled = true;
    };
  }, [viewer, enabled, layer, tileMatrixSet, format, date, alpha, refreshKey]);

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
