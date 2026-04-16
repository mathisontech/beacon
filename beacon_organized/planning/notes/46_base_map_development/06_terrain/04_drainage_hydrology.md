# Drainage & Hydrology

Water flow modeling from DEM. Outputs: D8 flow direction, flow accumulation, HAND (Height Above Nearest Drainage — critical for flood), watersheds.

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| compute_d8_flow_direction(dem) | DEM | Direction grid (1-8) | hydrology.d8_computed |
| compute_flow_accumulation(d8_grid, dem_area_m2) | D8 directions | Cell-count grid (discharge proxy) | hydrology.flow_accum_computed |
| delineate_watersheds(dem, pour_points) | DEM + outlets | Watershed polygon layer | hydrology.watersheds_delineated |
| compute_hand(dem, stream_network) | DEM + streams | HAND raster meters | hydrology.hand_computed |
| identify_stream_network(flow_accum, threshold) | Flow accumulation | Stream polygon layer | hydrology.streams_identified |
| compute_drainage_density(watersheds, streams) | Watershed + stream grids | Density (stream km / watershed km²) | hydrology.drainage_density_computed |
| identify_depressions(dem, threshold) | DEM | Depression polygon layer | hydrology.depressions_identified |
| compute_hydrographic_slope(stream_reach, dem) | Stream segments + DEM | Slope m/m per reach | hydrology.reach_slope_computed |
| identify_confluences_constrictions(stream_network) | Stream network | Confluence points | hydrology.confluences_identified |

## D8 Flow Direction Algorithm

Flow from each cell to one of 8 neighboring cells with steepest descent.

```
Direction codes:
1=E, 2=SE, 4=S, 8=SW, 16=W, 32=NW, 64=N, 128=NE

Per-cell rule:
  direction = argmin(elevation_neighbors)
  if flat: tie-breaking by nearest stream or manual seed
```

## HAND (Height Above Nearest Drainage)

Critical for flood susceptibility: HAND < 2m = high risk.

```
Algorithm:
  1. Compute D8 flow direction
  2. Identify stream network (flow_accum > threshold)
  3. For each cell: shortest flow path to nearest stream
  4. Record elevation difference = HAND
  5. Cells <2m HAND: flood-prone
```

## Data Storage

| Table | Schema |
|---|---|
| flow_direction | tile_id, d8_grid, source |
| flow_accumulation | tile_id, accum_grid, units (cells) |
| hand_raster | tile_id, hand_grid, min_hand, max_hand |
| stream_network | stream_id, geometry, order (Strahler), length_m, slope |
| watersheds | watershed_id, geometry, area_m2, drainage_density, outlet_id |
| depressions | depression_id, tile_id, geometry, area_m2, depth_m |

## Redis Cache

```
d8:tile:{tile_id} -> 1m direction grid (int8)
flow_accum:tile:{tile_id} -> 1m accumulation grid (int32)
hand:tile:{tile_id} -> 1m HAND raster (float32)
streams:tile:{tile_id} -> stream polyline layer
watersheds:{tile_id} -> watershed polygon layer
hydrographic_slope:{stream_id} -> slope_m_per_m
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| hydrology.d8_computed | {tile_id, coverage} | Per tile |
| hydrology.high_hand_zones | {location, hand_m, area_m2} | If HAND <2m zone |
| hydrology.confluences_detected | {confluence_id, location, upstream_count} | Per confluence |
| hydrology.constriction_detected | {location, width_reduction} | If channel narrows >50% |
| hydrology.depression_detected | {location, depth_m, area_m2} | Per depression |

## Flood Susceptibility Integration

Combine HAND + slope + permeability:

```
Flood risk = (1.0 if HAND < 2m else 0.5 if HAND < 5m else 0.1)
           * (1.0 if slope < 5° else 0.7 if slope < 15° else 0.3)
           * (1.0 if permeability_low else 0.7 if medium else 0.5)
```

## Validation

- Cross-check D8 against NHD Plus stream centerlines (>90% agreement)
- Validate HAND against FEMA flood zones (concordance >85%)
- Compare flow direction with NEXRAD-observed flow patterns
- Field survey depressions in karst regions

## Accuracy Targets

| Metric | Target |
|---|---|
| D8 direction correctness | >98% |
| Stream identification | >95% precision recall |
| HAND <2m zone accuracy | >90% |
| Confluence detection | >95% |

## ML Models

| Model | Purpose |
|---|---|
| Stream network enhancer | Predict missing small streams | LiDAR + Sentinel-1 SAR |
| Depression detector | Find closed depressions (sinkhole candidates) | DEM curvature + topology |

## Performance

| Operation | Time (1 km²) |
|---|---|
| D8 compute | 3 sec |
| Flow accumulation | 4 sec |
| HAND compute | 6 sec |
| Stream delineation | 2 sec |

## Dependencies

- numpy, scipy (D8, flow algorithms)
- rasterio (raster I/O)
- fiona, shapely (polygon ops)
- Redis (caching)
- NATS (publishing)
