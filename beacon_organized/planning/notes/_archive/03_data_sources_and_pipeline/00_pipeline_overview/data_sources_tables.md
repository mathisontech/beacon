## 5. Data Sources

### 5.1 Global Static (Permanent / Semi-Permanent)

| Source | Provides | Update Freq | Size |
|---|---|---|---|
| Copernicus DEM | Elevation, slope, aspect | Every few years | 100–150 GB |
| SoilGrids | Sand/silt/clay %, drainage class, depth to bedrock | Rarely | 50–100 GB |
| USGS Global Vs30 | Shear wave velocity (soil stiffness) | Rarely | 1–2 GB |
| ESA WorldCover | Land cover classification (Sentinel-2 based) | Annually | 300–500 GB |
| HydroSHEDS | Watershed boundaries, flow direction, stream network, upstream areas | Never | 50–100 GB |
| GEM Faults | Fault geometry, type, slip rate, max magnitude | Rarely | Small |
| Fan et al Water Table | Depth to water table (meters) | Never | 500 MB–1 GB |
| Natural Earth | Land/water polygons | Rarely | <100 MB |
| WorldPop | Population density rasters | Annually | 20–50 GB |
| Google Open Buildings | Building footprints, centroids, area | Quarterly | 100–200 GB |
| Microsoft Building Footprints | Building footprints, centroids, area | Quarterly | 50–100 GB |

### 5.2 US Static

| Source | Provides | Update Freq | Size |
|---|---|---|---|
| USGS 3DEP | LiDAR elevation, bare earth DEM | Check quarterly | 10–50 TB (download areas, process, keep rasters, remove raw LiDAR) |
| SSURGO | Soil properties, drainage, flood freq, water table | Annually | 20–40 GB |
| NLCD | Land cover, impervious surface %, tree canopy % | 2–3 years | 10–20 GB |
| FEMA NFHL | Flood zones, floodway, base flood elevation | Annually | 30–60 GB |
| NHD Plus | Stream network, flow direction, catchments | Every few years | 30–50 GB |
| NOAA Atlas 14 | Precipitation frequency, IDF curves | Rarely | 1–5 GB |
| National Bridge Inventory | Bridge locations, vulnerability, scour rating | Annually | <500 MB |
| NOAA Digital Coast | Coastal LiDAR, bathymetry, sea level scenarios | Varies | 1–10 TB (coastal) |
| LANDFIRE FBFM40 | Fire fuel models (40 types) | Every 2 years | 5–10 GB |
| LANDFIRE CBD/CBH/CC/CH | Canopy bulk density, base height, cover, height | Every 2 years | 15–25 GB |
| LANDFIRE EVT | Existing vegetation type | Every 2 years | 5–10 GB |
| MTBS | Burn perimeters, severity classification | Annually | 2–5 GB |
| EPA FRS | Hazmat facility locations, chemicals, permits | Annually | <500 MB |
| EPA UST Finder | Underground tank locations, status, leaks | Annually | <200 MB |
| Census Decennial | Population, housing units, group quarters | Every 10 years | 5–10 GB |
| American Community Survey | Age, disability, language, vehicles, housing, income | Annually | 10–20 GB |
| CDC SVI | Social vulnerability index | Annually | 1–2 GB |
| State Health Dept Licensing | Nursing homes, assisted living, group homes, hospitals, dialysis | Varies | Small |
| CMS Medicare Databases | Facility databases | Varies | Small |
| State Education Agencies | Schools and licensed daycare | Varies | Small |
| HUD | Homeless shelter locations | Varies | Small |

### 5.3 Global Periodic (Weekly to Monthly)

| Source | Provides | Update Freq | Size |
|---|---|---|---|
| OpenStreetMap | Roads, POIs, buildings with tags | Weekly–monthly | 70–100 GB |
| Sentinel-2 | NDVI, burn scars, custom analysis | Weekly (fire season) | On-demand |
| Mapillary | Fences, walls, gates, barriers, bollards, road condition, bridge condition, building entrances, underpasses, building descriptions | Monthly | 10–50 GB features (10–100 TB raw) |

### 5.4 Global Real-Time Feeds

| Source | Provides | Frequency | Size |
|---|---|---|---|
| USGS Earthquake API | Magnitude, depth, lat/long, time | Every 1–2 min | <10 MB |
| NASA FIRMS | Active fire detections | Every 3 hours | 10–50 MB |
| NASA GPM | Precipitation (mm/hr) | Every 30 min–3 hrs | 1–5 GB |
| GFS | Wind, temp, humidity, CAPE, shear, snow | Every 6 hours | 5–20 GB |
| GloFAS | River discharge, flood forecasts | Daily | 500 MB–2 GB |
| SWOT | Water surface elevation | As available | 100–500 MB |
| Sentinel-1 | Flood extent (during events) | Every 6–12 days | On-demand |
| Sentinel-3 / Jason-3 | Water level altimetry | Every few days | 100–500 MB |
| IBTrACS / JTWC / NHC | Storm tracks, intensity, forecasts | Every 6 hours | ~10 MB |
| NOAA CO-OPS | Tide predictions, observed water levels | Every 6 minutes | <50 MB |
| FES 2014 / TPXO | Global tide model (predictions anywhere) | On-demand | 5–10 GB |
| IOC Sea Level Monitoring | Global tide gauge network, observed levels | Hourly–real-time | <100 MB |

### 5.5 US Real-Time Feeds

| Source | Provides | Frequency | Size |
|---|---|---|---|
| NWS Alerts API | All warnings with polygons | 30–60 seconds | 10–50 MB |
| USGS Water Services | Gauge levels, discharge, flood stage | 15 minutes | 50–200 MB |
| NOAA GOES | Imagery, lightning, fire hot spots, winds | 5–15 minutes | 5–20 GB |
| NOAA NEXRAD | Radar reflectivity, velocity, hail, rotation | 5 minutes | 50–200 GB raw / 5–20 GB processed |
| NOAA MRMS | Merged precipitation, QPE | 2 minutes | 10–30 GB |
| NHC | Hurricane tracks, wind radii, storm surge | 6 hours | <50 MB |
| SPC | Outlooks, probabilities, watches | Multiple daily | <100 MB |
| NIFC | Fire perimeters, containment, behavior | Daily | 50–200 MB |

### 5.6 Storage Summary

| Category | Size |
|---|---|
| Global base layer (static) | 500 GB–1 TB |
| Global buildings/roads | 200–400 GB |
| Global real-time daily ingest | 10–30 GB/day |
| US refinement (static, no LiDAR) | 100–200 GB |
| US LiDAR (3DEP + Digital Coast) | 10–50 TB |
| US real-time daily ingest | 50–200 GB/day |

---

