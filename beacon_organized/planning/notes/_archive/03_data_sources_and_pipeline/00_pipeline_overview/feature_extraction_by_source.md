# Feature Extraction by Data Source

Every feature Beacon extracts from raw data. Organized by data source type, then by what to extract. Cross-source iterative patterns documented at end.

---

## 1. LiDAR (USGS 3DEP, NOAA Digital Coast)

### Terrain
- Bare earth elevation (DEM)
- Slope angle and aspect per pixel
- Drainage direction vectors
- Terrain roughness index
- Sinkhole depression detection (closed depressions in karst terrain)
- Cliff and escarpment edges
- Terrain permeability proxy (surface roughness correlates with soil drainage)

### Vegetation
- Individual tree detection (crown segmentation)
- Tree height
- Tree lean angle and direction (fall risk onto roads)
- Canopy density and gaps
- Understory brush density (transition fuel between terrain types)
- Vegetation clearing patterns (indicates unpaved roads/trails)
- Tree trunk diameter estimation (from crown-to-height allometry)

### Structures
- Building footprints (precise boundary)
- Building height / number of floors
- Roof geometry (flat, pitched, hip, gabled, complex)
- Roof slope and helicopter landability assessment
- Soft story detection (first floor significantly taller than upper floors)
- Space between structures (critical for burn-together group calculation)
- Building volume estimation
- Attached vs detached structures
- Chimney/vent detection on rooftops
- Solar panel detection (roof surface reflectance anomaly)

### Roads and Access
- Road width at every point along centerline
- Road surface elevation profile
- Shoulder width
- Driveway length, width, slope
- U-turn feasibility by width (indexed by vehicle size)
- K-turn feasibility by width + backing space
- Overpass clearance height
- Bridge deck elevation and width
- Guardrail and jersey barrier locations (height + extent)
- Parked cars reducing actual drivable width (street crowding)
- Parking lot boundaries
- Sidewalk width and curb height

### Water Features
- Stream channel geometry (cross-section for flood modeling)
- Dam and levee crest elevation
- Coastal elevation transects (tsunami run-up modeling)
- Bathymetry (NOAA Digital Coast, shallow coastal)
- Dock and pier structures
- Pool detection (water surface within structure boundary)

### Utilities
- Power line height and routing between poles
- Cell tower height and structure shape
- Water tower locations
- Antenna array identification

### Barriers
- Fence height and extent (linear feature with consistent height)
- Wall height and extent (solid return vs fence gaps)
- Boulder detection (large isolated returns)
- Hedge rows (dense vegetation in linear arrangement)
- Retaining walls

---

## 2. Satellite Imagery (Sentinel-2, NAIP, GOES, Landsat)

### Sentinel-2 (10m, global, weekly)
- NDVI (vegetation health/density, drought stress indicator)
- Burn scar mapping (dNBR differenced normalized burn ratio)
- Water body extent (MNDWI modified normalized difference water index)
- Snow cover extent (NDSI normalized difference snow index)
- Impervious surface estimation
- Crop type and growth stage
- Cloud and shadow masks
- Land cover classification (12 classes)
- Vegetation moisture content (NDWI for fire fuel moisture)
- Urban heat island proxy (thermal bands on Landsat, not Sentinel-2 — but Sentinel-2 red-edge correlates)

### NAIP (0.6m, US, every 2-3 years)
- Building footprint detection (higher resolution than Sentinel-2)
- Individual large tree detection
- Road centerline extraction
- Parking lot identification
- Swimming pool detection
- Construction site identification
- Trailer park identification
- Solar farm extent
- Dock and marina structure identification
- Sports field and open space identification
- Cemetery identification (open, non-flammable space)
- Camping ground clearing identification

### GOES (5-15min, US)
- Active fire hot spot detection (3.9um band)
- Lightning strike locations and density
- Cloud top temperature (severe storm indicator)
- Fog and low visibility detection
- Derived motion winds
- Volcanic ash cloud tracking

### Real-time Satellite (VIIRS/MODIS via FIRMS)
- Active fire detection (375m VIIRS, 1km MODIS)
- Fire radiative power (fire intensity)
- Smoke plume extent and direction
- Thermal anomaly detection (industrial fires, lava flows)

---

## 3. Street-Level Imagery (Mapillary, Ring Doorbell, User Photos)

### Mapillary (monthly refresh, coverage varies)

