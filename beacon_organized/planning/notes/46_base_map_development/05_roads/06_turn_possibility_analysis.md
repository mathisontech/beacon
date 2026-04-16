# Turn Possibility Analysis

Determine U-turn and K-turn feasibility for each road segment by vehicle type.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| compute_uturn_radius_needed | Vehicle type | Minimum radius (meters) | Vehicle dimension database |
| measure_available_turning_space | Road width, terrain geometry, adjacent land use | Available turning radius (meters) | LiDAR + DEM |
| compute_kturn_space_needed | Vehicle type | Minimum total length needed (meters) | 3-point turn geometry |
| classify_turn_possibility_by_vehicle | Available space, vehicle type | Turn feasibility (yes/maybe/no) | Spatial comparison |
| identify_turnaround_points | Road network, turn analysis, cul-de-sacs | Turnaround locations | Graph topology |
| flag_no_turnaround_dead_ends | Dead-end streets, turn analysis | No-turnaround flag for dead ends | Turn feasibility |

## Data Storage

Turn data stored inline in road GeoParquet and as separate turn-point layer:

```
{
  // Per-segment turn flags
  "uturn_sedan": boolean,
  "uturn_suv": boolean,
  "uturn_fire_truck": boolean,
  "uturn_semi_truck": boolean,
  "kturn_sedan": boolean,
  "kturn_suv": boolean,
  "kturn_fire_truck": boolean,
  "kturn_semi_truck": boolean,
  "turn_available_radius_m": float32,
  "dead_end_has_turnaround": boolean,

  // Turn-point features (separate layer)
  "turn_point_id": "string",
  "turn_point_type": "parking_lot" | "driveway" | "cul_de_sac" | "intersection_wide",
  "vehicles_can_turnaround": [string],
  "turn_radius_actual_m": float32
}
```

## U-Turn Analysis

U-turn = 180° turn in place (or within short distance).

Minimum radius by vehicle type:

| Vehicle | Length (m) | Width (m) | Turning Radius (m) | Notes |
|---|---|---|---|---|
| Sedan | 4.5 | 1.8 | 5.5 | Standard car |
| SUV | 4.8 | 2.0 | 6.0 | Compact SUV |
| Pickup truck | 5.5 | 2.0 | 6.5 | Standard bed |
| Van | 5.0 | 2.2 | 6.5 | Commercial van |
| Fire truck | 11.0 | 2.5 | 8.0 | Compact fire engine |
| Ambulance | 7.5 | 2.4 | 7.0 | Mobile ICU |
| Bus | 11.5 | 2.5 | 9.0 | Transit bus |
| Semi-truck | 16.0 | 2.6 | 10.0 | Tractor-trailer |

Turn radius calculation: R = wheelbase / sin(angle) for steady-state turning.

At full lock (maximum steering angle ~35°), minimum radius ≈ wheelbase / sin(35°) ≈ wheelbase × 1.74.

For sedan (2.7m wheelbase): R ≈ 4.7m ≈ 5.5m measured.

## K-Turn (3-Point Turn) Analysis

K-turn = Vehicle cannot U-turn, requires backing up (3-point maneuver).

K-turn space required:

```
Total length = vehicle_length + (2 × vehicle_length × tan(steering_angle))
```

For sedan at 35° steering: ~4.5 + 2 × 4.5 × tan(35°) ≈ 11m total length.

Typical K-turn space by vehicle:

| Vehicle | Length Needed (m) | Backing Distance (m) |
|---|---|---|
| Sedan | 10-12 | 2-3 |
| SUV | 12-15 | 3-4 |
| Fire truck | 25-30 | 5-8 |
| Semi-truck | 40-50 | 10-15 |

Feasibility: Road width ≥ vehicle width AND adjacent parking/shoulder available for backing.

## Available Turning Space Measurement

From LiDAR:

1. Extract perpendicular width profile at each point along road
2. Identify adjacent land use: parking lot (wide open) vs. buildings (constrained) vs. vegetation (passable with difficulty)
3. If parking lot adjacent: available radius = parking_lot_width
4. If open field adjacent: available radius = min(road_width × 2, field_extent)
5. If buildings/trees adjacent: available radius = road_width only

Examples:
- 7m road, 20m parking lot adjacent → available radius ≈ 15-20m (U-turn feasible for all vehicles)
- 5m narrow street with buildings on both sides → available radius = 2.5m (U-turn only for sedan, K-turn needed for larger vehicles)

