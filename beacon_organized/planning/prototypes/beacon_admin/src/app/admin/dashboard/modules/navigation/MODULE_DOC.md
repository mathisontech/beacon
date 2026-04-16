# Navigation & Terrain Module Documentation

## Module Overview

The Navigation & Terrain module governs movement, routes, and physical traversability during emergencies. It operates as two integrated sub-modules:

1. **Passable Terrain Manager** - Real-time assessment of road/trail passability across vehicle types
2. **Evacuation Manager** - Multi-objective route optimization and evacuation guidance

This module is critical infrastructure consumed by public user features, EMS clients, hazard models, notifications, and sensor integration systems. It directly impacts life-safety decisions during evacuations.

---

## 1. Passable Terrain Manager

### Purpose

Maintains dynamic, real-time traversability data for all terrain and road segments. Fuses multiple data sources (DOT feeds, user reports, hazard models, sensor data) into vehicle-specific passability scores. Propagates to routing engine for evacuation path computation.

### Responsibilities

- Ingest and normalize road network data from multiple sources (OSM, TIGER/Line, LiDAR, satellite)
- Extract 40+ attributes per road segment (width, surface type, bridges, barriers, turn feasibility)
- Compute base passability for each segment accounting for surface, width, slope, vehicle dimensions
- Apply real-time weather adjustments (snow/ice depth, flooding, wind exposure)
- Process damage reports and sensor observations (collapsed structures, debris, flood depth)
- Calculate vehicle-specific passability (2WD, 4WD, fire truck, ambulance, semi-truck, bus)
- Compute 8-directional traversability grids for emergency approach routing
- Broadcast passability updates via NATS for real-time propagation

### Architecture

#### Data Ingestion Pipeline

```
Source Data:
├── Static Attributes (refreshed quarterly)
│   ├── OpenStreetMap network + attributes
│   ├── TIGER/Line conflation
│   ├── LiDAR point clouds (1m resolution)
│   ├── Satellite imagery (high-res RGB)
│   ├── Digital elevation model (DEM)
│   └── Historical traffic camera feeds
│
├── Dynamic Weather (real-time)
│   ├── HRRR forecast model (hourly)
│   ├── NWS local observations
│   ├── NOAA rainfall data
│   └── Flood gauge feeds (USGS)
│
├── Event Sensor Data (real-time during emergencies)
│   ├── User phone camera (street-level perception)
│   ├── Traffic camera networks
│   ├── User blockage reports (mesh/cellular)
│   └── Snow plow GPS tracking
│
└── Hazard Model Outputs (real-time during events)
    ├── Fire perimeter intersection data
    ├── Flood inundation zones
    ├── Landslide hazard areas
    └── Power line outage maps

            ↓

Fusion Engine:
├── Network topology conflation (OSM ↔ TIGER matching)
├── Multi-source attribute reconciliation
├── Damage detection (CV + sensor fusion)
├── Passability computation
└── Vehicle-class stratification

            ↓

Output Layers:
├── Road segment network (topology + 40+ attributes)
├── Passability scores (per vehicle class)
├── 8-direction traversability grids
├── Vehicle-specific routing constraints
└── Real-time hazard overlays
```

#### Core Functions

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| ingest_osm_data | Load OpenStreetMap vector | OSM XML/PBF | Topology layer | N/A | OSM API |
| ingest_tiger_data | Load TIGER/Line data | Shapefile | Road segment layer | N/A | US Census |
| conflate_networks | Match OSM ↔ TIGER geometries | OSM, TIGER | Unified topology | 30s per 100km | Geometry matching |
| extract_road_width | Measure from LiDAR/satellite | Point cloud, RGB imagery | Width (meters) per segment | <60s per 100km | LiDAR + D-LinkNet |
| classify_surface | Determine paved/unpaved/condition | Satellite + street-view | Surface type + condition | <60s per 100km | CV models |
| detect_bridges | Identify bridges and overpasses | LiDAR heights + OSM | Bridge segment list | <30s per 100km | Height raster |
| detect_gates_barriers | Find access restrictions | Street-view + LiDAR | Barrier list + rammability score | <45s per 100km | CV + geometry |
| analyze_turn_feasibility | Compute U-turn/K-turn possibility | Road width, slope, vehicle specs | Turn matrix per segment | <15s per 100km | Vehicle DB |
| compute_base_passability | Calculate surface-based traversability | Surface, width, slope, vehicle | Passability [0-1] | 50ms | Road attributes |
| adjust_for_weather | Apply environmental conditions | Base passability, weather data | Weather-adjusted score | 100ms | Weather API |
| adjust_for_damage | Reduce for post-event conditions | Passability, damage reports | Damage-adjusted score | 50ms | Sensor fusion |
| compute_vehicle_passability | Generate vehicle-class scores | Base passability, vehicle specs | Passability per vehicle type | 30ms | Vehicle DB |
| generate_traversability_grid | Create 8-direction raster | Road segments, terrain | Directional passability grid | 2s per 1km tile | Road layer |
| update_passability_realtime | Process NATS events | Passability update event | Updated segment scores | <5s | Event stream |
| get_segment_passability | Query current score | Segment ID, vehicle type | Float [0-1] + timestamp | 10ms | Cache (Redis) |
| broadcast_passability_update | Publish change via NATS | Updated segment ID, new score | Event published | 1s | NATS broker |

#### Data Storage

**PostgreSQL/PostGIS Tables**

| Table | Purpose | Key Fields | Retention | Indexing |
|-------|---------|-----------|-----------|----------|
| road_segments | Core road network | segment_id, geom, surface, width, lanes, bridge_flag, gate_flag | Indefinite | geom (BRIN), segment_id |
| road_attributes | 40+ segment attributes | segment_id, surface_type, width_m, lane_count, slope_pct, u_turn, k_turn, turn_radius | Indefinite | segment_id |
| passability_static | Base pre-computed scores | segment_id, surface_component, width_factor, slope_factor | Quarterly refresh | segment_id |
| passability_dynamic | Real-time adjustments | segment_id, weather_factor, damage_factor, timestamp | 30 days | segment_id, timestamp |
| vehicle_passability | Per-vehicle-class scores | segment_id, vehicle_class, passability, timestamp | 30 days | segment_id, vehicle_class |
| hazard_passability_override | Hazard-specific constraints | segment_id, hazard_type, multiplier, event_id, active | 6 months | segment_id, event_id |
| blockage_reports | User-reported impassability | blockage_id, segment_id, reporter_id, location, severity, reported_at, confirmed | 90 days | segment_id, reported_at, confirmed |
| damage_observations | Street-level perception detections | observation_id, segment_id, damage_type, confidence, detected_at, cv_model_version | 90 days | segment_id, detected_at |
| traversability_grid | 8-direction raster per tile | tile_id, directional_passability[8], timestamp | 7 days | tile_id |

**Redis Cache**

