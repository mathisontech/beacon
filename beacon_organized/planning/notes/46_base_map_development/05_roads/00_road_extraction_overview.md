# Road Extraction Overview

Comprehensive road attribute extraction from aligned multi-source data. Outputs 40+ attributes per road segment for evacuation routing and hazard modeling.

## Attributes Extracted

| Attribute | Primary Source | Use Case | Hazards |
|-----------|---|---|---|
| Network topology (centerline) | OSM + TIGER/Line → D-LinkNet + LiDAR | Routing graph | All |
| Width (meters) | LiDAR + satellite | Vehicle clearance | EQ, flood, fire |
| Lane count | LiDAR width + satellite lanes | Throughput, one-way override | All |
| Surface type | Satellite + street-view | Passability condition | All |
| Surface condition | Street-view CV | Traversability | All |
| Bridges/overpasses | LiDAR height + OSM | Collapse risk, flood backup | EQ, flood |
| Gates/barriers | Street-view + LiDAR | Access control | All |
| U-turn feasibility | LiDAR width + terrain slope | Vehicle routing constraint | All |
| K-turn feasibility | Width + backing space | 3-point turn possibility | All |
| Passability model | Terrain + surface + obstacles | Dynamic traversability | All |
| Turn radius by vehicle | Segment geometry | Vehicle-specific routing | All |
| Driveways | LiDAR length/width/slope | Private access routes | All |
| Street crowding | LiDAR parked cars | Actual drivable width | All |
| Barriers (fences/walls) | Street-view + LiDAR | Vehicle penetration | All |
| Transit routes/stops | OSM + transit APIs | Evacuation assets | All |
| Docks/marinas | Satellite + LiDAR | Water evacuation | Flood, tsunami |
| Parking | Satellite + LiDAR | Vehicle staging, evacuation demand | All |
| Snow plow routes | GPS tracking | Seasonal passability | Snow, wind |
| Flat open fields | DEM + LiDAR | Emergency staging areas | All |
| Pile-up risk zones | Road geometry + visibility + historical crashes | Congestion hotspots | All |

## Downstream Consumers

| Module | Primary Attributes | Use |
|--------|---|---|
| Evacuation routing | Topology, width, lanes, passability, turn constraints | Primary routing engine |
| Wildfire | Passability, driveway length, pavement layer | Firebreak routes, defense perimeter |
| Flood | Bridges (elevation), passability (water depth override) | Alternate routes when flooded |
| All hazards | Topology + width → throughput | Evacuation demand modeling |
| Vehicle manager | Turn radius, lane count, width | Vehicle-specific routing |
| Public users | Topology, transit, docks | Navigation, evacuation assets |
| Traffic model | Width, lanes, surface condition | Congestion prediction |

## Module Structure

| File | Scope |
|------|-------|
| 01_road_network_extraction | Topology, centerlines, conflation |
| 02_road_width_measurement | Width per point, lanes, effective width |
| 03_road_surface_classification | Paved/unpaved, condition, seasonal passability |
| 04_bridge_overpass_detection | Vertical clearance, capacity, flood risk, weight limits |
| 05_gate_barrier_detection | Fences, walls, gates, lock types, rammability |
| 06_turn_possibility_analysis | U-turn, K-turn, turnaround points by vehicle |
| 07_passability_model | Dynamic traversability, weather/damage adjustments |
| 08_transit_docks_parking | Bus routes, train stations, marinas, parking lots, snow plow tracking |

## Processing Pipeline

```
OSM network + TIGER/Line
       ↓
LiDAR point cloud + Satellite imagery
       ↓
Network conflation (OSM + TIGER match)
       ↓
Road detection (LiDAR + D-LinkNet satellite)
       ↓
Width measurement (all points)
       ↓
Surface classification (Satellite + street-view)
       ↓
Bridge/gate detection (LiDAR + CV)
       ↓
Terrain-based passability (DEM slopes)
       ↓
Turn analysis (vehicle routing tables)
       ↓
Dynamic passability model (multi-factor)
       ↓
Final road layer with 40+ attributes per segment
```

## Accuracy Targets

| Task | Metric | Target |
|------|--------|--------|
| Network conflation | Match rate (OSM ↔ TIGER) | >85% |
| Width measurement | RMSE (meters) | 0.5 |
| Surface classification | Accuracy (paved/unpaved) | >90% |
| Bridge detection | Recall | >95% |
| Gate/barrier detection | Precision | >90% |
| Passability model accuracy | Blind validation vs. on-ground | >80% |

## Data Quality Scoring

Per-road-segment confidence: 0.0 to 1.0 based on:
- Source agreement (topology from ≥2 sources)
- Attribute completeness (width, surface, bridges, gates present)
- Recency (within 6 months)

Segments <0.5 confidence: escalated for field verification.

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| roads.extraction.started | Processor launch | Per run |
| roads.extraction.tile_complete | Tile finished | Per 1km tile |
| roads.extract.quality_issue | Low confidence segment | On detection |
| roads.extract.passability_update | Dynamic model change | Real-time event |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `roads:tile:{tile_id}:segment_count` | 7 days | Road count per tile |
| `roads:tile:{tile_id}:avg_width` | 7 days | Mean width meters |
| `roads:passability:cached_grid` | 24 hours | 8-direction traversability raster |
| `roads:transit:active_routes` | 24 hours | Currently operating transit |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| D-LinkNet road inference (8× A100, 30 days) | $400-500 |
| LiDAR width measurement (CPU, zonal stats) | $100-150 |
| Surface classification CV (2× A100) | $150-200 |
| Bridge/gate detection (LiDAR + CV) | $150-200 |
| Passability model + updates (CPU, weather API) | $100-150 |
| Transit API queries + OSM processing | $80-120 |
| S3 storage (GeoParquet road layer) | $100-150 |
| NATS/Redis messaging | $50-80 |
| **Total** | **$1,130-1,550** |

## Success Metrics

| Metric | Target |
|--------|--------|
| Extraction cycle time | <35 days (US) |
| Network conflation match rate | >85% |
| Width accuracy (RMSE) | <0.5m |
| Surface classification F1 | >0.90 |
| Bridge inventory completeness | >95% (vs. DOT records) |
| Passability model field validation | >0.80 accuracy |
| Routing latency (per-user query) | <200ms |
