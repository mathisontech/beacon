// Region router — picks the authoritative quake feed for a volcano.
//
// The first source whose bounding box contains (lat, lng) wins.
// USGS is the global fallback so any point on Earth resolves to a
// source.
//
// When adding a new regional observatory: create a file in
// ./sources, export a `QuakeSource`, and prepend it to `REGIONAL`
// here (earlier in the list = higher priority if boxes overlap).

import type { QuakeSource } from "./types";
import { usgs } from "./sources/usgs";
import { ingv } from "./sources/ingv";
import { geonet } from "./sources/geonet";
import { ipgp } from "./sources/ipgp";
import { emsc } from "./sources/emsc";
import { bmkg } from "./sources/bmkg";
import { geofon } from "./sources/geofon";

// OVSICORI pulled in C1.8c.6 and CSN pulled in C1.8c.7 — neither
// exposes a reachable FDSN event service under the URL I guessed.
// See OBSERVATORIES.md for current status and fallback paths.

const REGIONAL: QuakeSource[] = [ingv, geonet, ipgp, bmkg, emsc, geofon];

export function pickSource(lat: number, lng: number): QuakeSource {
  for (const s of REGIONAL) {
    if (s.covers(lat, lng)) return s;
  }
  return usgs;
}

export const ALL_SOURCES: QuakeSource[] = [usgs, ...REGIONAL];
