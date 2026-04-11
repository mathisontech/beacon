// BMKG — Badan Meteorologi, Klimatologi, dan Geofisika (Indonesia).
//
// BMKG operates the Indonesian national seismic network and is the
// authoritative source for earthquake catalog data across the
// Indonesian archipelago. It covers every volcano tracked by
// PVMBG: Merapi, Semeru, Sinabung, Krakatau, Anak Krakatau,
// Agung, Kerinci, Dukono, Ibu, Karangetang, Lokon-Empung, Ruang,
// Soputan, Tangkuban Parahu, Gamalama, Slamet, Lewotobi, Lewotolok,
// Ili Lewotolok, Raung, Bromo, Papandayan, and the rest of the
// Sunda Arc + Banda Arc + Halmahera Arc volcanoes.
//
// Note: PVMBG is the volcano observatory (alert levels, visual
// observations, tremor); BMKG is the seismic catalog. For raw quake
// data BMKG is the right source.
//
// Docs: http://geof.bmkg.go.id/fdsnws/event/1/

import type { QuakeSource } from "../types";
import { fetchFdsnText } from "../fdsn-text";

export const bmkg: QuakeSource = {
  id: "bmkg",
  name: "BMKG",
  operatorUrl: "https://www.bmkg.go.id/",
  covers(lat, lng) {
    // Indonesian archipelago bounding box.
    return lat >= -11 && lat <= 6 && lng >= 94 && lng <= 142;
  },
  async fetch(params, signal) {
    return fetchFdsnText(
      "http://geof.bmkg.go.id/fdsnws/event/1/query",
      "BMKG",
      params,
      signal,
    );
  },
};
