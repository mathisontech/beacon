# Transit, Docks, and Parking

Extract and model transit systems, marine evacuation assets, and parking capacity.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| extract_transit_routes | OSM routes, GTFS feeds, transit agency APIs | Route geometry + stop sequence + schedule | Transit data integration |
| extract_transit_stops | OSM amenity tags, GTFS stops, street-view CV | Stop locations + capacity + shelter + accessibility | Multi-source conflation |
| map_subway_depth | GTFS station data, geotechnical reports | Station depth below surface (meters) | Facility records |
| detect_dock_from_satellite | Satellite imagery, OSM leisure=marina | Dock locations, slip count, extent | Object detection |
| detect_parking_lot | Satellite building footprints, road network | Parking lot boundaries + capacity estimate | D-LinkNet or U-Net |
| estimate_parking_capacity | Lot area, parking space geometry | Capacity (vehicle count) | Standard parking modulus |
| detect_flat_open_fields | DEM + LiDAR elevation roughness | Drivable emergency staging areas | Terrain classification |
| track_snow_plow_routes | Plow vehicle GPS (opt-in), operator input | Route map, last-plow timestamp per segment | GPS tracking system |

## Data Storage

Transit, docks, and parking stored as separate GeoParquet feature layers:

### Transit Routes and Stops

```
{
  "geometry": "POINT/LINESTRING",
  "feature_type": "route" | "stop",
  "route_id": "string",
  "route_name": "string (e.g., 'Bus 42 Downtown Express')",
  "route_type": "bus" | "train" | "subway" | "tram" | "ferry" | "cable_car",
  "stop_id": "string",
  "stop_name": "string",
  "stop_capacity": int32,
  "shelter_present": boolean,
  "accessibility_ada": boolean,
  "schedule_type": "frequent" | "regular" | "limited" | "school_days",
  "hours_start": "HH:MM",
  "hours_end": "HH:MM",
  "days_of_week": [int],
  "operating_status": "active" | "suspended" | "closed",
  "last_updated": datetime,
  "subway_depth_m": float32
}
```

### Docks and Marinas

```
{
  "geometry": "POINT",
  "dock_type": "marina" | "ferry_terminal" | "boat_launch" | "commercial_port",
  "slip_count": int32,
  "vessel_length_max_m": float32,
  "water_depth_m": float32,
  "accessibility": "public" | "private_mooring" | "commercial",
  "operational_status": "open" | "seasonal" | "maintenance",
  "capacity_by_vessel_type": {
    "sailboat": int32,
    "motorboat": int32,
    "large_vessel": int32
  }
}
```

### Parking Lots

```
{
  "geometry": "POLYGON",
  "lot_id": "string",
  "lot_type": "street" | "lot" | "structure" | "garage",
  "capacity_vehicles": int32,
  "occupancy_rate_current": float32,
  "occupancy_rate_peak": float32,
  "accessible_spaces": int32,
  "ev_charging_available": boolean,
  "surveillance": boolean,
  "accessibility": "public" | "permit_required" | "private",
  "hours": "24h" | "business_hours" | "restricted",
  "last_capacity_update": datetime
}
```

## Transit Systems

### Bus Routes and Stops

Sources:
- GTFS (General Transit Feed Specification) feeds from transit agencies
- OSM public_transport tags
- Google Maps Transit API
- Street-view CV for stop shelter identification

Data per route:
- Route name + number (e.g., "42", "Downtown Express")
- Stop sequence (ordered list of stops)
- Schedule: weekday, weekend, holiday times
- Operating status (active, suspended, closed)

Stop attributes:
- Location (lat/lon)
- Capacity (seated + standing)
- Shelter present (weather protection)
- ADA accessibility (ramp, level boarding)
- Real-time arrival prediction (from transit agency API)

Confidence: 0.85-0.95 (GTFS is authoritative but may be outdated; real-time status less reliable).

### Train/Commuter Rail

