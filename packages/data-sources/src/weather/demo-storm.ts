// Synthetic demo storm — used only when NHC returns zero active storms
// (e.g. off-season) so the hurricane overlay UI remains inspectable.
// Loosely modeled on a 2017 Atlantic track, anchored to "now" so the
// time scrubber exercises interpolation realistically.

import type { HurricaneStorm } from "./types";

export function buildDemoStorm(nowMs: number = Date.now()): HurricaneStorm {
  const hour = 3600_000;

  // Past (best track): 4 points over the last 48h approaching from the east.
  const bestTrack = [
    { dh: -48, lat: 14.0, lng: -52.0, maxWindKt: 45, category: 0 },
    { dh: -36, lat: 15.1, lng: -57.5, maxWindKt: 55, category: 0 },
    { dh: -24, lat: 16.3, lng: -62.8, maxWindKt: 70, category: 1 },
    { dh: -12, lat: 17.6, lng: -67.5, maxWindKt: 85, category: 2 },
    { dh:   0, lat: 19.0, lng: -72.0, maxWindKt: 100, category: 3 },
  ].map((p) => ({
    time: new Date(nowMs + p.dh * hour).toISOString(),
    lat: p.lat,
    lng: p.lng,
    maxWindKt: p.maxWindKt,
    category: p.category,
    minPressureMb: 1010 - (p.maxWindKt ?? 0),
  }));

  // Forecast: 5-day NHC-style (+12h, +24h, +36h, +48h, +72h, +96h, +120h)
  const forecast = [
    { dh:   0, lat: 19.0, lng: -72.0, maxWindKt: 100, category: 3 },
    { dh:  12, lat: 20.4, lng: -76.0, maxWindKt: 105, category: 3 },
    { dh:  24, lat: 22.0, lng: -79.5, maxWindKt: 110, category: 3 },
    { dh:  36, lat: 23.8, lng: -82.0, maxWindKt: 105, category: 3 },
    { dh:  48, lat: 25.6, lng: -83.5, maxWindKt: 95,  category: 2 },
    { dh:  72, lat: 29.0, lng: -85.0, maxWindKt: 80,  category: 1 },
    { dh:  96, lat: 32.0, lng: -86.5, maxWindKt: 55,  category: 0 },
    { dh: 120, lat: 34.5, lng: -87.5, maxWindKt: 40,  category: 0 },
  ].map((p) => ({
    time: new Date(nowMs + p.dh * hour).toISOString(),
    lat: p.lat,
    lng: p.lng,
    maxWindKt: p.maxWindKt,
    category: p.category,
    minPressureMb: 1010 - (p.maxWindKt ?? 0),
  }));

  // Widening cone polygon around the forecast track.
  const coneCoords: [number, number][] = [];
  const widthKm = [30, 60, 90, 130, 170, 230, 290, 350];
  for (let i = 0; i < forecast.length; i++) {
    const p = forecast[i];
    const dLng = widthKm[i] / 111 / Math.cos((p.lat * Math.PI) / 180);
    coneCoords.push([p.lng - dLng, p.lat]);
  }
  for (let i = forecast.length - 1; i >= 0; i--) {
    const p = forecast[i];
    const dLng = widthKm[i] / 111 / Math.cos((p.lat * Math.PI) / 180);
    coneCoords.push([p.lng + dLng, p.lat]);
  }
  coneCoords.push(coneCoords[0]);

  return {
    id: "AL99DEMO",
    name: "DEMO",
    basin: "AL",
    classification: "HU",
    currentLat: 19.0,
    currentLng: -72.0,
    currentWindKt: 100,
    currentPressureMb: 950,
    movement: "NW at 14 kt",
    advisoryTime: new Date(nowMs).toISOString(),
    forecastTrack: forecast,
    bestTrack,
    cone: { type: "Polygon", coordinates: [coneCoords] },
  };
}
