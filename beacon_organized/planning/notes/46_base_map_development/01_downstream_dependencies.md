# Downstream Dependencies

Complete mapping of every feature/module consuming base map data. Organized by hazard model, core feature, and user interface.

## Hazard Models

| Hazard | Feature | Base Map Attributes | Why Needed | Update Freq | Accuracy Req |
|---|---|---|---|---|---|
| Wildfire | Terrain analysis | Elevation, slope, aspect | Fuel moisture gradient, wind channels | 6h | ±100m |
| Wildfire | Vegetation fuel | LANDFIRE EVT (140 categories), canopy height, bulk density | Flame length prediction | 2yr | Category exact |
| Wildfire | Building at-risk (WUI) | Building density, materials, spacing, roof type | Structure flammability, burn-together groups | 6h | ±30m footprint |
| Wildfire | Access/egress | Road network, width, bridges, driveways | Evacuation routing, resource access | 6h | ±5m width |
| Wildfire | Water resources | Water bodies, hydrant locations | Firefighting support | 6h | ±10m location |
| Wildfire | Power infrastructure | Power line routing, utility poles | Evacuation hazard, ignition source | 6h | ±5m location |
| Flood | Terrain (HAND) | DEM elevation, drainage direction | Flood depth calculation via HAND algorithm | 6h | ±0.5m elevation |
| Flood | Manning's n | Building coverage, vegetation type, impervious surface | Hydraulic resistance for flow modeling | 6h | ±0.1 roughness |
| Flood | Barriers | Levee/berm location, crest elevation | Inundation boundary | Annual | ±1m |
| Flood | Buildings | Footprints, heights, basement info | Occupancy loss, depth-damage curves | 6h | ±2m height |
| Flood | Roads/bridges | Elevation, surface type, overpass height | Passability thresholds | 6h | ±0.5m elevation |
| Flood | Impervious surface | Parking, roofs, pavement fraction | Runoff coefficient | Annual | ±5% |
| Flood | Stream geometry | NHDPlus cross-section, roughness | Channel flow capacity | Annual | Cross-section exact |
| Earthquake | Soil amplification | Vs30 shear wave velocity, soil type (SSURGO) | Seismic site class, amplification factor | Rarely | Vs30 ±20 m/s |
| Earthquake | Buildings | Location, footprint, materials, year built | Building fragility curves, collapse prediction | 6h | ±5m location |
| Earthquake | Soft story | LiDAR height discontinuity at floor levels | Failure mode identification | 6h | ±1m |
| Earthquake | Seismic retrofit status | County records, permit data | Strength improvement estimate | Annual | Binary (retrofitted/not) |
| Earthquake | Topographic amplification | Slope, ridge/valley topology | Ridge-top amplification factor | Rarely | ±10% |
| Earthquake | Dams | Location, height, material | Failure cascade, downstream impact | Rarely | ±50m location |
| Earthquake | Utilities | Power, water, gas routing | Lifeline disruption cascades | Annual | Routing exact |
| Earthquake | Open fields | Clear areas near buildings | Structural collapse debris spread | 6h | ±50m |
| Tsunami | Coastal elevation | DEM at shore, transect profiles | Inundation extent, run-up height | 6h | ±0.5m elevation |
| Tsunami | Multi-story buildings | Height, roof elevation | Vertical evacuation viability | 6h | ±2m height |
| Tsunami | Structural stability | Building materials, age, retrofit | Collapse likelihood under water load | Annual | Material type exact |
| Tsunami | Port infrastructure | Dock location, depth, type | Surge amplification, debris generation | Annual | ±10m location |
| Tsunami | Road network | Centerline, width, elevation | Evacuation bottleneck detection | 6h | ±2m elevation |
| Tsunami | Seawalls/reefs | Location, height, condition | Wave energy dissipation | Annual | ±1m height |
| Avalanche | Terrain slopes | Slope angle, aspect, elevation bands | Starting zone ID (30-45°), runout path | Rarely | ±2° slope |
| Avalanche | Treeline/vegetation | Forest density, clearing extents | Terrain roughness impact on flow | 6h | Density ±10% |
| Avalanche | Valley confinement | Valley width, wall height, geometry | Path constraint, acceleration zones | Rarely | ±20m width |
| Avalanche | Historic runouts | Polygon extent, frequency | Model calibration, risk zones | Rarely | Polygon exact |
| Avalanche | Infrastructure | Road, buildings in path | Occupancy, impact forces | 6h | ±10m location |
| Avalanche | Slope convexity/concavity | Curvature derived from DEM | Avalanche acceleration/deceleration | Rarely | ±0.1 curvature |
| Landslide | Slope/aspect/curvature | Derived from DEM | Susceptibility index calculation | Rarely | ±2° slope |
| Landslide | Drainage direction | D8 flow direction, wetness index | Saturation modeling | Rarely | Direction exact |
| Landslide | Soil permeability | SSURGO, SoilGrids | Pore pressure buildup | Annual | Drainage class exact |
| Landslide | Vegetation density | Canopy cover, root strength proxy | Stabilization effect | 6h | ±10% cover |
| Landslide | Burn scars | DNBR from Sentinel-2 | Erosion risk post-fire | Daily (event) | Perimeter exact |
| Landslide | Valley floor communities | Building location, elevation | Risk population | 6h | ±10m location |
| Volcano | Elevation/DEM | Bare earth elevation, slope, aspect | Valley topology for lahars | Rarely | ±1m elevation |
| Volcano | River valleys | Stream network, centerline, width | Lahar path constraint | Annual | Centerline ±5m |
| Volcano | Infrastructure | Building, road, power location | Asset exposure | 6h | ±10m location |
| Volcano | Road/community | Network, settlement footprints | Evacuation impact, exposure | 6h | ±5m |
| Volcano | Agricultural boundaries | Land use polygons, crop type | Ash damage assessment | Annual | Polygon exact |
| Hurricane | Terrain | Elevation, slope, surface type | Storm surge modeling | 6h | ±0.5m elevation |
| Hurricane | Building density | Footprints, height, materials | Damage prediction | 6h | ±5m |
| Hurricane | Road network | Centerline, width, elevation | Evacuation routing | 6h | ±2m elevation |
| Hurricane | Vegetation | Type, height, density | Wind damage, debris generation | 6h | Height ±5m |
| Hurricane | Infrastructure | Power lines, water systems | Service disruption modeling | Annual | Routing exact |
| Tornado | Building materials | Wood vs concrete vs steel identification | Fragility curves | Annual | Material type exact |
| Tornado | Building fragility | Year built, code compliance, materials | Damage probability curve | Annual | Age ±1 year |
| Tornado | Shelter locations | Building type, entrance accessibility | Walk-in freezers, bank vaults | 6h | ±10m location |
| Tornado | Road network | Centerline, intersection geometry | Evacuation routing | 6h | ±2m |
| Winter Storm | Road surface | Paved vs unpaved, texture | Snow removal feasibility | 6h | Material type exact |
| Winter Storm | Building heating | Heating method (gas/elec/oil/solar) | Cold shelter viability | Annual | Fuel type exact |
| Winter Storm | Power infrastructure | Distribution network, pole locations | Outage cascade, critical segments | Annual | Routing exact |
| Winter Storm | Snow plow routes | Plow tracking, coverage areas | Service availability | Real-time | Route exact |
| Dust Storm | Terrain | Surface type, vegetation, openness | Source area, transport | 6h | Surface type exact |
| Dust Storm | Road visibility zones | Sight distance, obstruction, elevation | Safe driving areas, bottlenecks | 6h | ±100m distance |
| Drought | Soil permeability | SSURGO drainage class, depth to water table | Groundwater stress | Annual | Drainage class exact |
| Drought | Vegetation health | NDVI, health proxy from Sentinel-2 | Plant stress indicator | Weekly (event) | ±0.1 NDVI |
| Drought | Water infrastructure | Well locations, pump locations, capacity | Resource location | Annual | ±10m |
| Extreme Heat | Building materials | Thermal properties, roof color (reflectance) | Heat absorption rate | Annual | Material type exact |
| Extreme Heat | Canopy cover | Tree coverage, shade availability | Cooling effect | 6h | ±10% cover |
| Extreme Heat | Road surface | Asphalt vs concrete reflectance | Albedo (cooling), reheating time | 6h | Surface type exact |
| Extreme Heat | Population density | Census, occupancy modeling | Vulnerable area identification | Annual | Density ±10% |
| Extreme Cold | Building insulation | Year built (proxy for code era), material | Heat retention | Annual | Age ±1 year |
| Extreme Cold | Heating infrastructure | Power, gas, oil service areas | Fuel availability | Annual | Service area polygon exact |
| Hazmat | Facility locations | EPA FRS coordinates | Exposure identification | Annual | ±100m |
| Hazmat | Building materials | Construction material, occupancy | Secondary hazard if impacted | Annual | Material type exact |
| Hazmat | Population density | Census, time-of-day occupancy | Consequence modeling | Annual | Density ±10% |
| Hazmat | Road network | Routing, chokepoints, residential areas | Transport risk, alternate routes | 6h | ±2m |
| Dam Failure | Elevation/topology | DEM, slope, drainage | Inundation extent modeling | Rarely | ±0.5m elevation |
| Dam Failure | Downstream communities | Building location, elevation relative to dam | At-risk population | 6h | ±10m |
| Dam Failure | Road network | Bridges, elevation, passability | Evacuation routing | 6h | ±2m elevation |
| Rip Current | Coastal elevation | Nearshore bathymetry, beach profile | Current zone identification | Annual | ±1m depth |
| Rip Current | Beach topology | Sandbars, channels, slope profile | Current pathway | Annual | ±5m elevation |
| Infrastructure Failure | Utility network | Power lines, water pipes, gas | Cascading failure analysis | Annual | Routing exact |
| Infrastructure Failure | Building dependencies | Type, purpose, critical facilities | Service disruption consequence | 6h | Building ID exact |
| Power Grid | Grid topology | Substation location, transmission routes | Vulnerability mapping | Annual | Routing exact |
| Power Grid | Population density | Census, time-of-day | Outage consequence | Annual | Density ±10% |
| Power Grid | Critical facilities | Hospital, fire, police location | Service loss priority | 6h | ±10m |
| Sinkhole | Geological data | Depth to bedrock, karst indicator (limestone) | Subsidence risk | Rarely | Geology type exact |
| Sinkhole | Building locations | Footprints, foundation type | At-risk structure ID | 6h | ±5m location |
| Liquefaction | Soil type | SSURGO, Vs30, water table depth | Liquefaction susceptibility | Annual | Vs30 ±20 m/s |
| Liquefaction | Building foundations | Year built, foundation type (proxy age) | Damage model selection | Annual | Age ±5 years |

