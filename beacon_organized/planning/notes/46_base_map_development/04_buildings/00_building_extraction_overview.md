# Building Extraction Overview

Comprehensive building attribute extraction from aligned multi-source data stack. Outputs 30+ attributes per building footprint for disaster modeling.

## Attributes Extracted

| Attribute | Primary Source | Use Case | Hazards |
|-----------|---|---|---|
| Footprint (geometry) | LiDAR → Mask R-CNN | Inundation depth, containment | All |
| Height (meters) | LiDAR DSM - DEM | Floor count, fragility | EQ, wind, snow |
| Material class | Street-view CV | Fire resistance, seismic | Fire, EQ, wind |
| Purpose/use type | OSM + CV + assessor | Occupancy, shelter | All |
| Year built | Assessor records | Building code era | EQ |
| Soft story flag | LiDAR + street-view | Collapse risk | EQ |
| Exits/entrances | OSM + street-view | Evacuation routes | All |
| Floor count | LiDAR height ÷ 3.5m | Evacuation speed | EQ, flood, wind |
| Unit count | Footprint × density model | Population estimation | All |
| Roof geometry | LiDAR DSM | Helicopter landing, snow load | EQ, snow, wind |
| Fire risk score | Materials + spacing + veg proximity | Wildfire impact | Fire |
| Shelter viability | Durability + capacity + accessibility | Emergency sheltering | All |
| Spacing to neighbors | LiDAR nearest-neighbor | Burn-together groups | Fire, EQ |
| Fence details | Street-view + LiDAR | Access control, rammability | All |
| Building code era | Year built + jurisdiction lookup | Vulnerability baseline | EQ |
| Seismic retrofit status | Assessor records + code era | Collapse prevention | EQ |
| Flood elevation | Ground elevation from DEM | Inundation depth | Flood, tsunami |
| Wind vulnerability | Materials + height + roof | Damage models | Wind |
| Basement presence | Street-view + assessor | Shelter access, flood | Flood, EQ |

## Downstream Consumers

| Module | Primary Attributes | Use |
|--------|---|---|
| Wildfire | Footprint, materials, spacing, fire risk score, vegetation proximity | Burn-together groups, shelter suitability, fuel assessment |
| Earthquake | Height, materials, floor count, soft story, seismic retrofit, code era | Fragility curves, collapse probability |
| Flood | Footprint, elevation, floor count, basement | Inundation depth at structure, shelter access |
| Tsunami | Height, elevation, purpose | Vertical evacuation, population at risk |
| Evacuation routing | Footprint, spacing, exits, fence rammability | Shelter identification, access constraint |
| Population model | Unit count, purpose, occupancy by time-of-day | Dynamic population estimation |
| Public users | Footprint, purpose, shelter score, exits | Shelter finding, safe building ID |

## Module Structure

| File | Scope |
|------|-------|
| 01_building_footprint_detection | Polygon extraction from LiDAR + satellite, confidence scoring |
| 02_building_height_estimation | Height from LiDAR DSM-DEM, shadow analysis, floor count |
| 03_building_material_classification | Material class from street-view CV, age inference, fire/seismic scoring |
| 04_building_purpose_classification | Purpose/use type from OSM + CV + assessor, occupancy estimation |
| 05_building_vulnerability_assessment | Hazard-specific vulnerability scores, soft story detection |
| 06_shelter_viability_scoring | Shelter suitability by hazard type, capacity, accessibility |
| 07_building_subcategories | Special-case buildings (hospitals, schools, hazmat facilities, historic sites) |

## Processing Pipeline

```
LiDAR point cloud
       ↓
Building point classification (CNN backbone)
       ↓
Footprint polygon extraction (Mask R-CNN)
       ↓
Height estimation (DSM - DEM)
       ↓
Material/age CV classification
       ↓
Purpose classification (OSM + CV + assessor)
       ↓
Vulnerability scoring (per hazard)
       ↓
Shelter viability assessment
       ↓
Conflict resolution (multi-source agreement)
       ↓
Final building layer with 30+ attributes per feature
```

## Accuracy Targets

| Task | Metric | Target |
|------|--------|--------|
| Footprint detection | mAP @ 0.5 IOU | 0.85 |
| Height estimation | RMSE (meters) | 2.0 |
| Material classification | F1 score | 0.85 |
| Purpose classification | Accuracy | 0.80 |
| Soft story detection | Recall | 0.80 |
| Shelter score agreement | Cohen's kappa (EMS vs. model) | 0.75 |

## Data Quality Scoring

Per-building confidence: 0.0 to 1.0 based on:
- Source agreement (footprint from ≥2 sources)
- Source resolution (LiDAR 1m > satellite 10m > OSM)
- Attribute completeness (all 30 attributes present)
- Validation pass rate

Buildings <0.4 confidence: flagged for human review.

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| buildings.extraction.started | Processor launch | Per run |
| buildings.extraction.tile_complete | Tile finished | Per 1km tile |
| buildings.extract.quality_issue | Low confidence building | On detection |
| buildings.extract.finished | All tiles done | Per run |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `buildings:tile:{tile_id}:count` | 7 days | Building count per tile |
| `buildings:tile:{tile_id}:shelters` | 7 days | Shelter-viable buildings per tile |
| `buildings:purpose:{purpose}:count` | 7 days | Population-weighted count by purpose |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| Mask R-CNN inference (8× A100, 30 days) | $300-400 |
| Material CV (ResNet-50 on street-view samples) | $150-200 |
| Shelter scoring (EMS verification on 500 samples) | $200-300 |
| S3 storage (GeoParquet building layer) | $50-100 |
| NATS/Redis messaging | $30-50 |
| **Total** | **$730-1,050** |

## Success Metrics

| Metric | Target |
|--------|--------|
| Extraction cycle time | <30 days (US) |
| Footprint accuracy (orthogonal test set) | >85% mAP |
| Height RMSE vs. field survey | <2m |
| Material classification accuracy (street-view test) | >85% |
| Shelter identification agreement with EMS | Kappa >0.75 |
