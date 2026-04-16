## 4. Map Layers

### 4.1 Terrain & Elevation

## Still Needs Research
- Global DEM resolution comparison (Copernicus vs. alternatives) for hazard modeling accuracy
- Sinkhole risk factors beyond limestone and underground water
- Fault line slip probability estimates and validation
- Volcano monitoring indicators and activity level classification
- Permafrost degradation modeling for cold regions
- Liquefaction zone boundary precision and seasonal variation
- Directional traversability computation from LiDAR (8-direction indexing)
- Terrain permeability vs. drought susceptibility relationship

- DEM (global: Copernicus DEM; US: 3DEP LiDAR)
- Slope (derived from DEM)
- Aspect
- Terrain classification
- LiDAR (roof geometry for fire model, bare earth)
- **Landcover layer:** Global: ESA WorldCover (10m); US: NLCD (30m). Supplemented by LiDAR, Mapillary, Sentinel-2.
- **Traversability layer (LiDAR-derived):** Walkable/climbable, bikeable, driveable (2WD, AWD, 4WD), max car length, passable by firetruck. Includes elevation, pavement, water, grass, dirt, sand, farm terrain.
- **Terrain passability from 8 main directions layer:** Directional traversability for routing from any approach angle
- Elevation layer for tsunami impact modeling
- Drainage direction
- Terrain permeability (susceptibility to drought, ground saturation capacity)
- Grass layer (feeds into terrain flammability and traversability)
- Sand layer (terrain subtype — traversability and fire resistance)
- Liquefaction risk zones
- Landslide/avalanche/mudslide likelihood (slope-derived)
- Sinkhole risk (underground water, limestone, etc.)
- Fault lines with most recent slip likelihood
- Volcano monitoring (signs of activity)

