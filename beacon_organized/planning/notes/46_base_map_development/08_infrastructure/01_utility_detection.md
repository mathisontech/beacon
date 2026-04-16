# Utility Detection

Power, water, gas, communication infrastructure extraction. Primary: utility company GIS data. Secondary: LiDAR linear feature detection, satellite confirmation, street-view validation.

## Data Sources

| Source | Attribute | Coverage | Accuracy | Cost |
|---|---|---|---|---|
| Utility GIS (direct) | Lines, substations, poles | Where partnerships exist | <10m | High ($5-50K/yr) |
| LiDAR (3DEP) | Power line routing, pole positions | US | 30-50m | Free |
| Satellite (Sentinel-2) | Linear feature detection | Global | 100m | Free |
| Street-view (Mapillary) | Feature classification, provider ID | Varies | <5m | Free |
| OpenStreetMap | Power lines + amenities | Variable coverage | Variable | Free |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| detect_power_lines_lidar(dem, lidar_points) | DEM + LiDAR point cloud | Power line vector layer | infrastructure.power_lines_detected |
| classify_transmission_vs_distribution(power_lines, height) | Power line layer + height | Transmission/distribution class | infrastructure.transmission_classified |
| detect_substations(satellite, lidar_footprints) | Satellite image + LiDAR | Substation polygon layer | infrastructure.substations_detected |
| detect_cell_towers(satellite, lidar_vertical) | Satellite + LiDAR tall structures | Tower point layer | infrastructure.cell_towers_detected |
| detect_fire_hydrants(street_view_cv) | Mapillary CV model | Hydrant point layer + pressure color | infrastructure.hydrants_detected |
| map_water_system(utility_gis, manual_edits) | Utility GIS + EMS input | Water main network | infrastructure.water_mapped |
| map_gas_pipeline_routes(phmsa_registry, satellite) | PHMSA data + satellite validation | Pipeline polyline layer | infrastructure.gas_mapped |
| compute_utility_redundancy(network_layer, topology) | Utility network topology | Redundancy score, critical segments | infrastructure.redundancy_computed |
| estimate_power_restoration_time(outage_zone, population) | Outage footprint + demand | Restoration time hours | infrastructure.restoration_time_estimated |

## Power Line Extraction (LiDAR)

Detect elevated linear features characteristic of power lines.

```
Algorithm:
  1. Find all elevated points (height > 5m above DEM)
  2. Cluster into linear features (slope linearity test)
  3. Filter by spacing (typical pole spacing 40-60m)
  4. Validate height profile (sagging parabolic curve)
  5. Vectorize to centerline

Confidence = length_agreement_with_poles * spacing_regularity * height_consistency
```

## Transmission vs Distribution Classification

| Factor | Transmission | Distribution |
|---|---|---|
| Height | >10m | 5-10m |
| Voltage | 115-765 kV | 1-35 kV |
| Pole style | Steel/concrete towers | Wood poles |
| Spacing | 60-150m | 40-60m |
| Conductor count | 3-6 per tower | 1-4 per pole |

LiDAR metrics enable indirect classification (height, separation distance).

## Substation Detection

Multi-spectral signature from rooftop structures.

```
Signatures:
  - Rectangular area 20-100m²
  - High reflectance (metal equipment)
  - Regular geometry
  - Often fenced/enclosed
  - Power lines converge at location
```

## Cell Tower Localization

FCC database (primary) + satellite/LiDAR confirmation.

| Source | Accuracy | Frequency |
|---|---|---|
| FCC database | <50m (as-filed) | Annual |
| Satellite detection | 30-100m | Monthly |
| LiDAR verification | <10m (if visible) | One-time |
| Street-view | <1m (structure) | Monthly |

## Fire Hydrant Detection (Street-View CV)

Mapillary computer vision identifies hydrants in street imagery.

| Attribute | Detection Method | Confidence |
|---|---|---|
| Location | Street-view position + GPS | >95% |
| Pressure color | RGB classification (white/yellow/red) | >90% |
| Type (wet/dry) | Visual style | 85% |
| Size/spacing | Post-processing validation | >90% |

## Data Storage

| Table | Schema |
|---|---|
| power_lines | line_id, geometry, voltage_estimated, transmission_bool, height_m, poles_count |
| substations | substation_id, location, bbox, equipment_types, capacity_mva |
| cell_towers | tower_id, location, height_m, provider, antenna_count, coverage_radius_m |
| fire_hydrants | hydrant_id, location, pressure_color, type, last_service_date |
| water_mains | main_id, geometry, diameter_in, material, pressure_psi, redundancy |
| gas_pipelines | pipeline_id, geometry, diameter_in, operating_pressure, hazard_class |

## Redis Cache

```
power_lines:tile:{tile_id} -> transmission + distribution vector
substations:{bbox} -> substation point layer
cell_towers:{bbox} -> tower point layer with coverage radius
hydrants:tile:{tile_id} -> hydrant point layer with pressure
water_mains:tile:{tile_id} -> water network
gas_pipelines:{bbox} -> pipeline vector
utility_redundancy:{tile_id} -> redundancy score grid
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| infrastructure.power_lines_detected | {count, total_length_km} | Per tile |
| infrastructure.transmission_line | {location, voltage_est, poles_spacing} | Per transmission line |
| infrastructure.substation_detected | {location, capacity_mva, equipment} | Per substation |
| infrastructure.cell_tower_detected | {location, height, provider, coverage_radius} | Per tower |
| infrastructure.hydrant_detected | {location, pressure_color, spacing_m} | Per hydrant |
| infrastructure.utility_single_point_failure | {critical_segment, consequence} | If redundancy <1 |

## Utility Redundancy Analysis

Identify segments with single point of failure.

```
Redundancy = number_of_independent_paths
  Redundancy = 0: dead-end (single source)
  Redundancy = 1: single path (parallel routes)
  Redundancy >= 2: true redundancy (loop or mesh)

Critical = (Redundancy = 0) AND (population_served > threshold)
```

## Power Restoration Estimation

Outage size + repair crew availability + damage assessment.

```
Restoration_hours = access_time + damage_assessment + repair_time + testing

Factors:
  - Transmission line down: 4-24 hours (depends on damage)
  - Distribution down: 2-12 hours
  - Substation failure: 8-72 hours
  - Multiple simultaneous outages: exponential delay (crew shortage)
```

## Validation

- Cross-check power line detections against utility company maps
- Validate FCC cell tower coordinates against street-view imagery
- Confirm hydrant locations via field GPS samples
- Cross-check PHMSA gas pipeline registry against satellite imagery

## Accuracy Targets

| Metric | Target |
|---|---|
| Power line length coverage | >95% |
| Transmission/distribution classification | >90% |
| Cell tower location | <50m error |
| Fire hydrant location | <10m error |
| Pipeline route accuracy | >85% |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Power line detector | Extract lines from LiDAR point cloud | Labeled LiDAR + utility maps |
| Substation classifier | Identify substations from satellite | Satellite imagery + field surveys |
| Cell tower detector | Localize towers in satellite | Sentinel-2 + FCC coordinates |
| Hydrant classifier | Detect + classify hydrants | Mapillary training set |

## Performance

| Operation | Time (1 km²) |
|---|---|
| Power line detection | 8 sec |
| Substation find | 3 sec |
| Cell tower locate | 2 sec |
| Hydrant extraction | 5 sec |

## Dependencies

- rasterio, gdal (raster I/O)
- fiona, shapely (vector ops)
- numpy, scipy (point cloud processing)
- scikit-learn (classification)
- networkx (redundancy analysis)
- Redis (caching)
- NATS (publishing)
