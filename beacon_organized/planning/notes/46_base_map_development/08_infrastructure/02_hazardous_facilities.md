# Hazardous Facilities

Toxic/explosive/radioactive facility mapping from EPA TRI/RMP, NRC, state fire marshal, satellite confirmation.

## Data Sources

| Source | Database | Records | Access | Update Frequency |
|---|---|---|---|---|
| EPA FRS | Facility Registry System | 800K+ facilities | Free, WFS | Quarterly |
| EPA RMP | Risk Management Programs | 14K+ plants | Free, download | Annual |
| EPA TRI | Toxics Release Inventory | 22K+ facilities | Free, download | Annual |
| NRC | Nuclear Regulatory Commission | 93 reactors + spent fuel | Free, API | Real-time |
| PHMSA | Hazmat pipeline registry | 300K+ miles | Free, download | Annual |
| ATF | Explosives facilities | 10K+, state databases | State-specific | Annual |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| load_epa_fri_facilities(bbox) | Bounding box | Facility point layer + attributes | hazmat.fri_facilities_loaded |
| load_epa_rmp_facilities(bbox) | Bounding box | RMP plants + worst-case scenarios | hazmat.rmp_facilities_loaded |
| load_nuclear_facilities() | Global | NRC reactor locations + planning zones | hazmat.nuclear_facilities_loaded |
| compute_hazmat_blast_radius(chemical, quantity) | Chemical + volume | Blast radius polygon | hazmat.blast_radius_computed |
| compute_toxic_plume_zone(chemical, weather, topography) | Chemical + dispersion model | Plume extent polygon | hazmat.plume_zone_computed |
| classify_facility_risk_level(chemicals, quantities, processes) | Facility inventory | Risk level 1-5 | hazmat.risk_level_classified |
| compute_population_in_blast_radius(blast_zone, census) | Blast polygon + population | Affected population count | hazmat.population_at_risk_computed |
| map_evacuation_zones_per_facility(facility, hazard_type) | Facility location + hazard | Evacuation zone polygons | hazmat.evacuation_zones_mapped |

## Facility Categories

| Category | Examples | Primary Hazards |
|---|---|---|
| Chemical plants | Refineries, synthetic chemicals | Fire, explosion, toxic release |
| Gas storage | Propane, natural gas | Fire, explosion, freeze burns |
| Ammunition/explosives | Ammunition stores, military | Explosion, fragmentation |
| Nuclear facilities | Reactors, spent fuel storage | Radiation, thermal |
| Laboratories | Universities, research | Varies by chemical inventory |
| Agricultural storage | Fertilizer (ammonium nitrate), pesticides | Fire, explosion, contamination |
| Gas stations | Retail fuel pumps | Fire, vapor explosion |

## Worst-Case Scenario (RMP)

EPA-mandated modeling for worst-case release of hazardous substance.

| Scenario | Example | Extent (km) |
|---|---|---|
| Chemical release (dense gas) | Chlorine, ammonia | 0.5-5 km to IDLH |
| Fire/explosion | Propane rupture | 0.3-1 km blast radius |
| Toxic vapor spread | Hydrogen fluoride | 2-10 km to LC50 |
| Thermal radiation | Large tank fire | 0.5-2 km |

## Blast Radius Calculation

TNT equivalency model for explosion hazard.

```
TNT_equivalent = chemical_quantity * TNT_factor
  Propane: 4.5 kg TNT / kg propane
  Gasoline: 3.2
  Ammunition: 0.5-1.0 (already energetic)

Blast_radius_m = 24.5 * (TNT_equivalent_kg) ^ (1/3)
  Example: 10 metric tons propane = 45 metric tons TNT
  Blast radius = 24.5 * (45,000,000)^(1/3) ≈ 900m
```

## Toxic Plume Dispersion

Gaussian plume model with topographic adjustment.

```
Plume extent = f(chemical_volatility, quantity, wind_speed, stability_class, terrain)

  Stability class (Pasquill-Turner):
    A: Very unstable (strong insolation, low wind) → wide dispersion
    D: Neutral (overcast, moderate wind) → moderate dispersion
    F: Very stable (night, calm) → narrow, concentrated plume

  IDLH = Immediately Dangerous to Life/Health concentration
  Plume mapped to IDLH contour (max concentration safe for emergency workers)
```

## Risk Level Classification

| Level | TRI Volume (lbs) | RMP Type | Action |
|---|---|---|---|
| 1 (Minimal) | <1000 | None | Monitor, no specific planning |
| 2 (Low) | 1K-10K | Regulated | Pre-event awareness |
| 3 (Moderate) | 10K-100K | RMP, not worst-case | Community notification + training |
| 4 (High) | 100K-1M | RMP + worst-case | Evacuation plan, frequent drills |
| 5 (Extreme) | >1M or multi-chemical | Catastrophic scenarios | Maximum readiness, 24/7 monitoring |

## Data Storage

| Table | Schema |
|---|---|
| hazmat_facilities | facility_id, location, facility_type, primary_chemical, quantity_lbs, risk_level |
| rmp_worst_case | scenario_id, chemical, quantity, blast_radius_m, plume_zone_geometry |
| nuclear_facilities | facility_id, location, reactor_count, planning_zone_10mi, planning_zone_50mi |
| evacuation_zones | zone_id, facility_id, hazard_type, geometry, population |
| blast_radiuses | facility_id, blast_radius_m, blast_geometry |
| toxic_plumes | scenario_id, facility_id, plume_geometry, max_concentration_ppm |

## Redis Cache

```
rmp_facilities:{bbox} -> facility point layer + worst-case
blast_zones:{facility_id} -> blast polygon
plume_zones:{facility_id} -> plume polygon
nuclear_zones:10mi -> 10-mile planning zone
nuclear_zones:50mi -> 50-mile planning zone
evacuation_zones:{facility_id} -> evacuation polygons
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| hazmat.rmp_facility_detected | {facility_id, location, risk_level} | Per facility |
| hazmat.blast_radius_computed | {location, radius_m, tnt_equivalent} | Per RMP facility |
| hazmat.plume_zone_mapped | {location, extent_m, max_concentration} | Per scenario |
| hazmat.high_population_risk | {facility_id, population_at_risk} | If pop > threshold |
| hazmat.nuclear_facility_detected | {location, reactor_count, planning_zones} | Per facility |

## Validation

- Cross-check EPA RMP addresses against facility locations (GPS verification)
- Validate worst-case scenarios against plant-specific technical reports
- Compare blast radiuses against historical accident case studies
- Confirm evacuation zones align with county emergency plans

## Accuracy Targets

| Metric | Target |
|---|---|
| Facility location accuracy | <100m |
| Risk level classification | >95% agreement with EPA |
| Blast radius uncertainty | ±20% |
| Plume zone modeling | >85% vs wind tunnel tests |
| Population count accuracy | ±10% |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Facility risk classifier | Estimate risk from chemical inventory | EPA RMP labeled facilities |
| Blast radius refiner | Adjust for terrain/building shielding | Historical accident cases |
| Plume dispersion refiner | Integrate terrain + weather patterns | Atmospheric modeling outputs |

## Performance

| Operation | Time (1 km²) |
|---|---|
| RMP facility load | 1 sec |
| Blast compute | 3 sec |
| Plume dispersion | 10 sec |

## Dependencies

- numpy, scipy (Gaussian plume, blast models)
- rasterio, fiona (GIS I/O)
- shapely (polygon operations)
- pandas (EPA data processing)
- PostgreSQL (facility database)
- Redis (caching)
- NATS (publishing)
