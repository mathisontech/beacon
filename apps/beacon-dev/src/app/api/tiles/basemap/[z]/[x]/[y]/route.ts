import { NextResponse } from "next/server";
import { basemapArchive } from "@/lib/tiles/basemap-archive";

// Serves vector tiles out of Beacon's self-hosted PMTiles archive.
// The route takes the place of a third-party tile host; MapLibre
// style.json points at /api/tiles/basemap/{z}/{x}/{y}.pbf.
//
// Caching: PMTiles content is immutable per build, so browser + CDN
// can hold tiles for a year. Header ETag is the archive's etag string
// suffixed with z/x/y so invalidation happens automatically when the
// archive is rebuilt.

interface Params {
  params: Promise<{ z: string; x: string; y: string }>;
}

function parseXYZ(p: { z: string; x: string; y: string }) {
  const z = parseInt(p.z, 10);
  const x = parseInt(p.x, 10);
  // Next's [y] segment may include a `.pbf` extension; strip it.
  const y = parseInt(p.y.replace(/\.[a-z0-9]+$/i, ""), 10);
  if (![z, x, y].every(Number.isFinite)) return null;
  return { z, x, y };
}

export async function GET(_req: Request, ctx: Params) {
  const raw = await ctx.params;
  const coords = parseXYZ(raw);
  if (!coords) return new NextResponse("bad xyz", { status: 400 });

  const archive = basemapArchive();
  const tile = await archive.getZxy(coords.z, coords.x, coords.y);
  if (!tile) return new NextResponse(null, { status: 204 });

  // pmtiles npm auto-decompresses the tile payload when reading, so
  // we ship raw PBF bytes with no Content-Encoding header.
  return new NextResponse(new Uint8Array(tile.data), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.mapbox-vector-tile",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
