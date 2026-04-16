# Global Pipeline Layers

Processing specifications for each global fallback source. All layers processed in "Global All-at-Once" mode: monthly full refresh, entire planet one pass.

## Data Sources and Processing Tiers

| Source | Input Format | Processing Tier | Function Prefix | Output Location |
|--------|-------------|-----------------|-----------------|-----------------|
| Copernicus DEM | GeoTIFF tiles (1°×1°) | Global All-at-Once | dem | staging/copernicus_dem |
| Sentinel-2 | Cloud-optimized imagery | Global All-at-Once | s2 | staging/sentinel2_global |
| OpenStreetMap | PBF (continent files) | Global All-at-Once | osm | staging/osm_global |
| HydroSHEDS | Raster flow direction | Global All-at-Once | hydro | staging/hydrosheds_global |
| GEM Faults | Shapefile catalog | Global All-at-Once | gem | staging/gem_faults |
| Volcanic Hazards | GVP CSV + vector scenarios | Global All-at-Once | volcanic | staging/volcanic_zones |
| Tsunami | GEBCO + ComMIT scenarios | Global All-at-Once | tsunami | staging/tsunami_zones |
| WorldCover | COG 3°×3° tiles | Global All-at-Once | worldcover | staging/worldcover_10m |

## Functions: Copernicus DEM

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| download_copernicus_dem | AWS bucket query | GeoTIFF tiles (raw/) | Fetch ~26k tiles, verify checksums, manifest | 8-12 hrs |
| standardize_dem_tiles | Raw GeoTIFF | COG Float32 EPSG:4326 (processed/) | Reproject, nodata -9999, LZW compression | 6 hrs |
| compute_slope_aspect_global | DEM VRT | slope/, aspect/ rasters | Per-tile slope (degrees), aspect (0-360, flat=-1) | 4 hrs |
| classify_terrain_global | DEM + slope | terrain_class/ raster | Mountain/valley/plain/escarpment per cell | 2 hrs |
| compute_landslide_susceptibility | DEM + geology | susceptibility/ raster | High/very-high cells, debris runout corridors | 3 hrs |
| build_global_dem_vrt | Standardized tiles | global_dem.vrt | Index all tiles for seamless access | 10 min |

## Functions: Sentinel-2 Global

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| download_sentinel2_cloudless_mosaic | AWS/Copernicus Hub | Raw JPEG/GeoTIFF | Cloud-free quarterly composite | 2 days (scheduled) |
| atmospheric_correction_global | Raw JPEG | Corrected JPEG (processing/) | Sen2Cor L2A, BRDF correction | 8 hrs |
| compute_ndvi_global | Corrected bands | NDVI raster | Vegetation index, confidence map | 2 hrs |
| compute_nbr_global | Corrected bands | NBR raster | Burn ratio (wildfire detection) | 2 hrs |
| compute_ndwi_global | Corrected bands | NDWI raster | Water/moisture index | 1 hr |
| compute_ndsi_global | Corrected bands | NDSI raster | Snow/ice index | 1 hr |
| classify_land_cover_global | NDVI + NBR + NDWI + NDSI | land_cover/ raster (11 classes) | ESA WorldCover-aligned classes | 4 hrs |
| generate_satellite_tiles | Corrected JPEG | BTS-IMAGERY tiles (z0-14) | 256×256 JPEG RGB, quality 85 | 3 hrs |

## Functions: OpenStreetMap Global

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| download_osm_global | Geofabrik PBF | Continental PBF files (raw/) | Download all continent extracts, checksums | 1 hr |
| extract_osm_roads | PBF | roads/ PostGIS table (staging) | All highway tags, surface type, name, refs | 6 hrs |
| extract_osm_buildings | PBF | buildings/ PostGIS table (staging) | Building footprints, name, type tags | 4 hrs |
| extract_osm_pois | PBF | pois/ PostGIS table (staging) | Nodes/ways with amenity/shop/tourism tags | 3 hrs |
| build_global_routing_graph | roads/ table | road_routing_graph/ (staging) | pgRouting topology, turn costs, turn restrictions | 2 hrs |
| validate_road_connectivity | routing_graph | connectivity_report.json | All nodes reachable, no islands, stats | 30 min |

