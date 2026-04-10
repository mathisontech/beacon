// GeoNet — GNS Science (New Zealand).
//
// Covers the NZ mainland, offshore, and the Kermadec Arc. This is
// the authoritative feed for Whakaari/White Island, Ruapehu,
// Tongariro, Ngauruhoe, Taupo, Raoul Island, Tarawera.
//
// Docs: https://www.geonet.org.nz/data/types/eq_catalogue

import type { QuakeSource } from "../types";
import { fetchFdsnText } from "../fdsn-text";

export const geonet: QuakeSource = {
  id: "geonet",
  name: "GeoNet",
  operatorUrl: "https://www.geonet.org.nz/",
  covers(lat, lng) {
    // NZ main islands + Kermadec Arc north to Raoul Island.
    return lat >= -48 && lat <= -25 && lng >= 163 && lng <= 182;
  },
  async fetch(params, signal) {
    return fetchFdsnText(
      "https://service.geonet.org.nz/fdsnws/event/1/query",
      "GeoNet",
      params,
      signal,
    );
  },
};
