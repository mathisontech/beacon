# Basemap layer coverage

Two archives + a merge step. Simplified v1 — vector only, no rasters. Rasters (DEM, landcover, fuel, Vs30) land in v2 via a separate raster pipeline.

## World (`world/out/beacon-world.pmtiles`)

| layer | source | license | notes |
|---|---|---|---|
| land | Natural Earth 10m | public domain | polygon fill |
| ocean | Natural Earth 10m | public domain | |
| countries | Natural Earth 10m admin_0 | public domain | |
| states | Natural Earth 10m admin_1 | public domain | provinces + US states |
| disputed | Natural Earth 10m admin_0_disputed | public domain | |
| rivers | Natural Earth 10m rivers + lake centerlines | public domain | |
| lakes | Natural Earth 10m lakes | public domain | |
| coastline | Natural Earth 10m coastline | public domain | |
| urban | Natural Earth 10m urban_areas | public domain | |
| roads | Natural Earth 10m roads | public domain | major only |
| populated | Natural Earth 10m populated_places | public domain | |
| volcanoes | Smithsonian GVP | CC BY | already in `/api/data/volcanoes` |

Zoom range 0-10. Tile size stays well under GitHub LFS limit.

## United States (`us/out/beacon-us.pmtiles`)

| layer | source | license | notes |
|---|---|---|---|
| us_states | TIGER 2024 states | public domain | swaps NE states in CONUS+AK+HI+PR |
| us_counties | TIGER 2024 counties | public domain | |
| us_roads_primary | TIGER 2024 roads (MTFCC S1100/S1200) | public domain | |
| us_hydro | USGS NHD flowline + waterbody | public domain | majors only (ftype filter) |
| us_faults | USGS Quaternary Faults | public domain | vector, CFM-compatible |
| us_flood_zones | FEMA NFHL S_FLD_HAZ_AR | public domain | A/AE/VE zones |
| us_fire_perims | MTBS burn perimeters | public domain | 1984-present |
| us_padus | USGS PAD-US 4.0 | public domain | federal/state/local protected |
| us_buildings | Microsoft US Building Footprints | ODbL | zoom 12+, bbox-windowed per state |
| us_places | TIGER 2024 places | public domain | incorporated cities/towns |

Zoom range 4-14 (us_buildings 12-14).

## Deferred to v2 (rasters)

- Copernicus GLO-30 DEM (global elevation, hillshade, contours)
- ESA WorldCover 10m (global landcover)
- LANDFIRE FM40 (US fuel models)
- LANDFIRE CC/CH/CBD/CBH (US canopy)
- USGS Vs30 (global + US)
- HRRR/GFS weather grids (event-time, not basemap)
- Overture buildings (global, requires DuckDB + S3 egress)
- WDPA (global protected, requires registration)

## Merge strategy

Within US bbox (`lib/conus-bbox.geojson` extended to include AK, HI, PR, Guam), US layers override world equivalents:

- `countries` + `states` from world, masked by `us_states` from US (US polygon deleted from world's version)
- `rivers` + `lakes` from world, masked by `us_hydro` bbox
- `roads` from world (NE majors) kept at zoom 0-6, `us_roads_primary` takes over 7-14
- All US-only layers (faults, flood, fire, padus, buildings, places) added without equivalent

Output: `merge/out/beacon-merged.pmtiles` — a single archive the client can cache.

## Discrepancy checks

Run on merge. Flag when:

- Border geometry: NE country polygon vertex-distance to TIGER state-dissolved boundary > 2 km. Output `reports/border-drift.geojson`.
- River crosswalk: NE river centerline has no NHD flowline within 1 km over any 10 km segment inside CONUS. Output `reports/river-missing.geojson`.
- Feature count: per-layer count delta between US-clipped world layer and US equivalent > 20%. Output `reports/count-delta.json`.
- Overlap audit: cells where both world and US supply a conflicting attribute (e.g. admin name mismatch). Output `reports/attr-conflict.json`.

## Prereqs (user's Mac)

Already installed: `gdal`, `tippecanoe`, `pmtiles`. Add:

- `brew install jq`
- `brew install node` (already have — needed for diff scripts)
