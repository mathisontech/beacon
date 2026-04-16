import { NextResponse } from "next/server";
import {
  fetchHurricanesWithForecast,
  fetchGdacsCyclones,
  type HurricaneStorm,
} from "@beacon/data-sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Merge NHC + GDACS cyclones. Dedupe by approximate position (within 2° lat/lng)
 * keeping the NHC record when both provide the same storm, because NHC has
 * richer cone/track geometry in its AOR.
 */
function dedupe(storms: HurricaneStorm[]): HurricaneStorm[] {
  const seen: HurricaneStorm[] = [];
  for (const s of storms) {
    const dup = seen.find(
      (x) =>
        Math.abs(x.currentLat - s.currentLat) < 2 &&
        Math.abs(x.currentLng - s.currentLng) < 2,
    );
    if (!dup) seen.push(s);
  }
  return seen;
}

export async function GET() {
  const results = await Promise.allSettled([
    fetchHurricanesWithForecast(),
    fetchGdacsCyclones(),
  ]);

  const combined: HurricaneStorm[] = [];
  const errors: string[] = [];

  if (results[0].status === "fulfilled") combined.push(...results[0].value);
  else errors.push(`NHC: ${String(results[0].reason)}`);

  if (results[1].status === "fulfilled") combined.push(...results[1].value);
  else errors.push(`GDACS: ${String(results[1].reason)}`);

  const storms = dedupe(combined);

  return NextResponse.json(
    { storms, errors, fetchedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