| Key | TTL | Use | Latency |
|-----|-----|-----|---------|
| `passability:{segment_id}:{vehicle_class}` | 5 min | Instant lookups | <1ms |
| `passability:tile:{tile_id}:grid` | 24 hours | 8-direction traversability | <1ms |
| `blockage:{segment_id}:reports` | 30 min | Active blockage count | <1ms |
| `weather:passability:factors` | 15 min | Current weather multipliers | <1ms |
| `hazard:passability:overrides:{event_id}` | Duration of event | Hazard-based constraints | <1ms |

### Configuration & Tuning

#### Base Passability Computation

**Surface Component**
```
Asphalt (good condition)    → 1.0
Asphalt (fair)              → 0.95
Asphalt (poor)              → 0.80
Concrete                    → 1.0
Gravel (good)               → 0.90
Gravel (poor)               → 0.70
Dirt/unpaved (dry)          → 0.80
Dirt/unpaved (wet)          → 0.40
Paved/mixed                 → 0.85
```

**Width Factor by Vehicle**
```
Road Width   | 2WD  | 4WD  | Fire Truck | Semi-Truck
<3.5m        | 0.5  | 0.8  | 0.0        | 0.0
3.5-5m       | 0.7  | 0.95 | 0.0        | 0.0
5-7m         | 0.9  | 1.0  | 0.6        | 0.0
7-10m        | 1.0  | 1.0  | 0.9        | 0.5
>10m         | 1.0  | 1.0  | 1.0        | 1.0
```

**Slope Factor**
```
Grade       | Multiplier
<5%         | 1.0
5-10%       | 0.95
10-15%      | 0.80
15-20%      | 0.50
>20%        | 0.0 (impassable for vehicles)
```

#### Weather Adjustments

**Snow/Ice on Paved Roads (Cleared)**
```
<2cm snow     → ×0.95
2-5cm snow    → ×0.80
5-10cm snow   → ×0.60
>10cm snow    → ×0.30
Ice (any)     → ×0.50
Plowed <2hrs  → +0.15 bonus
```

**Flooding**
```
<0.3m depth   → ×0.80 (visible, caution)
0.3-0.6m      → ×0.30 (SUV at risk)
>0.6m         → ×0.0 (impassable all vehicles)
```

**High Wind**
```
Wind >60 km/h:
  Sedan       → ×0.95
  SUV         → ×0.90
  Van         → ×0.80
  Bus         → ×0.70
  Semi-truck  → ×0.60

Wind >80 km/h:
  Sedan       → ×0.70
  SUV         → ×0.60
  Van         → ×0.40
  Bus         → ×0.20
  Semi-truck  → ×0.0
```

#### Damage Adjustments

```
Debris field (>50% blocked)     → ×0.3
Complete blockage (100%)        → ×0.0
Fallen tree (partial)           → ×0.5-0.7
Building collapse (width reduced) → ×0.2-0.5
Fire-caused burn (impassable)   → ×0.0
Recently burned (cooled)        → ×0.8
```

### Message Bus (NATS)

| Topic | Payload | Frequency | Consumers |
|-------|---------|-----------|-----------|
| `terrain.segment.passability_updated` | `{segment_id, old_score, new_score, vehicle_class, reason, timestamp}` | Real-time | Evacuation engine, routing cache |
| `terrain.weather.passability_adjusted` | `{affected_segments, weather_type, multiplier, effective_time}` | Hourly + events | Routing cache refresh |
| `terrain.damage.blockage_reported` | `{blockage_id, segment_id, reporter_id, location, severity, timestamp}` | Real-time | Blockage aggregator |
| `terrain.damage.blockage_confirmed` | `{blockage_id, confirmation_count, severity_updated, timestamp}` | Real-time | Evacuation rerouting |
| `terrain.hazard.passability_override` | `{segment_id, hazard_type, multiplier, event_id, active}` | Event-driven | Routing engine |
| `terrain.grid.traversability_computed` | `{tile_id, directional_grid[8], timestamp}` | Per tile refresh | Emergency approach planner |

### Employee Interfaces & Dashboards

#### 1. Terrain Status Dashboard

**Purpose:** Monitor real-time passability across region; identify bottlenecks and blockages

**UI Components:**
- Interactive map with color-coded passability overlay (green=passable, yellow=degraded, red=blocked)
- Segment detail panel: surface type, width, current weather factor, damage reports, blockage count
- Blockage management sidebar: confirmed blockages, reporter count, unconfirmed reports
- Weather layer overlay: current precipitation, snow depth, wind exposure areas
- Vehicle-class filter: toggle between 2WD, 4WD, fire truck, ambulance, semi-truck to see class-specific traversability
- Time slider: project passability given hazard trajectory (e.g., "passability in 30 minutes")

**Data Refresh:** Real-time (NATS subscriptions)
**Key Metrics:** % Network passable by vehicle class, median passability score, # blockages, # unconfirmed reports

#### 2. Road Network Attribute Editor

**Purpose:** Verify and correct extracted road attributes (width, surface, bridges, gates)

**UI Components:**
- Street-view window (satellite + ground-level camera feed side-by-side)
- Attribute input form: width slider, surface selector, bridge/gate toggles, turn feasibility checkboxes
- Confidence scoring: shows extraction CV model confidence, allows override
- Batch verification: show N unverified segments, mark as verified/needs_correction
- Photo evidence uploader: attach photos of specific road conditions
- Conflation editor: resolve OSM ↔ TIGER mismatches

**Data Persistence:** Edits stored in `road_attributes` table with editor_id, edit_timestamp

#### 3. Blockage Management Console

**Purpose:** Triage and confirm user-reported blockages; manage rerouting

**UI Components:**
- Blockage list: segment location, reporter count, severity estimate, time since report
- Report detail: show all reports for blockage, reporter profiles (verified or anonymous), photos if attached
- Confirmation workflow: "Confirm blockage," "Dismiss as false alarm," "Needs field verification"
- Rerouting trigger: manually trigger rerouting for affected evacuees
- Broadcast notification: alert all users in affected area with alternate routes
- Blockage history: archive of resolved blockages, patterns

**Severity Rules:**
- 1 report, no confirmation → low confidence
- 3+ reports, different reporters → medium confidence
- Official report (EMS, DOT) → high confidence
- Photos showing obstruction → confidence +0.2

#### 4. Passability Model Tuning UI

**Purpose:** Calibrate base passability, weather, and damage adjustment factors

**UI Components:**
- Simulation sandbox: adjust parameters, see real-time effects on network-wide passability
- A/B testing: compare old vs. new parameter sets on historical event data
- Validation metrics: accuracy vs. on-ground field truth, precision/recall on blockage detection
- Parameter sweep tool: automatically search for optimal weights for weather/damage multipliers
- Documentation: built-in guidance for each adjustment parameter with citations to research

**Audience:** Senior engineers, operations director
**Change Control:** Parameter changes require review before deployment; rollback capability

#### 5. Vehicle Routing Constraints Manager

**Purpose:** Define and test vehicle-specific traversability rules