## Dead-End and Cul-de-Sac Detection

Dead-end street: Network node with degree = 1 (only one road segment connected).

Classification:
- Pure dead-end (no turnaround available): Flag = `dead_end_has_turnaround = false`
- Dead-end with turnaround (parking lot, cul-de-sac): Flag = `dead_end_has_turnaround = true`

Turnaround detection:

1. Check if dead-end terminates in parking lot (satellite: open paved area)
2. Check if dead-end terminates in cul-de-sac (network: loop topology)
3. Check if dead-end terminates in intersection with wide road (road_width >10m)
4. Measure actual turnaround radius (available space at endpoint)

Example: Dead-end street 5m wide, terminates in circular cul-de-sac 25m diameter → radius 12.5m, all vehicles can turn (mark `dead_end_has_turnaround = true`).

## Turn-Point Features

Special locations where vehicles can reliably turn:

Features stored as point geometry:

```
{
  "geometry": "POINT(...)",
  "turn_point_id": "uuid",
  "turn_point_type": "parking_lot" | "cul_de_sac" | "intersection_wide" | "driveway_cluster",
  "turn_radius_actual_m": float32,
  "vehicles_can_turnaround": [
    "sedan", "suv", "pickup_truck", "van",
    "fire_truck", "ambulance", "bus", "semi_truck"
  ],
  "adjacent_road_ids": [string]
}
```

Populated by:
- Detected cul-de-sacs (network topology)
- Large parking lots (satellite detection, >20m diameter)
- Intersections where road_width > 10m (wide turnaround)
- Driveway clusters (adjacent driveways enabling multi-point turns)

## Dynamic Turn Availability

Turn feasibility can change due to:

1. **Parked vehicles**: Street crowding layer reduces available width
   - If cars parked on both sides: effective width = measured_width - 2 × car_width
   - If effective width <3m: even U-turns no longer feasible for larger vehicles

2. **Seasonal obstructions**: Snow piles, flood water
   - Road width is effective (after snow removal) vs. actual
   - Seasonal marking: `seasonal_turn_constrained = true` for winter in snowy regions

3. **Post-event damage**: Debris, fallen trees, building collapse
   - Real-time updates via street-level perception
   - Override turn flags if obstruction detected

## Routing Integration

Evacuation routing uses turn flags:

1. Query: "Can fire truck evacuate from this street?"
2. Check: `kturn_fire_truck` flag per street
3. If false: Find alternate route avoiding this street (or dispatch narrow-profile vehicle)

Example routing query:
```
SELECT roads WHERE
  dead_end_has_turnaround = false
  AND kturn_fire_truck = false
  → "No fire truck turnaround; plan alternate route"
```

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| turns.analysis.tile_done | Tile processed | Per-tile |
| turns.seasonal_constraint_updated | Seasonal flag change | Seasonal |
| turns.obstacle_detected | Parked cars/debris blocking turns | Real-time |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `turns:road:{road_id}:feasible_vehicles` | 7 days | Vehicle types that can turn |
| `turns:turnaround_points:{tile_id}` | 7 days | List of turnaround points |
| `turns:dead_ends_no_turnaround` | 7 days | Problematic dead-ends |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| Turn radius computation (CPU, geometry) | $50-80 |
| Available space measurement (LiDAR analysis) | $80-120 |
| Turnaround point detection (topology + satellite) | $50-80 |
| Seasonal constraint flagging | $30-50 |
| Manual verification of 50 roads | $50-100 |
| **Total** | **$260-430** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| U-turn feasibility prediction | >90% | Field validation (20 vehicles) |
| K-turn space availability | >85% | Field measurements |
| Cul-de-sac detection | >95% | Network topology validation |
| Dead-end turnaround identification | >90% | Field audit |
| Vehicle type-specific predictions | >0.80 per vehicle class | Multi-vehicle field test |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Turn radius computation coverage | >95% per tile | Proceed |
| Available space data quality | >80% per tile | Proceed, estimate if sparse |
| Dead-end classification agreement | >90% | Proceed |
| Seasonal constraint completeness | >70% per region | Proceed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Analysis cycle | <15 days (US) |
| Turn feasibility prediction accuracy | >0.85 overall |
| Fire truck route viability | >95% (no forced backtrack) |
| Routing integration latency | <50ms per route query |