Data sources:
- Amtrak, commuter rail operator GIS
- GTFS feeds (where available)
- OSM railway tags

Per station:
- Station name + location
- Track count
- Platform capacity
- Accessibility features
- Parking at station
- Schedule reliability (historical on-time %)

Evacuation use: Trains as transport asset for mass evacuation (capacity 100-1000 persons per train).

### Subway Systems

Special handling for radiation sheltering:

Deep subway stations provide radiation protection due to earth/concrete shielding.

Depth data:
- Station depth below ground (meters)
- Shielding material (concrete, earth)
- Ventilation type (natural, mechanical, filtered)

Source: GTFS depth_m field (if available) or geotechnical reports from transit authority.

Radiation protection factors by depth:
- Surface: protection factor 1 (no reduction)
- 3m underground (typical basement): PF 10 (10× dose reduction)
- 10m underground (subway): PF 100-1000 (very high protection)
- 30m underground (deep metro): PF 1000+ (excellent)

### Ferry Routes

Water evacuation asset for coastal/island communities.

Data per ferry:
- Terminal locations (departure + arrival)
- Vessel capacity (persons)
- Crossing time (minutes)
- Schedule frequency
- Service status (operating, closed)
- Weather limitations (rough seas impassable)

Source: Ferry operator GIS, GTFS where available.

## Docks and Marinas

### Detection from Satellite

U-Net or Mask R-CNN on satellite imagery:

Visual signature: Linear structures over water, slip markings, vessel shapes.

Training data: 500-marina Sentinel-2 dataset, hand-labeled slip geometry.

Post-detection:

1. Extract polygon boundary of dock area
2. Estimate slip count: detect linear parking spaces within boundary
3. Measure typical slip length (24-45 feet)
4. Capacity = boundary_area / slip_area

Confidence: 0.70-0.80 (affected by water clarity, shadow, image angle).

### OSM Data Integration

OSM leisure=marina tag includes:
- operator name
- fuel availability
- services (repair, launch, restroom)

Merge satellite detection with OSM for complete picture.

### Vessel Types and Capacity

Model vessel types by marina depth + slip length:

| Marina Type | Typical Depth | Slip Length | Vessel Types |
|---|---|---|---|
| Shallow mooring | <2m | <20ft | Kayak, small boat, sailboat |
| Standard marina | 2-4m | 20-45ft | Motorboat, sailboat, catamaran |
| Deep water port | >4m | >45ft | Freighter, fishing vessel, yacht |

Evacuation capability: Estimate persons evacuable per vessel × vessel count.

## Parking Lots

### Detection from Satellite

D-LinkNet or custom U-Net trained on parking detection:

Input: NAIP (0.6m) or Sentinel-2 (10m).

Output: Parking lot mask (binary).

Post-detection:

1. Extract parking lot polygon
2. Detect individual spaces (regular grid pattern)
3. Count spaces: area / space_area (typical space 12.5 m² = 3.5m × 3.6m)

Accuracy: 85% detection rate, ±10% capacity error.

Confidence: 0.75-0.85.

### Street Parking

From LiDAR street crowding layer:

Detect parked vehicles on road edges as proxy for street parking availability.

Count available spaces = road_width_available / vehicle_width.

Dynamic estimate: Street parking capacity varies with time-of-day, day-of-week.

### Parking Utilization

Sources:
- Real-time parking sensor data (where available, limited coverage)
- Historical occupancy patterns (time-of-day, day-of-week)
- User reports via app

Occupancy model:
- Daytime (8am-6pm): Office/shopping areas at 80-90% capacity
- Evening (6pm-11pm): Residential areas high, commercial lower
- Night (11pm-8am): Most lots <50% capacity

Evacuation demand: Estimate vehicle count needing evacuation as census_vehicles_per_household × evacuating_population.

Compare to available parking near shelters to assess bottlenecks.

## Emergency Staging Areas

Open fields suitable for vehicle/equipment staging:

