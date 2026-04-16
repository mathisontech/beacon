# Infrastructure Extraction Overview

All infrastructure attributes: power lines, substations, cell towers, fire hydrants, water/sewer, dams, gas pipelines, hazmat facilities, nuclear plants, communication systems. Critical for earthquake cascade failures, wildfire ignition, flood dam failure, emergency notifications, EMS routing.

## Extracted Attributes

| Attribute | Source | Type | Downstream Use |
|---|---|---|---|
| Power lines (transmission/distribution) | LiDAR, street-view, utility maps | Vector network | Earthquake cascade, wildfire hazard |
| Power substations | Satellite, street-view, utility maps | Point layer | Power restoration modeling |
| Cell tower locations | Satellite, LiDAR, FCC database | Point layer | Coverage mapping, alert delivery |
| Fire hydrants with pressure | Street-view CV + utility maps | Point + pressure color | Fire suppression routing |
| Water mains | Utility GIS, street-view | Vector network | Water system redundancy |
| Water towers/wells | Satellite, LiDAR, utility maps | Point layer | Emergency water access |
| Gas pipeline routes | PHMSA, utility maps | Vector network | Blast zone modeling |
| Dams and levees | NID database, LiDAR, satellite | Point + polygon | Dam failure flood zones |
| Hazmat facilities | EPA RMP/TRI, satellite, street-view | Point + risk zones | Evacuation planning |
| Nuclear plants | NRC database | Point + planning zones | Emergency zone modeling |
| Communication networks | Utility maps, FCC database | Vector/point network | Redundancy assessment |

## Pipeline Order

1. Load utility company GIS data (where available via licensing)
2. Detect infrastructure via LiDAR + satellite (where no GIS available)
3. Cross-reference street-view for feature confirmation
4. Load EPA/PHMSA/NRC databases for hazmat facilities
5. Compute utility redundancy and single points of failure
6. Model restoration time estimates per region
7. Generate hazmat blast/plume zones
8. Map emergency response coverage areas

## Downstream Dependencies

| Consumer | Required Layers |
|---|---|
| Earthquake model | Power outage cascade, water disruption |
| Wildfire model | Power line ignition risk, restoration time |
| Flood model | Dam failure risk, pipeline inundation |
| Notifications | Cell tower coverage, redundancy |
| EMS routing | Hydrant locations, resource depots |
| Evacuation planning | Hazmat blast zones, pipeline routes |

## Cost & Storage

| Component | Cost |
|---|---|
| LiDAR utility detection | ~$20/month A100 GPU US |
| Utility GIS licensing | $5K-50K/year (varies by utility) |
| EPA/PHMSA databases | Free (public download) |
| Satellite detection | ~$10/month A100 GPU US |
| Storage (infrastructure layers) | ~3 TB |

## 5-Agent Monitoring

| Metric | Target | Tool |
|---|---|---|
| Power line detection accuracy | >95% length coverage | Visual comparison |
| Cell tower locations | 100% FCC database agreement | Cross-check FCC |
| Hydrant geoposition | <10m error | Field GPS verification |
| Pipeline route accuracy | >90% | Cross-check PHMSA |
| Hazmat facility locations | 100% EPA agreement | Automated crossmatch |

## Accuracy Targets

| Layer | Metric | Target |
|---|---|---|
| Power lines | Length coverage | >95% |
| Cell towers | Locational error | <50m |
| Fire hydrants | Positional error | <5m |
| Gas pipelines | Route agreement | >90% |
| Hazmat zones | Zone boundary | >85% agreement |

## ML Models

| Task | Architecture | Training Data |
|---|---|---|
| Power line detection | Line detection CNN | LiDAR + labeled power lines |
| Cell tower localization | Object detection YOLO | Satellite + FCC coordinates |
| Hydrant detection | Small object detector | Street-view + labeled hydrants |
| Facility classification | Convolutional classifier | Satellite + facility type labels |

## Dependencies

- rasterio, gdal (GIS data I/O)
- fiona, shapely (vector operations)
- numpy, pandas (data processing)
- GDAL (utility GIS import)
- PostgreSQL (facility database)
- Redis (caching)
- NATS (broadcasting)
