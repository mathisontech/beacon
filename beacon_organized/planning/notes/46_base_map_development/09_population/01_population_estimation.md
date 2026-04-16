# Population Estimation

Multi-source population modeling: Census block data, building units, commercial occupancy, time-of-day variation, seasonal adjustment.

## Data Sources

| Source | Metric | Resolution | Frequency |
|---|---|---|---|
| Census ACS | Population, household size, age | Block group (~1500 people) | Annual |
| Building detections | Unit count, floor area, purpose | Per building | Once/year update |
| Google Places | Business category, hours | Per POI | Daily refresh |
| Cellular data (aggregated) | Movement patterns | Block group | Real-time |
| School enrollment | Student counts | Per school | Annual |
| Hotel/motel records | Rooms, occupancy rate | Per facility | Monthly |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| load_census_block_data(bbox) | Bounding box | Census attributes by block group | population.census_loaded |
| compute_residential_population(units, household_size) | Unit count + Census data | Residential pop per building | population.residential_computed |
| compute_commercial_daytime_population(floor_area, purpose, density) | Floor area + type + lookup table | Commercial worker count | population.commercial_daytime_computed |
| compute_time_of_day_multiplier(building_type, hour, weekday) | Building type + time | Population multiplier 0-1 | population.time_multiplier_computed |
| compute_total_population_estimate(all_components) | All population layers | Total pop per cell | population.total_estimated |
| compute_population_density_grid(population, cell_area_m2) | Population + cell size | Density per square km | population.density_grid_computed |
| adjust_for_seasonal_variation(population, location_type) | Pop + seasonal factor | Adjusted population | population.seasonal_adjusted |
| compute_transient_population(hotels, hospitals, transit) | Facilities + capacity | Temporary resident count | population.transient_computed |

## Residential Population Calculation

```
Pop_residential = building_units * census_household_size

Census household size varies:
  - Urban core: 2.1 persons/unit
  - Suburban: 2.5 persons/unit
  - Rural: 2.8 persons/unit
  - Mobile homes: 1.8 persons/unit
  - Multi-family: 1.9 persons/unit

Applied by block group (Census geography)
```

## Commercial Daytime Population

Occupancy density varies by building purpose.

| Building Type | Floor Area Density | Persons per 100m² | Peak Time |
|---|---|---|---|
| Office | High | 15-20 | 9am-5pm |
| Retail | Medium | 5-8 | 10am-7pm, Sat-Sun |
| Warehouse | Low | 2-3 | 8am-5pm |
| Restaurant | Medium | 8-12 (including patrons) | 12-1pm, 6-8pm |
| Hotel | Medium | 2-4 occupied + staff | 24-hour |
| Hospital | High | 20-30 per floor | 24-hour |
| School | Very high | 30-40 | 8am-3pm weekdays |
| Gym/recreation | Medium | 5-15 | 5-7pm |

## Time-of-Day Multipliers

Population varies by hour, day of week, building type.

| Building Type | Night (10pm-6am) | Day (6am-6pm) | Evening (6pm-10pm) |
|---|---|---|---|
| Residential | 1.0 | 0.3-0.4 | 0.8-0.9 |
| Office | 0.05 | 1.0 | 0.1 |
| School | 0.0 | 1.0 | 0.0 |
| Retail | 0.0 | 0.7 | 0.5 |
| Restaurant | 0.05 | 0.4 | 0.9 |
| Hotel | 1.0 | 0.7 | 0.9 |
| Hospital | 1.0 | 1.0 | 1.0 |
| Gym | 0.0 | 0.3 | 0.9 |

Weekend/holiday adjustments:
```
Multiplier_weekend = Multiplier_weekday * weekend_factor
  Office: 0.05
  Retail: 1.2 (busier on weekends)
  School: 0.0
  Restaurant: 1.1
```

## Seasonal Variation Factors

| Location Type | Winter | Spring | Summer | Fall |
|---|---|---|---|---|
| Beach town | 0.5 | 1.0 | 2.0 | 1.0 |
| Ski resort | 2.5 | 0.3 | 0.5 | 0.5 |
| College town | 0.6 (break) | 1.0 | 0.3 (summer) | 1.0 |
| Urban business district | 0.95 | 1.0 | 0.95 | 1.0 |
| Agricultural area | 1.0 | 1.2 (harvest) | 1.0 | 1.0 |

## Data Storage

| Table | Schema |
|---|---|
| census_block_data | block_group_id, bbox, total_pop, age_0_17, age_18_64, age_65_plus, avg_household_size |
| residential_population | building_id, unit_count, estimated_population |
| commercial_population | building_id, floor_area_m2, purpose, daytime_workers |
| population_time_series | cell_id, hour, dow (day of week), population_count |
| seasonal_factors | location_id, location_type, season, adjustment_factor |
| transient_population | facility_id, facility_type, capacity, current_occupancy |

## Redis Cache

```
census_block:{block_group_id} -> Census demographics
residential:tile:{tile_id} -> Residential pop per cell
commercial:tile:{tile_id} -> Commercial pop per cell
population:tile:{tile_id}:hour:{hour} -> Time-of-day adjusted pop
seasonal_factor:{location_id}:{month} -> Seasonal adjustment
transient:{facility_id} -> Transient occupancy current
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| population.census_loaded | {block_group_count, total_pop} | Per bbox |
| population.residential_computed | {tile_id, total_pop, density_per_km2} | Per tile |
| population.daytime_peak_identified | {location, peak_hour, peak_population} | Per building |
| population.high_density_zone | {location, pop_per_km2, density_level} | If density >5000/km² |
| population.seasonal_adjustment | {location, season, adjustment_factor} | Per season change |
| population.total_estimated | {bbox, time_of_day, total_population} | Per query |

## Validation

- Cross-check residential pop against Census block group totals (±15% target)
- Compare daytime pop to employment data + school enrollment
- Validate time-of-day factors via mobile phone movement patterns
- Check seasonal variation against tourism board statistics

## Accuracy Targets

| Metric | Target |
|---|---|
| Residential pop (block group) | ±15% vs Census |
| Daytime pop (tract) | ±30% vs employment data |
| Building units | ±25% per building |
| Time-of-day factor | >85% category accuracy |
| Transient pop | ±50% |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Unit counter | Estimate residential units from imagery | Building surveys + unit counts |
| Commercial occupancy predictor | Daytime pop from floor area + category | POI data + employment stats |
| Time-of-day model | Predict occupancy by hour + day + season | Cellular anonymized data + survey |
| Seasonal factor predictor | Predict seasonal variation | Tourism board + school calendars |

## Performance

| Operation | Time (1 km²) |
|---|---|
| Census load | 1 sec |
| Residential compute | 2 sec |
| Commercial daytime compute | 3 sec |
| Time-of-day aggregation | 2 sec |

## Dependencies

- numpy, pandas (population computation)
- scikit-learn (time-series models)
- Census API (demographic data)
- rasterio (gridding)
- PostgreSQL (facility inventory)
- Redis (caching)
- NATS (publishing)
