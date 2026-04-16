# World Base Map — Per-Source-Tile Processing Pipeline

**Data that arrives in natural tiles and is processed independently per tile**

---

## Overview

Some global and national data sources arrive pre-tiled by the provider. These tiles are independent — processing one tile doesn't require reading neighbors. This makes them simpler than the global all-at-once processors (which need VRTs and cross-tile reads) but different from per-cell compositing (which happens after all sources are processed).

**Processing pattern:** Download tiles → validate → standardize format → write to S3 → cell-chop during per-cell compositing.

These processors do NOT generate derivatives. They clean and standardize the source data into a consistent format. The per-cell pipeline consumes them.

---

## ESA WorldCover Layer

### Source Overview

| Property | Value |
|----------|-------|
| Source | ESA WorldCover |
| Resolution | 10m |
| Coverage | Global |
| Classes | 11: tree cover, shrubland, grassland, cropland, built-up, bare/sparse, snow/ice, permanent water, herbaceous wetland, mangroves, moss/lichen |
| Tile size | 3° × 3° |
| Format | GeoTIFF |
| Update cycle | ~Annual |

### Fetcher: worldcover

**Takes in:** ESA WorldCover download portal

**Spits out:** `raw/worldcover/v{NNN}/{tile_id}.tif` (one 3° tile per file)

### Processor: worldcover_standardize

**Takes in:** Raw 3° tiles

**Spits out per tile:**
- Standardized tile: `worldcover/v{NNN}/{tile_id}.tif` (UInt8, class codes, COG, EPSG:4326)

**Pseudocode:**
1. For each 3° tile:
   - Verify class codes are valid (1-11)
   - Reproject to EPSG:4326 if needed
   - Compress as COG
   - Log tile stats (class distribution)
2. Write processing log

**Validation:** All pixels have valid class codes. No tiles 100% nodata. Class distribution plausible per geography (no "tree cover" in Sahara).

**Rendering:** Not served directly. Consumed by per-cell compositing for land cover percentage calculations.

---

## NLCD US Land Cover Layer

### Source Overview

| Property | Value |
|----------|-------|
| Source | USGS National Land Cover Database |
| Resolution | 30m |
| Coverage | CONUS |
| Classes | 20: open water, developed (4 intensity levels), barren, forest (3 types), shrub, grassland, pasture, crops, woody wetland, herbaceous wetland |
| Format | Single national GeoTIFF |
| Update cycle | Every 2-3 years |

### Fetcher: nlcd

**Takes in:** USGS MRLC download

**Spits out:** `raw/nlcd/v{NNN}/nlcd_land_cover.tif`

### Processor: nlcd_standardize

**Takes in:** National GeoTIFF

**Spits out:**
- Tiled COGs (1° tiles for consistency): `nlcd/v{NNN}/{tile_id}.tif` (UInt8, NLCD class codes, COG, EPSG:4326)
- Impervious surface: `nlcd/v{NNN}/impervious/{tile_id}.tif` (UInt8, percent 0-100)
  - *NLCD provides a separate impervious surface product at 30m*

**Why both WorldCover and NLCD?** WorldCover is global at 10m but has coarser classes. NLCD is US-only at 30m but distinguishes developed intensity levels (open space / low / medium / high) which directly indicate population density and urban structure. The per-cell compositing combines both.

**Validation:** Class codes valid. State-level class distribution matches NLCD published statistics.

---

## Processing Order

Per-source-tile processing is simple and fast. These should be processed **before** the national pipeline because:
1. They provide land cover context used by LiDAR and satellite processors (e.g., "is this area expected to be forested?")
2. They are quick — a few hours of download + standardize
3. They have no dependencies on other national sources

**Order:**
1. WorldCover (global, small, fast)
2. NLCD (US only, single file, fast)

Then proceed to the national pipeline (LiDAR, NAIP, street view, etc.)

---

## Development Plan (Per-Tile Pipeline)

### Step T.1 — WorldCover fetcher + standardizer

**Ask Claude:** "Build the WorldCover fetcher and standardize processor. Download 3° tiles from ESA, validate class codes, compress as COG, write to S3 with manifest and processing log. Follow the same fetcher/processor/validate.py pattern as the global pipeline."

**Delivers:** Fetcher + processor + validator.

**Verify:** Tiles on S3. Class distribution logged. Random tile opens in QGIS with correct classes.

### Step T.2 — NLCD fetcher + standardizer

**Ask Claude:** "Build the NLCD fetcher and standardize processor. Download the national GeoTIFF, tile into 1° COGs, extract impervious surface layer, write to S3."

**Delivers:** Fetcher + processor + validator.

**Verify:** Tiles cover CONUS. Class codes valid. Impervious surface 0-100%.
