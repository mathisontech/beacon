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
import { csn } from "./sources/csn";
import { ovsicori } from "./sources/ovsicori";
import { bmkg } from "./sources/bmkg";

const REGIONAL: QuakeSource[] = [ingv, geonet, ipgp, csn, ovsicori, bmkg, emsc];

export function pickSource(lat: number, lng: number): QuakeSource {
  for (const s of REGIONAL) {
    if (s.covers(lat, lng)) return s;
  }
  return usgs;
}

export const ALL_SOURCES: QuakeSource[] = [usgs, ...REGIONAL];
