"use client";

import type { MapView } from "@/types/map";
import { getCameraState, setCameraState } from "./camera-state";

// Set base URL BEFORE any Cesium import
if (typeof window !== "undefined") {
  (window as Record<string, unknown>).CESIUM_BASE_URL =
    "https://cesium.com/downloads/cesiumjs/releases/1.125/Build/Cesium/";
}

let cesiumModule: typeof import("cesium") | null = null;

async function getCesium() {
  if (!cesiumModule) {
    cesiumModule = await import("cesium");
  }
  return cesiumModule;
}

// Token hardcoded because Turbopack does not inline env vars into dynamic imports
const ION_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNzJiMmVlYS03OWFkLTQ1Y2UtYTRmOS04ODUyOGZiNDc4MmUiLCJpZCI6MzgzNDAwLCJpYXQiOjE3Njk0MDcwNzV9.f5_xu9PXklOqKEd1FFwYWdC1iF8uB-S2tr-pEWkQwNE";

/* ------------------------------------------------------------------ */
/*  Camera lock – snaps camera back whenever nothing is interacting   */
/* ------------------------------------------------------------------ */

let _activePointers = 0;
let _userInteracting = false;
let _flightActive = false;
let _savedPosition: InstanceType<typeof import("cesium").Cartesian3> | null = null;
let _savedDirection: InstanceType<typeof import("cesium").Cartesian3> | null = null;
let _savedUp: InstanceType<typeof import("cesium").Cartesian3> | null = null;

function saveCamera(cam: { position: { clone: () => unknown }; direction: { clone: () => unknown }; up: { clone: () => unknown } }) {
  _savedPosition = cam.position.clone() as typeof _savedPosition;
  _savedDirection = cam.direction.clone() as typeof _savedDirection;
  _savedUp = cam.up.clone() as typeof _savedUp;
  // Sync to shared state for cross-view persistence
  if (cesiumModule && _savedPosition) {
    const carto = cesiumModule.Cartographic.fromCartesian(_savedPosition as InstanceType<typeof cesiumModule.Cartesian3>);
    setCameraState({
      lat: cesiumModule.Math.toDegrees(carto.latitude),
      lng: cesiumModule.Math.toDegrees(carto.longitude),
      altitude: carto.height,
    });
  }
}

/** Mark that a flyTo is running so the lock doesn't fight it */
export function markFlightStart() { _flightActive = true; }
export function markFlightEnd() { _flightActive = false; }

/** Zoom the camera in or out by a factor. factor < 1 = zoom in, > 1 = zoom out */
export async function zoomCamera(viewer: unknown, factor: number) {
  const Cesium = await getCesium();
  const v = viewer as InstanceType<typeof Cesium.Viewer>;
  if (!v || v.isDestroyed()) return;
  const camera = v.camera;
  const height = Cesium.Cartographic.fromCartesian(camera.position).height;
  const newHeight = Math.max(500, Math.min(30000000, height * factor));
  const delta = newHeight - height;
  camera.zoomIn(-delta);
  saveCamera(camera);
  v.scene.requestRender();
}

/* ------------------------------------------------------------------ */

export async function createViewer(
  container: HTMLElement,
  view: MapView
) {
  const Cesium = await getCesium();

  Cesium.Ion.defaultAccessToken = ION_TOKEN;

  const viewer = new Cesium.Viewer(container, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    creditContainer: document.createElement("div"),
    sceneMode: Cesium.SceneMode.SCENE3D,
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  });

  // Lock the globe in place — no drift, no spin
  // Fix clock to a static epoch so ICRF frame never advances
  const fixedTime = Cesium.JulianDate.fromIso8601("2024-01-01T12:00:00Z");
  viewer.clock.currentTime = fixedTime;
  viewer.clock.startTime = fixedTime.clone();
  viewer.clock.stopTime = fixedTime.clone();
  viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
  viewer.clock.shouldAnimate = false;
  viewer.clock.multiplier = 0;
  viewer.clock.canAnimate = false;

  const ssccc = viewer.scene.screenSpaceCameraController;
  ssccc.enableRotate = true;
  ssccc.enableZoom = true;
  ssccc.enableTilt = true;
  ssccc.enableLook = false;
  ssccc.inertiaSpin = 0;
  ssccc.inertiaZoom = 0;
  ssccc.inertiaTranslate = 0;
  ssccc.minimumZoomDistance = 100;
  ssccc.maximumZoomDistance = 30000000;

  // Only re-render when user interacts or we request it
  viewer.scene.requestRenderMode = true;
  viewer.scene.maximumRenderTimeChange = Infinity;

  // Restore camera from shared state (persists across view switches)
  const camState = getCameraState();
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(camState.lng, camState.lat, camState.altitude),
  });
  viewer.camera.cancelFlight();

  // ---- Camera lock: track user interaction via pointer events ----
  const canvas = viewer.scene.canvas;

  canvas.addEventListener("pointerdown", () => {
    _activePointers++;
    _userInteracting = true;
  });
  // save snapshot only when ALL pointers are released
  const onPointerUp = () => {
    _activePointers = Math.max(0, _activePointers - 1);
    if (_activePointers === 0) {
      _userInteracting = false;
      saveCamera(viewer.camera);
    }
  };
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);
  // wheel / trackpad pinch zoom — flag as interacting during gesture
  let _wheelTimer: ReturnType<typeof setTimeout> | null = null;
  canvas.addEventListener("wheel", (e) => {
    _userInteracting = true;
    viewer.scene.requestRender();
    if (_wheelTimer) clearTimeout(_wheelTimer);
    _wheelTimer = setTimeout(() => {
      _userInteracting = false;
      saveCamera(viewer.camera);
      viewer.scene.requestRender();
    }, 300);
  }, { passive: false });

  // take initial snapshot
  saveCamera(viewer.camera);

  // Before every render: if nobody is interacting and no flight is
  // running, force the camera back to its last known-good position.
  viewer.scene.preRender.addEventListener(() => {
    if (_userInteracting || _flightActive || !_savedPosition) return;
    viewer.camera.position = Cesium.Cartesian3.clone(
      _savedPosition as InstanceType<typeof Cesium.Cartesian3>,
      viewer.camera.position
    );
    viewer.camera.direction = Cesium.Cartesian3.clone(
      _savedDirection as InstanceType<typeof Cesium.Cartesian3>,
      viewer.camera.direction
    );
    viewer.camera.up = Cesium.Cartesian3.clone(
      _savedUp as InstanceType<typeof Cesium.Cartesian3>,
      viewer.camera.up
    );
  });

  await applyViewStyle(viewer, view);
  return viewer;
}

