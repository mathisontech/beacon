// EMSC — European-Mediterranean Seismological Centre.
//
// A regional aggregator that covers the Mediterranean, Atlantic
// islands, and surrounding seas. For volcanoes it is the best
// non-national source for:
//   - Greek volcanoes: Santorini, Nisyros, Methana, Milos
//   - Azores: Pico, Fogo–Congro, Sete Cidades, Furnas, Faial
//   - Canary Islands: Teide, Cumbre Vieja, El Hierro
//   - Madeira
// Italy is claimed first by INGV; anything outside the INGV box
// in the Mediterranean / Atlantic island region falls through
// to EMSC before USGS.
//
// Docs: https://www.seismicportal.eu/fdsnws/event/1/

import type { QuakeSource } from "../types";
import { fetchFdsnText } from "../fdsn-text";

function inBox(lat: number, lng: number, box: [number, number, number, number]): boolean {
  return lat >= box[0] && lat <= box[1] && lng >= box[2] && lng <= box[3];
}

// [minLat, maxLat, minLng, maxLng]
const AEGEAN: [number, number, number, number] = [34, 42, 19, 30];
const AZORES: [number, number, number, number] = [36.5, 40.0, -32, -24];
const CANARIES: [number, number, number, number] = [27, 30, -19, -13];
const MADEIRA: [number, number, number, number] = [32, 34, -17.5, -16];

export const emsc: QuakeSource = {
  id: "emsc",
  name: "EMSC",
  operatorUrl: "https://www.emsc-csem.org/",
  covers(lat, lng) {
    return (
      inBox(lat, lng, AEGEAN) ||
      inBox(lat, lng, AZORES) ||
      inBox(lat, lng, CANARIES) ||
      inBox(lat, lng, MADEIRA)
    );
  },
  async fetch(params, signal) {
    return fetchFdsnText(
      "https://www.seismicportal.eu/fdsnws/event/1/query",
      "EMSC",
      params,
      signal,
    );
  },
};
