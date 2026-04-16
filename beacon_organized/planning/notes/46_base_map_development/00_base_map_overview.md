# Base Map Overview

## Definition

Base map = all non-transient layers required for disaster management. Includes terrain, buildings, roads, vegetation, infrastructure, population, geological features.

Global fallback (used only where higher-res data unavailable):
- Copernicus DEM 30m
- Sentinel-2 10m
- OpenStreetMap
- HydroSHEDS
- ESA WorldCover

Full base map adds (where available):
- LiDAR 1m (3DEP, NOAA Digital Coast)
- Aerial imagery 0.6m (NAIP, Mapillary)
- Street-view imagery (Mapillary, Ring, user photos)
- County assessor records
- LANDFIRE fuel models
- Census/demographic data
- FEMA flood zones
- Soil data (SSURGO)
- Hydrological networks (NHD+)

## Processing Pipeline

```
Raw Sources → Alignment Processor → Attribute Extraction → Digital Twin → Tile Delivery
```

1. **Raw ingestion:** All data sources imported to EPSG:4326
2. **Alignment:** Georeferencing, resampling, cross-calibration
3. **Extraction:** 30+ layer attributes per 1km tile
4. **Fusion:** Weighted by resolution, recency, agreement
5. **Tiling:** PMTiles format for CDN delivery
6. **Real-time validation:** User reports, sensor data override static layers

## Organization Structure

| Subfolder | Owner | Scope |
|---|---|---|
| 00_base_map_overview | Director Base Map Mgmt | Strategic overview, architecture |
| 01_downstream_dependencies | Hazard Model Lead | Feature requirements by module |
| 02_attribute_data_source_matrix | Data Integration Lead | Source prioritization per attribute |
| 03_terrain_elevation | Terrain Lead | DEM, slope, traversability, geological |
| 04_roads_transportation | Road Lead | Network, geometry, passability, barriers |
| 05_structures_buildings | Building Lead | Footprints, attributes, purpose, materials |
| 06_vegetation | Vegetation Lead | Species, density, health, fuel loading |
| 07_infrastructure | Infrastructure Lead | Utilities, hazmat, water, power |
| 08_population | Demographics Lead | Density, vulnerability, capacity |
| 09_water_hydrological | Hydrology Lead | Streams, floods, coastal, bathymetry |
| 10_cv_ml_systems | ML Lead | Detection, classification, change detection |
| 11_fusion_validation | Validation Lead | Multi-source calibration, conflict resolution |
| 12_tile_delivery | Platform Lead | Tiling, caching, performance |
| 13_user_input_integration | UX Lead | User reports, corrections, real-time updates |
| 14_documentation | Tech Writer | API docs, schema, tutorials |

## Performance Targets

| Metric | Target |
|---|---|
| Tile response latency | <100ms p95 |
| Update cycle | 6 hours |
| Offline cache size | 5GB (1000 tiles) |
| Tile grid | 1km × 1km |
| Processing throughput | 10,000 tiles/hour on 8× A100 |
| US coverage time | ~33 days for full update |

## Data Authority Chain

Conflict resolution by source priority:

1. Human confirmation (EMS, user, field verification): +0.3 confidence
2. Higher resolution source wins (LiDAR 1m > Satellite 10m > Global 30m)
3. Newer source (recency tiebreaker)
4. Source agreement (more sources = higher confidence)
5. Manual override available with audit trail

## Tile Quality Scoring

Data quality per tile: 0-100 based on:
- Source count (agreeing sources)
- Source resolution
- Source recency
- Validation pass rate
- Known weaknesses

Tiles <60: flagged for priority update