**Building Attributes**
- Building material classification (wood, brick, concrete, metal, stone, mixed)
- Building purpose/type (residential, commercial, industrial, public, religious)
- Number of visible floors
- Building age estimation (architectural style + condition)
- Store/business identification (logo recognition)
- Glass-front store identification (tornado/blast vulnerability)
- Entrance and exit locations
- Garage door detection
- Building condition assessment

**Road and Access**
- Lane marking type and condition
- Road surface type (asphalt, concrete, gravel, dirt)
- Speed limit signs
- Stop signs, yield signs, traffic signals
- One-way indicators
- Road hazard signs (curves, grade, falling rock)
- Bridge weight limit signs
- Road condition (potholes, cracks, flooding evidence)

**Barriers and Access Control**
- Fence material (chain link, wood, wrought iron, vinyl, concrete)
- Fence condition and rammability assessment
- Gate type (manual, electric, bollard)
- Gate lock type (padlock, electronic, combination)
- Wall material and height
- Guardrail type and condition
- Bollard spacing and type

**Utilities**
- Fire hydrant locations and type (color coding indicates pressure)
- Power line identification and provider signage
- Transformer locations (pole-mounted, pad-mounted)
- Gas meter locations (indicates gas service to building)
- Utility pole identification
- Manhole cover locations

**Vegetation**
- Tree species identification (visual characteristics)
- Tree health/drought stress (brown leaves, dead branches)
- Vegetation proximity to structures (defensible space assessment)
- Bush and hedge species

**Hazardous**
- Gas station identification (brand, pump count)
- Chemical storage signage (NFPA 704 diamond placards)
- Propane tank detection
- Ammunition store identification
- Industrial facility identification

**Signage**
- Street name signs
- Building address numbers
- Business name signs and logos
- Warning signs
- Emergency route signs
- Evacuation route signs
- Beach condition signs
- Trail marker signs

**Other**
- Sidewalk condition
- ADA ramp presence
- Bus stop locations and shelter type
- Parking meter locations
- Bike rack locations
- Dumpster and waste bin locations
- Fire escape identification
- Subway entrance identification and depth indicators

### Ring Doorbell (partnership, real-time)
- Street-level activity (pedestrian, vehicle traffic patterns)
- Post-event change detection (before/after comparison)
- Package delivery frequency (population activity proxy)
- Vehicle type identification in driveways
- Snow accumulation on driveways/sidewalks

### User Phone Camera (real-time during events)
- Obstruction detection vs LiDAR prior (fallen trees, collapsed structures, debris, flooding)
- Smoke density and direction
- Flame location and intensity
- Visibility distance estimation
- Road condition (flooded, icy, debris-covered)
- Damage severity classification (0-4 scale)
- Scene classification (indoor/outdoor, vehicle, open space)

---

## 4. DEM / Elevation Models (Copernicus 30m global, 3DEP 1m US)

- Elevation at every point
- Slope angle (degrees)
- Slope aspect (compass direction)
- Terrain classification (flat, gentle, moderate, steep, cliff)
- Drainage direction (D8 flow direction algorithm)
- Flow accumulation (where water collects)
- Watershed delineation
- Topographic wetness index
- Distance to high ground from any point (walking + driving)
- Tsunami inundation zones by wave height scenario
- Flood depth estimation given river stage
- Landslide susceptibility (slope angle + curvature)
- Avalanche starting zone identification (slope 30-45 degrees)
- Avalanche runout zone estimation (alpha-beta model)
- Terrain passability from 8 cardinal directions (directional traversability)
- Dirt road identification (slope analysis where no paved road mapped)
- Helicopter landing zone identification (flat areas with clearance)
- Line-of-sight analysis (radio propagation, visibility between points)

---

## 5. Vector Data (OpenStreetMap, TIGER/Line, Census)

### OpenStreetMap (weekly-monthly refresh)
- Road network: name, type, surface, lanes, speed limit, one-way, bridge, tunnel
- Building footprints with tags: type, name, levels, material, address
- POIs: amenity, shop, tourism, leisure, emergency, healthcare tags
- Land use polygons: residential, commercial, industrial, farm, forest, military
- Water features: rivers, lakes, streams, coastline, wetlands
- Railways: tracks, stations, crossings, level crossings
- Power infrastructure: lines, substations, generators, plants
- Gas stations (amenity=fuel)
- Marinas (leisure=marina)
- Fire stations, police stations, hospitals
- Schools, churches, community centers
- Parking areas (surface, underground, multi-story)
- Camping grounds (tourism=camp_site)
- Ammunition and gun shops
- Trail networks (hiking, biking, horse)
- Ferry routes and terminals
- Subway stations and lines

