# Evacuation Routing Module

## 1. Overview
OSRM-based pathfinding for mass evacuations, individuals, and low-visibility indoor scenarios. Computes safe zones, dynamic rerouting when hazards cross routes, danger projections, convoy routing, and EMS-drawn routes. Manages shelter capacity and staging areas with real-time blockage detection.

## 2. Ownership
- Director: Evacuation Operations
- Leads: Pathfinding Engine, Safe Zone Modeling, Dynamic Rerouting, Shelter Management, Convoy Routing, Low-Visibility Navigation, Danger Projection, Traffic Load Balancing

## 3. Parent Module
Public User Features + EMS Client. Consumed by Hazard modules, Notifications, Sensor data integrations.

## 4. Submodules
- OSRM Routing Engine
- Safe Zone Calculation
- Dynamic Rerouting
- Shelter & Staging Management
- Convoy Routing
- Danger Rating Projection
- Low-Visibility Navigation (UWB/indoor)

## 5. Goals
1. Compute safe zones in <2 seconds per hazard event
2. Generate evacuation routes in <1 second
3. Detect blockages within 10 seconds of user report
4. Reroute 95% of users before hazard impact
5. Provide danger rating projections with confidence
6. Support convoy routes for groups of 100+
7. Sustain low-visibility guidance in <1% visibility

