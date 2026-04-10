# @beacon/data-sources

Central registry of every external feed. One file per source so the list is easy to audit.

## Scope

- `src/natural/` — GDACS, USGS, EMSC, JMA, NWS, GloFAS, EFAS, Smithsonian GVP, etc.
- `src/human/` — ACLED, FEWS NET, IPC, WHO DON, CDC HAN/NWSS, NSOPW, Amber
- `src/volcano/` — INGV, PHIVOLCS, PVMBG, OVSICORI, IGEPN, CENAPRED, KVERT, deformation (Sentinel-1, COMET LiCSAR, Nevada Geodetic Lab)
- `src/cameras/` — live webcams (Iceland IMO, GeoNet NZ, Campi Flegrei Solfatara, etc.)
- `src/travel/` — US State Dept, UK FCDO, Smartraveller AU, Canada Global Affairs

Each source file exports: `{ id, name, category, pollIntervalMs, fetch(): Promise<RawEvent[]> }`.