### TIGER/Line (Census)
- County, state, city, place boundaries
- School district boundaries
- Congressional district boundaries
- Census tract and block group boundaries
- Address ranges per road segment
- Road centerlines with MTFCC type codes
- Landmark features (airports, cemeteries, parks)

### Other Vector Sources
- FEMA NFHL: flood zone polygons, base flood elevation, floodway
- NHD Plus: stream network, flow direction, catchments, gauge locations
- HydroSHEDS: global watershed boundaries, flow direction, stream network
- GEM Global Active Faults: fault geometry, slip type, slip rate, max magnitude
- National Bridge Inventory: location, condition rating, scour rating, load capacity
- PHMSA: pipeline routes (gas, oil, hazmat) with registration
- State GIS clearinghouses: fire districts, police jurisdictions, utility service areas

---

## 6. Soil and Subsurface Data

### SSURGO (US, annual)
- Soil type classification per polygon
- Drainage class (well-drained to very poorly drained)
- Hydrologic soil group (A through D, runoff potential)
- Depth to water table
- Flood frequency class
- Shrink-swell potential (foundation risk)
- Erosion factor (K factor)
- Permeability rate
- Available water capacity
- Depth to restrictive layer (bedrock)
- Soil liquefaction susceptibility (correlated with Vs30)

### SoilGrids (global)
- Sand/silt/clay percentage at multiple depths
- Organic carbon content
- Bulk density
- Depth to bedrock
- Soil moisture proxy

### USGS Global Vs30
- Shear wave velocity (seismic site amplification factor)
- Liquefaction susceptibility zones (Vs30 < 180 m/s high risk)
- Seismic site classification (A through E per NEHRP)

### Fan et al Water Table
- Depth to water table (meters)
- Shallow water table zones (subsidence and liquefaction risk)

---

## 7. Weather and Atmospheric (Real-Time Feeds)

### NWS / GFS / HRRR
- Temperature, dewpoint, humidity
- Wind speed, direction, gusts at surface and aloft
- CAPE (convective available potential energy — severe storm indicator)
- Wind shear (tornado environment indicator)
- Precipitation rate and type (rain, snow, sleet, freezing rain)
- Visibility
- Barometric pressure and pressure tendency
- Snow depth and snow water equivalent
- Fire weather indices (RH, wind, temp, fuel moisture)
- Freezing level height
- IDF curves for precipitation intensity (NOAA Atlas 14)

### NEXRAD Radar (5-minute updates)
- Reflectivity (precipitation intensity)
- Velocity (rotation detection for mesocyclones)
- Dual-pol products: differential reflectivity (hail vs rain), correlation coefficient (tornado debris signature), specific differential phase (heavy rain)
- Storm-relative velocity (tornado vortex signature)
- Vertically integrated liquid (hail potential)
- Echo tops (storm height)
- Mesocyclone detection algorithm output
- Tornado vortex signature detection

### MRMS (2-minute updates)
- Multi-radar merged precipitation rate
- Quantitative precipitation estimation
- Precipitation type classification
- Rotation tracks (tornado path estimation)
- Maximum estimated size of hail

### GOES Satellite (5-15 min)
- Cloud-to-ground lightning density and locations
- Fire hot spots
- Fog extent
- Volcanic ash detection
- Derived atmospheric motion vectors

### Air Quality
- AirNow: PM2.5, PM10, ozone, AQI by monitoring station
- HYSPLIT: smoke transport trajectories and dispersion modeling
- Purple Air: crowdsourced PM2.5 (denser network than AirNow)
- Pollen counts (regional, relevant for respiratory vulnerability)

---

## 8. Hydrological (Real-Time)

### USGS Water Services (15-min updates)
- Gauge height at each monitoring station
- Discharge (cubic feet per second)
- Flood stage status (action, minor, moderate, major)
- Water temperature
- Rate of rise/fall

### NOAA CO-OPS (6-min updates)
- Observed tide levels
- Predicted tide levels
- Storm surge component (observed minus predicted)
- Currents

### DART Buoys / NDBC
- Deep ocean pressure (tsunami detection)
- Wave height, period, direction
- Water temperature
- Atmospheric pressure at buoy

### GloFAS (daily)
- River discharge forecasts (global)
- Flood probability (2, 5, 20 year return periods)
- Upstream rainfall accumulation

### SWOT
- Water surface elevation (rivers, lakes)
- Inundation extent mapping

---

## 9. Fire-Specific Sources

