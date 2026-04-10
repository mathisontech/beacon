// INGV — Istituto Nazionale di Geofisica e Vulcanologia (Italy).
//
// Covers Italy + surrounding seas. This is the authoritative feed
// for Campi Flegrei, Vesuvius, Etna, Stromboli, Vulcano, Ischia,
// Pantelleria, Colli Albani, Marsili, and the Aeolian Islands.
//
// Docs: https://webservices.ingv.it/fdsnws/event/1/

import type { QuakeSource } from "../types";
import { fetchFdsnText } from "../fdsn-text";

export const ingv: QuakeSource = {
  id: "ingv",
  name: "INGV",
  operatorUrl: "https://terremoti.ingv.it/en",
  covers(lat, lng) {
    return lat >= 35 && lat <= 48 && lng >= 6 && lng <= 20;
  },
  async fetch(params, signal) {
    return fetchFdsnText(
      "https://webservices.ingv.it/fdsnws/event/1/query",
      "INGV",
      params,
      signal,
    );
  },
};
