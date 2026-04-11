// GEOFON — GFZ Potsdam global seismic network.
//
// GEOFON runs a long-standing FDSN event service and is one of the
// reference European-operated global catalogs. It is strongest for
// M4.5+ events globally, and for European / Mediterranean / North
// Atlantic regions where the GEOFON station density is high.
//
// In the Beacon router we use GEOFON to fill the Iceland gap: Katla,
// Hekla, Grímsvötn, Eyjafjallajökull, Bárðarbunga, Askja. The
// Icelandic Met Office does not expose a public FDSN event service,
// and USGS misses most small Icelandic quakes. GEOFON is the best
// realistic fallback here because GFZ participates in the Nordic
// monitoring networks.
//
// Bounding box is Iceland-only in this pass; if the endpoint verifies
// we can extend to the African Rift (Nyiragongo, Erta Ale, Ol Doinyo
// Lengai) in a follow-up pass.
//
// Docs: https://geofon.gfz-potsdam.de/waveform/archive/
// FDSN:  https://geofon.gfz-potsdam.de/fdsnws/event/1/

import type { QuakeSource } from "../types";
import { fetchFdsnText } from "../fdsn-text";

export const geofon: QuakeSource = {
  id: "geofon",
  name: "GEOFON",
  operatorUrl: "https://geofon.gfz-potsdam.de/",
  covers(lat, lng) {
    // Iceland bounding box.
    return lat >= 63 && lat <= 67 && lng >= -25 && lng <= -13;
  },
  async fetch(params, signal) {
    return fetchFdsnText(
      "https://geofon.gfz-potsdam.de/fdsnws/event/1/query",
      "GEOFON",
      params,
      signal,
    );
  },
};
