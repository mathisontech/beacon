// Shared helper for FDSN `format=text` endpoints.
//
// The FDSN event webservice spec is implemented by most regional
// seismic observatories (INGV, GeoNet, IPGP, IRIS, etc.). The `text`
// format is a pipe-delimited table that is identical across servers,
// so this one helper handles all of them with just a base URL swap.
//
// Spec: https://www.fdsn.org/webservices/FDSN-WS-Specifications-1.2.pdf

import type { Quake, QuakeFetchParams } from "./types";

export async function fetchFdsnText(
  baseUrl: string,
  source: string,
  params: QuakeFetchParams,
  signal?: AbortSignal,
): Promise<Quake[]> {
  const start = new Date(Date.now() - params.days * 86_400_000);
  // `maxradius` is in degrees and is the FDSN spec standard.
  // `maxradiuskm` is a USGS extension some servers (EMSC) reject.
  const maxRadiusDeg = params.radiusKm / 111.195;
  const qs = new URLSearchParams({
    format: "text",
    latitude: String(params.lat),
    longitude: String(params.lng),
    maxradius: maxRadiusDeg.toFixed(4),
    starttime: start.toISOString().slice(0, 19),
    minmagnitude: String(params.minMag),
    orderby: "time",
    limit: "500",
  });

  const res = await fetch(`${baseUrl}?${qs.toString()}`, {
    headers: { Accept: "text/plain" },
    cache: "no-store",
    signal,
  });
  if (!res.ok) {
    if (res.status === 204 || res.status === 404) return [];
    throw new Error(`${source} ${res.status}`);
  }
  const body = await res.text();
  return parseFdsnText(body, source);
}

// FDSN text columns (v1.2):
// #EventID|Time|Latitude|Longitude|Depth/km|Author|Catalog|
//   Contributor|ContributorID|MagType|Magnitude|MagAuthor|
//   EventLocationName
export function parseFdsnText(body: string, source: string): Quake[] {
  const out: Quake[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const c = line.split("|");
    if (c.length < 13) continue;
    const time = Date.parse(c[1]);
    const lat = Number(c[2]);
    const lng = Number(c[3]);
    const depth = Number(c[4]);
    const mag = c[10] === "" ? null : Number(c[10]);
    if (!Number.isFinite(time) || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    out.push({
      id: `${source.toLowerCase()}-${c[0]}`,
      mag: mag != null && Number.isFinite(mag) ? mag : null,
      place: c[12] || null,
      time,
      depthKm: Number.isFinite(depth) ? depth : 0,
      lat,
      lng,
      url: "",
      source,
    });
  }
  return out;
}
