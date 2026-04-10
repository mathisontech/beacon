import { NextResponse } from "next/server";

// Proxies the USGS FDSN earthquake catalog. We proxy server-side so
// the client doesn't need to worry about CORS or API shape changes.
//
// Usage: /api/volcano-quakes?lat=19.4&lng=-155.28&radiusKm=20&days=30&minMag=0
//
// USGS docs: https://earthquake.usgs.gov/fdsnws/event/1/

export const dynamic = "force-dynamic";

type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
    type: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
};

type UsgsFeed = {
  features: UsgsFeature[];
};

export interface VolcanoQuake {
  id: string;
  mag: number | null;
  place: string | null;
  time: number;
  depthKm: number;
  lat: number;
  lng: number;
  url: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const radiusKm = Number(url.searchParams.get("radiusKm") ?? "20");
  const days = Number(url.searchParams.get("days") ?? "30");
  const minMag = Number(url.searchParams.get("minMag") ?? "0");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const startTime = start.toISOString().slice(0, 10);

  const qs = new URLSearchParams({
    format: "geojson",
    latitude: String(lat),
    longitude: String(lng),
    maxradiuskm: String(radiusKm),
    starttime: startTime,
    minmagnitude: String(minMag),
    orderby: "time",
  });

  const endpoint = `https://earthquake.usgs.gov/fdsnws/event/1/query?${qs.toString()}`;

  try {
    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `USGS ${res.status}` },
        { status: 502 }
      );
    }
    const data = (await res.json()) as UsgsFeed;
    const quakes: VolcanoQuake[] = data.features.map((f) => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      depthKm: f.geometry.coordinates[2] ?? 0,
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      url: f.properties.url,
    }));

    return NextResponse.json({
      at: Date.now(),
      center: { lat, lng },
      radiusKm,
      days,
      count: quakes.length,
      quakes,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch failed" },
      { status: 502 }
    );
  }
}
