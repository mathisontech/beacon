# LiDAR Alignment

USGS 3DEP LiDAR registration to 1km grid. US coverage only.

## Source

| Property | Value |
|----------|-------|
| Coverage | ~90% CONUS |
| Resolution | QL1: 8+ pts/m², QL2: 2+ pts/m² |
| Typical: 1m DEM, 1-2m vertical accuracy |
| Format | LAZ (compressed LAS) |
| Update | Per-project, 1-10 year refresh |
| Reference datum | NAVD88 (vertical) |

## Architecture: Two-Pass

**Pass 1: Deterministic** — Classification, rasterization, no ML. Per-project, runs immediately on new data.

**Pass 2: ML-Based** — Refined classification, advanced extraction. Waits for trained models.

This split allows Pass 1 outputs to enter alignment immediately, while Pass 2 refines asynchronously.

## Pass 1: Deterministic Processors

| Processor | Input | Output | Time |
|-----------|-------|--------|------|
| `classify_lidar_points` | Raw LAZ | Classified LAZ (ASPRS classes) | 30-60 min per 1000 km² |
| `generate_bare_earth_dem` | Classified LAZ (ground) | 1m DEM (Float32) | 15-30 min per 1000 km² |
| `generate_dsm` | Classified LAZ (first returns) | 1m surface model | 10-20 min |
| `compute_chm` | DEM + DSM | Canopy height model | 5 min |
| `strip_adjust` | Classified LAZ | Flight-line adjusted LAZ | 45-90 min (overlap correction) |
| `mosaic_projects` | Multiple LAZ projects | Seamless LAZ mosaic | 30-60 min (boundary blending) |
| `coregister_to_satellite` | DEM + Sentinel-2 | DEM aligned to S2 grid | 20-40 min (GCP-based) |
| `normalize_vertical_datum` | DEM (raw datum) | DEM (NAVD88) | 5 min (lookup transform) |
| `compute_point_cloud_metrics` | Classified LAZ | Height percentiles, density stats | 20-30 min |
| `extract_building_footprints_raw` | Classified LAZ | Building polygons + heights | 30-60 min (deterministic clustering) |
| `extract_vegetation_metrics_raw` | Classified LAZ (veg classes) | Height, density, cover fraction | 20-30 min |

## Pass 2: ML-Based Processors

Require trained models. Reference National Pipeline - 3DEP LiDAR Layer for details.

| Processor | Input | Output | Requires |
|-----------|-------|--------|----------|
| `ml_classify_points` | Classified LAZ | Re-classified LAZ (custom taxonomy) | RandLA-Net model |
| `ml_advanced_buildings` | Building footprints + ML LAZ | Roof type, material, solar, helicopter landable | PointNet++ model |
| `ml_barriers` | ML-classified LAZ | Fence/wall/guardrail polylines + height | ML classification output |
| `ml_vegetation_detail` | ML-classified LAZ + canopy | Individual tree detection, ladder fuels | Instance segmentation model |
| `ml_surface_features` | ML LAZ + DEM | Power lines, curbs, road widths, driveways, helicopter landing zones | Geometric + learned models |
| `ml_soil_estimate` | Intensity + texture + slope | Soil class + confidence (rocky vs soft) | Weak signal, primarily for fusion |

## Alignment Workflow (Per Project)

```
1. Download LAZ from USGS/OpenTopography
2. Pass 1a: Classify points (deterministic)
3. Pass 1b: Generate DEMs, terrain derivatives
4. Pass 1c: Extract buildings, vegetation (deterministic)
5. Register DEM to Sentinel-2 grid (GCP-based)
6. Mosaic with adjacent projects
7. Validation (completeness, accuracy)
8. If Pass 1 valid:
     → Pass 2a: ML classification (async)
     → Pass 2b: ML extraction (async)
9. Final alignment to 1km tile grid
```

## Spatial Registration

LiDAR projects arrive in project-specific CRS. Registration to EPSG:4326 + 1km grid.

### GCP Collection

| GCP Type | Count | Method |
|----------|-------|--------|
| Building corners | 10-20 | Manual + feature detection |
| Road junctions | 5-10 | Manual + intersection snapping |
| Field boundaries | 5-10 | Automatic edge detection on imagery |
| Total per project | 30-50 | Mix of manual (accuracy) + automatic (speed) |

### Co-registration to Satellite

LiDAR DEM co-registered to Sentinel-2 baseline using automated feature matching:

```
1. Extract building edges from LiDAR DSM
2. Extract building edges from Sentinel-2 NDVI
3. Compute 2D offset (translation only)
4. Apply shift to DEM
5. Verify: building edges aligned, <1m residual
```

Output: affine correction stored with project metadata.

## Coverage Metrics

Per-project coverage assessment written to metadata.