**UI Components:**
- Vehicle class selector: dropdown list of vehicle types (2WD, 4WD, fire truck, ambulance, semi-truck, bus, motorcycle, ATV)
- Constraint definition: width minimum, length maximum, clearance minimum, slope maximum, surface restrictions
- Test routing: input start/end, see computed route per vehicle class with constraints applied
- Turn radius validation: visualize turn circle on map, highlight segments where vehicle cannot turn
- Special cases: seasonal restrictions (mountain passes require chains), toll roads, restricted access

#### 6. Weather Passability Adjustment Dashboard

**Purpose:** Monitor and adjust weather-based passability factors in real-time

**UI Components:**
- Weather radar overlay: live precipitation, snow depth from HRRR
- Passability snapshot: current passability scores by region and vehicle class
- Adjustment controls: sliders to override automated weather multipliers (manual calibration)
- Snow plow tracking: show active plow routes, mark segments cleared in last 2 hours
- Wind exposure map: highlight roads vulnerable to wind closure (e.g., high-altitude passes)

---

## 2. Evacuation Manager

### Purpose

Computes safe evacuation routes using OSRM, optimizes for multiple objectives (speed + safety + congestion), detects route blockages, manages shelter allocation, coordinates convoy routing, and provides guidance for low-visibility scenarios.

### Responsibilities

- Compute shortest-path routes using OSRM
- Generate alternate routes ranked by danger level and congestion
- Overlay hazard zones; exclude routes through dangerous areas
- Project hazard trajectories; assess if user can escape before impact
- Detect route blockages from user reports and sensor data
- Reroute users dynamically when blockages or hazards block primary route
- Calculate danger ratings (LOW/MEDIUM/HIGH/EXTREME) with confidence
- Assign public shelters; manage capacity constraints
- Route users to staging areas before final shelter (staging area pattern)
- Coordinate group evacuations with convoy routing
- Provide turn-by-turn guidance (audio + haptic)
- Support low-visibility guidance (UWB indoor, haptic feedback)
- Merge EMS-drawn routes; validate and suggest modifications
- Load-balance evacuation traffic across multiple routes

### Architecture

#### Routing Pipeline

```
User Location + Destination
        ↓
OSRM Shortest Path (main route)
        ↓
Generate Alternates (2nd, 3rd options)
        ↓
Overlay Hazard Zones
├── Check route-hazard intersection
├── Exclude routes through danger
└── Calculate impact time (ETA hazard)
        ↓
Rank Routes
├── By danger level (confidence score)
├── By congestion (model traffic load)
└── By distance (as tiebreaker)
        ↓
Assign Safe Zone (if applicable)
├── Compute safe zone polygon
└── Route user to safe zone centroid
        ↓
Select Shelter
├── Find nearest public shelter
├── Check capacity
└── Assign if space available
        ↓
Staging Area (if needed)
├── Compute intermediate staging zone
└── Route to staging first
        ↓
Output: Primary Route + Alternates + Danger Rating + ETA
```

#### Core Functions

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| compute_shortest_path | OSRM basic routing | start, end, avoid_zones | Route (coords, turn-by-turn) | 500ms | OSRM API |
| generate_alternate_routes | Compute 2nd/3rd options | start, end, hazard_zones | Route array (3 options) | 1s | Routing engine |
| overlay_hazard_zones | Check route-hazard intersection | route, hazard_polygon_set | Intersection points + segments | 100ms | Hazard data |
| rank_routes_by_danger | Score by danger level | route_array, hazard_model | Ranked routes + confidence | 100ms | Risk model |
| rank_routes_by_congestion | Score by traffic load | route_array, traffic_data | Ranked routes | 50ms | Traffic model |
| compute_danger_rating | Assign urgency tier | route, hazard_proximity, time | Danger tier (LOW/MED/HIGH/EXTREME) | 50ms | Risk model |
| project_hazard_at_time | Predict hazard location | hazard_model, minutes_ahead | Projected polygon | 100ms | Hazard predictor |
| check_route_safety_at_time | Will route intersect hazard? | route, time_to_departure | Safe/Unsafe + confidence | 100ms | Hazard projector |
| calculate_eta_departure | When is safest to leave? | location, hazard_trajectory | Recommended depart time + danger | 200ms | Optimizer |
| estimate_travel_time | Predict arrival | route, flow_rate, distance | ETA minutes | 10s | Traffic model |
| detect_route_blockage | Find impassable segments | route_id, user_reports | Blocked segment list | 10s | Report aggregator |
| notify_blockage | Alert users of blockage | user_id, blockage_location, alt_route | Notification sent | 2s | Notification module |
| reroute_around_blockage | Compute new path | user_location, hazard/blockage | New route + urgency | 1s | Routing engine |
| compute_safe_zones | Find unburnable areas | fire_extent, wind, heat_model | Safe zone polygon set | 2s | Multi-model |
| assign_public_shelters | Rank shelter options | user_location, hazard, shelter_db | Ranked shelter list | 100ms | Shelter index |
| track_shelter_capacity | Monitor occupancy | shelter_id, occupant_list | Current % occupied | 1s | Capacity log |
| enforce_shelter_limits | Prevent over-allocation | shelter_id, capacity | Enforcement status | 1ms | Capacity rules |
| compute_staging_areas | Safe waiting zones | hazard_zones, road_network | Staging area polygon set | 500ms | Area planner |
| generate_convoy_route | Route group together | group_user_list, destination | Shared route + meeting point | 500ms | Convoy optimizer |
| merge_ems_route | Prioritize EMS input | ems_route, auto_route | EMS-prioritized route | 100ms | Route merger |
| validate_ems_route | Check feasibility | ems_route, road_network | Validation status | 200ms | Validator |
| broadcast_route_to_group | Send to group members | route, group_id | Broadcast status | 2s | Messenger |
| provide_turn_by_turn | Audio/haptic guidance | route, user_location | Spoken instruction | 2s per turn | TTS/haptic |
| compute_exit_point | Track building exit | indoor_position_data, uwb | Exit coordinates | 100ms | Position tracker |
| provide_low_visibility_guidance | Haptic guidance at <1% viz | indoor_position, uwb, heading | Intense vibration toward escape | 1s per update | UWB/haptic |
| balance_users_across_routes | Distribute load | user_locations, route_set | Load-balanced assignments | 2s | Load balancer |
| suggest_backwards_driving | Last-resort escape | route_blocked_ahead, clearance | K-turn / U-turn suggestion | 200ms | Maneuver suggester |
| compute_route_capacity | Throughput on route | route, vehicle_density, time_window | Capacity (vehicles) | 100ms | Capacity calculator |

#### Data Storage

**PostgreSQL/PostGIS Tables**