export async function applyViewStyle(
  viewer: unknown,
  view: MapView
) {
  const Cesium = await getCesium();
  const v = viewer as InstanceType<typeof Cesium.Viewer>;

  v.scene.primitives.removeAll();

  if (view === "photo") {
    // Keep globe visible but transparent — it must stay as the camera
    // controller's ground-plane anchor or the camera drifts into space.
    v.scene.globe.show = true;
    v.scene.globe.baseColor = Cesium.Color.TRANSPARENT;
    v.scene.globe.translucency.enabled = true;
    v.scene.globe.translucency.frontFaceAlpha = 0.0;
    v.scene.globe.translucency.backFaceAlpha = 0.0;
    try {
      const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
      v.scene.primitives.add(tileset);
    } catch (err) {
      console.warn("Google 3D Tiles unavailable, using default globe:", err);
    }
  } else if (view === "clay") {
    v.scene.globe.show = true;
    v.scene.globe.baseColor = Cesium.Color.fromCssColorString("#4a4a52");
    v.scene.globe.enableLighting = false;
    v.scene.skyAtmosphere.show = false;
    v.scene.backgroundColor = Cesium.Color.fromCssColorString("#1a1a22");
  }

  // snapshot after style change
  saveCamera(v.camera);
  v.scene.requestRender();
}

export async function flyTo(
  viewer: unknown,
  lat: number,
  lng: number,
  bbox: [number, number, number, number] | null,
  altitude?: number
) {
  const Cesium = await getCesium();
  const v = viewer as InstanceType<typeof Cesium.Viewer>;

  _flightActive = true;

  const onComplete = () => {
    _flightActive = false;
    saveCamera(v.camera);
  };

  if (bbox) {
    const [south, north, west, east] = bbox;
    v.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(west, south, east, north),
      duration: 1.5,
      complete: onComplete,
      cancel: onComplete,
    });
  } else {
    v.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, altitude ?? 50000),
      duration: 1.5,
      complete: onComplete,
      cancel: onComplete,
    });
  }
}

/** Save the current Cesium camera position to shared state */
export async function saveCameraToState(viewer: unknown) {
  const Cesium = await getCesium();
  const v = viewer as InstanceType<typeof Cesium.Viewer>;
  if (!v || v.isDestroyed()) return;
  const carto = Cesium.Cartographic.fromCartesian(v.camera.position);
  setCameraState({
    lat: Cesium.Math.toDegrees(carto.latitude),
    lng: Cesium.Math.toDegrees(carto.longitude),
    altitude: carto.height,
  });
}

export async function setupClickHandler(
  viewer: unknown,
  onPick: (data: { position: { lat: number; lng: number; alt: number } }) => void
) {
  const Cesium = await getCesium();
  const v = viewer as InstanceType<typeof Cesium.Viewer>;

  const handler = new Cesium.ScreenSpaceEventHandler(v.scene.canvas);
  handler.setInputAction(
    (event: { position: { x: number; y: number } }) => {
      const cartesian = v.camera.pickEllipsoid(
        event.position,
        v.scene.globe.ellipsoid
      );
      if (Cesium.defined(cartesian)) {
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        onPick({
          position: {
            lat: Cesium.Math.toDegrees(carto.latitude),
            lng: Cesium.Math.toDegrees(carto.longitude),
            alt: carto.height,
          },
        });
      }
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK
  );
  return handler;
}
