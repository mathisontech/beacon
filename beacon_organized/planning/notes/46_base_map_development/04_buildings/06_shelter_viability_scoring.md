# Shelter Viability Scoring

Rank buildings by suitability as emergency shelters, hazard-specific.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| score_structural_durability | Material, height, age, seismic vulnerability | Durability score 0-1 | Material resilience tables |
| estimate_capacity | Floor area, purpose-based density | Occupancy capacity (persons) | Density model by purpose |
| check_accessibility | Building type, entrances, ADA features | Accessibility score 0-1 | ADA checklist |
| compute_shelter_score_by_hazard | Durability, capacity, accessibility, hazard-specific data | Shelter score 0-1 | Hazard-specific ranking |
| rank_shelters_by_proximity | Building array, user location, hazard zone | Sorted shelter list | Distance + shelter score |
| compute_hours_of_access | Purpose, hours of operation, time of day | Access availability factor 0-1 | Schedule model |

## Data Storage

Shelter attributes stored inline in building GeoParquet:

```
{
  "structural_durability_score": float32,
  "shelter_capacity_persons": int32,
  "accessibility_score": float32,
  "shelter_score_tornado": float32,
  "shelter_score_flood": float32,
  "shelter_score_earthquake": float32,
  "shelter_score_wildfire": float32,
  "shelter_score_radiation": float32,
  "hours_of_access": string,
  "access_availability_factor": float32,
  "preferred_shelter_type": "basement" | "bank_vault" | "reinforced_concrete" | "multi_story" | "basement_freezer" | "subway_station"
}
```

## Structural Durability Scoring

Resistance to structural failure, normalized 0-1.

| Material Type | Base Durability | Age Modifier |
|---|---|---|
| Reinforced concrete | 0.95 | -0.10 if pre-1970 |
| Steel frame | 0.90 | -0.05 if pre-1980 |
| Brick/CMU reinforced | 0.75 | -0.15 if pre-1970 |
| Wood frame | 0.40 | -0.10 if pre-1980 |
| Manufactured home | 0.20 | -0.05 if >20 years old |

Height factor (taller = more complex, higher failure risk):
- 1-3 floors: 1.0
- 4-7 floors: 0.95
- 8-20 floors: 0.90
- >20 floors: 0.85

Final durability = material_base × age_factor × height_factor

## Capacity Estimation

Occupancy capacity based on floor area and purpose:

| Purpose | Density (persons per 100m²) |
|---|---|
| Residential (sleeping) | 1-2 |
| School gymnasium | 2-4 |
| Church/community center | 1-2 |
| Large retail (open space) | 2-5 |
| Warehouse (configured shelter) | 1-2 |
| Bank vault | 0.5-1 (small, high-security) |
| Walk-in freezer | 0.3-0.8 (very small) |

Capacity = floor_area_m² × (density_factor / 100) × accessible_floor_fraction

Example: 5,000 m² retail building with 3 accessible floors = 5000 × (3 / 100) × 0.9 = 135 persons.

## Accessibility Scoring

ADA compliance assessment:

| Feature | Points | Note |
|---|---|---|
| Accessible entrance (ramp or no steps) | +0.20 | |
| Accessible parking (nearby) | +0.10 | |
| Interior navigation (wide aisles, no obstacles) | +0.15 | |
| Accessible restrooms | +0.15 | |
| Accessibility for mobility-impaired | +0.20 | Ramps, elevators, accessible routes |
| Service animal accommodation | +0.10 | |
| Signage in multiple languages | +0.10 | |

Total accessibility score = sum of applicable features, capped 0-1.

Street-view CV assesses: ramp presence, door width (3.2m+ accessible), step count.

Manual verification: ADA compliance documents from facilities.

## Hazard-Specific Shelter Scores

### Tornado Shelter

Criteria: Below-ground or reinforced, minimal horizontal span.

Base durability applies. Modifiers:

- Basement present: +0.40 (highest protection)
- Bank vault or safe room: +0.50
- Walk-in freezer: +0.35
- Interior concrete room: +0.25
- Multi-story frame building: -0.30 (high collapse risk)

Capacity: Basement capacity typically lower, limited by stair access. Adjust capacity downward by 50% for basement shelters.

Final score = durability + location_modifier, clamped 0-1.

### Flood Shelter

Criteria: Elevation above flood level, multi-story, roof access.

Base: Elevation relative to 100-year flood elevation:
- >10m above: 0.90
- 5-10m above: 0.70
- 0-5m above: 0.40
- Below: 0.0 (unsuitable)

Modifiers:
- Multi-story (4+ floors): +0.15 (roof access evacuation)
- Flat roof with anchors: +0.10 (helicopter rescue feasible)
- Backup power: +0.05
- Water/sanitation capacity: +0.10

