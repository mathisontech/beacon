'use client';

import { useEffect, useRef } from 'react';
// Camera state not shared with live-map — base views are independent
import CesiumControls from './cesium-controls';
import type { OverlayType } from './overlay-toolbar';

interface Props {
  overlays: OverlayType[];
  onViewerReady?: (viewer: unknown) => void;
}

const SF = { lat: 37.7749, lng: -122.4194, altitude: 4000 };

const ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNzJiMmVlYS03OWFkLTQ1Y2UtYTRmOS04ODUyOGZiNDc4MmUiLCJpZCI6MzgzNDAwLCJpYXQiOjE3Njk0MDcwNzV9.f5_xu9PXklOqKEd1FFwYWdC1iF8uB-S2tr-pEWkQwNE';

// Clay palette
const CLAY_LAND  = '#6b8fa3'; // blue clay — land
const CLAY_BG    = '#1a2433'; // dark background
const CLAY_WATER = '#3d4f5c'; // dark gray-blue — water areas
const CLAY_BLDG  = '#8ab4c7'; // lighter blue clay — buildings
const CLAY_VEG   = '#5a8a72'; // muted green clay — vegetation
const CLAY_ROAD  = '#94b8c9'; // pale clay — roads

export default function Clay3D({ overlays, onViewerReady }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!wrapperRef.current || !containerRef.current) return;
    let cancelled = false;

    // Wait until the wrapper has non-zero dimensions before creating Cesium viewer
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

      // ── Strip chrome ──
      viewer.scene.skyBox = undefined as unknown as typeof viewer.scene.skyBox;
      viewer.scene.sun = undefined as unknown as typeof viewer.scene.sun;
      viewer.scene.moon = undefined as unknown as typeof viewer.scene.moon;
      if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString(CLAY_BG);
      viewer.scene.fog.enabled = false;

      // ── Globe: blue clay land, dark gray water ──
      const globe = viewer.scene.globe;
      globe.show = true;
      globe.baseColor = Cesium.Color.fromCssColorString(CLAY_WATER);
      globe.enableLighting = false;
      globe.showGroundAtmosphere = false;
      globe.depthTestAgainstTerrain = true;

      // Remove default imagery
      viewer.imageryLayers.removeAll();

      // ── Contour lines: OpenTopoMap at low opacity on clay base ──
      const topoProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
        minimumLevel: 0,
        maximumLevel: 17,
        credit: 'OpenTopoMap',
      });
      const topoLayer = viewer.imageryLayers.addImageryProvider(topoProvider);
      topoLayer.alpha = 0.25;
      topoLayer.brightness = 0.6;
      topoLayer.contrast = 1.8;
      topoLayer.saturation = 0.0; // fully desaturated → grayscale contours
      topoLayer.gamma = 0.8;

      // ── Terrain: real elevation ──
      try {
        viewer.scene.terrainProvider =
          await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
      } catch {
        console.warn('Terrain unavailable');
      }

      // ── OSM Buildings: clay-styled ──
      try {
        const buildings = await Cesium.Cesium3DTileset.fromIonAssetId(96188);
        buildings.style = new Cesium.Cesium3DTileStyle({
          color: {
            conditions: [
              // Vegetation features → green clay
              ["${feature['building']} === 'greenhouse' || ${feature['building']} === 'farm_auxiliary'",
                `color('${CLAY_VEG}')`],
              // Default → blue clay buildings
              ['true', `color('${CLAY_BLDG}')`],
            ],
          },
        });
        viewer.scene.primitives.add(buildings);
      } catch {
        console.warn('OSM Buildings unavailable');
      }

      // ── Camera: tilted view of SF ──
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(SF.lng, SF.lat, SF.altitude),
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
