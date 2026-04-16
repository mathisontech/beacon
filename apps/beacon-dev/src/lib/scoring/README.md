# Heuristic scoring — spec

On-device fallback below CASCADE surrogates. Phone-computable from cached basemap tiles, no connectivity required.

Two functions per hazard:
- `safetyScore(cell) -> 0..1` — static pre-event suitability of a location as a refuge for that hazard class.
- `hazardScore(cell, event) -> 0..1` — live intensity estimate given an active event.

Action layer (shared): `advice = f(safetyScore, hazardScore, distanceToSafer)` → {shelter, move, evacuate}.

## Shared cell inputs (from basemap tiles)

- `elev_m` Copernicus GLO-30
- `slope_deg`, `aspect_deg` derived from GLO-30
- `tpi` topographic position index (cell − mean of 300 m ring)
- `hand_m` height above nearest drainage (HydroSHEDS)
- `landcover` ESA WorldCover class
- `nonburnable_frac` pavement+sand+water+bare fraction from WorldCover
- `fuel_fm40` LANDFIRE US, WorldCover→FM40 LUT global
- `canopy_h_m` Potapov 30 m global
- `bldg_h_m` WSF-3D / Overture
- `bldg_density` footprint area / cell area
- `dist_road_m`, `dist_water_m`, `dist_coast_m`
- `fault_dist_m`, `volcano_dist_m`
- `shake_vs30` USGS global Vs30 proxy
- `flood_fema_class` US only; global fallback: HAND threshold
- `popdens` GHS-POP

All scores clamped [0,1]. Weights are defaults — calibrated per-region later.

## Files

- `wildfire.md` — fire safety + fire hazard
- `flood.md` — flash flood
- `earthquake.md` — shaking + structural
- `tsunami.md` — coastal inundation
- `hurricane.md` — wind + surge
- `smoke.md` — PM2.5 intrusion
- `volcano.md` — proximity + ashfall

- `common.ts` — shared primitives (normalize, clamp, sigmoid, ring-mean).
