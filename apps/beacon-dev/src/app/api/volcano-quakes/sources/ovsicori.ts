// DEPRECATED — OVSICORI is not currently wired into the router.
//
// The guessed FDSN endpoint (sdb.ovsicori.una.ac.cr) does not
// resolve. OVSICORI publishes weekly bulletins and alert levels
// at https://www.ovsicori.una.ac.cr/ but does not expose a
// machine-readable FDSN event service.
//
// Options for future implementation:
//  1. Scrape the weekly bulletin PDFs and extract quake counts
//     per volcano (coarse, not per-event).
//  2. Use INETER Nicaragua's cross-border catalog for the far-north
//     Costa Rican volcanoes if it extends south.
//  3. Fall back to USGS for Costa Rican volcanoes (current state
//     after pulling this source from the router).
//
// Until one of the above is implemented, Costa Rica falls through
// to the USGS global catalog like any other uncovered region.

export {};
