# Passability Model

Core dynamic traversability computation combining terrain, surface, obstacles, weather, and damage.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| compute_base_passability | Road surface, width, terrain slope, vehicle type | Base passability 0-1 | Surface properties + vehicle specs |
| adjust_for_weather | Base passability, weather conditions, road type | Weather-adjusted passability | Weather model + road database |
| adjust_for_damage | Passability, post-event obstruction data | Damage-adjusted passability | Street-level perception + user reports |
| compute_passability_by_vehicle_class | Road attributes, vehicle type | Vehicle-specific passability 0-1 | Vehicle dimension database |
| generate_passability_grid | Road network, passability per segment | 8-direction traversability raster | Grid interpolation |
| update_passability_realtime | NATS event stream, obstruction detection | Live passability update | Event-driven processing |
| compute_directional_traversability | Terrain slope, aspect, 8 directions | Traversability per direction | DEM-based routing |

## Data Storage

Passability stored in multiple formats:

```
{
  // Per-segment passability
  "passability_base": float32,
  "passability_current": float32,
  "passability_last_update": datetime,
  "weather_factor": float32,
  "damage_factor": float32,

  // Per-vehicle passability
  "passability_2wd": float32,
  "passability_awd": float32,
  "passability_4wd": float32,
  "passability_fire_truck": float32,
  "passability_ambulance": float32,
  "passability_bus": float32,
  "passability_semi_truck": float32,

  // Hazard-specific overrides
  "passability_flood": float32,
  "passability_snow": float32,
  "passability_fire": float32,

  // Directional grid (8 directions)
  "directional_passability": [float32 × 8]
}
```

Passability raster (1km tiles): 8-bit per direction, 0-255 scale (0=impassable, 255=fully passable).

## Base Passability Computation

Base = surface × width_factor × slope_factor × vehicle_fit

### Surface Component

| Surface Type | Base Passability |
|---|---|
| Asphalt (good) | 1.0 |
| Asphalt (fair) | 0.95 |
| Asphalt (poor) | 0.80 |
| Concrete | 1.0 |
| Gravel (good) | 0.90 |
| Gravel (poor) | 0.70 |
| Dirt (dry) | 0.80 |
| Dirt (wet) | 0.40 |
| Paved/mixed | 0.85 |

### Width Factor

| Width (m) | 2WD | 4WD | Fire Truck | Semi-Truck |
|---|---|---|---|---|
| <3.5 | 0.5 | 0.8 | 0.0 (impassable) | 0.0 |
| 3.5-5 | 0.7 | 0.95 | 0.0 | 0.0 |
| 5-7 | 0.9 | 1.0 | 0.6 | 0.0 |
| 7-10 | 1.0 | 1.0 | 0.9 | 0.5 |
| >10 | 1.0 | 1.0 | 1.0 | 1.0 |

### Slope Factor

| Grade | Passability Multiplier |
|---|---|
| <5% | 1.0 |
| 5-10% | 0.95 |
| 10-15% | 0.80 |
| 15-20% | 0.50 |
| >20% | 0.0 (impassable for vehicles) |

### Vehicle Fit

Checks if vehicle can physically fit:
- Vehicle width ≤ road width → multiplier 1.0
- Vehicle width > road width → multiplier 0.0 (impassable)

Base passability = surface × width_factor × slope_factor × vehicle_fit

Example: 6m road, asphalt (good), 8% grade, sedan (1.8m wide):
- Surface: 1.0
- Width factor (sedan): 0.9
- Slope: 0.95
- Vehicle fit: 1.0 (1.8 < 6)
- Base passability = 1.0 × 0.9 × 0.95 × 1.0 = 0.855

## Weather Adjustments

Real-time weather data (HRRR, local NWS):

### Snow/Ice

Impact by road type and clearing status:

| Condition | Paved Road (Cleared) | Unpaved Road | Elevation >2000m |
|---|---|---|---|
| <2cm snow | ×0.95 | ×0.80 | ×0.85 |
| 2-5cm snow | ×0.80 | ×0.60 | ×0.65 |
| 5-10cm snow | ×0.60 | ×0.30 | ×0.40 |
| >10cm snow | ×0.30 | ×0.0 | ×0.15 |
| Ice (any depth) | ×0.50 | ×0.20 | ×0.30 |

Snow plow tracking: If road marked "plowed in last 2 hours," apply +0.15 bonus (cleared condition).

### Rain/Flooding

