// CSN — Centro Sismológico Nacional, Universidad de Chile.
//
// Authoritative seismic catalog for Chile. Covers Villarrica,
// Nevados de Chillán, Copahue, Llaima, Puyehue-Cordón Caulle,
// Calbuco, Chaitén, Lascar, Lonquimay, Osorno, Cerro Hudson,
// Planchón-Peteroa, Nevado Tres Cruces, Ojos del Salado, San José,
// Tupungatito, Michinmahuida, and the rest of the Southern Andes
// volcanic arc.
//
// Docs: http://evtdb.csn.uchile.cl/fdsnws/event/1/

import type { QuakeSource } from "../types";
import { fetchFdsnText } from "../fdsn-text";

export const csn: QuakeSource = {
  id: "csn",
  name: "CSN Chile",
  operatorUrl: "https://www.csn.uchile.cl/",
  covers(lat, lng) {
    // Mainland Chile + near-offshore trench. Excludes Easter Island
    // (far off the coast) which would fall through to USGS.
    return lat >= -56 && lat <= -17 && lng >= -76 && lng <= -66;
  },
  async fetch(params, signal) {
    return fetchFdsnText(
      "http://evtdb.csn.uchile.cl/fdsnws/event/1/query",
      "CSN Chile",
      params,
      signal,
    );
  },
};
