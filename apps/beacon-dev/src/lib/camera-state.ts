/** Shared camera state that persists across view switches */

export interface CameraState {
  lat: number;
  lng: number;
  altitude: number;
}

const DEFAULT: CameraState = { lat: 39.8, lng: -98.5, altitude: 15000000 };

let _current: CameraState = { ...DEFAULT };

export function getCameraState(): CameraState {
  return { ..._current };
}

export function setCameraState(s: CameraState) {
  _current = { ...s };
}

/** Convert Cesium-style altitude (meters) to MapLibre zoom level */
export function altitudeToZoom(alt: number): number {
  return Math.max(0, Math.min(20, Math.log2(40000000 / alt)));
}

/** Convert MapLibre zoom level to Cesium-style altitude (meters) */
export function zoomToAltitude(zoom: number): number {
  return 40000000 / Math.pow(2, zoom);
}