## Functions: HydroSHEDS Global

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| download_hydrosheds | HydroSHEDS mirror | Raw GeoTIFF (raw/) | DEM-derived flow direction, upslope area | 2 hrs |
| breach_depressions_global | Flow direction raster | Breached flow direction raster | Fill inland sinks before HAND | 4 hrs |
| compute_d8_accumulation | Breached flow | Upslope area raster | Flow accumulation for stream detection | 3 hrs |
| compute_hand_global | DEM + flow + accumulation | HAND raster per cell | Height Above Nearest Drainage, flood proxy | 2 hrs |
| extract_stream_network | D8 accumulation (threshold >1000) | streams/ PostGIS table | Stream polylines, Strahler order | 1 hr |
| delineate_watersheds_global | Flow direction | watersheds/ PostGIS table | HydroBASINS polygons, nesting hierarchy | 2 hrs |

## Functions: Volcanic Hazards

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| download_gem_faults | GEM global catalog | CSV (raw/) | Active fault traces, dip, rake | 30 min |
| download_gvp_catalog | Smithsonian GVP | CSV + scenarios (raw/) | All volcanoes, vent locations, eruption history | 30 min |
| model_pyroclastic_zones | GVP data + DEM | pyroclastic_zones/ PostGIS (staging) | Energy cone per vent, 3 scenarios (small/med/large) | 4 hrs |
| model_lahar_corridors | GVP + HydroSHEDS + glacier data | lahar_zones/ PostGIS (staging) | Runout corridors for glaciated/crater-lake volcanoes | 3 hrs |
| compute_ashfall_zones | GVP wind climatology | ashfall_zones/ raster | Ashfall extent per scenario, thickness estimates | 2 hrs |
| compute_seismic_zones | GEM faults | seismic_hazard/ raster | Peak ground acceleration (PGA) per fault slip rate | 3 hrs |

## Functions: Tsunami & Coastal

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| download_gebco_bathymetry | GEBCO mirror | Raw GeoTIFF (raw/) | Bathymetry 15 arc-sec global, elevation below-sea-level | 1 hr |
| download_commit_scenarios | ComMIT database | Pre-computed scenario files (raw/) | Tsunami scenarios: subduction zones, 4.5-9.0 Mw | 2 hrs |
| compute_tsunami_inundation_global | GEBCO + scenarios | tsunami_inundation/ PostGIS (staging) | Flood extent per wave height (2m/5m/10m/20m) | 6 hrs |
| extract_coastlines | DEM/GEBCO at MSL | coastlines/ PostGIS | Land-water boundary, tide zone flags | 1 hr |
| compute_noaa_tide_predictions | Tide constituents | tide_predictions/ CSV (staging) | Mean high/low water, tidal range per cell | 30 min |
| compute_storm_surge_zones | Historical storms + DEM | storm_surge/ raster (staging) | Surge inundation extent for 100-year storm | 2 hrs |

## Processing Infrastructure

| Component | Specification | Cost |
|-----------|--------------|------|
| Compute | 128-vCPU, 512GB RAM instances | ~$5K/month (EC2 spot) |
| Storage | S3 Standard (raw + staging): 1.5TB | ~$35/month |
| Storage | Archive (old versions): Glacier | ~$5/month |
| Data Transfer | Outbound to CloudFront: 100GB/month | ~$9/month |
| Database | RDS PostGIS: 8-core, 32GB RAM | ~$2K/month |
| **Total Monthly** | | **~$7K** |

## Sequencing

1. Copernicus DEM (foundation layer)
2. HydroSHEDS (depends on DEM)
3. Sentinel-2 (independent)
4. OSM (independent)
5. Terrain classification (depends on DEM + Sentinel-2)
6. Volcanic/tsunami/seismic (mostly independent, final hazard zones depend on terrain)
7. WorldCover (validation only, independent)

Phases 3-5 can run in parallel. Phase 1-2 sequential (HydroSHEDS needs DEM). Phase 6-7 after all inputs ready.

## Versioning

Each processor produces versioned output: v001, v002, etc. Metadata: timestamp, input versions, processor version, status (pass/fail). Old versions archived to S3 Glacier after 1 month.