### LANDFIRE (every 2 years)
- FBFM40: 40 fire behavior fuel models per pixel
- Canopy bulk density (crown fire potential)
- Canopy base height (surface-to-crown fire transition threshold)
- Canopy cover percentage
- Canopy height
- Existing vegetation type (EVT, 800+ classes)
- Existing vegetation height
- Fire regime groups (historical fire frequency and severity)

### MTBS (annual)
- Burn perimeters (historical fires)
- Burn severity classification (unburned to high severity)
- Time since last burn (recent burns = lower fuel loading)

### NIFC (daily during fire season)
- Active fire perimeters
- Containment percentage
- Fire behavior observations
- Evacuation zone boundaries
- Incident resources deployed

---

## 10. Hazardous Facility Data

### EPA Databases
- FRS: facility locations, chemicals stored, permit status, compliance history
- RMP (Risk Management Program): worst-case release scenarios, toxic endpoints, affected population
- UST Finder: underground storage tank locations, leak status, cleanup status
- TRI (Toxics Release Inventory): annual chemical release quantities

### PHMSA
- Pipeline routes (gas, oil, hazardous liquid)
- Pipeline material, diameter, pressure
- Incident history per segment

### NRC (Nuclear Regulatory Commission)
- Reactor locations and status
- Emergency planning zones (10-mile plume, 50-mile ingestion)
- Spent fuel storage locations

### DOT
- Hazmat transportation routes
- Bridge load restrictions
- Road weight limits

---

## 11. Demographic and Vulnerability

### Census Decennial + ACS
- Total population per block/tract
- Age distribution (children, working age, elderly)
- Disability prevalence by type
- Vehicles available per household (zero-vehicle households = evacuation-dependent)
- Housing unit counts and types (single family, multi-family, mobile home)
- Language spoken at home (non-English for alert translation)
- Income (poverty threshold for resource allocation)
- Group quarters (dorms, nursing homes, prisons, military barracks)

### CDC Social Vulnerability Index
- Composite vulnerability score per census tract
- Four themes: socioeconomic, household composition/disability, minority/language, housing type/transportation

### Facility Databases
- State health dept licensing: nursing homes, assisted living, group homes, hospitals, dialysis centers
- CMS Medicare: certified facilities with bed counts and specialties
- State education agencies: schools (K-12) and licensed daycare locations with enrollment
- HUD: homeless shelter locations and capacity
- VA: veteran facilities
- DOJ: correctional facilities with population

---

## 12. Phone Sensor Data (Real-Time, Per-User)

- GPS location and accuracy
- Accelerometer: crash detection, building collapse, fall detection, earthquake shaking
- Barometer: altitude confirmation, pressure drop (severe weather approach), wind change prediction
- Gyroscope: vehicle orientation, lofting detection (tornado)
- Microphone: fire alarm detection, explosion detection
- Camera: real-time scene analysis, change detection vs LiDAR prior
- Ambient light sensor: time-of-day confirmation, smoke density proxy
- Cellular signal strength: dead zone mapping, service loss detection
- Battery level: battery drain pattern analysis (phone overheating = fire proximity, stopped activity = potential casualty)
- Bluetooth/UWB: indoor navigation, building evacuation path sharing
- Magnetometer: compass heading for evacuation guidance

---

## 13. User-Reported Data (Manual Input)

- Vehicle make/model/year and capabilities (snow tires, chains, 4WD)
- Household members needing evacuation assistance
- Disability status and type
- Pets (type, count, location)
- Swimming ability
- Equipment available (snow plow, excavator, bolt cutters, ladder, surfboard, boat)
- Skills (retired police/fire, medical training, SAR certified)
- Fireproofed home certification
- Driveway clearing status
- Sidewalk conditions
- Visibility reports (distance estimation)
- Snow drift levels
- Water pressure reports
- Geiger counter readings
- Evacuation status (evacuated, sheltering, en route)
- Destruction reports with photos
- Animal sightings (for rescue)
- Controlled avalanche reports from locals
- Condition reports on runs (ski resort module)
- Gate status (open/closed/blocked)

---

## 14. EMS/Authority-Reported Data

- Evacuation routes (drawn on map)
- Evacuation zone boundaries
- Shelter locations and capacity
- Road closures and detours
- One-way designations during evacuation
- Resource staging areas
- 911 call locations and types
- Confirmed casualties/fatalities
- Confirmed evacuated buildings
- Fire line positions (manually drawn by fire personnel)
- Water drop locations
- Hazmat spill boundaries
- Plow routes (tracked automatically when plower account is active)
- Dispatch layer markings
- Mutual aid requests and responses
- Group area boundaries
- Jurisdiction boundary corrections

