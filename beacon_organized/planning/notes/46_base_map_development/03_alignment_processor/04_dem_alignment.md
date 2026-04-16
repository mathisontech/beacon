# DEM Alignment

Global and US elevation models registration to 1km grid.

## Sources

| Source | Resolution | Coverage | Vertical Accuracy | Update | Use |
|--------|-----------|----------|------------------|--------|-----|
| Copernicus 30m | 30m | Global | ±5m RMSE | Every few years | Global baseline |
| 3DEP 1m DEM | 1m | ~90% CONUS | ±1m RMSE | Per-project | US refinement |
| NOAA Digital Coast | 1-3m | US coastal | ±0.5m RMSE | Varies | Coastal refinement |

## Functions

| Function | Input | Output | Algorithm |
|----------|-------|--------|-----------|
| `download_copernicus_dem` | Tile ID | Cloud optimized GeoTIFF | AWS bucket API |
| `download_3dep_dem` | Project ID | Cloud optimized GeoTIFF | USGS OpenTopography API |
| `normalize_vertical_datum` | DEM + source datum | DEM (NAVD88 for US, EGM96 global) | VDatum grid interpolation |
| `fill_voids` | DEM + void mask | DEM (filled) | Kriging interpolation |
| `remove_artifacts` | DEM | DEM (cleaned) | Median filter + local extrema detection |
| `merge_dem_sources` | Multiple DEMs + priority | Merged DEM | Prioritize by resolution + recency |
| `compute_slope` | DEM | Slope raster (degrees) | Horn method, 3x3 kernel |
| `compute_aspect` | DEM | Aspect raster (0-360) | Aspect from slope gradients |
| `compute_curvature` | DEM | Curvature raster | Profile + plan curvature |
| `compute_drainage_direction` | DEM | D8 flow direction | Steepest descent per cell |
| `compute_flow_accumulation` | DEM + flow direction | Flow accumulation (upstream area) | D8 flow algorithm |
| `compute_hand` | DEM + streams + basins | Height Above Nearest Drainage | Per-basin elevation minus stream elevation |
| `compute_terrain_roughness` | DEM | Roughness raster | Std dev of elevation in 5m window |
| `compute_terrain_classification` | Slope raster | Terrain class (flat/gentle/moderate/steep/cliff) | Slope thresholds |
| `compute_traversability_8dir` | Slope + surface | 8-direction traversability | Per-direction vehicle capability |

## Coordinate Systems

All DEMs normalized to:
- Horizontal: EPSG:4326 (WGS84)
- Vertical: NAVD88 (US), EGM96 (global)
- Grid: 1km cells at integer lat/lon boundaries

## DEM Merging Strategy

Prioritize 3DEP (1m) over Copernicus (30m) where both available (CONUS).

```
1. For each 1km tile:
   a. Check if 3DEP coverage exists
   b. If yes: use 3DEP DEM as primary
   c. If no: use Copernicus DEM
   d. Fill interior voids (water, buildings) with interpolation
   e. Mark source + confidence per cell
2. Build global VRT covering entire planet
3. Compute all derivatives from merged DEM
```

Output: single authoritative DEM raster per tile, with source attribution.

## Void Filling

Missing data handling (water, building interiors, bad classification).

| Void Type | Size | Strategy |
|-----------|------|----------|
| Small voids (<5m diameter) | Typical | Bilinear interpolation from neighbors |
| Large voids (water bodies) | 100m-km | Hydro-enforced DEM (flatten surface) |
| Building interiors (3DEP only) | 10-1000m² | Mark as nodata, leave unfilled |
| Cloud-masked areas (Copernicus) | Variable | Interpolate from surrounding cells |

Goal: no 100% nodata tiles. Tiles with >30% nodata flagged for review.

## Artifact Removal

Post-classification errors (spike/pit anomalies).

```
Algorithm: Median filter + local extrema check
1. Apply 3x3 median filter
2. Find local minima (pits) + maxima (spikes)
3. If isolated (<10 cells), interpolate from neighbors
4. Log removal statistics per tile
```

Expected artifact count: <0.1% of pixels.

## Slope Computation

| Formula | Use |
|---------|-----|
| Horn method (3x3 kernel) | Smooth slope estimates |
| Zevenbergen-Thorne (3x3) | Alternative, similar results |
| Fit planar surface (5x5+) | Multi-scale slope |

Output: slope in degrees (0-90, flat=0, vertical=90).

## Aspect Computation

Compass direction of steepest descent per cell.

| Range | Direction | Code |
|-------|-----------|------|
| 337.5-22.5° | N | 0 |
| 22.5-67.5° | NE | 45 |
| 67.5-112.5° | E | 90 |
| ... | ... | ... |
| 292.5-337.5° | NW | 315 |
| Flat (slope <1°) | Undefined | -1 |