## Core Features

| Feature | Base Map Attributes | Why Needed | Update Freq | Accuracy Req |
|---|---|---|---|---|
| Evacuation Routing | Road width, lanes, surface, bridges, gates, U-turn/K-turn, passability, barriers, terrain traversability, driveway accessibility | Vehicle clearance, turn radius, barrier ramming feasibility, alternate path finding | Real-time (event) | Width ±0.5m, terrain ±1m |
| Notifications/Alerts | Building type (hospitals, schools, shelters), proximity to hazard zone boundary, address accuracy | Specialized alert routing (evacuation instructions for vulnerable facilities), geofence precision | 6h | ±10m location |
| Street-Level Perception | LiDAR baseline prior (reprojected to street-view), road segments, building outlines, obstruction classification | Real-time change detection by comparing live camera image vs LiDAR prior | Real-time | ±0.5m LiDAR |
| Modeling/Simulation | Terrain (DEM, slope, roughness), vegetation (height, density, species), buildings (footprint, height, materials), roads (width, surface, slope) | Physics-based flood/fire/avalanche simulation, deep learning surrogate model training | 6h | Simulation-specific |
| World Model | Road network (full topology, connectivity), terrain (traversability), building purpose (shelter decision logic) | Pack-aware routing (convoy planning), safe zone analysis, shelter availability | 6h | Network exact, routing ±2m |
| Agentic Planners | Road network, terrain, building location, GeoJSON hazard polygon overlay | Spatial reasoning on evacuation alternatives, resource positioning, multi-objective path planning | Real-time (event) | Network exact, location ±10m |