| Metric | Computed | Use |
|--------|----------|-----|
| Point density (pts/m²) | Histogram per 1km tile | Assess quality level |
| Coverage gaps (%) | Holes / total area | Flag areas with poor LiDAR |
| Shadow zones (m²) | Geometry + scan angle | Confidence map |
| Height range | Min/max elevation | Sanity check |
| Vertical accuracy | Compare to GCPs | Estimate sigma |

## Storage

```
s3://beacon-atlas/alignment_processor/lidar/v{NNN}/{project_id}/
├── raw/                        # Original LAZ tiles
├── classified/                 # After Pass 1 classification
├── dem_raw/                    # Pre-datum-conversion DEM
├── dem_aligned/                # NAVD88, aligned to S2 grid
├── dsm/                        # Surface model
├── chm/                        # Canopy height model
├── metrics/
│   ├── density.tif
│   ├── coverage_confidence.tif
│   └── shadow_map.tif
├── buildings_pass1/
│   └── footprints.parquet      # Deterministic extraction
└── ml_outputs/                 # Pass 2 outputs (async)
    ├── ml_classified/
    ├── buildings_pass2/
    ├── barriers/
    ├── trees/
    └── ...
```

## Databases

**lidar_projects** — Track all 3DEP projects.

| Field | Type | Notes |
|-------|------|-------|
| project_id | VARCHAR | USGS ID |
| tile_id | INT | Primary 1km cell |
| acq_date | DATE | Acquisition start |
| ql_level | INT | 1 or 2 (density) |
| coverage_pct | FLOAT | % coverage, gaps filled |
| pass1_status | ENUM | Pending, processing, complete, failed |
| pass2_status | ENUM | As above |
| vertical_rmse | FLOAT | Meters, vs ground truth |

**lidar_buildings** — Buildings extracted (Pass 1 + Pass 2).

| Field | Type | Notes |
|-------|------|-------|
| id | INT | Auto-increment |
| geom | POLYGON | Footprint |
| project_id | VARCHAR | Source project |
| height_mean | FLOAT | Meters |
| est_floors | INT | height / 3.5, rounded |
| roof_type | VARCHAR | flat/gable/hip/complex (Pass 2) |
| confidence | FLOAT | 0-1, based on point density |

## Vertical Datum Conversion

NAVD88 conversion uses grid interpolation (NOAA VDatum or similar).

| Step | Tool |
|------|------|
| Download NAVD88 correction grid | GDAL / PROJ |
| Interpolate correction per pixel | Bilinear |
| Apply to all DEM values | Per-pixel addition |
| Validate: compare to known benchmarks | Spot-check |

Expected accuracy: <0.1m after conversion (VDatum accuracy).

## Quality Validation

Per-project checks before Pass 1 outputs enter alignment.

| Check | Threshold | Action |
|-------|-----------|--------|
| Point density | Matches declared QL | Fail if < 2 pts/m² |
| Coverage gaps | <20% of area | Flag if exceeded |
| Vertical range | Plausible for region | Fail if < -500m or > 9000m |
| Building count vs area | Reasonable density | Flag if suspicious |
| DEM-to-Sentinel accuracy | <1m offset mean | Fail if > 2m |

## Performance Targets

| Operation | Time (per 1000 km²) | Cost |
|-----------|-------------------|------|
| Classification | 45-90 min | $50-100 GPU-hours |
| DEM generation | 20-40 min | $20-40 |
| Terrain derivatives | 15-30 min | $15-30 |
| Building extraction | 30-60 min | $40-80 |
| Mosaic + validation | 30-60 min | $30-60 |
| **Total** | **2-5 hours** | **$155-310** |

Large projects (>5000 km²) benefit from parallel tile processing.

## Storage Estimates

| Product | Size (per 1000 km²) |
|---------|-------------------|
| Raw LAZ | 2-5 GB |
| Classified LAZ | 2-5 GB (lossless compression) |
| DEM (1m, COG) | 100-200 MB |
| DSM | 100-200 MB |
| All rasters (metrics, chm, etc.) | 500 MB-1 GB |
| Vector outputs (buildings, trees) | 50-200 MB |
| **Total per project** | **5-12 GB** |

Full US 3DEP (10-50 TB downloaded) processes to ~500 TB of derivatives (most deleted after tiling).

## Integration with Satellite Alignment

LiDAR DEM serves as reference for other sources where available (US only). For satellite alignment in LiDAR regions:

1. Use LiDAR DEM as ground truth reference
2. Register Sentinel-2 and NAIP to LiDAR (vs LiDAR to Sentinel-2)
3. Confidence boost for satellite in LiDAR-covered areas (multi-source agreement)

Outside LiDAR coverage: Sentinel-2 is baseline.
