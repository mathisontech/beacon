# Beacon Basemap Tiles

Self-hosted vector basemap. Three archives:

- `world/out/beacon-world.pmtiles` — simplified global layer set (Natural Earth 10m)
- `us/out/beacon-us.pmtiles` — US national coverage (TIGER + MTBS + Qfaults + PAD-US)
- `merge/out/beacon-merged.pmtiles` — single archive combining both, plus discrepancy reports

Served via `/api/tiles/basemap/:z/:x/:y`; archive path set by `BEACON_BASEMAP_PMTILES` (defaults to `merge/out/beacon-merged.pmtiles`).

See `OUTLINE.md` for layer coverage and licensing. See each `*/scripts/build.sh` for the per-stage pipeline (download → ogr2ogr → tippecanoe → pmtiles convert).

## Prereqs

```
brew install gdal tippecanoe pmtiles jq node
```

## Build

```
cd apps/beacon-dev/tiles
./build-all.sh
```

Or piecewise:

```
bash world/scripts/build.sh
bash us/scripts/build.sh     # follow manual-download prompts for Qfaults + PAD-US
bash merge/scripts/build.sh
```

Merge emits reports in `merge/reports/`:

- `border-drift.geojson` — NE country boundary vs TIGER states, points >2 km off
- `count-delta.json` — feature count delta per paired layer
- `attr-conflict.json` — state-name mismatches NE vs TIGER

## Legacy

`scripts/` and root `layers.json` are the v0 Natural Earth 50m pipeline. Still works but superseded by `world/`. Safe to delete once `merge/` archive is wired into the app.
