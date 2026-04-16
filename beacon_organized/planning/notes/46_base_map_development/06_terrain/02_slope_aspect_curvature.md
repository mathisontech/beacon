# Slope, Aspect, Curvature

Terrain derivative layers computed via finite difference methods on DEM. Critical for avalanche, landslide, and fire models.

## Functions

| Function | Input | Output | Formula |
|---|---|---|---|
| compute_slope_degrees(dem, kernel) | DEM | Slope grid (degrees) | arctan(sqrt((dz/dx)^2 + (dz/dy)^2)) |
| compute_slope_radians(dem) | DEM | Slope grid (radians) | atan2(gradient_magnitude, 1) |
| compute_aspect_compass(dem) | DEM | Aspect grid (0-360°) | atan2(-dz/dy, dz/dx) + 180 |
| compute_aspect_category(aspect) | Aspect grid | Category (N/NE/E/SE/S/SW/W/NW) | 8 cardinal classes |
| compute_profile_curvature(dem) | DEM | Curvature perpendicular to slope | d²z/ds² along max gradient |
| compute_plan_curvature(dem) | DEM | Curvature perpendicular to aspect | d²z/dn² across gradient |
| classify_slope_category(slope_deg) | Slope grid | Category grid | Flat/gentle/moderate/steep/cliff |
| detect_convexity_concavity(profile_curv) | Profile curvature | Convex/concave classification | positive=convex, negative=concave |

## Finite Difference Kernels

Sobel-Scharr 3x3 for slope/aspect (smoothing edge effects).

```
Kernel (normalized):
[-1  0  1]     [-1 -2 -1]
[-2  0  2]  X  [ 0  0  0]
[-1  0  1]     [ 1  2  1]
```

## Classification Thresholds

| Category | Slope Range | Use Case |
|---|---|---|
| Flat | <5° | Roads, parking, non-hazard terrain |
| Gentle | 5-15° | Pasture, light traversability |
| Moderate | 15-30° | Forest, challenging traversal |
| Steep | 30-45° | Avalanche starting zones, cliffs |
| Cliff/Impassable | >45° | Extreme terrain, barriers |

## Avalanche-Specific Layers

Convexity/concavity adjustment to slip probability:

| Curvature Type | Slip Probability Adjustment |
|---|---|
| Convex (crest-like) | +0.15 (runout accelerates) |
| Neutral (planar) | 0.0 (baseline) |
| Concave (bowl-like) | -0.10 (runout decelerates) |

## Data Storage

| Table | Schema |
|---|---|
| terrain_derivatives | tile_id, bbox, slope_min, slope_max, slope_mean, aspect_variance, curvature_extremes |
| slope_categories | tile_id, flat_fraction, gentle_fraction, moderate_fraction, steep_fraction, cliff_fraction |

## Redis Cache

```
slope:tile:{tile_id} -> 1m slope grid (float32)
aspect:tile:{tile_id} -> 1m aspect grid (float32)
curvature:profile:tile:{tile_id} -> profile curvature
curvature:plan:tile:{tile_id} -> plan curvature
convexity:tile:{tile_id} -> binary convex/concave mask
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| terrain.slope_computed | {tile_id, mean_slope, steep_fraction} | Per tile |
| terrain.steep_zones_detected | {location, slope_deg, area_m2} | If slope >30° |
| terrain.cliff_detected | {tile_id, location, confidence} | If slope >45° |
| terrain.convexity_detected | {tile_id, location, effect} | If |curvature| > threshold |

## Validation

- Cross-check slope against ASTER GDEM slopes (should correlate >0.95)
- Compare aspect against known geology (aspect bias for landslides)
- Visual inspection of curvature reversal artifacts
- Validate steep zones match known avalanche terrain

## Accuracy Targets

| Metric | Target |
|---|---|
| Slope angular error | <0.5° |
| Aspect directional error | <10° |
| Curvature sign correctness | >99% |
| Category classification | >95% accuracy |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Slope validation CNN | Detect DEM artifacts causing false slopes | Synthetic + labeled LiDAR |
| Convexity classifier | Distinguish true convex from noise | Terrain curvature dataset |

## Performance

| Operation | Time (1 km² tile) |
|---|---|
| Slope compute | 2 sec |
| Aspect compute | 2 sec |
| Curvature compute | 4 sec |
| Classification | 1 sec |

## Dependencies

- numpy (finite difference kernels)
- scipy.ndimage (convolution, morphology)
- rasterio (I/O)
- Redis (caching)
- NATS (publishing)