## User Features

| User Group | Feature | Base Map Attributes | Why Needed | Update Freq | Accuracy Req |
|---|---|---|---|---|---|
| Public Users | Shelter finding | Building purpose, capacity, entrance location, accessibility, hours | Safe place identification with navigation | 6h | ±10m location |
| Public Users | Vehicle evacuation | Road geometry, surface type, barriers, driveway availability, passability | Route selection, vehicle feasibility check | Real-time (event) | ±1m width |
| Public Users | Safe zones | Terrain elevation, vegetation type, water bodies, open space | Higher ground identification, flood-safe areas | 6h | ±2m elevation |
| Public Users | Fence rammability | Fence material, height, post spacing, gate lock type | Emergency access assessment | 6h | Material type exact |
| Public Users | Dock locations | Dock footprint, water depth, vessel type capacity | Water evacuation asset identification | Annual | ±10m location |
| Public Groups (Convoys) | Convoy mode routing | Road width, lanes, bridge capacity, turn radius | Multi-vehicle path that accommodates largest vehicle | Real-time (event) | Width ±0.5m |
| Public Groups | Resource pooling | Building location, capacity, accessibility | Meeting point, supply distribution | 6h | ±10m location |
| EMS Clients | Zone drawing | Terrain boundaries, elevation contours | Evacuation zone definition tool base layer | 6h | ±1m elevation |
| EMS Clients | Resource positioning | Road access, driveway length, parking availability | Asset staging area selection | 6h | ±5m access width |
| EMS Clients | Dispatch routing | Road network, passability, real-time closure updates | Incident response routing | Real-time | Network exact |
| Vehicle Manager | Turn radius constraints | Road width, intersection geometry, driveway length | Vehicle-specific passability check | 6h | ±0.5m width |
| Vehicle Manager | K-turn/U-turn feasibility | LiDAR-measured width, backing space, slope | Vehicle-specific maneuver viability | 6h | ±0.5m width |
| Ski Resort | Terrain slopes | Slope angle, aspect, elevation bands | Run mapping, avalanche zone identification | Seasonal | ±2° slope |
| Ski Resort | Avalanche zones | Historic runouts, slope convexity, treeline | Closed run identification, safe area marking | Seasonal | Zone exact |
| Ski Resort | Run mapping | Terrain roughness, vegetation gaps, elevation profile | Terrain park layout, difficulty rating | Seasonal | ±10m elevation |
