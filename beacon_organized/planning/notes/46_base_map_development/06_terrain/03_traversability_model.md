# Traversability Model

8-directional traversability indexed by vehicle type. Routes evacuation, fire trucks, search & rescue.

## Transport Modes

| Mode | Cost Index | Slope Limit | Surface Types | Barriers |
|---|---|---|---|---|
| Walk | 1x | <60° | Terrain, grass, dirt | Cliffs >2m |
| Climb | 2x | <70° | Rock, near-vertical | Overhangs |
| Bike | 1.5x | <15° | Paved, packed dirt | Cliffs >1m |
| 2WD car | 3x | <20° | Paved, gravel, packed | Water, cliffs >2m |
| AWD car | 2.5x | <25° | Paved, dirt, grass | Water, cliffs >2m |
| 4WD/SUV | 2x | <35° | Paved, dirt, grass, rocks | Water, cliffs >3m |
| Fire truck | 2.5x | <30° | Paved, gravel, dirt | Water, cliffs >2m, trees <40cm |
| Heavy equipment | 1.5x | <40° | Any land surface | Water, cliffs >5m |

## Cost Factors (Dijkstra weight multipliers)

| Factor | Impact | Formula |
|---|---|---|
| Slope | Primary | e^(slope_deg/10) for vehicles; e^(slope_deg/15) for walk |
| Surface friction | Secondary | 1.0 paved, 1.5 gravel, 2.0 dirt, 3.0 grass |
| Vegetation density | Secondary | 1.0 clear, 1.5 sparse, 3.0 moderate, 10.0+ dense |
| Obstacles | Blocking | 0 (impassable) if detected |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| compute_traversability_per_direction(dem, surface, veg, direction) | Terrain layers | Cost grid for direction | traversability.{direction}_computed |
| compute_traversability_by_vehicle(cost_grids, vehicle_type) | 8-direction grids + vehicle | Vehicle-specific cost map | traversability.{vehicle}_computed |
| generate_traversability_grid(all_inputs, resolution) | DEM + surface + veg | 1m traversability mosaic | traversability.grid_generated |
| identify_impassable_terrain(slope, obstacles, vehicle) | Terrain + vehicle limits | Impassable regions | traversability.impassable_zones |
| detect_cliff_edges(dem, threshold_m) | DEM | Cliff polygon layer | traversability.cliffs_detected |
| compute_off_road_passability(terrain, vehicle) | Open terrain + vehicle | Off-road cost grid | traversability.offroad_computed |

## 8-Direction Indexing

Compute traversability cost for each cardinal + diagonal (N, NE, E, SE, S, SW, W, NW) per 30m grid cell.

```
Routing uses local direction cost lookup:
  For path from A to B:
  - Compute bearing (direction)
  - Look up cost[direction] at current cell
  - Apply slope multiplier
  - Apply surface/veg multipliers
  - Sum for path optimization
```

## Data Storage

| Table | Schema |
|---|---|
| traversability_grids | tile_id, vehicle_type, direction, cost_raster, resolution |
| impassable_zones | zone_id, vehicle_type, geometry, reason (cliff/water/slope/veg) |
| cliff_edges | edge_id, tile_id, geometry, height_m, confidence |

## Redis Cache

```
traversability:vehicle:{vehicle}:tile:{tile_id} -> 30m cost grid
traversability:direction:{direction}:tile:{tile_id} -> 30m directional cost
impassable:{vehicle}:tile:{tile_id} -> polygon mask
cliffs:tile:{tile_id} -> edge buffer (5m around cliff)
offroad:{vehicle}:tile:{tile_id} -> open-terrain cost grid
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| traversability.{vehicle}_computed | {tile_id, passability_frac} | Per tile, per vehicle |
| traversability.cliff_detected | {location, height, directional_exposure} | If cliff >2m |
| traversability.impassable_expanded | {vehicle, region, reason} | If impassable zone >1 ha |
| traversability.offroad_route_available | {start, end, vehicle, distance} | If path found |

## Validation

- Compare 2WD routes against road network (should match where roads exist)
- Validate fire truck routes can reach all buildings <3min by road
- Test 4WD passability in known off-road areas
- Confirm cliff detection matches LiDAR cliff signatures

## Accuracy Targets

| Metric | Target | Vehicle |
|---|---|---|
| Route realism | >95% match documented | All |
| Cliff detection | >95% precision | All |
| Impassable zone accuracy | >90% (F1) | Vehicle-type |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Terrain passability classifier | Predict traversability from DEM + satellite | GPS traces + manual labeling |
| Vegetation density from LiDAR | Estimate veg impedance | LiDAR training polygons |

## Performance

| Operation | Time (1 km²) |
|---|---|
| 8-direction cost compute | 5 sec |
| Vehicle routing prep | 2 sec |
| Cliff detection | 3 sec |

## Dependencies

- numpy, scipy (routing algorithms)
- rasterio (raster ops)
- shapely (polygon operations)
- Redis (caching)
- NATS (publishing)