Detection criteria:
1. Flat terrain (slope <3%)
2. Minimum extent: 100m × 100m (10,000 m²)
3. Accessibility: adjacent to road network
4. Not active farmland or ecological area

Sources:
- DEM slope analysis + LiDAR elevation roughness
- Satellite land-use classification (grassy field, parking area)
- Street-view confirmation (not forest, not developed)

Examples:
- Airport runways (satellite detection: runway markings)
- Parking lots (use parking layer)
- Athletic fields (satellite: distinctive patterns)
- Campgrounds (OSM tourism=camp_site)
- Cemeteries (satellite: regular plot pattern, OSM tags)

## Snow Plow Tracking

Optional GPS tracking system for snow plow vehicles:

Data:
- Operator enables tracking app
- GPS logs sent to server in real-time
- Server marks road segment as "plowed" with timestamp

Update:
```
NATS Topic: snow_plow.route_completed
{
  "road_id": "string",
  "tile_id": "string",
  "plow_timestamp": datetime,
  "plow_vehicle_id": "string",
  "plow_depth_reduction": float32 (estimate)
}

Redis update:
SET snow_plow:road:{road_id}:last_plow {timestamp}
```

Routing integration: Freshly plowed roads get passability boost (+0.15).

EMS can request plow: Special "request plow" button on police app, dispatches nearest available plow.

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| transit.extraction.done | Transit data updated | Weekly |
| transit.route_status_changed | Service suspension/resumption | Event-driven |
| transit.real_time_arrival | Stop ETA update | 30-60 second updates |
| docks.detection.done | Dock layer refreshed | Monthly |
| parking.detection.done | Parking lot layer refreshed | Quarterly |
| parking.occupancy_updated | Real-time occupancy change | Hourly (where available) |
| snow_plow.route_completed | Road plowed | Real-time |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `transit:route:{route_id}:schedule` | 30 days | Cached transit schedule |
| `transit:stop:{stop_id}:real_time_arrivals` | 1 hour | Live arrival predictions |
| `parking:lot:{lot_id}:occupancy` | 1 hour | Current occupancy % |
| `parking:tile:{tile_id}:total_capacity` | 7 days | Total parking per tile |
| `docks:capacity_by_type` | 30 days | Vessel evacuation capacity |
| `snow_plow:road:{road_id}:last_plow` | 24 hours | Last plow time |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| GTFS feed ingestion + parsing (CPU) | $50-80 |
| Google Maps Transit API (real-time arrivals, 100k queries) | $150-200 |
| Transit agency data licensing | $100-200 |
| Satellite dock detection (U-Net inference) | $100-150 |
| Parking lot detection (D-LinkNet inference) | $150-200 |
| Parking utilization API (where available) | $50-100 |
| Snow plow GPS tracking system (server infrastructure) | $100-200 |
| Manual transit system verification (20 routes) | $100-150 |
| **Total** | **$800-1,280** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Transit route matching (detected vs. GTFS) | >95% | 100-route comparison |
| Stop location accuracy | <50m | Field GPS validation |
| Parking lot detection recall | >85% | 500-lot satellite comparison |
| Parking capacity accuracy | ±10% MAPE | Aerial count validation (50 lots) |
| Dock slip count accuracy | ±15% | Manual slip counting (30 marinas) |
| Real-time arrival accuracy | >90% on-time | Transit agency audit |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| GTFS feed freshness | <6 months old | Proceed, request update if older |
| Transit route coverage | >90% urban areas | Proceed |
| Parking lot detection rate | >85% per tile | Proceed, flag sparse areas |
| Dock accuracy | >80% confidence | Proceed |
| Real-time occupancy availability | >30% lots (where available) | Proceed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Transit extraction cycle | <14 days |
| Parking lot detection cycle | <30 days |
| Real-time arrival prediction latency | <30 seconds |
| Parking occupancy update frequency | Hourly (where available) |
| Snow plow routing integration | Tested in 2 events |