| Table | Purpose | Key Fields | Retention | Indexing |
|-------|---------|-----------|-----------|----------|
| evacuation_routes | Computed routes | route_id, event_id, user_id, start, end, route_json, computed_at, status | 6 months | event_id, user_id, computed_at |
| route_updates | Rerouting history | route_id, version, reason, updated_at, old_route, new_route | 6 months | route_id, updated_at |
| blockage_reports | User-reported issues | blockage_id, route_id, user_id, location, reported_at, status, confirmed | 3 months | route_id, reported_at, confirmed |
| safe_zones | Computed safety areas | zone_id, hazard_type, event_id, polygon_json, confidence | 3 months | event_id, hazard_type |
| shelters | Shelter registry | shelter_id, name, location, capacity, is_public, is_ems_only, amenities | Indefinite | is_public, location |
| shelter_occupancy | Capacity tracking | shelter_id, timestamp, current_occupants, capacity_percent | 1 year | shelter_id, timestamp |
| staging_areas | Intermediate zones | staging_id, event_id, location, polygon_json | 3 months | event_id |
| ems_routes | EMS-authored routes | ems_route_id, event_id, ems_author_id, polyline_json, issued_at, status | 1 year | event_id, issued_at |
| convoy_assignments | Group routing | convoy_id, event_id, member_id_list, meeting_point, assigned_route | 3 months | event_id, member_id_list |
| danger_projections | Risk estimates | projection_id, route_id, departure_time, hazard_proximity, danger_tier, confidence | 1 month | route_id, departure_time |
| hazard_crossings | Route-hazard intersections | crossing_id, route_id, hazard_polygon, intersection_time, blockage_severity | 1 month | route_id |
| indoor_evacuation_paths | UWB-guided indoor routes | path_id, building_id, entry_point, exit_point, waypoints, uw_beacons | Event duration | building_id |
| evacuation_events | Event metadata | event_id, hazard_type, declared_at, scope_polygon, status | 2 years | hazard_type, declared_at |

**Redis Cache**

| Key | TTL | Use | Latency |
|-----|-----|-----|---------|
| `route:{route_id}` | Duration of evac | Current active route | <1ms |
| `route:{route_id}:danger_rating` | 5 min | Current danger tier | <1ms |
| `safe_zones:{event_id}` | 5 min | Computed safe zones | <1ms |
| `shelter_capacity:{shelter_id}` | 2 min | Current occupancy % | <1ms |
| `blockage:{route_id}` | 30 min | Known blockages | <1ms |
| `hazard_projection:{hazard_id}:{time}` | 5 min | Projected hazard location | <1ms |
| `user_evacuation_status:{user_id}` | Duration of evac | Active evac state | <1ms |
| `convoy:{convoy_id}` | Duration of evac | Group route + members | <1ms |

### Message Bus (NATS)

| Topic | Payload | Frequency | Consumers |
|-------|---------|-----------|-----------|
| `evacuation.route.computed` | `{route_id, user_id, event_id, route_json, danger_rating, eta_minutes}` | Per user request | User app, notifications |
| `evacuation.route.updated` | `{route_id, reason, old_route, new_route, urgency_flag, timestamp}` | Real-time | User app, notifications |
| `evacuation.blockage.reported` | `{blockage_id, route_id, location, reporter_id, severity_estimate}` | Per report | Blockage aggregator |
| `evacuation.blockage.confirmed` | `{blockage_id, confirmation_count, severity_final, timestamp}` | After 3+ reports | Routing engine |
| `evacuation.shelter.capacity.alert` | `{shelter_id, current_occupancy, capacity_percent, timestamp}` | When >85% | EMS dashboard |
| `evacuation.safe_zone.computed` | `{zone_id, event_id, hazard_type, polygon_json, confidence}` | Per event | User app, risk communication |
| `evacuation.danger.high` | `{user_id, route_id, danger_tier, confidence, time_to_impact_minutes}` | Real-time | Notifications, EMS |
| `evacuation.convoy.assembled` | `{convoy_id, member_count, meeting_point, assigned_route, ready_time}` | Per group formation | Group members |
| `evacuation.ems_route.issued` | `{ems_route_id, event_id, ems_author_id, route_json, broadcast_timestamp}` | Per EMS action | All users in zone |
| `evacuation.indoor.exit_confirmed` | `{path_id, exit_point, evacuee_count, timestamp}` | Per building | Indoor evac tracking |
| `evacuation.low_visibility.guidance_active` | `{user_id, visibility_percent, indoor_location, haptic_pattern}` | Every 1s | UWB system, phone haptic |

### Configuration & Tuning

#### Danger Rating Calculation

Danger is function of: hazard distance, hazard speed, user location, route ETA, time to impact.

```
danger_rating = f(
  hazard_distance_km,
  hazard_speed_kmh,
  user_eta_minutes,
  hazard_time_to_impact_minutes
)

LOW:       hazard >20km away OR user can escape >20min before impact + route clear
MEDIUM:    hazard 10-20km away OR user escape margin 10-20min
HIGH:      hazard 5-10km away OR user escape margin 5-10min
EXTREME:   hazard <5km away OR user cannot escape (boxed in, no safe direction)
```

#### Congestion Modeling

Routes ranked by:
1. Current traffic density (vehicles per km per lane)
2. Bottleneck capacity (smallest segment capacity on route)
3. Estimated slowdown (flow rate / desired speed)
4. Load balancing (users already assigned vs. capacity)

```
Congestion Score =
  (current_traffic_density / max_capacity) * 0.4 +
  (users_assigned / route_capacity) * 0.4 +
  (bottleneck_multiplier) * 0.2
```

Lower = better route.

#### Shelter Assignment Logic

```
Shelters ranked by:
1. Capacity (prefer >10% available)
2. Distance from user (prefer <5km)
3. Hazard safety (prefer distance from hazard)
4. Accessibility (prefer public over EMS-only)
5. Amenities (prefer facilities with power, water, medical)

assignment_priority =
  (1 - capacity_util) * 0.3 +
  (1 - distance_normalized) * 0.3 +
  (hazard_safety_score) * 0.2 +
  (amenity_score) * 0.2
```

#### Stage Area Selection

Staging areas are intermediate safe zones where users wait before proceeding to final shelter. Used when:
- Direct route to shelter blocked/dangerous
- Shelter at capacity but expected to free up
- Convoy assembly point needed
- Large group needs coordination point

```
Staging area selected if:
  - Distance to shelter <10km
  - Staging location outside primary hazard zone
  - Staging location has basic amenities (parking, shelter)
  - Multiple routes from staging to final shelter
```

### Employee Interfaces & Dashboards

#### 1. Real-Time Evacuation Monitoring

**Purpose:** Monitor active evacuations; track users, routes, shelters, and blockages

**UI Components:**
- Hazard overlay on map (fire perimeter, flood zone, tornado path)
- User locations (anonymized clusters at scale >100 users; individual dots at smaller scales)
- Route flows (animated arrows showing direction and speed on each route)
- Color coding: green (flowing), yellow (slow), red (stopped)
- Danger ratings displayed as badges on each user location
- Shelter icons with occupancy % in real-time
- Blockage markers with report count and confirmation status
- Time slider: advance/rewind to see evacuation progression

