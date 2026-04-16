import type { Volcano } from "./types";
import { ALL_VOLCANOES } from "./all-volcanoes";

// PLACEHOLDER DATA.
// The real "volcanoes of interest" decision pipeline lives downstream in
// the Volcano Status Overview Manager (sidebar: Volcanoes > Volcano Status
// Overview Manager). It will fuse eruption state, population/human-risk
// exposure, and live evacuation data to produce this list automatically.
// For now this file is hand-curated so the UI Manager map has something
// meaningful to open to.

export type OfInterestReason = "erupting" | "high-risk" | "evacuation";

interface OfInterestSeed {
  volcanoId: string;
  reasons: OfInterestReason[];
  note?: string;
}

const SEED: OfInterestSeed[] = [
  { volcanoId: "kilauea",      reasons: ["erupting", "high-risk"],    note: "Halemaʻumaʻu lava lake activity" },
  { volcanoId: "mauna-loa",    reasons: ["high-risk"],                note: "Large downslope population" },
  { volcanoId: "fuego",        reasons: ["erupting", "high-risk"],    note: "Persistent eruption, communities on the flanks" },
  { volcanoId: "stromboli",    reasons: ["erupting"],                 note: "Persistent Strombolian activity" },
  { volcanoId: "etna",         reasons: ["erupting"],                 note: "Summit crater activity" },
  { volcanoId: "sakurajima",   reasons: ["erupting", "high-risk"],    note: "Persistent, Kagoshima downwind" },
  { volcanoId: "merapi",       reasons: ["erupting", "high-risk"],    note: "Dome growth, Yogyakarta exposed" },
  { volcanoId: "semeru",       reasons: ["erupting", "evacuation"],   note: "Pyroclastic flows, villages evacuating" },
  { volcanoId: "popocatepetl", reasons: ["high-risk"],                note: "Mexico City region exposure" },
  { volcanoId: "taal",         reasons: ["high-risk", "evacuation"],  note: "Lake crater, Batangas evacuation zones" },
  { volcanoId: "lewotobi",     reasons: ["erupting", "evacuation"],   note: "Ongoing eruption, Flores evacuation" },
];

export interface OfInterestEntry {
  volcano: Volcano;
  reasons: OfInterestReason[];
  note?: string;
}

// Returns the curated list joined against ALL_VOLCANOES so each entry has
// its full Volcano record. Unknown IDs are silently dropped.
export function getVolcanoesOfInterest(): OfInterestEntry[] {
  const byId = new Map(ALL_VOLCANOES.map((v) => [v.id, v]));
  const out: OfInterestEntry[] = [];
  for (const s of SEED) {
    const v = byId.get(s.volcanoId);
    if (v) out.push({ volcano: v, reasons: s.reasons, note: s.note });
  }
  return out;
}

// Set of volcano IDs currently marked as having an ongoing evacuation.
// Drives the "E" badge in the corner of a pin.
export function getEvacuationIds(): Set<string> {
  return new Set(
    SEED.filter((s) => s.reasons.includes("evacuation")).map((s) => s.volcanoId)
  );
}

export const REASON_LABEL: Record<OfInterestReason, string> = {
  erupting: "Erupting",
  "high-risk": "High human risk",
  evacuation: "Evacuation ongoing",
};