## Drainage & Flow

D8 flow direction algorithm.

```
1. For each cell, find steepest descent neighbor (8-neighbor)
2. Set flow direction to that neighbor
3. Accumulate upstream area per cell (# cells draining to it)
4. Build stream network: cells with high accumulation
5. Delineate basins: pour point + upstream cells
```

## HAND (Height Above Nearest Drainage)

Per-basin computation: elevation - nearest stream elevation.

```
Per-basin:
1. Identify streams (flow accumulation > threshold)
2. For each non-stream cell: find nearest stream cell
3. Compute: elevation_cell - elevation_stream
4. Result: HAND raster per basin
```

Use: flood modeling, floodplain identification. HAND ~0 near streams, increases upslope.

## Terrain Roughness

Local elevation variance proxy for surface texture (soil, vegetation, rock).

```
For each cell:
  Roughness = std_dev(elevation in 5m window)
```

Expected values: 0.1-0.5m smooth terrain, 1-3m forested/rocky.

## Terrain Classification

Slope-based land classification.

| Class | Slope Range | Travel | Use |
|-------|-------------|--------|-----|
| Flat | 0-3° | Easy, any vehicle | Roads, open space |
| Gentle | 3-10° | Easy, most vehicles | Rural, light terrain |
| Moderate | 10-20° | Difficult, 4WD required | Steep sides |
| Steep | 20-35° | Very difficult, hiking | Mountainous |
| Cliff | >35° | Impassable | Cliffs, talus |

## Traversability (8-Direction)

Per-cell, per-direction passability by vehicle type.

| Vehicle | Parameters | Slope Limit |
|---------|----------|------------|
| Walking | Flat terrain | <30° |
| Biking | No obstacles | <15° |
| 2WD car | Road surface | <12° |
| 4WD truck | Any surface | <30° |
| Fire truck | Steerable articulated | <25° |

Output: UInt8 per direction, per vehicle type. 0 = impassable, 1 = passable.

## Databases

**dem_metadata** — Track DEM sources.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | 1km cell |
| source | ENUM | Copernicus, 3DEP, NOAA_Coast |
| acq_date | DATE | Data collection date |
| vertical_accuracy_m | FLOAT | RMSE vs ground truth |
| void_pct | FLOAT | Percentage unfilled |
| vertical_datum | VARCHAR | NAVD88 or EGM96 |

**dem_derivatives** — Pre-computed products.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | 1km cell |
| product | VARCHAR | slope, aspect, roughness, curvature, hand, etc. |
| mean_value | FLOAT | Spatial mean |
| stddev | FLOAT | Spatial stddev |
| min_value | FLOAT | Min |
| max_value | FLOAT | Max |

## Vertical Datum Conversion

US: NAVD88. Global: EGM96.

```
1. Download correction grid from NOAA VDatum or GeoidHGT
2. For each pixel:
   Elevation_NAVD88 = Elevation_ellipsoidal + correction[lat,lon]
3. Bilinear interpolation for sub-grid resolution
4. Validate: compare to known benchmarks (benchmarks dataset)
```

Expected accuracy: <0.1m after conversion.

## Quality Validation

| Check | Threshold | Action |
|-------|-----------|--------|
| Elevation range | Plausible for region | Fail if <-500m or >9000m |
| Void percentage | <30% per tile | Flag if exceeded |
| Slope range | 0-90 degrees | Fail if outside |
| Vertical datum conversion | <0.2m error | Flag if > 0.5m |
| Copernicus-to-3DEP agreement | <2m mean offset | Flag systematic bias |
| Artifact count | <0.1% pixels | Log if exceeded |

## Performance

| Operation | Time (per 10,000 tiles) |
|-----------|------------------------|
| Download | 1-2 hours |
| Standardize + reproject | 30 min |
| Fill voids | 1 hour |
| Slope/aspect/curvature | 2 hours |
| Flow accumulation + HAND | 3-4 hours |
| Terrain classification + traversability | 1 hour |
| **Total** | **8-12 hours** |

Highly parallelizable (per-tile operations).

## Cost Estimates (Global)

| Operation | Cost |
|-----------|------|
| Copernicus DEM download + processing (26,000 tiles) | $200-300 |
| Derivative computation | $150-250 |
| Storage (30m DEM + derivatives) | $100-150 |
| **Total monthly** | **$450-700** |

3DEP (US) additional: $100-200 monthly for Pass 1 LiDAR DEM processing and integration.

## Integration with Alignment

DEM serves as:
1. **Vertical reference** for all raster sources
2. **Hydrologic reference** for stream/flow modeling
3. **Terrain constraint** for building/vegetation placement validation
4. **Traversability input** for evacuation routing

DEM alignment is prerequisite for all downstream terrain-dependent processors.
