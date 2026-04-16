// Open-Meteo forecast API.
// Licensed CC-BY 4.0 — free for commercial use with attribution
// ("Weather data by Open-Meteo.com"). No API key required.
//
// Docs: https://open-meteo.com/en/docs

import type { WeatherSample } from "./types";

const BASE = "https://api.open-meteo.com/v1/forecast";

export interface OpenMeteoQuery {
  lat: number;
  lng: number;
  /** Hours ahead from "now" (0 → current, 120 → +5 days). */
  hoursAhead?: number;
}

interface OpenMeteoResponse {
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    relativehumidity_2m?: number[];
    precipitation?: number[];
    cloudcover?: number[];
    surface_pressure?: number[];
    windspeed_10m?: number[];
    winddirection_10m?: number[];
  };
}

/**
 * Fetch a single forecast sample at the given point and hour offset.
 * hoursAhead is clamped to [0, 168] (7-day forecast limit).
 */
export async function fetchForecastSample(q: OpenMeteoQuery): Promise<WeatherSample | null> {
  const hoursAhead = Math.min(168, Math.max(0, Math.round(q.hoursAhead ?? 0)));
  const params = new URLSearchParams({
    latitude: q.lat.toFixed(4),
    longitude: q.lng.toFixed(4),
    hourly: [
      "temperature_2m",
      "relativehumidity_2m",
      "precipitation",
      "cloudcover",
      "surface_pressure",
      "windspeed_10m",
      "winddirection_10m",
    ].join(","),
    forecast_days: "7",
    timezone: "UTC",
  });

  const res = await fetch(`${BASE}?${params.toString()}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = (await res.json()) as OpenMeteoResponse;
  const h = data.hourly;
  if (!h?.time || h.time.length === 0) return null;

  const now = new Date();
  const targetTs = now.getTime() + hoursAhead * 3600_000;
  let bestIdx = 0;
  let bestDelta = Infinity;
  for (let i = 0; i < h.time.length; i++) {
    const t = Date.parse(h.time[i] + "Z");
    const delta = Math.abs(t - targetTs);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIdx = i;
    }
  }

  return {
    lat: q.lat,
    lng: q.lng,
    time: new Date(Date.parse(h.time[bestIdx] + "Z")).toISOString(),
    temperatureC: h.temperature_2m?.[bestIdx],
    humidityPct: h.relativehumidity_2m?.[bestIdx],
    precipitationMmH: h.precipitation?.[bestIdx],
    cloudCoverPct: h.cloudcover?.[bestIdx],
    pressureMb: h.surface_pressure?.[bestIdx],
    windSpeedMs: h.windspeed_10m?.[bestIdx] != null
      ? h.windspeed_10m[bestIdx] / 3.6  // API returns km/h; convert to m/s
      : undefined,
    windDirectionDeg: h.winddirection_10m?.[bestIdx],
  };
}

/**
 * Fetch a grid of forecast samples in ONE batched HTTP request. Open-Meteo
 * supports comma-separated lat/lng lists (up to ~1000 points). Used for
 * cloud-cover / wind / temperature heatmap overlays.
 */
export async function fetchForecastGrid(opts: {
  bbox: [number, number, number, number]; // [west, south, east, north]
  cols: number;
  rows: number;
  hoursAhead: number;
}): Promise<WeatherSample[]> {
  const [w, s, e, n] = opts.bbox;
  const cols = Math.max(2, Math.min(60, opts.cols));
  const rows = Math.max(2, Math.min(30, opts.rows));

  const lats: number[] = [];
  const lngs: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      lats.push(s + ((n - s) * (r + 0.5)) / rows);
      lngs.push(w + ((e - w) * (c + 0.5)) / cols);
    }
  }

  const hoursAhead = Math.min(168, Math.max(0, Math.round(opts.hoursAhead)));
  const params = new URLSearchParams({
    latitude: lats.map((v) => v.toFixed(3)).join(","),
    longitude: lngs.map((v) => v.toFixed(3)).join(","),
    hourly: [
      "temperature_2m",
      "precipitation",
      "cloudcover",
      "windspeed_10m",
      "winddirection_10m",
    ].join(","),
    forecast_days: "7",
    timezone: "UTC",
  });

  const res = await fetch(`${BASE}?${params.toString()}`, {
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Open-Meteo grid ${res.status}`);
  // Open-Meteo returns an ARRAY of responses when multiple coords are passed.
  const data = (await res.json()) as
    | OpenMeteoResponse
    | (OpenMeteoResponse & { latitude: number; longitude: number })[];
  const arr = Array.isArray(data) ? data : [data];

  const out: WeatherSample[] = [];
  const now = Date.now();
  const targetTs = now + hoursAhead * 3600_000;

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i] as OpenMeteoResponse & { latitude?: number; longitude?: number };
    const h = item.hourly;
    if (!h?.time || h.time.length === 0) continue;

    let bestIdx = 0;
    let bestDelta = Infinity;
    for (let k = 0; k < h.time.length; k++) {
      const t = Date.parse(h.time[k] + "Z");
      const d = Math.abs(t - targetTs);
      if (d < bestDelta) {
        bestDelta = d;
        bestIdx = k;
      }
    }
    out.push({
      lat: item.latitude ?? lats[i],
      lng: item.longitude ?? lngs[i],
      time: new Date(Date.parse(h.time[bestIdx] + "Z")).toISOString(),
      temperatureC: h.temperature_2m?.[bestIdx],
      precipitationMmH: h.precipitation?.[bestIdx],
      cloudCoverPct: h.cloudcover?.[bestIdx],
      windSpeedMs:
        h.windspeed_10m?.[bestIdx] != null ? h.windspeed_10m[bestIdx] / 3.6 : undefined,
      windDirectionDeg: h.winddirection_10m?.[bestIdx],
    });
  }
  return out;
}
