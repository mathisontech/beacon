// USGS FDSN — global fallback.
//
// Keeps the original geojson path (USGS publishes event URLs in the
// feed which the text format drops). Covers everywhere and is the
// default when no regional observatory claims the bounding box.
//
// Docs: https://earthquake.usgs.gov/fdsnws/event/1/

import type { Quake, QuakeSource } from "../types";

type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
    type: string;
  };
  geometry: { type: "Point"; coordinates: [number, number, number] };
};

type UsgsFeed = { features: UsgsFeature[] };

export const usgs: QuakeSource = {
  id: "usgs",
  name: "USGS",
  operatorUrl: "https://earthquake.usgs.gov/",
  covers() {
    return true;
  },
  async fetch(params, signal) {
    const start = new Date(Date.now() - params.days * 86_400_000);
    const qs = new URLSearchParams({
      format: "geojson",
      latitude: String(params.lat),
      longitude: String(params.lng),
      maxradiuskm: String(params.radiusKm),
      starttime: start.toISOString().slice(0, 10),
      minmagnitude: String(params.minMag),
      orderby: "time",
    });
    const res = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?${qs.toString()}`,
      { headers: { Accept: "application/json" }, cache: "no-store", signal },
    );
    if (!res.ok) throw new Error(`USGS ${res.status}`);
    const data = (await res.json()) as UsgsFeed;
    const quakes: Quake[] = data.features.map((f) => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      depthKm: f.geometry.coordinates[2] ?? 0,
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      url: f.properties.url,
      source: "USGS",
    }));
    return quakes;
  },
};
