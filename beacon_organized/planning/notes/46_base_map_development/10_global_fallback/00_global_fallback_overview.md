# Global Fallback Base Map System

## Overview

Global base map provides FALLBACK coverage for areas with insufficient local data: outside US, rural regions without LiDAR/street-view, and ocean areas. Lower resolution, fewer attributes, lower confidence (0.2-0.5 vs 0.7-0.9 for full coverage). Flagged tiles indicate fallback data so downstream consumers know uncertainty.

## Data Sources

| Source | Resolution | Primary Use | Coverage |
|--------|------------|-------------|----------|
| Copernicus DEM 30m | 30m raster | Elevation, slope, aspect, terrain classification | Global |
| Sentinel-2 10m | 10m raster | Land cover, vegetation, water, snow, burn scars | Global |
| OpenStreetMap | Vector | Road topology, buildings, POIs | Variable, community-contributed |
| HydroSHEDS | Raster | Watersheds, river networks, HAND | Global |
| GEM Global Active Faults | Vector | Seismic hazard zones | Global |
| Smithsonian GVP | Vector | Volcanic locations, classification | Global |
| GEBCO Bathymetry | 15 arc-sec | Tsunami wave propagation | Ocean basins |
| ESA WorldCover 10m | 10m raster | Land cover (11 classes) | Global |

## Available Attributes

Limited attribute set compared to US enhanced coverage:

- Elevation, slope, aspect, hillshade
- Terrain classification (mountain, valley, plain, escarpment)
- Land cover (11 ESA classes: tree, shrub, grassland, cropland, building, bare, water, snow, clouds)
- Road topology (OSM highway class, surface type where tagged)
- Building footprints (OSM ways and relations, rough polygons)
- POI clusters (OSM nodes, aggregated per 1km cell)
- Major water bodies (rivers, lakes, coastlines)
- Volcanic hazard zones (pyroclastic, lahar, ashfall)
- Tsunami inundation zones (2m, 5m, 10m, 20m wave scenarios)

NOT available: building materials, soft-story detection, road width measurement, barrier classification, turn radii analysis, detailed damage assessment attributes.

## Confidence Scoring

Confidence per tile based on data availability:

| Tier | Sources | Confidence | Use Case |
|------|---------|-----------|----------|
| Full US | LiDAR + NAIP + Mapillary + reference | 0.7-0.9 | Primary hazard models |
| Enhanced US | Satellite + OSM + some reference | 0.4-0.7 | Secondary/routing |
| Global Fallback | Copernicus + Sentinel-2 + OSM only | 0.2-0.5 | Evacuation routing, basic hazard |
| Insufficient | <20% coverage | <0.2 | Suppress, flag for acquisition |

## Accuracy Degradation

Hazard models on fallback tiles lose accuracy due to missing attributes:

| Model | Full Accuracy | Fallback Degradation |
|-------|--------------|----------------------|
| Wildfire spread | 85% ROC | 55-65% ROC |
| Flood inundation | 78% recall | 45-55% recall |
| Tsunami runup | 72% MAE ±2m | 40-50% MAE ±5m |
| Landslide runout | 68% recall | 35-45% recall |
| Evacuation routing | 95% passability | 75-85% passability |

Tier downgrade applies conservative safety factors: assume worse conditions when confidence low.

## Tile Flagging

Every tile tagged with coverage_tier: "full", "enhanced", "global", or "insufficient". Downstream hazard models check tier and apply confidence-scaled uncertainty factors. Clients warn users in UI when viewing low-confidence areas.

## Data Acquisition Prioritization

`generate_coverage_gap_report` identifies areas with insufficient fallback data (e.g., populated regions with <0.3 confidence). Sorted by: (population × missing_attributes) / current_confidence. Highest priority areas targeted for LiDAR or street-view collection.

## Storage and Format

Global fallback stored in: `/atlas/world_base_map/live/global_fallback/`

All layers as Cloud-Optimized GeoTIFF (raster) or PostGIS tables (vector). Tiles indexed by 1km grid cell. Zstandard compression (40-60% ratio).

## Update Frequency

| Source | Release Frequency | Trigger |
|--------|------------------|---------|
| Copernicus DEM | Annual (December) | Manual |
| Sentinel-2 | Every 5 days | Automatic weekly digest |
| OSM | Continuous | Weekly diff extraction |
| WorldCover | Biennial (Dec even years) | Manual |
| Volcanic/tsunami | Ad-hoc | Manual update on new data |

Global fallback refreshes are independent of US-specific updates. Fallback tiles can be updated without affecting national US coverage.

## Downstream Consumers

Hazard models, evacuation routing, mobile client pre-caching, public web map, international EMS partnerships.
