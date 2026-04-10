'use client';

import { useEffect, useRef } from 'react';
// Camera state not shared with live-map — base views are independent
import CesiumControls from './cesium-controls';
import type { OverlayType } from './overlay-toolbar';

interface Props {
  overlays: OverlayType[];
  onViewerReady?: (viewer: unknown) => void;
}

// Closer camera for 3D tiles — shows buildings at street level
const SF = { lat: 37.7749, lng: -122.4194, altitude: 5000 };

const ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNzJiMmVlYS03OWFkLTQ1Y2UtYTRmOS04ODUyOGZiNDc4MmUiLCJpZCI6MzgzNDAwLCJpYXQiOjE3Njk0MDcwNzV9.f5_xu9PXklOqKEd1FFwYWdC1iF8uB-S2tr-pEWkQwNE';

export default function Google3D({ overlays, onViewerReady }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!wrapperRef.current || !containerRef.current) return;
    let cancelled = false;

    function waitForSize(el: HTMLElement): Promise<void> {
      return new Promise((resolve) => {
        if (el.offsetWidth > 0 && el.offsetHeight > 0) { resolve(); return; }
        const ro = new ResizeObserver((entries) => {
          for (const e of entries) {
            if (e.contentRect.width > 0 && e.contentRect.height > 0) {
              ro.disconnect();
              resolve();
              return;
            }
          }
        });
        ro.observe(el);
        setTimeout(() => { ro.disconnect(); resolve(); }, 1000);
      });
    }

    async function init() {
      await waitForSize(wrapperRef.current!);

      // Load Cesium CSS (required for viewer/widget/canvas sizing)
      if (!document.querySelector('link[href*="cesium"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.125/Build/Cesium/Widgets/widgets.css';
        document.head.appendChild(link);
      }

      if (typeof window !== 'undefined') {
        (window as Record<string, unknown>).CESIUM_BASE_URL =
          'https://cesium.com/downloads/cesiumjs/releases/1.125/Build/Cesium/';
      }

      const Cesium = await import('cesium');
      if (cancelled || !containerRef.current) return;

      Cesium.Ion.defaultAccessToken = ION_TOKEN;
      const cam = SF;

      const viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
        msaaSamples: 2,
      });

      // Transparent globe as camera anchor
      viewer.scene.globe.show = true;
      viewer.scene.globe.baseColor = Cesium.Color.TRANSPARENT;
      viewer.scene.globe.translucency.enabled = true;
      viewer.scene.globe.translucency.frontFaceAlpha = 0.0;
      viewer.scene.globe.translucency.backFaceAlpha = 0.0;

      // Load Google 3D Tiles
      try {
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
        viewer.scene.primitives.add(tileset);
      } catch (err) {
        console.warn('Google 3D Tiles unavailable:', err);
        // Fallback to visible globe
        viewer.scene.globe.translucency.enabled = false;
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#3a5a3a');
      }

      // Position camera — tilted street-level view of SF downtown
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(cam.lng, cam.lat, cam.altitude),
        orientation: {
          heading: Cesium.Math.toRadians(30),
          pitch: Cesium.Math.toRadians(-35),
          roll: 0,
        },
      });

      // Camera change listener (no shared state — base views are independent)

      // Hide credits
      const cw = viewer.cesiumWidget.creditContainer as HTMLElement;
      if (cw) cw.style.display = 'none';

      // Keep viewer in sync with wrapper size changes
      const ro = new ResizeObserver(() => {
        if (!viewer.isDestroyed()) viewer.resize();
      });
      ro.observe(wrapperRef.current!);

      viewerRef.current = viewer;
      (viewerRef.current as Record<string, unknown>)._ro = ro;
      if (onViewerReady) onViewerReady(viewer);
    }

    init();
    return () => {
      cancelled = true;
      if (viewerRef.current) {
        const ref = viewerRef.current as Record<string, unknown>;
        if (ref._ro) (ref._ro as ResizeObserver).disconnect();
        const v = viewerRef.current as { isDestroyed: () => boolean; destroy: () => void };
        if (!v.isDestroyed()) v.destroy();
        viewerRef.current = null;
      }
    };
  }, [onViewerReady]);

  return (
    <div ref={wrapperRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <CesiumControls viewerRef={viewerRef} />
    </div>
  );
}
