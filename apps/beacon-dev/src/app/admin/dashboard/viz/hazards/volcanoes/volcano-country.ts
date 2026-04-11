import type { Volcano } from "./types";
import { ALL_VOLCANOES } from "./all-volcanoes";

// Map the free-text `region` string on each volcano to a canonical
// country name. The region field is formatted either as
// "<subregion>, <country>" (most globals) or as a US state / territory
// (the volcano-data.ts entries). This function covers both shapes.
//
// Returns "Unknown" for anything we haven't explicitly mapped — that
// lets us surface gaps in the Data Manager UI.

const US_REGIONS = new Set([
  "Hawaiʻi",
  "Maui, Hawaiʻi",
  "Wyoming",
  "California",
  "Oregon",
  "Washington",
  "Aleutians, AK",
  "AK Peninsula",
  "Aleutians, AK (submarine)",
  "Cook Inlet, AK",
  "Mariana Islands",
  "Northern Marianas",
  "American Samoa",
]);

// Some globals carry only a country name (no subregion).
const COUNTRY_ONLY = new Set([
  "Cameroon",
  "Cape Verde",
  "Costa Rica",
  "El Salvador",
  "Grande Comore",
  "Guadeloupe",
  "Guatemala",
  "Martinique",
  "Montserrat",
  "Nicaragua",
  "Panama",
  "Reunion",
  "Saint Helena",
  "Saint Lucia",
  "Saint Vincent",
  "Tristan da Cunha",
]);

// A few region strings that need explicit overrides because their
// suffix isn't the country name.
const SPECIAL: Record<string, string> = {
  "La Palma, Canary": "Spain",
  "Canary Islands": "Spain",
  "Azores": "Portugal",
  "Sicily, Italy": "Italy",
  "Grenada (submarine)": "Grenada",
};

export function countryForRegion(region: string): string {
  if (SPECIAL[region]) return SPECIAL[region];
  if (US_REGIONS.has(region)) return "United States";
  if (COUNTRY_ONLY.has(region)) return region;
  // Fall back to the last comma-separated segment.
  const parts = region.split(",").map((s) => s.trim());
  const tail = parts[parts.length - 1];
  if (!tail) return "Unknown";
  // Normalize a few common abbreviations.
  if (tail === "AK") return "United States";
  if (tail === "NZ") return "New Zealand";
  if (tail === "PNG") return "Papua New Guinea";
  return tail;
}

export interface NationBucket {
  name: string;
  volcanoes: Volcano[];
}

// Build one bucket per country, sorted by volcano count descending
// then alphabetically. Used by the Data Manager nation tab strip.
export function bucketVolcanoesByNation(): NationBucket[] {
  const map = new Map<string, Volcano[]>();
  for (const v of ALL_VOLCANOES) {
    const country = countryForRegion(v.region);
    const list = map.get(country) ?? [];
    list.push(v);
    map.set(country, list);
  }
  const buckets: NationBucket[] = Array.from(map.entries()).map(
    ([name, volcanoes]) => ({
      name,
      volcanoes: volcanoes.slice().sort((a, b) => a.name.localeCompare(b.name)),
    })
  );
  buckets.sort((a, b) => {
    if (b.volcanoes.length !== a.volcanoes.length) {
      return b.volcanoes.length - a.volcanoes.length;
    }
    return a.name.localeCompare(b.name);
  });
  return buckets;
}
