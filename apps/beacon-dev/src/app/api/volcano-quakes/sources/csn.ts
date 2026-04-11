// DEPRECATED — CSN Chile is not currently wired into the router.
//
// The guessed endpoint `http://evtdb.csn.uchile.cl/fdsnws/event/1/`
// redirects HTTP -> HTTPS, and the HTTPS target serves the CSN
// website HTML rather than an FDSN event service. CSN may have
// retired the subdomain or never exposed FDSN publicly.
//
// Alternatives to investigate:
//  1. IRIS/EarthScope federator — includes CSN's C1 network.
//     `https://service.iris.edu/fdsnws/event/1/query` with a
//     catalog filter. Could be wired in as a CSN proxy.
//  2. GEOFON/GFZ secondary feed — picks up larger Chilean events.
//  3. sismologia.cl / www.csn.uchile.cl — HTML daily bulletin,
//     would need scraping.
//
// Until one of the above is implemented, Chilean volcanoes fall
// through to the USGS global catalog.

export {};