---

## 15. Third-Party APIs (Real-Time)

### Earthquake
- USGS Earthquake API: magnitude, depth, location, time, ShakeMap intensity, focal mechanism
- ShakeAlert EEW: seconds-of-warning before shaking arrives

### Hurricane
- NHC: track forecast, wind radii (34/50/64 kt), storm surge forecast, rainfall forecast
- IBTrACS/JTWC: global tropical cyclone tracks and intensity

### Severe Weather
- SPC: convective outlooks (day 1-8), tornado/wind/hail probabilities, watch boxes, mesoscale discussions
- NWS Alerts API: all watches/warnings/advisories with polygons and expiry times

### Tsunami
- NOAA PTWC: tsunami warnings, watches, advisories with ETA
- DART buoy network: deep ocean pressure anomalies

### Volcano
- USGS CVO / Smithsonian GVP: volcano alert levels, aviation color codes, eruption status
- InSAR: ground deformation (inflation/deflation indicating magma movement)

### Other
- NOAA tide predictions and observed levels
- AIS: vessel tracking for maritime evacuation assets
- FAA: TFR (temporary flight restrictions) indicating incidents
- Wastewater surveillance: COVID/pathogen detection for pandemic module
- Power outage trackers: utility-reported outage maps

---

## 16. Cross-Source Iterative Identification Patterns

Many features cannot be reliably identified from a single source. The pipeline uses iterative passes where one source narrows candidates and a second source confirms or refines.

### Pattern A: LiDAR Candidate, Street-View Confirm

LiDAR detects a geometric anomaly. Street-view imagery classifies what it actually is.

| LiDAR Detection | Street-View Confirmation | Feature |
|---|---|---|
| Low linear feature at consistent height | Chain-link fence visible | Chain-link fence + rammability rating |
| Low linear feature, solid return | Concrete or brick wall visible | Wall (not rammable) |
| Isolated large return, irregular shape | Boulder visible | Boulder (barrier) |
| Isolated large return, regular shape | Dumpster or container visible | Not a barrier |
| Gap in linear barrier | Gate hardware visible | Gate + lock type |
| Tall narrow vertical return | Fire hydrant visible | Fire hydrant + pressure color |
| Regular rectangular roof, flat | Store signage/brand logo visible | Specific business ID (Target, Walmart) |
| Cylindrical vertical return | Propane tank visible | Propane tank (hazard) |
| Linear feature at pole height | Power line visible, provider sign | Power line + utility provider |
| Rooftop anomaly, rectangular | Solar panel array | Solar panel (non-flammable roof section) |

### Pattern B: Satellite Candidate, LiDAR Refine

Satellite imagery identifies broad areas. LiDAR provides precise measurement.

| Satellite Detection | LiDAR Refinement | Feature |
|---|---|---|
| Water surface (MNDWI) | Surface elevation, depth profile | Pool vs pond vs puddle |
| Impervious surface cluster | Building footprints + heights | Structure count and density |
| Vegetation gap (cleared area) | Elevation profile, surface type | Road vs parking lot vs cleared lot |
| Linear dark feature | Width, surface elevation | Road width + type |
| Bright roof signature | Roof geometry, helicopter landability | Flat commercial roof (staging area) |
| Coastal low-lying area | Precise elevation per meter | Tsunami inundation zone boundary |
| Forest clearing | Tree heights around edges | Potential helicopter landing zone |

### Pattern C: DEM + LiDAR + Street-View Triple Pass

Some features require three passes to fully characterize.

**Dirt Roads:** DEM slope analysis suggests traversable grade along an unmapped route. LiDAR confirms vegetation clearing pattern along that grade. Street-view (where available) confirms surface type and condition. Without street-view, classified as "probable unpaved road" at lower confidence.

**Driveways:** LiDAR measures length, width, slope. DEM confirms grade is drivable. Street-view confirms surface type, gate presence, vehicle clearance. Combined: full driveway profile for vehicle routing.

**Building Vulnerability (Earthquake):** DEM locates the building on soil type (via SSURGO overlay). LiDAR measures building height and detects soft-story geometry. Street-view identifies building material and age. Combined: earthquake collapse probability score.

**Overpass Assessment:** LiDAR measures clearance height precisely. DEM provides approach grade. DOT records provide weight limits. Street-view confirms signage and condition. Combined: full overpass traversability profile by vehicle type.