**Data Refresh:** Real-time (NATS subscriptions)
**Key Metrics:** Total evacuees, # on routes, # in shelters, # at risk (EXTREME danger), blocked routes, avg ETA

#### 2. Route Management & Optimization

**Purpose:** Analyze routes; identify bottlenecks; manually override or adjust routes

**UI Components:**
- Route list: all active routes, sorted by congestion, danger, or ETA
- Route detail: full path geometry, current users, blockages, danger rating, projected impact time
- Bottleneck analysis: identify slowest segments, show capacity vs. current load
- Load balancing tool: manually rebalance users across routes to prevent gridlock
- Alternative route suggestion: AI suggests best alternate given current conditions
- Manual override: EMS can manually draw/edit evacuation routes and broadcast to users
- Route validation: system checks EMS-drawn route for feasibility, blockages, suggests corrections

**Audience:** EMS operations, dispatch
**Change Control:** Route changes broadcast immediately via NATS; user app shows update

#### 3. Blockage Management & Confirmation

**Purpose:** Triage blockage reports; confirm severity; trigger rerouting

**UI Components:**
- Blockage report queue: incoming reports with location, reporter info, severity estimate
- Report map: visualize all reports for a blockage, show clustering
- Confirmation workflow: "Confirm blockage," "False alarm," "Needs field check"
- Severity classification: user input on obstruction type (debris, tree, flooding, fire, structure)
- Broadcast alert: send notification to all affected users with updated danger rating and alternate route
- Field verification: dispatch EMS to confirm blockage on-ground
- Blockage history: trends of false reports by region or user type (for education)

**Data Persistence:** All reports stored in `blockage_reports` table; confirmations feed into passability model

#### 4. Shelter Capacity Management

**Purpose:** Track real-time shelter occupancy; prevent over-allocation; plan relief operations

**UI Components:**
- Shelter list: capacity, current occupancy, % full, amenities available, EMS-only flag
- Occupancy trends: chart of occupancy over time for each shelter
- Capacity alerts: highlight shelters >85% full; suggest overflow to nearby shelters
- Shelter detail: contact info, accessibility features, available resources (medical, power, water)
- Intake/exit tracking: manual update of occupant counts (or integration with check-in system)
- Relief operations: schedule transfer of people from full shelter to new location
- Amenity status: track power outages, water issues, medical needs

**Audience:** EMS logistics, shelter coordinators
**Change Control:** Shelter updates propagate to user app within 30s

#### 5. EMS Route Drawing & Broadcasting

**Purpose:** Allow EMS to manually create and broadcast evacuation routes

**UI Components:**
- Map canvas: draw routes by clicking waypoints; route automatically snaps to road network
- Route validation: system checks for blockages, hazards, and suggests corrections
- Broadcast control: select user groups to send route to; confirm send
- Route history: archive of all routes issued during event; ability to revoke or update
- Conflict detection: warn if route intersects new hazards or blockages since creation
- Multi-route coordination: visualize multiple routes together; check for congestion
- Turn-by-turn preview: show what users will see (text directions + map)

**Audience:** EMS operations, evacuation commander
**Broadcast Method:** NATS topic `evacuation.ems_route.issued`; propagates to user app instantly

#### 6. Convoy & Group Evacuation Coordinator

**Purpose:** Manage group evacuations; assign convoy routes; track group assembly

**UI Components:**
- Group selector: search/filter by school, workplace, shelter, or custom group
- Member locations: show all group members on map; identify members not yet evacuated
- Meeting point selection: AI suggests optimal meeting point (centroid, parking area, main road)
- Route generation: compute single route for entire group; show estimated assembly time
- Assembly tracker: real-time indicator when % of group reaches meeting point
- Departure control: coordinator can signal "GO" when sufficient group assembled
- Route broadcast: send to all group members simultaneously
- Tracking: follow group progress toward destination

**Audience:** School coordinators, workplace evacuation leaders, EMS group management
**Change Control:** Group updates require coordinator confirmation

#### 7. Safe Zone & Shelter Decision Dashboard

**Purpose:** Visualize computed safe zones; assign shelters; confirm or override predictions

**UI Components:**
- Safe zone polygon overlay (green, semi-transparent)
- Hazard projections at 5/10/15/30 minute intervals (show hazard expansion over time)
- Shelter locations with capacity and distance to safe zone
- Shelter assignment recommendations (ranked by priority scoring)
- Manual override: EMS can designate alternate shelter or declare area unsafe
- Confidence scoring: show model confidence for each safe zone (based on hazard model uncertainty)
- Liability flagging: highlight EMS-designated last-resort shelters (only shown to EMS)

#### 8. Low-Visibility Guidance Setup

**Purpose:** Configure UWB beacons and indoor evacuation paths for buildings

**UI Components:**
- Building map with UWB beacon positions (indoor positioning nodes)
- Exit point specification: mark primary and alternate exits on map
- Path drawing: trace evacuation routes from building interior to exits
- Beacon routing: generate shortest low-visibility path using beacon network
- Haptic intensity tuning: set vibration intensity patterns for different distances to exit
- Pre-event testing: simulate low-visibility with mobile app; verify guidance works
- Documentation: generate building-specific evacuation instructions

**Audience:** Facility managers, EMS pre-event planning
**Deployment:** Paths cached on phones; activated when visibility <1%

#### 9. Traffic & Congestion Modeling

**Purpose:** Simulate evacuation flow; identify gridlock risk; optimize routing

**UI Components:**
- Simulation canvas: input # users, hazard extent, starting positions
- Traffic density model: visualize simulated traffic flow per route over time
- Bottleneck heatmap: highlight segments that become gridlocked
- Timing analysis: show ETA distribution; identify users unable to escape
- Route rebalancing: system suggests load-balanced user assignments to prevent bottleneck
- What-if scenarios: compare outcomes under different route sets, hazard speeds, entry point distributions
- Validation: compare simulation to actual event data from past incidents

**Audience:** Operations planners, research team
**Model:** Agent-based simulation with vehicle following dynamics

#### 10. Danger Projection & Communication

**Purpose:** Calculate danger ratings with confidence; communicate risk to users and EMS

**UI Components:**
- Danger rating breakdown: show inputs (hazard distance, speed, ETA, impact time)
- Confidence level: display uncertainty range (e.g., "HIGH confidence" vs. "MEDIUM confidence")
- Risk timeline: chart danger level over time as user evacuates
- User communication templates: generate recommended wording for danger notifications
- EMS briefing: summarize risk by zone; recommend evacuation priority
- Hazard speed confirmation: show model estimate vs. observed historical data for validation

---

## 3. Integration & Workflows

### 3.1 Hazard Model Integration

Each hazard module outputs:
- **Extent polygon:** Current hazard boundary (fire perimeter, flood inundation)
- **Speed estimate:** Hazard propagation speed (km/h)
- **Trajectory:** Future position (5/10/15/30 min ahead)
- **Confidence:** Model certainty (0-1)

