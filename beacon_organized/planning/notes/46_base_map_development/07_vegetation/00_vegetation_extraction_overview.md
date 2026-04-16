# Vegetation Extraction Overview

All vegetation attributes: species/type, height, density/canopy cover, health (NDVI), fuel loading, burn scars. Primary source: LANDFIRE EVT 140-category classification. Secondary: satellite NDVI, LiDAR structural metrics.

## Extracted Attributes

| Attribute | Source | Resolution | Downstream Use |
|---|---|---|---|
| Vegetation type (EVT) | LANDFIRE EVT | 30m | Fire behavior, wildlife habitat |
| Vegetation height | LiDAR CHM / satellite | 1m/30m | Crown fire initiation, visibility |
| Canopy cover (%) | LiDAR + satellite NDVI | 1m/30m | Fire intensity, light regime |
| Vegetation density | LiDAR + NDVI | 1m/30m | Traversability, fuel loading |
| Health/NDVI | Sentinel-2 multispectral | 10m | Drought stress, fire fuel moisture |
| Fuel loading (tons/ha) | LANDFIRE FBFM40 + LiDAR | 30m | Wildfire spread model |
| Tree species | Satellite multispectral + LiDAR | 30m/1m | Flammability, ecology |
| Burn scars | Sentinel-2 NBR temporal | 10m | Post-fire debris flow risk |

## Pipeline Order

1. Load LANDFIRE EVT (140 categories)
2. Compute NDVI from Sentinel-2
3. Extract LiDAR vegetation (DSM - DEM = canopy height model)
4. Classify canopy density from LiDAR returns
5. Identify tree species via multispectral + structure
6. Load LANDFIRE FBFM40 fuel models
7. Estimate fuel loading from LiDAR + FBFM40
8. Detect burn scars via NBR index
9. Estimate recovery stage from temporal NDVI

## Downstream Dependencies

| Consumer | Required Layers |
|---|---|
| Wildfire model | EVT, fuel loading, NDVI, height, canopy cover |
| Avalanche model | Forest presence, height (density reduces runout 40-60%) |
| Landslide model | Root strength (depth estimate from species + age) |
| Air quality | Fuel loading (smoke production potential) |
| Terrain traversability | Vegetation density, understory height |

## Cost & Storage

| Component | Cost |
|---|---|
| LANDFIRE EVT licensing | Free (USFS public) |
| Sentinel-2 data | Free (ESA Copernicus) |
| LiDAR (where available) | Free (USGS 3DEP) |
| Compute (classification + metrics) | ~$30/month A100 GPU US coverage |
| Storage (EVT + metrics) | ~8 TB |

## 5-Agent Monitoring

| Metric | Target | Tool |
|---|---|---|
| EVT classification accuracy | >80% per-class | Cross-validation |
| NDVI temporal consistency | <0.05 seasonal shift | Seasonal comparison |
| Fuel loading realism | Within ±2 tons/ha | Validation vs field plots |
| Burn scar detection | >90% precision | Cross-check FIRMS |
| Species classification | >70% accuracy | Ground truth surveys |

## Accuracy Targets

| Layer | Metric | Target |
|---|---|---|
| EVT classification | Per-class accuracy | >80% |
| Canopy height | RMSE | <1.5m |
| Canopy cover | RMSE | <10% |
| Fuel loading | RMSE | ±2 tons/ha |
| Burn scar detection | Precision/Recall | >90% / >85% |

## ML Models

| Task | Architecture | Training Data |
|---|---|---|
| Vegetation type classification | Random Forest + Sentinel-2 | LANDFIRE labeled sites |
| Canopy height estimation | Random Forest regression | LiDAR training polygons |
| Tree species classifier | ResNet-18 multispectral | Multispectral imagery + field plots |
| Burn scar detector | U-Net temporal | Pre/post satellite pairs + MTBS labels |
| Fuel moisture estimator | XGBoost | Weather + NDVI + historic moisture |

## Dependencies

- rasterio, gdal (vegetation data I/O)
- numpy, pandas (array ops)
- scikit-learn (classification)
- TensorFlow (deep learning models)
- Sentinel Hub (satellite imagery)
- PostgreSQL (metadata)
- Redis (caching)
- NATS (result broadcasting)