### Pattern D: OSM Candidate, Satellite + LiDAR Validate

OSM tags claim something exists. Satellite and LiDAR confirm it is still there and measure it.

| OSM Tag | Satellite Check | LiDAR Check | Result |
|---|---|---|---|
| amenity=fuel | Structure visible at coords | Canopy structure height | Gas station confirmed + footprint |
| leisure=marina | Water + dock structures | Dock elevation, slip count | Marina confirmed + capacity |
| building=church | Roof shape visible | Steeple height, footprint | Church confirmed + shelter capacity |
| highway=residential | Linear feature visible | Width measurement | Road confirmed + width + lanes |
| landuse=cemetery | Distinct pattern visible | Low, flat, open space | Cemetery confirmed (non-flammable zone) |
| amenity=school | Large building + fields | Building height, playground | School confirmed + population capacity |

### Pattern E: Model Output, Secondary Source Override

A model produces an initial prediction. A second source can override it.

- Fire fuel model (LANDFIRE) says grassland, but LiDAR shows dense brush: upgrade fuel loading.
- Population model (Census) says low density, but building purpose model identifies apartment complex: upgrade population count.
- Flood zone (FEMA NFHL) says Zone X (minimal risk), but DEM shows depression with no drainage outlet: flag as unmapped flood risk.
- Road passability model says passable, but user reports flooding: override to impassable.
- Building material model says wood frame, but county assessor records say concrete: use assessor data.

### Pattern F: Temporal Cross-Source (Event-Active)

During events, real-time sources validate or override static base map data.

- Base map shows road open + NEXRAD shows heavy rain over watershed + USGS gauge rising past flood stage: flag road as probably flooded before user reports.
- Base map shows building standing + user phone camera shows rubble vs LiDAR prior: mark building as collapsed, update evacuation routing.
- Base map shows tree canopy + VIIRS shows fire hot spot + Sentinel-2 shows burn scar: mark area as burned, flag as potential safe zone once cooled.
- Base map shows power line route + utility reports outage + user reports downed line: mark road segment as electrocution hazard.

### Pattern G: Confidence Scoring

Every extracted feature gets a confidence score (0.0 to 1.0) based on:

| Factor | Effect on Confidence |
|---|---|
| Number of agreeing sources | +0.1 per additional source |
| Source resolution (higher = better) | Up to +0.2 |
| Source recency (newer = better) | Up to +0.15 |
| Human confirmation (EMS or user) | +0.3 |
| Conflicting sources | -0.2 per conflict |
| Known source weakness for this feature type | -0.1 |

Features below 0.4 confidence are flagged for human review. Features below 0.2 are suppressed from user-facing layers unless no other data exists for that area.

---

## 17. Source Priority Matrix (Summary)

Which source is best for which category of feature:

| Feature Category | Primary Source | Secondary | Tertiary |
|---|---|---|---|
| Elevation/slope | LiDAR (3DEP) | DEM (Copernicus) | - |
| Building footprints | LiDAR | Satellite (NAIP) | OSM/Google/MS |
| Building materials | Street-view (Mapillary) | LiDAR reflectance | County records |
| Building purpose | Street-view (logos/signs) | OSM tags | LiDAR shape |
| Road width | LiDAR | Satellite | OSM tags |
| Road surface type | Street-view | Satellite | DEM slope |
| Barriers (fences/walls) | Street-view | LiDAR | Satellite |
| Fire hydrants | Street-view | - | - |
| Power lines | Street-view | LiDAR + satellite | Utility maps |
| Vegetation health | Sentinel-2 (NDVI) | Street-view | LiDAR |
| Vegetation structure | LiDAR | Sentinel-2 | Street-view |
| Fire fuel loading | LANDFIRE | Sentinel-2 NDVI | LiDAR canopy |
| Flood zones | FEMA NFHL | DEM + flow models | Sentinel-1 SAR |
| Soil type | SSURGO | SoilGrids | - |
| Population | Census/ACS | Building purpose model | User reports |
| Hazmat facilities | EPA FRS/RMP | Street-view (placards) | OSM |
| Fault lines | GEM / USGS | - | - |
| Weather | NWS/GFS/HRRR | NEXRAD | GOES |
| Active fires | VIIRS/MODIS | GOES | User reports |
| Earthquake shaking | USGS API / ShakeAlert | Phone sensors | - |
| Water levels | USGS gauges | DART buoys | SWOT |
| Jurisdictions | TIGER/Line | State GIS | OSM admin |