Navigation module consumes via NATS topics:
- `hazard.{type}.extent_updated` → compute safe zones, update passability overrides
- `hazard.{type}.trajectory_updated` → project danger at time, recommend departure time
- `hazard.{type}.speed_updated` → recalculate ETAs, reroute if needed

### 3.2 Sensor Integration

Real-time sensor inputs update passability:
- **User phone cameras:** Street-level perception detects debris, fallen trees, flooding
- **Traffic cameras:** Monitor congestion, detect accidents
- **Snow plow GPS:** Mark roads cleared in last 2 hours
- **Blockage reports:** Users report impassable segments via app
- **Barometric pressure:** Phone sensors improve flood depth estimates

Processing: Sensor events published to NATS → passability model → routing engine

### 3.3 EMS Dispatch Integration

EMS can:
- Draw evacuation zones and issue routes
- Confirm blockages and hazard observations
- Update shelter status and capacity
- Request specific routing (e.g., "route all users to Stadium shelter")
- Broadcast custom alerts with routing recommendations
- Designate last-resort shelters (visible only to EMS)

All actions broadcast via NATS for immediate propagation to users and dashboards.

### 3.4 Public User Features

Public users receive:
- **Evacuation route:** Primary + 2 alternatives, with danger ratings
- **Turn-by-turn guidance:** Audio/haptic + map display
- **ETA countdown:** Time to safety, live updates
- **Shelter info:** Address, amenities, occupancy %, directions
- **Danger alerts:** Real-time danger rating updates
- **Blockage notifications:** When route blocked, alternate route offered
- **Low-visibility guidance:** Haptic feedback if visibility <1%
- **"I'm stuck" button:** Request help; mesh broadcast to nearby users

### 3.5 Mesh Networking

When cellular down:
- Pre-cached evacuation routes available offline
- Simplified map tiles for offline routing
- Blockage reports broadcast via mesh
- Hazard updates sync across mesh (may be delayed)
- UWB beacons for indoor evacuation (local mesh range)
- Standardized messages heavily compressed to fit mesh bandwidth

### 3.6 Offline Capability

Critical data cached on device:
- **All pre-computed evacuation routes** (for each region/hazard scenario)
- **Shelter locations** (within 100km of user)
- **Safe zone polygons** (pre-computed for major hazard scenarios)
- **Road network** (simplified: topology + passability, no turn-by-turn detail)
- **Hazard model** (compressed DL surrogate for on-phone inference)

Updates via mesh or cellular when available; graceful degradation if not.

---

## 4. Development Blocks & Dependencies

### 4.1 Critical Path (Launch Order)

1. **Road Extraction (46_base_map_development/05_roads)**
   - OSM + TIGER conflation
   - Width measurement from LiDAR
   - Surface classification
   - Bridge/gate detection
   - **Blocks:** Passability model, routing engine
   - **Timeline:** 6-8 weeks (US coverage)

2. **Passable Terrain Manager (Core)**
   - Base passability computation
   - Weather adjustment logic
   - Vehicle-class stratification
   - Real-time NATS integration
   - **Blocks:** Evacuation routing
   - **Timeline:** 4-6 weeks

3. **OSRM Integration**
   - Self-hosted OSRM setup or API integration
   - Turn-by-turn extraction
   - Alternate route generation
   - **Blocks:** Evacuation routing
   - **Timeline:** 2-3 weeks

4. **Evacuation Routing (Core)**
   - Shortest-path routing
   - Hazard overlay
   - Danger rating calculation
   - Alternate route ranking
   - **Blocks:** User features, EMS features
   - **Timeline:** 6-8 weeks

5. **Shelter Management**
   - Shelter database ingestion
   - Capacity tracking
   - Assignment logic
   - **Blocks:** Evacuation routing (final step)
   - **Timeline:** 3-4 weeks

6. **Dynamic Rerouting**
   - Blockage detection/confirmation
   - Real-time rerouting trigger
   - User notification integration
   - **Blocks:** Launch (critical for safety)
   - **Timeline:** 4-6 weeks

7. **Safe Zone Computation**
   - Integrate hazard model outputs
   - Compute unburnable/unhot areas
   - Staging area logic
   - **Blocks:** User features (safe zone display)
   - **Timeline:** 3-4 weeks

8. **EMS Route Drawing & Broadcasting**
   - Route canvas + snapping
   - Validation logic
   - Broadcast system
   - **Blocks:** EMS features
   - **Timeline:** 4-5 weeks

9. **Low-Visibility Guidance (UWB)**
   - UWB beacon network setup
   - Indoor path computation
   - Haptic feedback integration
   - **Blocks:** Advanced features (post-launch)
   - **Timeline:** 8-10 weeks

### 4.2 Dependencies

```
User location (Sensor Integration)
    ↓
Public User Features
    ↓
Evacuation Routing Core
    ├─ Passable Terrain Manager
    │  ├─ Road Extraction (Base Map)
    │  ├─ Vehicle Manager
    │  └─ Hazard Model outputs
    │
    ├─ OSRM Routing
    ├─ Traffic Model
    ├─ Hazard Projections
    └─ Shelter Database

    ↓
EMS Features
    ├─ Route Drawing & Broadcasting
    ├─ Blockage Management
    ├─ Shelter Management
    └─ Danger Projection Dashboards

    ↓
Advanced Features (Post-Launch)
    ├─ Low-Visibility Guidance
    ├─ Convoy Routing
    ├─ Mesh Delivery
    └─ Offline Capability
```

### 4.3 Known Blockers & Mitigation

| Blocker | Impact | Mitigation |
|---------|--------|-----------|
| LiDAR coverage gaps (rural areas) | Road width accuracy <50% | Fallback to satellite + user reports; mark low-confidence segments |
| OSRM performance at scale | >5s routing for single user | Self-host OSRM; optimize with spatial index; cache frequent routes |
| Hazard model uncertainty | Confidence <70% for projection | Show confidence ranges to users; recommend conservative behavior |
| Shelter database maintenance | Stale capacity data | Real-time capacity sync with shelter management systems; user-reported updates |
| Mesh bandwidth limits | Can't deliver full map | Compress routes to ~1KB; standardize messages; prioritize EMS traffic |
| Indoor positioning (UWB) | Limited building coverage | Phase 1: outdoor only; phase 2: key buildings (hospitals, schools) |

---

## 5. Technical Specifications

### 5.1 API Endpoints

All endpoints served at `/api/v1/evacuation/` and `/api/v1/terrain/`.

