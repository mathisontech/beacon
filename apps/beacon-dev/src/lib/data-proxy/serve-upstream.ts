import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Shared helper for "pull a static upstream dataset through Beacon,
// cache it on disk, and serve it with strong browser + CDN caching."
//
// On first hit: fetch, persist to .cache/data/<key>, compute ETag.
// On every hit: serve from disk with Cache-Control that lets the
// browser skip re-asking for a long time; refresh in the background
// when older than `staleAfterMs`.
//
// Keeps beacon in full control of what clients see — upstream outages
// don't break the map, and volcano / country data isn't re-pulled
// across every page load.

export interface UpstreamSpec {
  key: string; // filesystem-safe cache key
  url: string;
  contentType: string;
  // Browser cache (seconds). Volcanoes / borders barely ever change.
  maxAge?: number;
  // Server-side freshness window (ms). After this, a background
  // re-fetch runs while we still serve the cached copy.
  staleAfterMs?: number;
}

const CACHE_ROOT = path.join(process.cwd(), ".cache", "data");

async function ensureRoot() {
  await fs.mkdir(CACHE_ROOT, { recursive: true });
}

function cachePath(key: string) {
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(CACHE_ROOT, safe);
}

async function readMeta(p: string) {
  try {
    const raw = await fs.readFile(`${p}.meta.json`, "utf8");
    return JSON.parse(raw) as { etag: string; fetchedAt: number };
  } catch {
    return null;
  }
}

async function writeAll(p: string, body: Buffer) {
  const etag = `"${crypto.createHash("sha1").update(body).digest("hex")}"`;
  await fs.writeFile(p, body);
  await fs.writeFile(
    `${p}.meta.json`,
    JSON.stringify({ etag, fetchedAt: Date.now() })
  );
  return etag;
}

async function refetch(spec: UpstreamSpec) {
  const p = cachePath(spec.key);
  const res = await fetch(spec.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`upstream ${spec.url} failed: ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  await ensureRoot();
  return { body, etag: await writeAll(p, body) };
}

// Background refresh without blocking the response.
let refreshing: Record<string, Promise<unknown> | undefined> = {};
function refreshInBackground(spec: UpstreamSpec) {
  if (refreshing[spec.key]) return;
  refreshing[spec.key] = refetch(spec)
    .catch((err) => console.warn(`bg refresh ${spec.key} failed:`, err))
    .finally(() => {
      refreshing = { ...refreshing, [spec.key]: undefined };
    });
}

export async function serveUpstream(spec: UpstreamSpec, req: Request) {
  const p = cachePath(spec.key);
  const maxAge = spec.maxAge ?? 60 * 60 * 24; // 1 day default
  const staleAfterMs = spec.staleAfterMs ?? 1000 * 60 * 60 * 24 * 7; // 7d

  let body: Buffer | null = null;
  let etag = "";

  const meta = await readMeta(p);
  if (meta) {
    try {
      body = await fs.readFile(p);
      etag = meta.etag;
      if (Date.now() - meta.fetchedAt > staleAfterMs) {
        refreshInBackground(spec);
      }
    } catch {
      body = null;
    }
  }

  if (!body) {
    const fetched = await refetch(spec);
    body = fetched.body;
    etag = fetched.etag;
  }

  // Handle conditional request.
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=86400, immutable`,
      },
    });
  }

  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": spec.contentType,
      ETag: etag,
      "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=86400`,
    },
  });
}
