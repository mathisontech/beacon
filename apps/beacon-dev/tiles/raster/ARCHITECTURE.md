# Unified raster basemap

Single pre-baked raster tile stack. Every cell at every location has one definitive value per layer. No runtime compositing. No seams between coverage zones.

## Grid spec

- CRS: EPSG:3857 (Web Mercator) — aligns with standard tile pyramids, GPS lat/lng → pixel is a single projection.
- Tile size: 1024x1024 pixels.
- Max zoom: 17 (effective ~0.75 m/pixel at equator; each tile covers ~768 m).
- Min zoom: 0.
- Target ground resolution: 1 m. Where source data is coarser (e.g. GLO-30 at 30 m), bilinear interpolation fills to 1 m grid — no new information, but the grid stays uniform so all layers stack without resampling at query time.
- Pixel alignment: all layers share the exact same grid. A pixel at (z, x, y, row, col) refers to the same ground footprint across every layer.

## Build strategy: regional, not global-at-once

At 1 m, global land is ~150 trillion pixels per layer. Building the full globe in one pass is impractical (~400 TB intermediate). Instead:

1. **Define regions of interest (ROI)** — bbox per build target (e.g. a US state, a metro area, a wildfire incident).
2. **Build per-ROI**: all scripts accept an optional `-bbox west,south,east,north` flag to clip source data before processing.
3. **Server holds a global index** of which ROIs are built. On-demand build for new ROIs (triggered by incident activation or user cache request).
4. **Phone requests tiles by bbox** — server returns pre-built tiles or kicks off a build job.

Pre-built at launch: CONUS (lower 48) at 1 m where 3DEP LiDAR exists, 10 m everywhere else (upsampled to 1 m grid). Global at 30 m (upsampled to 1 m grid) as fallback.

## Layer types

### Continuous (float → terrain-RGB)

Continuous numeric values (elevation, canopy height, Vs30). Encoded as terrain-RGB PNG: `value = (R * 256 * 256 + G * 256 + B) * scale + offset`. Decoding is a single multiply+add on device.

| layer | encoding | scale | offset | unit |
|---|---|---|---|---|
| elevation | terrain-rgb | 0.1 | -10000 | meters |
| canopy_height | terrain-rgb | 0.1 | 0 | meters |
| building_height | terrain-rgb | 0.1 | 0 | meters |
| vs30 | terrain-rgb | 0.1 | 0 | m/s |
| population_density | terrain-rgb | 0.01 | 0 | people/km2 |

### Derived (computed from elevation)

Same encoding, computed from the merged elevation layer:

| layer | encoding | scale | offset | unit |
|---|---|---|---|---|
| slope | terrain-rgb | 0.01 | 0 | degrees |
| aspect | terrain-rgb | 0.1 | 0 | degrees (0-360) |
| tpi | terrain-rgb | 0.1 | -1000 | meters |
| hand | terrain-rgb | 0.1 | 0 | meters |

### Categorical (uint8/uint16 → indexed PNG)

Discrete classes. Stored as paletted or grayscale PNG, value = class ID. Lookup table ships with the app.

| layer | max classes | source |
|---|---|---|
| landcover | 11 | ESA WorldCover classes |
| fuel_model | 256 | FM40 (US) / WorldCover→FM40 LUT (global) |
| admin_zone | 65535 | TIGER (US) / Overture (global) → zone ID |
| protected_area | 8 | PAD-US category (US) / WDPA (global) |
| flood_zone | 8 | FEMA NFHL (US) / HAND-derived (global) |

### Distance (float → terrain-RGB)

Pre-computed distance-to-feature grids. Avoids runtime nearest-feature search on device.

| layer | encoding | scale | offset | unit |
|---|---|---|---|---|
| dist_road | terrain-rgb | 1.0 | 0 | meters |
| dist_water | terrain-rgb | 1.0 | 0 | meters |
| dist_coast | terrain-rgb | 1.0 | 0 | meters |
| dist_fault | terrain-rgb | 1.0 | 0 | meters |

## Source priority per layer

Each layer has an ordered list of sources. The build step processes them highest-priority-first. Where a higher-priority source has data, it wins. Where it has nodata, the next source fills. The output has no nodata cells (ocean gets 0/null class as appropriate).

Example — elevation:
1. 3DEP 10 m (US only, highest res)
2. ArcticDEM 2 m mosaic (Arctic, clip to non-US)
3. Copernicus GLO-30 (global, fills everything else)

Example — fuel_model:
1. LANDFIRE FM40 30 m (US)
2. WorldCover → FM40 lookup table (global fallback)

## Build pipeline per layer

```
01-download.sh    fetch source files (COG, GeoTIFF, shapefile)
02-warp.sh        reproject + resample all sources to EPSG:3857, 10m target
03-merge.sh       priority fill: patch higher-res onto global base
04-derive.sh      (terrain layers only) compute slope/aspect/tpi/hand
05-encode.sh      float → terrain-RGB or categorical → indexed PNG
06-tile.sh        gdal2tiles → directory of PNGs at z0-z14
07-pmtiles.sh     pack tile directory into raster PMTiles archive
```

For polygon layers, 02-warp.sh is replaced by:
```
02-rasterize.sh   gdal_rasterize vector → aligned raster at target res
```

For distance layers:
```
02-rasterize.sh   rasterize source features (roads, water, faults)
03-distance.sh    gdal_proximity → distance grid
```

## Basemap processor

`processor/build.sh` — runs all layers, validates alignment:

1. For each layer: run its `scripts/build.sh`
2. Validate: every PMTiles archive has identical tile matrix (same zoom range, same tile set)
3. Spot-check: sample 100 random tiles, confirm pixel grids align across layers
4. Output manifest: `manifest.json` listing archive paths, encoding params, version timestamp

## On-device usage

Phone caches one PMTiles archive per layer (or a bundled multi-layer archive). GPS coordinate → tile z/x/y + pixel row/col → read value from each layer's tile → feed to scoring function.

```
lat, lng → EPSG:3857 x,y → tile z,x,y at zoom 14
pixel_col = floor((x - tile_west) / pixel_size)
pixel_row = floor((tile_north - y) / pixel_size)
value = decode(layer_tile[row][col])
```

No network needed. Pure local lookup from cached tiles.

## Prereqs

```
brew install gdal python3
pip3 install rasterio numpy
# pmtiles CLI already installed
```

## Storage estimates (1 m, 1024x1024 tiles, zoom 0-17)

### Per region

| region | area km² | pixels/layer | raw size/layer | compressed/layer |
|---|---|---|---|---|
| Single county (LA) | 12,000 | 12B | 12 GB | ~2 GB |
| California | 425,000 | 425B | 425 GB | ~50 GB |
| CONUS | 8,000,000 | 8T | 8 TB | ~800 GB |
| Global land | 150,000,000 | 150T | 150 TB | ~15 TB |

### Phone cache budget

A 50 km radius around the user (~7,850 km²) at 1 m, 15 layers:
~7.8B pixels × 15 layers × 1 byte = ~117 GB raw → ~12 GB compressed.

Too large for phone. Solution: phone caches at adaptive resolution:
- 1 m within 5 km of user (~78 km², ~1.2 GB for 15 layers compressed)
- 10 m within 50 km (~600 MB)
- 100 m beyond 50 km (~60 MB)
- Total: ~2 GB on phone. Fits comfortably.

Server always holds full 1 m. Phone requests tiles at the resolution it needs.