**GET /evacuation/route**
```json
Request:
{
  "user_id": "string",
  "start_location": {"lat": float, "lon": float},
  "end_location": {"lat": float, "lon": float},
  "vehicle_type": "sedan|suv|4wd|fire_truck|ambulance",
  "event_id": "string (optional)",
  "include_alternates": boolean (default true),
  "include_danger_rating": boolean (default true)
}

Response:
{
  "route_id": "string",
  "primary_route": {
    "geometry": "polyline",
    "distance_km": float,
    "eta_minutes": int,
    "waypoints": [{"lat": float, "lon": float, "instruction": "string"}],
    "passability_score": float
  },
  "alternate_routes": [{ ...same structure... }],
  "danger_rating": "LOW|MEDIUM|HIGH|EXTREME",
  "danger_confidence": float,
  "time_to_impact_minutes": int (nullable),
  "safe_zone_location": {"lat": float, "lon": float} (nullable),
  "assigned_shelter": {
    "shelter_id": "string",
    "name": "string",
    "location": {"lat": float, "lon": float},
    "occupancy_percent": float,
    "eta_to_shelter_minutes": int
  },
  "timestamp": "ISO 8601"
}
```

**POST /evacuation/blockage**
```json
Request:
{
  "user_id": "string",
  "route_id": "string",
  "location": {"lat": float, "lon": float},
  "obstruction_type": "debris|tree|flooding|fire|structure|other",
  "severity_estimate": "low|medium|high",
  "photo_urls": ["string"] (optional),
  "description": "string" (optional)
}

Response:
{
  "blockage_id": "string",
  "status": "reported",
  "confirmation_count": 1,
  "timestamp": "ISO 8601"
}
```

**GET /terrain/passability/{segment_id}**
```json
Request:
{
  "vehicle_type": "sedan|suv|4wd|fire_truck|ambulance",
  "include_factors": boolean (default true)
}

Response:
{
  "segment_id": "string",
  "passability_score": float [0-1],
  "base_score": float,
  "weather_factor": float,
  "damage_factor": float,
  "hazard_override": float (nullable),
  "last_updated": "ISO 8601",
  "active_blockage_reports": int
}
```

**GET /evacuation/safe-zones/{event_id}**
```json
Response:
{
  "event_id": "string",
  "hazard_type": "fire|flood|tsunami|earthquake|etc",
  "safe_zones": [
    {
      "zone_id": "string",
      "geometry": "polygon (GeoJSON)",
      "confidence": float,
      "reason": "unburnable|high_ground|drainage_area|etc"
    }
  ]
}
```

### 5.2 Database Schema Highlights

**Passability Model:**
```sql
CREATE TABLE road_segments (
  segment_id UUID PRIMARY KEY,
  geom GEOMETRY(LineString, 4326),
  osm_id BIGINT,
  tiger_id VARCHAR,
  surface_type VARCHAR,
  width_m FLOAT,
  lane_count INT,
  slope_pct FLOAT,
  has_bridge BOOLEAN,
  has_gate BOOLEAN,
  confidence FLOAT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE passability_dynamic (
  id UUID PRIMARY KEY,
  segment_id UUID REFERENCES road_segments,
  vehicle_class VARCHAR,
  passability FLOAT,
  weather_factor FLOAT,
  damage_factor FLOAT,
  timestamp TIMESTAMP,
  UNIQUE(segment_id, vehicle_class, timestamp)
);
```

**Evacuation Routes:**
```sql
CREATE TABLE evacuation_routes (
  route_id UUID PRIMARY KEY,
  event_id UUID REFERENCES evacuation_events,
  user_id UUID,
  start_location GEOMETRY(Point, 4326),
  end_location GEOMETRY(Point, 4326),
  route_json JSONB,
  danger_rating VARCHAR,
  danger_confidence FLOAT,
  eta_minutes INT,
  assigned_shelter_id UUID REFERENCES shelters,
  computed_at TIMESTAMP,
  status VARCHAR
);
```

### 5.3 Performance Targets

| Operation | Target SLA | Current (Est.) | Notes |
|-----------|-----------|----------------|-------|
| Compute single route | 500ms | 300-500ms | OSRM cached, simple road network |
| Generate 3 alternates | 1s | 800ms-1s2 | Parallel OSRM calls |
| Blockage detection | 10s | 5-8s | Aggregation window |
| Safe zone computation | 2s | 1.5-2s | Multi-model synthesis |
| Shelter assignment | 100ms | 50-80ms | Index lookup |
| Passability grid (1km tile) | 2s | 1.5-2s | Directional computation |
| Danger rating update | 50ms | 30-50ms | Simple calculation |
| Reroute on blockage | 1s | 800ms-1s | Re-run routing + broadcast |

### 5.4 Scalability

**Expected Load (Full US Deployment):**
- 10M+ simultaneous users during large event
- 100k+ route computations per minute
- 50k+ blockage reports per minute
- 1M+ passability queries per minute

**Architecture:**
- OSRM: 50-100 instances (auto-scaled by load)
- Route cache (Redis): 10TB+ for pre-computed common routes
- Passability cache (Redis): 1TB for dynamic scores
- Database: TimescaleDB cluster for time-series (blockage, occupancy)
- NATS: 10+ broker nodes for message distribution
- Hazard model inference: GPU cluster (inference only, training server-side)

---

## 6. Testing & Validation

### 6.1 Unit Tests

- Passability computation: all surface/weather/damage combinations
- Danger rating calculation: edge cases (hazard at location, user on route)
- Route ranking: verify ordering by danger, congestion, distance
- Shelter assignment: capacity enforcement, distance calculations
- Blockage detection: confirm aggregation thresholds

**Coverage Target:** >85%

### 6.2 Integration Tests

- OSRM integration: route generation, alternate routes, fallback behavior
- Hazard model integration: safe zone computation, trajectory projection
- NATS message propagation: end-to-end broadcast of rerouting
- Sensor fusion: blockage report aggregation, confidence scoring
- EMS route validation: conflict detection, feasibility checks

### 6.3 Simulation & Validation

- **Traffic simulation:** Agent-based model of evacuating population; compare simulated flow to historical event data
- **Hazard projection accuracy:** Test fire/flood/tsunami models against past events; measure % of population correctly routed to safety
- **Passability model validation:** Ground-truth field surveys; measure accuracy of traversability predictions
- **Blockage detection:** Inject synthetic blockage reports; measure detection latency and false-positive rate

### 6.4 Acceptance Criteria (Launch Readiness)

- [ ] All primary routes computed <500ms (p95)
- [ ] Blockages detected within 10s of 3rd report (majority rules)
- [ ] Rerouting broadcasts received by 95% of affected users <2s
- [ ] Danger ratings confidence >70% for events in training data
- [ ] Passability model >80% accuracy vs. ground truth
- [ ] Shelter capacity tracked within ±5% of actual occupancy
- [ ] System handles 100k route requests/min without degradation
- [ ] All EMS routes validated for feasibility before broadcast
- [ ] Low-visibility guidance tested with human subjects (success rate >95% exit confirmation)

---

## 7. Monitoring & Metrics

### 7.1 Real-Time Health Checks

**Dashboard Metrics:**
- OSRM uptime (target 99.9%)
- Route computation latency (p50, p95, p99)
- Blockage queue length (target 0; alert if >100)
- Shelter occupancy variance (alert if >10% unexplained)
- Hazard model confidence trend
- Passability grid freshness (age of youngest tile)