| Flood Depth | Passability Multiplier |
|---|---|
| <0.3m (6") | ×0.80 (water visible, proceed cautiously) |
| 0.3-0.6m (1-2") | ×0.30 (SUV/truck at risk of stall) |
| >0.6m (2"+) | ×0.0 (all vehicles impassable) |

Flood depth modeled from USGS stream gauges + DEM flow direction.

### Wind

High wind (>60 km/h) affects high-profile vehicles:

| Vehicle Type | Wind >60 km/h | Wind >80 km/h |
|---|---|---|
| Sedan | ×0.95 | ×0.70 |
| SUV | ×0.90 | ×0.60 |
| Van | ×0.80 | ×0.40 |
| Bus | ×0.70 | ×0.20 |
| Semi-truck | ×0.60 | ×0.0 (impassable) |

## Damage Adjustments

Post-event obstruction from street-level perception:

From user phone camera + traffic camera feeds:

| Obstruction | Impact |
|---|---|
| Debris field (>50% width blocked) | ×0.3 (navigate carefully) |
| Debris complete blockage (100% width) | ×0.0 (impassable) |
| Fallen tree (partial) | ×0.5-0.7 depending on clearance |
| Building collapse (road width reduced) | ×0.2-0.5 based on visible width |
| Flooding (depth-based) | See rainfall section |

Real-time update: When user reports damage, NATS event triggers passability recalculation.

## Passability by Vehicle Class

Each road segment pre-computed for vehicle classes:

```
passability_sedan = base × width_sedan × slope
passability_4wd = base × width_4wd × slope × traction_bonus
passability_fire_truck = base × width_truck × slope × fire_truck_specific_penalties
passability_semi_truck = base × width_semi × slope × semi_truck_penalties
```

Fire truck specific: Large turning radius, high center of gravity, limited ground clearance (~0.5m).
- Penalty for narrow streets: if width <7m, passability reduced by 0.3
- Penalty for steep slopes: semi-trucks impassable >8%

## 8-Direction Traversability Grid

For each 1km tile, compute traversability per 8 compass direction:

Directions: N, NE, E, SE, S, SW, W, NW

For each direction:
1. Extract path along that direction through tile
2. Compute passability per segment
3. Aggregate: min(segment_passabilities) per direction (bottleneck limited)
4. Store as uint8 array [N, NE, E, SE, S, SW, W, NW]

Use case: Emergency vehicles approaching from specific direction. Query NE passability to check if they can enter tile from northeast corner.

## Dynamic Updates

Real-time NATS event processing:

```
NATS Topic: passability.update.{event_type}

event_type = "obstruction_detected" | "snow_plow_completed" | "flood_reported" | "fire_proximity"

Payload:
{
  "road_id": "string",
  "tile_id": "string",
  "event_type": "string",
  "factor_name": "string" (e.g., "weather_snow", "damage_debris"),
  "adjustment": float32,
  "timestamp": datetime,
  "source": "camera" | "user_report" | "sensor" | "official"
}

Processing:
1. Lookup current passability_current for road
2. Apply adjustment factor
3. Update passability_current = base × factor_adjusted
4. Push to Redis cache
5. Notify subscribers (routing engine, user apps)
```

Latency target: <5 seconds from event to UI update.

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| passability.update.weather | Weather condition change | Per HRRR update (1 hour) |
| passability.update.damage | Obstruction detected | Real-time |
| passability.update.snow_plow | Road cleared | Real-time (from plow GPS) |
| passability.update.flood | Water depth change | Per gauge update (15 min) |
| passability.grid_updated | Full tile passability refreshed | Per update cycle |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `passability:{road_id}:current` | 1 hour | Live passability value |
| `passability:weather_factor` | 1 hour | Current weather adjustment per region |
| `passability:damage_map` | Real-time | Spatial damage field |
| `passability:grid:{tile_id}:directional` | 1 hour | 8-direction raster |
| `passability:vehicle_class:{class}:routable` | 1 hour | Roads passable for vehicle class |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| Base passability computation (CPU, per-segment) | $50-80 |
| Weather data integration (HRRR API, hourly updates) | $100-150 |
| Flood depth modeling (DEM + gauge data) | $80-120 |
| Damage detection (street-view CV processing) | $150-200 |
| Real-time event processing (NATS + Kafka) | $80-120 |
| Grid generation (8-direction raster) | $50-80 |
| **Total** | **$510-750** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Base passability vs. field test | >0.85 correlation | 50-vehicle field trial |
| Weather adjustment accuracy | >0.80 | Post-storm event validation |
| Damage detection sensitivity | >0.80 recall | 20-obstruction scenarios |
| Vehicle-specific prediction | >0.80 per class | Multi-vehicle field test |
| Real-time update latency | <5 seconds | 100-event timing test |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Base passability computed | >95% per tile | Proceed |
| Weather data availability | >90% regions | Proceed, use default if sparse |
| Damage update rate | <5 sec median | Proceed, flag slow events |
| Vehicle class diversity | >6 classes covered | Proceed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Computation cycle (base) | <30 days (US) |
| Weather update latency | <2 hours |
| Real-time damage update latency | <5 seconds |
| Routing engine query latency | <100ms per query |
| Field validation accuracy | >0.80 |