## 6. Functions

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| compute_shortest_path | OSRM-based routing | Start point, end point, avoid_zones | Route array (coords, turn-by-turn) | 500ms | OSRM API |
| add_hazard_avoidance | Exclude danger zones | Route, hazard polygon | Modified route | 100ms | Hazard data |
| compute_alternate_routes | Generate 2nd/3rd options | Start, end, hazard zones | Route array (3 options) | 1s | Routing engine |
| rank_routes_by_risk | Order by danger level | Route array, hazard model | Ranked routes | 100ms | Risk scorer |
| rank_routes_by_congestion | Order by traffic | Route array, current traffic | Ranked routes | 50ms | Traffic data |
| detect_route_blockage | Find impassable segments | Route ID, user reports | Blocked segment list | 10s | Report aggregator |
| analyze_blockage_severity | Assess if passable | Blockage reports, count | Severity level | 5s | Rules engine |
| compute_traffic_flow | Model current congestion | Route, traffic sensors | Flow rate (vehicles/min) | 2s | Sensor fusion |
| estimate_travel_time | Predict arrival time | Route, flow rate, distance | ETA minutes | 10s | Time predictor |
| project_hazard_at_time | Where will hazard be in T min? | Hazard model, minutes_ahead | Projected polygon | 100ms | Hazard predictor |
| check_route_safety_at_time | Will route intersect hazard? | Route, time_to_departure | Safe/Unsafe flag | 100ms | Hazard projector |
| calculate_danger_rating | Assign urgency (LOW/MED/HIGH) | Route, hazard proximity, time | Danger tier | 50ms | Risk model |
| project_danger_at_departure | If leave now, danger = ? | Current position, hazard, depart_time | Danger tier + confidence | 100ms | Risk model |
| recommend_departure_time | When is safest to leave? | Current position, hazard trajectory | Depart time + danger | 200ms | Optimizer |
| estimate_hazard_travel_time | How fast is hazard moving? | Hazard trajectory points, deltas | Speed estimate | 50ms | Physics model |
| compute_safe_zones | Find unburnable/unhot areas | Fire extent, wind, heat model | Safe zone polygon set | 2s | Multi-model |
| exclude_burned_areas_as_temp_unsafe | Mark recent burns unsafe | Fire boundary, time_since_fire | Unsafe zone polygon | 1s | Burn tracker |
| include_cooled_burns_as_safe | Allow cooled burn areas | Burn boundary, cooling_rate, elapsed | Safe zone polygon | 500ms | Cooling model |
| compute_flood_safe_zones | High ground + drainage | Flood extent, terrain, drainage | Safe zone polygon set | 1s | Flood model |
| compute_wind_safe_zones | Protected valleys/buildings | Wind direction/speed, terrain | Safe zone polygon set | 500ms | Wind model |
| exclude_liabilities_from_safe_zones | Remove EMS-hidden liability spots | Safe zones, liability list | Filtered zones | 100ms | Liability DB |
| assign_public_shelters | Find capacity + distance | User location, hazard, shelter DB | Ranked shelter list | 100ms | Shelter index |
| assign_last_resort_shelters | Reveal EMS-only locations to EMS | User location, hazard, EMS_shelter_DB | EMS shelter list | 50ms | EMS DB |
| track_shelter_capacity | Monitor current occupancy | Shelter ID, occupant list | Current % occupied | 1s | Capacity log |
| enforce_shelter_limits | Don't over-allocate | Shelter ID, capacity | Enforcement status | 1ms | Capacity rules |
| update_shelter_capacity | Record new occupant | Shelter ID, user_id | Updated capacity | 1s | User tracking |
| compute_staging_areas | Safe waiting zones before final shelter | Hazard zones, road network | Staging area polygon set | 500ms | Area planner |
| assign_staging_area | Route user to stage first | User location, hazard, shelter | Staging area + final shelter | 200ms | Assignment logic |
| generate_convoy_route | Route group together | Group user list, destination | Single shared route + meeting point | 500ms | Convoy optimizer |
| compute_group_centroid | Find meeting point | User location array | Centroid location | 50ms | Geo math |
| merge_ems_drawn_route | Use EMS input override | EMS route, auto-computed route | EMS-prioritized route | 100ms | Route merger |
| load_ems_route_polyline | Parse EMS input | Polyline coordinates | Route object | 10ms | Parser |
| validate_ems_route | Check feasibility | EMS route, road network | Validation status | 200ms | Validator |
| detect_ems_route_blockage | Check if EMS route passable | EMS route, hazard zones | Blockage flag | 100ms | Hazard overlap |
| suggest_ems_route_mods | Recommend changes to EMS input | EMS route, blockages | Modified route | 500ms | Route optimizer |
| broadcast_route_to_group | Send to all group members | Route, group_id | Broadcast status | 2s | Messenger |
| reroute_around_hazard | Compute alternate when hazard crosses path | User route, hazard polygon, timestamp | New route + urgency flag | 1s | Re-routing engine |
| notify_user_of_blockage | Alert that route blocked | User ID, blockage location, alt_route | Notification sent | 2s | Notification module |
| persist_route_to_device | Cache route offline | Route, device_id | Cached status | 100ms | Device storage |
| display_route_on_map | Render route + hazard on screen | Route, hazard layers, user_loc | Map display updated | 500ms | Map renderer |
| provide_turn_by_turn_guidance | Audio/haptic navigation | Route, user location | Spoken/haptic instruction | 2s per turn | TTS/haptic engine |
| compute_exit_point | Track where person left building | Indoor position data, UWB | Exit coordinates | 100ms | Position tracker |
| broadcast_successful_exit | Signal that evacuation route works | Exit point, remaining_people_in_building | Broadcast sent | 5s | Broadcast engine |
| shift_path_with_exit | Update exit route based on exits | Exit point, remaining indoor_users | Updated route | 100ms | Route updater |
| provide_low_visibility_guidance | Haptic + voice when visibility <1% | Indoor position, UWB, heading | Intense vibration toward escape route | 1s per update | UWB/haptic |
| orient_phone_toward_escape | Vibrate more intensely in escape direction | Phone orientation, escape route bearing | Vibration pattern | 100ms | Motion API |
| disable_outdoor_features | Turn off non-critical in low viz | Visibility %, scenario_type | Feature disable flag | 100ms | Feature config |
| load_offline_maps | Get pre-cached map tiles | User bbox | Offline tile set cached | 30s | Tile cache |
| reroute_2wd_drivers | Prefer paved roads for 2WD | Driver vehicle_type, available_routes | 2WD-optimized route | 200ms | Route ranker |
| suggest_carpooling | Recommend stranger pickup | User location, evacuation zone, strangers_evacuating | Carpool suggestion | 500ms | Proximity matcher |
| route_to_walkable_street | Send pedestrians to vehicle evac street | User location, evacuation zone | Route to vehicle street | 500ms | Route computer |
| allow_illegal_turns | Override traffic laws in emergency | User request, hazard_tier | Legal override flag | 1ms | Rules config |
| suggest_backwards_driving | Last-resort escape if only option | Route blocked ahead, clearance | K-turn / U-turn / reverse suggestion | 200ms | Maneuver suggester |
| alert_traffic_behind_backup_driver | Warn drivers when ahead vehicle backing up | Event ID, drivers_behind | Broadcast notification | 2s | Event broadcaster |
| route_around_perimeter_slowly | Safer lateral escape vs frontal evac | Fire spread model, user location | Slower side route | 500ms | Route optimizer |
| balance_users_across_routes | Distribute load to prevent bottleneck | All user locations, route set | Load-balanced route assignments | 2s | Load balancer |
| simulate_evacuation_flow | Model traffic on routes | Route array, user count, route_capacity | Simulated flow + ETA distribution | 5s | Simulator |
| compute_route_capacity | How many can fit on route? | Route, vehicle_density, time_window | Capacity (vehicles) | 100ms | Capacity calculator |

## 7. Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| evacuation_routes | Computed routes | route_id, event_id, user_id, start, end, route_json, computed_at | 6 months |
| route_updates | Rerouting history | route_id, version, reason, updated_at | 6 months |
| blockage_reports | User-reported issues | blockage_id, route_id, user_id, location, reported_at, status | 3 months |
| safe_zones | Computed safety areas | zone_id, hazard_type, event_id, polygon_json, confidence | 3 months |
| shelters | Shelter registry | shelter_id, name, location, capacity, is_public, is_ems_only | Indefinite |
| shelter_occupancy | Current capacity tracking | shelter_id, timestamp, current_occupants, capacity_percent | 1 year |
| staging_areas | Intermediate staging zones | staging_id, event_id, location, polygon_json | 3 months |
| ems_routes | EMS-authored evacuation routes | ems_route_id, event_id, ems_author_id, polyline_json, issued_at | 1 year |
| convoy_assignments | Group routing records | convoy_id, event_id, member_id_list, meeting_point, assigned_route | 3 months |
| danger_projections | Precomputed risk estimates | projection_id, route_id, departure_time, hazard_proximity, danger_tier, confidence | 1 month |
| hazard_crossings | Route-hazard intersections | crossing_id, route_id, hazard_polygon, intersection_time, blockage_severity | 1 month |

