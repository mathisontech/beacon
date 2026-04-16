# Geological Hazards

Fault lines, liquefaction zones, sinkhole risk, volcanic hazard zones, site amplification (Vs30).

## Data Sources

| Source | Attribute | Region | Resolution | Access |
|---|---|---|---|---|
| GEM Global Active Faults | Fault geometry, slip rate | Global | Vector | Free |
| USGS Earthquake Hazards | Fault locations, recurrence | US | Vector | Free, WFS |
| USGS Vs30 maps | Shear wave velocity | Global | 1 km | Free, WCS |
| Zhu et al. 2017 | Liquefaction susceptibility | Global | 1 km | Free |
| USGS Sinkhole database | Known sinkholes | US | Points | Free |
| Smithsonian GVP | Volcano monitoring | Global | Vector | Free, API |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| map_fault_lines(bbox) | Bounding box | Fault vector layer | geology.faults_mapped |
| compute_fault_slip_probability(fault, magnitude) | Fault + earthquake | Probability per 30 years | geology.slip_probability_computed |
| map_liquefaction_zones(dem, soil, vs30) | Terrain + soil + Vs30 | Liquefaction zone polygons | geology.liquefaction_mapped |
| identify_sinkhole_risk_areas(geology, water_table) | Geology + hydrology | Sinkhole risk zones | geology.sinkhole_risk_mapped |
| map_volcanic_hazard_zones(volcano, hazard_type) | Volcano location + type | Hazard zone polygons | geology.volcanic_zones_mapped |
| compute_site_amplification_vs30(vs30, soil_type) | Vs30 + soil | Amplification factor (1-6x) | geology.amplification_computed |

## Fault Line Data

| Field | Source | Uncertainty |
|---|---|---|
| Geometry | GEM/USGS mapping | 50-500 m |
| Strike (direction) | Field survey | ±5° |
| Dip (angle) | Field/seismic | ±10° |
| Slip rate (mm/yr) | Paleoseismic studies | 50-100% |
| Max magnitude | Historical events + moment balance | ±0.5 |

## Slip Probability (Poisson Model)

```
P(slip in 30yr) = 1 - exp(-30 * slip_rate_mm_yr / average_slip_m)

Example: San Andreas
  Slip rate: 35 mm/yr
  Average slip per event: 6 m
  P(M7+ in 30yr) = 1 - exp(-30 * 0.035 / 6) ≈ 0.17 (17%)
```

## Liquefaction Susceptibility (Zhu et al. 2017)

| Vs30 Range | Soil Type | Base Risk | Saturation Multiplier |
|---|---|---|---|
| <180 m/s | Clay/silt | 0.8 | x1.0 |
| 180-250 m/s | Mixed | 0.5 | x0.8 |
| 250-360 m/s | Sand/gravel | 0.3 | x0.6 |
| >360 m/s | Rock | 0.05 | x0.5 |

Final risk = base_risk * saturation_factor * depth_factor (0.5-1.0 based on depth_to_water_table)

## Site Amplification (Vs30-based)

| Vs30 Range | Site Class | Amplification |
|---|---|---|
| <180 m/s | E (soft soil) | 4.0-6.0x |
| 180-360 m/s | D (stiff soil) | 2.5-3.5x |
| 360-760 m/s | C (dense soil) | 1.5-2.0x |
| 760-1500 m/s | B (rock) | 1.0-1.2x |
| >1500 m/s | A (hard rock) | 1.0x (baseline) |

## Sinkhole Risk Assessment

| Factor | Indicator | Risk Weight |
|---|---|---|
| Geology | Limestone/karst | x3.0 |
| Water table | <3m depth | x2.0 |
| History | Known sinkholes nearby | x2.0 |
| Subsidence | >1 cm/yr | x1.5 |
| Urban development | Building load change | x1.5 |

Risk = base_rate * geology_weight * water_weight * history_weight (capped at 1.0)

## Volcanic Hazard Zones

| Hazard Type | Extent | Speed | Model |
|---|---|---|---|
| Pyroclastic flow | 5-50 km downslope | >100 m/s | Topographic flow path |
| Lahar (debris flow) | 20-100 km down valleys | 10-50 m/s | Stream channel routing |
| Tephra (ash fall) | 100-1000 km downwind | Hours | Atmospheric dispersion |
| Lava flow | 1-20 km | 1-10 m/s | Slope downslope |

## Data Storage

| Table | Schema |
|---|---|
| fault_lines | fault_id, geometry, strike, dip, slip_rate_mm_yr, max_magnitude, recurrence_yr |
| liquefaction_zones | zone_id, bbox, vs30_mean, risk_level, area_m2 |
| sinkhole_risk | cell_id, bbox, risk_score_0_1, geology_type, water_depth_m |
| volcanic_hazards | hazard_id, volcano_id, hazard_type, geometry, extent_km |
| vs30_rasters | tile_id, vs30_grid, soil_class |

## Redis Cache

```
faults:{bbox} -> fault vector layer
liquefaction:{tile_id} -> risk zone polygons
sinkhole_risk:{tile_id} -> risk score grid
vs30:{tile_id} -> 1km Vs30 grid
volcanic:{volcano_id} -> hazard zone polygons
amplification:{tile_id} -> amplification factor grid (1-6x)
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| geology.fault_detected | {fault_id, location, slip_prob_30yr} | Per fault in bbox |
| geology.liquefaction_zone | {location, risk_level, area_m2} | Per zone |
| geology.sinkhole_risk_high | {location, risk_score, depth_to_water} | If risk >0.5 |
| geology.amplification_computed | {tile_id, mean_factor} | Per tile |
| geology.volcanic_hazard_zone | {hazard_type, extent, speed} | Per volcano |

## Earthquake Modeling Integration

Site amplification modifies ground motion:

```
Effective PGA = recorded_PGA * amplification_factor
  E.g., recorded 0.3g on hard rock → 0.6-1.8g on soft soil
```

Liquefaction risk compounds building damage (soft story + liquefaction = high collapse risk).

## Validation

- Cross-check GEM faults against USGS earthquake hypocenter catalogs
- Compare liquefaction zones against 1906 San Francisco, 2004 Sumatra earthquake damage
- Validate sinkhole risk against USGS sinkhole database
- Field survey volcanic hazard zones in active regions

## Accuracy Targets

| Metric | Target |
|---|---|
| Fault location accuracy | <500 m |
| Slip probability estimate | Within ±50% |
| Liquefaction zone boundary | >85% agreement with observations |
| Sinkhole risk ranking | >80% predictive power |

## ML Models

| Model | Purpose |
|---|---|
| Fault continuity predictor | Infer obscured fault segments | Gravity anomalies + seismicity |
| Liquefaction zone refiner | Enhance boundary mapping | Shakemap + liquefaction observed |

## Dependencies

- rasterio, fiona (raster/vector I/O)
- numpy, scipy (probabilistic models)
- shapely (polygon operations)
- Redis (caching)
- NATS (publishing)
