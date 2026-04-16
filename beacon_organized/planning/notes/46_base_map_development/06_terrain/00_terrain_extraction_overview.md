# Terrain Extraction Overview

Complete terrain attribute extraction for all hazard models and routing systems. Primary input: LiDAR DEM + Copernicus 30m global coverage.

## Extracted Attributes

| Attribute | Source | Resolution | Downstream Use |
|---|---|---|---|
| Elevation (DEM) | 3DEP/Copernicus | 1m/30m | Flood, tsunami, landslide |
| Slope (degrees) | DEM-derived | 1m/30m | Avalanche, landslide, traversability |
| Aspect (compass) | DEM-derived | 1m/30m | Solar radiation, landslide aspect bias |
| Curvature (profile/plan) | DEM-derived | 1m/30m | Avalanche convexity factor |
| Traversability (8-direction) | DEM + slope + surface | 1m/30m | Evacuation routing, SAR |
| Traversability by vehicle | Slope + obstacles | 1m/30m | Emergency vehicle routing |
| Drainage direction (D8) | DEM-derived | 1m/30m | Hydrology, debris flow |
| Flow accumulation | DEM-derived | 1m/30m | Flood modeling |
| Permeability | SSURGO/terrain | 30m | Flood Manning's n, drought |
| Grass/sand layers | Landcover + LiDAR | 1m/30m | Fire traversability, terrain type |
| Terrain classification | Slope-derived | 1m/30m | Flat/gentle/moderate/steep/cliff |
| Height above ground | DEM + LiDAR | 1m | Urban canyon modeling |

## Pipeline Order

1. Load DEM (3DEP US, Copernicus global fallback)
2. Fill voids, remove artifacts
3. Compute slope, aspect, curvature
4. Delineate drainage (D8, flow accumulation)
5. Overlay SSURGO permeability
6. Generate traversability grids by vehicle type
7. Identify impassable terrain, cliffs
8. Classify terrain categories
9. Validate against reference data

## Downstream Dependencies

| Consumer | Required Layers |
|---|---|
| Wildfire model | Slope, traversability, permeability, drainage |
| Flood model | HAND, slope, permeability, Manning's n |
| Avalanche model | Slope (>30°), curvature, aspect, forest density |
| Landslide model | Slope, curvature, permeability, soil saturation |
| Earthquake model | Vs30 site amplification, soil liquefaction |
| Routing engines | Traversability by vehicle, 8-direction costs |
| Search & rescue | Traversability, cliff edges, drainage obstacles |

## Cost & Storage

| Component | Cost |
|---|---|
| 3DEP LiDAR licensing | Free (USGS public) |
| Copernicus DEM | Free (ESA public) |
| SSURGO soil data | Free (USDA NRCS) |
| Compute (slope/aspect/curvature) | ~$50/month A100 GPU time US coverage |
| Storage (1m DEM US) | ~2 TB |
| Storage (processed layers) | ~5 TB |

## 5-Agent Monitoring

| Metric | Target | Tool |
|---|---|---|
| DEM void fill accuracy | <0.5m RMSE | Validation vs field survey |
| Slope computation | <0.5° error | Cross-check sentinel-1 slopes |
| Drainage direction correctness | >98% | Visual inspection per watershed |
| Traversability coverage | 100% US | Automated extent check |
| Layer freshness | Annual | Update calendar |

## Accuracy Targets

| Layer | Metric | Target |
|---|---|---|
| Elevation (3DEP) | RMSE | <1m |
| Elevation (Copernicus) | RMSE | <5m |
| Slope | Angular error | <0.5° |
| Drainage direction | D8 correctness | >98% |
| Traversability | Classification F1 | >0.85 |
| Cliff edge detection | Precision | >0.95 |

## ML Models

| Task | Architecture | Training Data |
|---|---|---|
| Terrain obstacle detection | U-Net | LiDAR + manual terrain labels |
| Cliff edge classification | ResNet-18 | Multi-directional slope analysis |
| Surface type classification | Random Forest | LiDAR reflectance + satellite |

## Dependencies

- rasterio, gdal (DEM processing)
- GDAL (terrain derivatives)
- scipy.ndimage (morphological ops)
- numpy, pandas
- PostgreSQL (metadata store)
- Redis (layer caching)
- NATS (result broadcasting)
