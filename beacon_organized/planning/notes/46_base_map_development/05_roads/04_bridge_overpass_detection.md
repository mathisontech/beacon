# Bridge/Overpass Detection

Detect bridges, overpasses, and assess crossing capacity and vulnerability.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| detect_bridge_from_lidar | LiDAR DSM vs. DEM, road centerline | Bridge flag + confidence | Height difference threshold |
| detect_overpass_from_lidar | LiDAR height profile, above road | Overpass flag + clearance height | Clearance measurement |
| measure_clearance_height | LiDAR DSM, vehicle height models | Clearance height (meters) by vehicle | Vehicle dimension database |
| assess_bridge_condition | NBI (National Bridge Inventory) data | Condition rating 0-9 | NBI lookup |
| compute_bridge_capacity | Lane count, load rating | Vehicle throughput (vehicles/hour) | Traffic engineering model |
| flag_flood_vulnerable_bridges | Bridge elevation, flood zone, river stage | Flood risk (low/medium/high) | Hydrological data |
| detect_bridge_weight_limit | OSM maxweight tag, NBI data | Weight limit (tons) | Data sources |

## Data Storage

Bridges stored inline in road GeoParquet:

```
{
  "is_bridge": boolean,
  "bridge_confidence": float32,
  "bridge_type": "road" | "pedestrian" | "railroad" | "aqueduct" | "unknown",
  "clearance_height_m": float32,
  "clearance_vehicle_types_passable": [string],
  "bridge_condition": int32,
  "bridge_condition_source": "nbi" | "lidar_based" | "estimated",
  "bridge_capacity_vph": int32,
  "weight_limit_tons": float32,
  "flood_vulnerability": "low" | "medium" | "high",
  "scour_risk": float32,
  "nbi_structure_number": string
}
```

## Primary Method: LiDAR Detection

**Target: >95% recall**

Algorithm:

1. Extract DSM (digital surface model) and DEM (bare earth) along road centerline
2. For each point: DSM - DEM = height_above_ground
3. If height_above_ground > 1.5m AND continuous for >5m → bridge candidate
4. Validate: Check if feature is linear and aligned with road (not tree/building)
5. Confidence based on height magnitude and continuity

Example: Road at elevation 100m, DSM shows 105m for 50m length → 5m bridge, high confidence.

Limitations:
- May miss low bridges (<1.5m)
- Cannot distinguish bridge type from height alone
- Requires good DSM-DEM alignment (LiDAR source quality critical)

## Secondary Method: OSM Bridge Tags

OSM `bridge=yes` tag indicates crossing:

Tag additional attributes:
- `bridge=viaduct` (elevated structure)
- `bridge=suspension` (suspension cable)
- `bridge=arch` (arch bridge)
- `bridge=movable` (drawbridge, swing)
- `maxheight` tag (clearance restriction)
- `maxweight` tag (load limit)

Confidence: 0.85-0.90 (OSM tags reliable but may be incomplete in remote areas).

## Clearance Height Assessment

For overpasses and restricted-clearance bridges:

1. Extract LiDAR DSM directly above road centerline
2. Identify obstruction (bridge/overpass) as vertical structure
3. Measure height from DSM at obstruction peak down to road surface elevation
4. Clearance = obstruction_height - road_elevation

Vehicle type clearance check:

| Vehicle Type | Height (meters) |
|---|---|
| Sedan | 1.5 |
| SUV | 1.8 |
| Pickup truck | 1.9 |
| Van | 2.2 |
| Fire truck | 3.5-4.0 |
| Semi-truck | 4.1-4.2 |
| Bus | 3.8-4.0 |

Passability: If clearance < vehicle_height → flag as impassable for that vehicle.

Example: 3.2m overpass → sedan/SUV passable, fire truck impassable.

## NBI (National Bridge Inventory) Data

US federal database of all bridges (>20 feet span):

Data:
- Structure number (unique ID)
- Location (coordinates, route, crossing)
- Condition rating (0 poor to 9 excellent)
- Load rating (short-term truck weight limit)
- Year built, year last inspected
- Scour critical flag (flood/water damage risk)
- Deficient status (needs repair)

Lookup: Match LiDAR-detected bridge to NBI record by location + characteristics.

Confidence: 0.95+ (official government source).

## Bridge Condition Rating

NBI condition rating 0-9:

| Rating | Status | Action |
|---|---|---|
| 0-3 | Poor (imminent failure) | Close immediately |
| 4 | Fair (significantly deteriorated) | Monitor, closure imminent |
| 5 | Fair (deteriorated, needs maintenance) | Plan repair, monitor |
| 6 | Satisfactory (minor deterioration) | Routine maintenance |
| 7-8 | Good | Standard maintenance |
| 9 | Excellent | Normal operation |

Evacuation routing: Avoid bridges rated <4 unless no alternative.

Flag bridges 4-5 as "risky" (reduced rating during event).

## Flood Vulnerability Assessment

Bridges crossing rivers/streams at risk of:

1. Scour (water erosion of bridge piers)
2. Debris impact (logs, buildings flowing downstream)
3. Overtopping (water flow over bridge deck)

Determination:

- Bridge elevation relative to 100-year flood elevation (from FEMA NFHL)
- If elevation < flood elevation → high flood risk
- If scour flag in NBI → very high risk
- River stage data (USGS gauges) → real-time risk

Flood vulnerability: low (>3m above flood) / medium (0-3m above) / high (below or flagged scour).

## Weight Limit Assessment

Bridge weight limit from:

1. OSM `maxweight` tag (often missing, incomplete)
2. NBI load rating (US official, most reliable)
3. Manual inspection records (DOT maintenance reports)

Format: Gross vehicle weight rating (GVWR) in short tons.

Passability: If vehicle exceeds weight limit → flag as impassable (no detour possible, coordination required).

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| bridges.detection.tile_done | Tile processed | Per-tile |
| bridges.nbi_update | New NBI data available | Quarterly |
| bridges.flood_alert | Bridge flood vulnerability flagged | Per weather event |
| bridges.condition_alert | Bridge condition downgrade | Quarterly inspections |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `bridges:tile:{tile_id}:count` | 7 days | Bridge count per tile |
| `bridges:by_clearance:{height}` | 30 days | Bridges passable by vehicle height |
| `bridges:flood_risk:high` | Real-time | Bridges at flood risk |
| `bridges:nbi:condition_ratings` | Quarterly | Latest NBI condition data |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| LiDAR bridge detection (CPU, height analysis) | $80-120 |
| NBI database lookup and matching | $100-150 |
| Flood elevation comparison (DEM/hydrological data) | $50-80 |
| OSM tag integration + validation | $30-50 |
| Field verification of 20 bridges | $100-200 |
| **Total** | **$360-600** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Bridge detection recall | >95% | NBI comparison |
| Clearance height accuracy | ±0.5m | Field measurement survey |
| Condition rating agreement | >85% | NBI validation |
| Weight limit accuracy | >90% | Field inspection comparison |
| Flood vulnerability prediction | >80% | Post-event validation |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| LiDAR bridge detection coverage | >85% per tile | Proceed |
| NBI match rate (US) | >80% | Proceed, flag unmatched |
| Clearance data completeness | >70% per tile | Proceed |
| Condition rating availability (US) | >90% | Proceed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Detection cycle | <20 days (US) |
| LiDAR height analysis latency | <0.1 sec per bridge |
| NBI lookup latency | <0.01 sec |
| Clearance assessment accuracy | >90% vehicle passability prediction |
| Flood risk prediction sensitivity | >0.80 |
