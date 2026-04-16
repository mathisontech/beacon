import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import type { Volcano } from "@/app/admin/dashboard/viz/hazards/volcanoes/types";

// Server-cached Smithsonian GVP Holocene list, normalized to Beacon's
// Volcano shape before the browser ever sees it. One upstream hit per
// server start (or per refresh window), not per user session.

const GVP_URL =
  "https://webservices.volcano.si.edu/arcgis/rest/services/GVP_VOTW/MapServer/0/query" +
  "?where=1%3D1&outFields=Volcano_Number,Volcano_Name,Primary_Volcano_Type," +
  "Country,Region,Subregion,Latitude,Longitude,Elevation,Last_Eruption_Year" +
  "&returnGeometry=true&f=geojson&outSR=4326";

const CACHE = path.join(process.cwd(), ".cache", "data", "volcanoes.json");
const CACHE_META = `${CACHE}.meta.json`;
const REFRESH_MS = 1000 * 60 * 60 * 24 * 7; // weekly

interface GvpProps {
  Volcano_Number?: number;
  Volcano_Name?: string;
  Country?: string;
  Region?: string;
  Subregion?: string;
  Latitude?: number;
  Longitude?: number;
  Elevation?: number;
  Last_Eruption_Year?: number | string;
}

function normalize(features: { properties: GvpProps; geometry?: { coordinates?: [number, number] } }[]): Volcano[] {
  const out: Volcano[] = [];
  for (const f of features) {
    const p = f.properties;
    const lat = p.Latitude ?? f.geometry?.coordinates?.[1];
    const lng = p.Longitude ?? f.geometry?.coordinates?.[0];
    if (lat == null || lng == null) continue;
    out.push({
      id: `gvp-${p.Volcano_Number ?? `${lat.toFixed(3)},${lng.toFixed(3)}`}`,
      name: p.Volcano_Name ?? "Unknown",
      region: [p.Region, p.Subregion, p.Country].filter(Boolean).join(" · "),
      lat,
      lng,
      level: "normal",
      elevation_m: p.Elevation ?? 0,
      last_eruption: String(p.Last_Eruption_Year ?? "unknown"),
      obs: "GVP",
    });
  }
  return out;
}

async function refetch(): Promise<{ body: Buffer; etag: string }> {
  const res = await fetch(GVP_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`GVP fetch failed: ${res.status}`);
  const raw = (await res.json()) as { features?: Parameters<typeof normalize>[0] };
  const normalized = normalize(raw.features ?? []);
  const body = Buffer.from(JSON.stringify(normalized));
  const etag = `"${crypto.createHash("sha1").update(body).digest("hex")}"`;
  await fs.mkdir(path.dirname(CACHE), { recursive: true });
  await fs.writeFile(CACHE, body);
  await fs.writeFile(CACHE_META, JSON.stringify({ etag, fetchedAt: Date.now() }));
  return { body, etag };
}

let bgRefresh: Promise<unknown> | null = null;
function backgroundRefresh() {
  if (bgRefresh) return;
  bgRefresh = refetch()
    .catch((e) => console.warn("volcano bg refresh failed:", e))
    .finally(() => { bgRefresh = null; });
}

export async function GET(req: Request) {
  let body: Buffer | null = null;
  let etag = "";
  try {
    const meta = JSON.parse(await fs.readFile(CACHE_META, "utf8")) as { etag: string; fetchedAt: number };
    body = await fs.readFile(CACHE);
    etag = meta.etag;
    if (Date.now() - meta.fetchedAt > REFRESH_MS) backgroundRefresh();
  } catch {
    const fresh = await refetch();
    body = fresh.body;
    etag = fresh.etag;
  }

  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
      },
    });
  }

  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ETag: etag,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
}
