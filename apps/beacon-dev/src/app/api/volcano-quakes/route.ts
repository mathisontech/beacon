import { NextResponse } from "next/server";
import { pickSource } from "./router";
import type { QuakeFetchResult } from "./types";

// Thin GET handler. Parses query params, dispatches to the router,
// returns the normalized Quake list. All feed-specific logic lives
// in ./sources and ./router.

export const dynamic = "force-dynamic";

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

  const source = pickSource(lat, lng);
  try {
    const quakes = await source.fetch({ lat, lng, radiusKm, days, minMag });
    const body: QuakeFetchResult = {
      at: Date.now(),
      center: { lat, lng },
      radiusKm,
      days,
      source: { id: source.id, name: source.name, url: source.operatorUrl },
      count: quakes.length,
      quakes,
    };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch failed" },
      { status: 502 },
    );
  }
}