Final score = elevation_base + modifiers, clamped 0-1.

### Earthquake Shelter

Criteria: Non-collapse, open fields preferred over buildings.

Base durability applies (material + age).

Modifiers:
- Open field nearby (>500 m² flat, <2m elevation change): +0.25
- Reinforced concrete: +0.15
- High-rise (8+ floors): -0.20 (complex, higher failure risk)
- Soft story: -0.30 (collapse risk)

Final score = durability + location_modifiers.

### Wildfire Shelter

Criteria: Non-combustible, defensible space, water access.

Material modifier:
- Concrete/steel: 0.80
- Masonry: 0.60
- Wood frame: 0.20

Defensible space (distance to nearest vegetation):
- >100m: +0.20
- 50-100m: +0.10
- <50m: -0.10

Water supply (fire suppression):
- Sprinkler system: +0.15
- Nearby water source (pool, pond): +0.10
- None: 0

Final score = material_mod + defensible_space + water_mod.

### Radiation Shelter

Criteria: Below-ground depth, mass shielding.

Depth of protection:
- Subway station (10-30m underground): 0.95
- Building basement (3-5m underground): 0.70
- Bank vault (3-5m, heavily shielded): 0.85
- Above-ground building: 0.10

Modifiers:
- Concrete walls >50cm: +0.05
- Multiple floor slabs above: +0.10
- Limited ventilation (air-filtered): +0.10

Final score = depth_base + modifiers.

## Hours of Access

Shelters must be physically accessible during emergency.

Open doors model:
- Residential building: locked normally, accessible via forced entry
- Public building (school, library, town hall): operating hours known, after-hours access requires keys
- Commercial retail: business hours only, locked after-hours
- Hospital/fire station: always staffed
- Religious building: service hours + special request arrangements

For time-of-day occupancy:

```
access_factor = {
  "residential": 0.0 (locked, requires forced entry),
  "school_during_hours": 1.0 (open, staffed),
  "school_after_hours": 0.3 (locked, key holders may be reached),
  "office_during_hours": 1.0,
  "office_after_hours": 0.1 (locked, minimal staff),
  "retail_during_hours": 1.0,
  "retail_after_hours": 0.0 (locked),
  "hospital": 1.0 (24/7),
  "fire_station": 1.0 (24/7)
}
```

Adjusted shelter score = base_shelter_score × access_availability_factor.

## Shelter Ranking

For user at location (lat, lon) with hazard type:

1. Filter buildings by hazard-specific score > 0.60
2. Compute distance (walking time for evacuation context)
3. Rank by: shelter_score × (1 / distance_km) × access_factor
4. Return top 5-10 shelters with:
   - Shelter name
   - Distance
   - Capacity
   - Estimated shelter score
   - Access constraints
   - Key phone numbers (facility manager, EMS liaison)

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| shelters.scoring.tile_done | Tile processed | Per-tile |
| shelters.ranking_updated | User proximity update | Per evacuation event |
| shelters.access_changed | Hours of operation change | Daily |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `shelters:by_hazard:{hazard}:top_100` | 7 days | Highest-scored shelters per hazard |
| `shelters:capacity:by_purpose` | 7 days | Total capacity by building type |
| `shelters:access:open_now` | 24 hours | Buildings accessible at current time |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| Durability scoring (CPU, capacity lookup) | $50-80 |
| Accessibility assessment (CV + manual review of 100 buildings) | $200-300 |
| Hazard-specific scoring (thresholds + modifiers) | $50-80 |
| Hours of operation API (Google/OSM lookup, 500k queries) | $150-200 |
| EMS facility manager outreach (100 facilities, verification) | $150-250 |
| **Total** | **$600-910** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Shelter score agreement (EMS expert) | Kappa >0.70 | 100-building assessment |
| Capacity estimate accuracy | ±20% MAPE | 20-shelter occupancy test |
| Accessibility detection (ADA ramp) | >90% precision | 50-building field audit |
| Hazard ranking realism (peer review) | >0.75 agreement | 200-shelter EMS ranking |
| Hours of access accuracy | >90% | Facility contact verification |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Durability score distribution | Mean 0.45-0.65 | Proceed, flag skewed |
| Accessible shelters per tile | >3 per 10k persons | Flag underserved areas |
| Hazard score variance | >0.15 std dev | Proceed |
| Access factor data completeness | >85% buildings | Proceed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Scoring cycle | <20 days (US) |
| Shelter ranking latency (user query) | <500ms |
| Shelter availability during event | >95% accessible |
| EMS satisfaction (post-event survey) | >0.80 rating |