### 7.2 Event-Level Metrics

Collected during active evacuation events:

| Metric | Target | Notes |
|--------|--------|-------|
| % of evacuees who followed assigned route | >85% | Measure from location data |
| % of users who received reroute before impact | >95% | Safety-critical |
| Average ETA accuracy (±15 minutes) | >70% | Compare predicted vs. actual arrival |
| Shelter capacity enforcement success | 100% | No over-allocations |
| Blockage detection latency (3rd report) | <10s | Median |
| False blockage rate | <10% | % of reported blockages unconfirmed |
| Low-visibility guidance exit success | >95% | Only for <1% visibility events |

### 7.3 Research Metrics

- Hazard model projection accuracy (vs. on-ground observations)
- Danger rating calibration (compare predicted danger to actual outcomes)
- Congestion prediction accuracy
- Safe zone computation confidence (vs. post-event assessment)
- Convoy assembly success rate

### 7.4 Cost Metrics

- Cost per computed route
- Cost per evacuation event
- OSRM API spend vs. self-hosted cost
- Infrastructure cost per 1M users

---

## 8. Security & Privacy Considerations

### 8.1 Data Protection

- User locations are stored but not shared with external parties (except EMS during declared emergencies under legal agreement)
- Blockage reports can be anonymous; location shared only with system (not reporter identity)
- Shelter capacity updates aggregated; no individual occupant tracking
- Hazard model inputs (weather, terrain) are non-sensitive; can be cached offline

### 8.2 Authorization

- Public users: can compute personal routes, report blockages, join group convoys
- EMS users: can draw routes, confirm blockages, manage shelters, view group locations, declare events
- Beacon employees: full system access, model training, parameter tuning

### 8.3 Audit Logging

All significant actions logged:
- Route computations (user_id, start/end, result)
- Blockage reports (reporter, location, confirmation status)
- EMS route issuance (author, recipients, route)
- Shelter capacity updates (who reported, what changed)

---

## 9. Deployment & Operations

### 9.1 Environment Setup

**Development:**
- Fake hazard data (GeoJSON files)
- Offline OSRM (Docker)
- Local PostGIS
- Redis (Docker)
- NATS (Docker)

**Staging:**
- Real hazard model API
- Live weather data (HRRR)
- Cloud OSRM (Mapbox or self-hosted)
- Cloud PostgreSQL + TimescaleDB
- Cloud Redis
- Cloud NATS

**Production:**
- All staging components scaled horizontally
- Multi-region OSRM (for high availability)
- CDN for map tile delivery
- Backup database (read replica)
- Disaster recovery plan (RTO <1 hour)

### 9.2 Release Process

1. Feature branch → integration tests pass
2. Pull request → code review + approval
3. Merge to develop → all integration tests
4. Deploy to staging → end-to-end testing by QA + EMS partners
5. Tag release → version bump, release notes
6. Deploy to production → canary (5% traffic) → ramp to 100%
7. Monitor metrics → rollback if SLA violated

### 9.3 On-Call Runbook

**Alert: Route computation SLA exceeded**
- Check OSRM uptime; restart if crashed
- Check database connection pool; scale if exhausted
- Check query performance (especially hazard overlay)
- Fallback to pre-computed routes if OSRM down >5 min

**Alert: Blockage queue buildup**
- Check confirmation thresholds; adjust if too conservative
- Check false report rate; may need stricter rules
- Check mesh/cellular connectivity; may be reporting delays

**Alert: Hazard model confidence drops**
- Compare model to real-time observations
- Check input data quality (weather, terrain)
- Consider switching to ensemble of models

---

## 10. Future Enhancements

### 10.1 Short-Term (6-12 months)

- [x] Core routing + passability
- [ ] Advanced vehicle types (motorcycle, ATV, bus)
- [ ] Smoke/air quality integration (wildfire smoke avoidance)
- [ ] Convoy routing for schools/workplaces
- [ ] EMS route drawing + broadcasting
- [ ] Blockage detection machine learning (improve false-positive rate)

### 10.2 Medium-Term (1-2 years)

- [ ] Low-visibility guidance (UWB indoor)
- [ ] Mesh-first routing (for areas without cellular)
- [ ] Shelter check-in integration (real-time capacity)
- [ ] Multi-hazard routing (avoid multiple hazards simultaneously)
- [ ] Radiation/air quality specific routing
- [ ] Watercraft evacuation routing (boat docks, marinas)

### 10.3 Long-Term (2+ years)

- [ ] Autonomous vehicle coordination (mixed human + self-driving)
- [ ] Advanced traffic prediction (ML models trained on real events)
- [ ] Biological threat modeling (pandemic spread, pathogen detection)
- [ ] AI-driven traffic management (dynamic lane control, signal timing)
- [ ] Global hazard network (federated routing across regions)

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| Passability | Traversability score (0-1) for a road segment, vehicle-specific |
| Base Passability | Static passability derived from surface, width, slope (pre-computed) |
| Weather Factor | Multiplier for weather conditions (snow, ice, flooding) |
| Damage Factor | Multiplier for post-event obstructions (debris, collapsed structures) |
| Vehicle Class | Category of vehicle (2WD sedan, 4WD SUV, fire truck, ambulance, semi-truck, bus, motorcycle, ATV) |
| Turn Radius | Minimum turning arc required for vehicle (impacts routing constraints) |
| 8-Directional Grid | Traversability raster with passability per compass direction (N, NE, E, SE, S, SW, W, NW) |
| OSRM | Open Source Routing Machine; provides shortest-path algorithms |
| Safe Zone | Polygon area predicted to be unaffected by ongoing hazard (unburnable, above flood level, etc.) |
| Staging Area | Intermediate safe zone where users wait before proceeding to final shelter |
| Convoy Route | Single shared route for group of evacuees (single meeting point, shared destination) |
| Danger Rating | Urgency tier (LOW/MEDIUM/HIGH/EXTREME) based on hazard proximity, speed, and ETA |
| Blockage | Road segment reported as impassable; confirmed after 3+ reports |
| Mesh Networking | Decentralized communication when cellular towers down; devices relay messages |
| UWB | Ultra-wideband positioning; provides indoor location accuracy (~10cm) |
| Hazard Trajectory | Projected future position of hazard (fire perimeter, flood extent) |
| Confidence | Model certainty (0-1); higher = more reliable prediction |
| NATS | Message broker for pub/sub event distribution |
| Redis | In-memory cache for hot data (routes, passability, shelf occupancy) |
| PostGIS | PostgreSQL extension for geospatial queries |
| LiDAR | Laser scanning; provides high-resolution terrain and road surface data |
| Street-Level Perception | Phone camera + CV models to detect on-ground conditions (debris, flooding) |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-25
**Owner:** Navigation & Terrain Module Lead
**Audience:** Engineers, operations staff, EMS partners, Beacon leadership