## 8. Message Bus (NATS)
- `evacuation.route.computed`: Route generated
- `evacuation.route.updated`: Rerouting executed
- `evacuation.blockage.reported`: User reported impassable segment
- `evacuation.blockage.confirmed`: Multiple reports confirm blockage
- `evacuation.shelter.capacity.alert`: Shelter reaching limits
- `evacuation.safe_zone.computed`: Safe zone updated
- `evacuation.danger.high`: High danger rating flagged
- `evacuation.convoy.assembled`: Group route ready
- `evacuation.ems_route.issued`: EMS deployed custom route
- `indoor_evacuation.exit.confirmed`: Successful building exit recorded

## 9. Cache (Redis)
- `route:{route_id}`: Current active route
- `safe_zones:{event_id}`: Computed safe zones
- `shelter_capacity:{shelter_id}`: Current occupancy
- `blockage:{route_id}`: Known blockages on route
- `hazard_projection:{hazard_id}:{time}`: Projected hazard location
- `user_evacuation_status:{user_id}`: Active evacuation state
- `convoy:{convoy_id}`: Group route + members

## 10. External Integrations
- OSRM API (OpenRouteService or self-hosted)
- OpenStreetMap road network
- Mapbox Directions API (fallback)
- Traffic data providers (Waze, HERE, Google)
- Starlink for remote area routing (optional)
- UWB positioning system (indoor evacuation)
- Siren API (to broadcast evacuation zones)
- EMS dispatch systems (for route input)
- Shelter management databases (Red Cross, local govt)

## 11. API Contracts
Consumed by: Public User Features, EMS Client, Hazard modules, Notifications, Sensor systems
Provides: computeEvacRoute(), getRouteStatus(), reportBlockage(), getSafeZones(), getShelterList()
Endpoints: `/api/v1/evacuation/route`, `/api/v1/evacuation/blockage`, `/api/v1/evacuation/shelters`

## 12. UI Components
- Evacuation map with Navy bg (#0B0F2A), Teal evacuation arrow (#0097B2)
- Safe zone overlay (green, semi-transparent)
- Hazard boundary (red/orange heatmap)
- Route display (Teal line, animated direction)
- Alternative route options (secondary Teal, dashed)
- Danger rating badge (LOW: green, MED: yellow, HIGH: orange, EXTREME: red)
- ETA countdown timer
- Shelter capacity indicator (bar chart per facility)
- Turn-by-turn card (large, easy to scan while driving)
- Blockage banner (full-width warning with alternate route)
- Convoy indicator (group size + meeting point)
- Low-visibility mode (high contrast, large buttons)

## 13. Offline & Mesh Behavior
- Pre-computed evacuation routes cached offline
- Simplified map tiles for offline routing (5GB delta)
- Mesh broadcast of blockage reports
- Hazard mesh broadcasts trigger rerouting on offline devices
- Shelter capacity updates via mesh sync
- Turn-by-turn guidance works offline (pre-cached routes)
- UWB beacon placement for low-visibility guidance (local mesh position broadcast)
- Standard route suggestions precached per zone

## 14. Cost Breakdown
- OSRM API/self-hosted: ~$10K/yr (compute)
- Traffic data licensing: ~$5K/yr
- Shelter database maintenance: ~$3K/yr
- Mapbox fallback API: ~$2K/yr
- UWB hardware (indoor evac): ~$20K (one-time per venue)
- Simulation compute: ~$3K/yr
- Network bandwidth for rerouting: ~$1K/yr

## 15. Monitoring & Metrics

| Agent | Metrics |
|-------|---------|
| Quality | Route computation latency (target <1s), blockage detection accuracy, rerouting success rate, ETA accuracy ±15%, safe zone confidence |
| Research | Danger projection model accuracy, convoy assembly time, low-visibility guidance success (exit confirmation %), traffic flow simulation validation |
| Business | Routes per event, shelter capacity utilization, cost per computed route, Mapbox vs OSRM cost trade-off, simulation model cost-benefit |
| Compliance | EMS route approval audit trail, liability shelter exclusion adherence, evacuation data retention, user instruction clarity audit |
| Lead | Daily routing health, blockage queue, rerouting event count, shelter capacity status, OSRM uptime |

## 16. Cross-Module Dependencies
- Consumes: Hazard model outputs (extent, speed, trajectory), User location (sensor data), Traffic data, Shelter availability, EMS route input
- Provides: Evacuation recommendations to Public User Features, Danger ratings to Notifications, Traffic load signals to other modules
- Dependencies: Base Map (road network), Hazard models (all types), Sensor systems (user location), Notifications (rerouting alerts), Mesh Networking (offline delivery, blockage broadcast)
