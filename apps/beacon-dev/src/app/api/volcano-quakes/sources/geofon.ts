// DEPRECATED — GEOFON was pulled in C1.8c.9.
//
// Endpoint is live (https://geofon.gfz-potsdam.de/fdsnws/event/1/query
// returns 200 for Aegean M4+ queries; sandbox-verified a real M4.17
// at Dodecanese Islands). But GEOFON's catalog is a global M~4.5+
// reference catalog by design — it contains zero small quakes at
// Icelandic volcanoes, so Katla / Hekla / Grímsvötn M0+ queries
// return 204 No Content.
//
// For bradyseismic monitoring (the whole point of this router)
// GEOFON cannot do better than USGS, because the events we care
// about (M0-M3 swarms) simply are not in the catalog. Extending the
// bbox to the African Rift would hit the same problem.
//
// Iceland now falls through to USGS. Follow-up paths if we want
// better Iceland coverage:
//   - IMO (api.vedur.is/skjalftalisa/v1/quake/array) — Icelandic
//     Met Office. Returns JSON array, shape not yet mapped.
//   - ISK network via IRIS federator.
//   - GEOFON with a much lower magnitude floor once we verify they
//     even expose sub-M4 events (they probably don't).
//
// Source file is kept as this stub so router edits stay visible
// in the git history.

export {};
