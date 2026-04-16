"use client";

import HurricaneLayer from "./hurricane-layer";
import WmsImageryLayer from "./wms-imagery-layer";
import CloudHeatmapLayer from "./cloud-heatmap-layer";
import WindLayer from "./wind-layer";
import { useWeather } from "./weather-context";
import { MRMS_RADAR, NWS_ALERTS_WMS } from "@beacon/data-sources";

interface Props {
  viewer: unknown;
}

/**
 * Single bundle of all weather overlays. Subscribes to WeatherProvider state
 * and mounts only the overlays that are enabled. Designed to live inside
 * live-world-map.tsx with just one import line.
 */
export default function WeatherOverlays({ viewer }: Props) {
  const w = useWeather();

  const refreshKey = Math.round(w.hoursOffset); // for re-fetching time-varying WMS

  return (
    <>
      <CloudHeatmapLayer
        viewer={viewer}
        enabled={w.enabled.has("wx-cloud-cover")}
        hoursAhead={Math.max(0, w.hoursOffset)}
      />
      <WmsImageryLayer
        viewer={viewer}
        enabled={w.enabled.has("wx-radar")}
        spec={MRMS_RADAR}
        alpha={0.7}
        refreshKey={refreshKey}
      />
      <WmsImageryLayer
        viewer={viewer}
        enabled={w.enabled.has("wx-nws-wms")}
        spec={NWS_ALERTS_WMS}
        alpha={0.55}
        refreshKey={refreshKey}
      />
      <HurricaneLayer
        viewer={viewer}
        storms={w.storms}
        effectiveTimeMs={w.effectiveTimeMs}
        enabled={w.enabled.has("wx-hurricane")}
      />
      <WindLayer
        viewer={viewer}
        enabled={w.enabled.has("wx-wind")}
        hoursAhead={Math.max(0, w.hoursOffset)}
      />
    </>
  );
}
