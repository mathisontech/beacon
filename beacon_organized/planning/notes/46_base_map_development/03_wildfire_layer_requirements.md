# Beacon: Wildfire — Layer Requirements

All layers from the attribute data source matrix classified by wildfire model role.

**Key:** R = Required, I = Important, U = Useful

**Model Component Key:**
- SPREAD = Fire spread / Rothermel surface fire
- CROWN = Crown fire initiation and spread
- EMBER = Ember transport and spotting
- STRUCT = Structure ignition and vulnerability
- EVAC = Evacuation routing and population
- WEATHER = Weather and atmospheric inputs
- FUEL = Fuel characterization
- TOPO = Topographic inputs
- HISTORY = Historical fire data
- DETECT = Detection and monitoring
- RESPONSE = Emergency response resources
- POST = Post-fire damage assessment

---

## Building Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Footprint location | R | STRUCT | Structure exposure, ember receipt area |
| Height / floors | R | STRUCT | Radiation view factor, vertical fire spread |
| Building material | R | STRUCT | Ignition probability, burn duration |
| Building purpose | I | EVAC | Occupancy type affects evacuation priority |
| Apartment building | R | EVAC | High-density population, evacuation complexity |
| Single family home | I | STRUCT | Individual structure defense assessment |
| Neighborhood boundary | I | EVAC | Community-level evacuation zones |
| Year built | I | STRUCT | Building code era predicts fire resistance |
| Soft story detection | U | STRUCT | Collapse risk if fire weakens structure |
| Exits/entrances | R | EVAC | Evacuation capacity per building |
| Detected stairwells | I | EVAC | Vertical evacuation in multi-story |
| Number of floors | R | STRUCT, EVAC | Evacuation time, fire spread floors |
| Roof geometry | R | STRUCT | Ember accumulation potential (flat vs pitched) |
| Roof material | R | STRUCT | Ignition from embers (wood shake vs tile vs metal) |
| Roof flame retardant | R | STRUCT | Resistance to ember ignition |
| Helicopter landable roof | I | RESPONSE | Aerial rescue capability |
| Distance to other structures | R | STRUCT, SPREAD | Structure-to-structure fire spread |
| Flammability score | R | STRUCT | Overall structure ignition risk |
| Population estimate | R | EVAC | People at risk per structure |
| Time-of-day occupancy | R | EVAC | Dynamic population for evacuation timing |
| Heating type | I | STRUCT | Ignition source risk (wood stove, gas) |
| Building code compliance | I | STRUCT | Fire code compliance predicts resistance |
| Building status (intact/damaged/destroyed) | R | POST | Post-fire damage tracking |
| Fireproof certified | R | STRUCT | Certified fire-resistant structures |
| Power source | I | STRUCT | Electrical ignition risk, generator fuel |
| Has fireplace | I | STRUCT | Ember entry point via chimney |
| Utility provider coverage | U | RESPONSE | Coordinate utility shutoffs |
| Glass front / storefront | I | STRUCT | Radiant heat breakage, fire entry |
| Marked high risk building | I | STRUCT | Pre-identified vulnerable structures |
| Ignition ease (exterior) | R | STRUCT | Exterior material ignitability |
| Burn duration estimate | R | STRUCT | How long structure burns |
| Fuel load (structure) | R | STRUCT | Total combustible mass |
| ADA accessible entrance | I | EVAC | Accessible evacuation routing |
| Elevator present | I | EVAC | Evacuation of mobility-impaired |
| Wheelchair navigable interior | I | EVAC | Interior evacuation accessibility |

## Road Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Network topology | R | EVAC | Evacuation route graph |
| Road width | R | EVAC | Vehicle throughput, potential firebreak |
| Number of lanes | R | EVAC | Evacuation capacity |
| Lane direction | I | EVAC | Contraflow evacuation planning |
| One-way | R | EVAC | Routing constraints |
| Surface type | I | EVAC | Passability under fire conditions |
| U-turn possibility | I | EVAC | Route reversal for trapped vehicles |
| K-turn possibility | I | EVAC | Route reversal for trapped vehicles |
| Driveway length/width/slope | I | EVAC | Individual property egress |
| Street crowding (parked cars) | I | EVAC | Effective road width reduction |
| Driveways (existence) | I | EVAC | Property access points |
| Pavement layer | U | SPREAD | Non-combustible surface, firebreak potential |
| Parking areas | U | SPREAD | Non-combustible surface, staging area |
| Docks / marinas | I | EVAC | Water evacuation points |
| Private roads | I | EVAC | Access restrictions during evacuation |
| Behind locked gate | R | EVAC | Access barriers for responders |
| Confirmed evacuation routes | R | EVAC | Pre-planned fire evacuation routes |
| Road flammability | R | SPREAD | Vegetation overhang, roadside fuel |
| Signs (road/warning/info) | U | EVAC | Wayfinding during smoke conditions |

## Barrier Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Fence location/extent | I | SPREAD | Fire pathway, evacuation barrier |
| Fence material | R | SPREAD, STRUCT | Combustible fencing spreads fire |
| Fence rammability | I | EVAC | Emergency vehicle breach capability |
| Fence flammability | R | SPREAD | Fire bridge between properties |
| Wall location/extent | I | SPREAD | Fire barrier or obstacle |
| Wall material/height | I | SPREAD | Non-combustible walls as firebreaks |
| Wall flammability | R | SPREAD | Combustible walls spread fire |
| Guardrail location | U | EVAC | Road edge definition in smoke |
| Hedge location/extent | R | SPREAD, FUEL | Living fuel connecting properties |
| Hedge height/density | R | FUEL | Fuel volume in hedge |
| Hedge species | R | FUEL | Flammability varies by species |
| Hedge flammability | R | SPREAD | Fire bridge potential |
| Boulder/rock barrier | I | SPREAD | Natural firebreak |
| Gate (locked/unlocked) | R | EVAC | Responder and evacuee access |
| Gate owner/contact | I | EVAC | Emergency access coordination |
| Barrier bypass difficulty | I | EVAC | Evacuation obstacle assessment |
| Barrier fire-bridge potential | R | SPREAD | Barriers that carry fire across gaps |

## Terrain Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Elevation | R | TOPO | LCP required. Fire behavior, smoke dispersion |
| Slope angle | R | TOPO | LCP required. Fire spreads faster upslope |
| Aspect | R | TOPO | LCP required. South-facing = drier fuels |
| Terrain curvature | I | TOPO | Ridge/valley channeling of fire and wind |
| Drainage direction | U | TOPO | Post-fire debris flow paths |
| Soil permeability | U | POST | Post-fire erosion and runoff risk |
| Grass layer | R | FUEL | Surface fuel, fast-spreading fire carrier |
| Sand layer | I | SPREAD | Non-combustible surface, natural firebreak |
| Landslide risk | U | POST | Post-fire slope instability |
| HAND (height above nearest drainage) | U | POST | Post-fire flood susceptibility |

## Vegetation Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Tree location/height | R | FUEL | Individual tree fire behavior |
| Tree species | R | FUEL | Species-specific flammability and moisture |
| Vegetation density | R | FUEL | Fuel continuity, spread potential |
| Canopy cover (%) | R | FUEL, CROWN | LCP required. Crown fire transition |
| Canopy height | R | FUEL, CROWN | LCP required. Crown fire behavior |
| Canopy base height | R | CROWN | LCP required. Surface-to-crown fire transition |
| Canopy bulk density (kg/m³) | R | CROWN | LCP required. Active vs passive crown fire |
| Canopy fuel loading | R | CROWN | Total crown fuel available |
| Fire behavior fuel model (FBFM) | R | SPREAD | LCP required. Rothermel surface fire input |
| Vegetation health/NDVI | R | FUEL | Live/dead ratio, drought stress indicator |
| Burn scars | R | HISTORY | Recently burned = low fuel = spread barrier |
| Vegetation type (EVT) | R | FUEL | Fuel classification and fire behavior |
| Transition fuel (ground to canopy) | R | CROWN | Ladder fuel enabling crown fire |
| Ladder fuel density | R | CROWN | Vertical fuel continuity |
| Surface fuel depth | R | FUEL | Rothermel input for flame length |
| Litter/duff depth | R | FUEL | Smoldering fire potential |
| Coarse woody fuel loading | R | FUEL | Heavy fuel, long burn duration |
| Duff loading (tons/acre) | R | FUEL | Smoldering and holdover fire |
| Fuel particle surface-area-to-volume ratio | R | SPREAD | Rothermel input for rate of spread |
| Fuel particle heat content | R | SPREAD | Rothermel input for fire intensity |
| Moisture of extinction | R | SPREAD | Rothermel input for fire/no-fire threshold |
| 1-hour fuel moisture | R | FUEL | Fine dead fuel, fastest response |
| 10-hour fuel moisture | R | FUEL | Small branch moisture |
| 100-hour fuel moisture | R | FUEL | Large branch moisture |
| Live herbaceous moisture | R | FUEL | Green grass/herb dampening effect |
| Live woody moisture | R | FUEL | Shrub moisture content |
| Foliar moisture content | R | CROWN | Crown fire intensity calculation |
| Dead fuel moisture (seasonal avg) | R | FUEL | Baseline fuel condition |
| Live fuel moisture (seasonal avg) | R | FUEL | Baseline vegetation condition |

## Hazard History & Fire Risk Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Last burn date per cell | R | HISTORY | Time since fire = fuel accumulation |
| Burn-together zones (N wind) | R | SPREAD | Pre-computed structure fire spread |
| Burn-together zones (S wind) | R | SPREAD | Pre-computed structure fire spread |
| Burn-together zones (E wind) | R | SPREAD | Pre-computed structure fire spread |
| Burn-together zones (W wind) | R | SPREAD | Pre-computed structure fire spread |
| Wind history (prevailing direction) | R | WEATHER | Dominant fire spread direction |
| Wind history (seasonal patterns) | R | WEATHER | Seasonal fire weather patterns |
| Low burn risk zones | R | SPREAD | Pre-identified low-risk areas |
| Terrain flammability | R | SPREAD | Terrain-based burn potential |
| Vegetation ignition ease | R | SPREAD | How easily vegetation ignites |
| Vegetation burn duration | R | SPREAD | How long vegetation burns |
| Fire spread rate (per cell) | R | SPREAD | Pre-computed spread velocity |
| Historical fire perimeters | R | HISTORY | Past fire extent, fuel age mapping |
| Fire return interval | R | HISTORY | Expected fire frequency |
| Ember transport potential | R | EMBER | Likelihood of generating embers |
| Spotting distance (modeled) | R | EMBER | How far embers can travel |
| Crown fire potential | R | CROWN | Likelihood of crown fire |
| Wind speed grid (real-time/modeled) | R | WEATHER | Primary spread driver |
| Wind direction grid (real-time/modeled) | R | WEATHER | Primary spread direction |
| Temperature grid | R | WEATHER | Fuel drying, fire behavior |
| Relative humidity grid | R | WEATHER | Fuel moisture, fire behavior |
| Precipitation grid | R | WEATHER | Fuel wetting, suppression |
| Solar radiation / insolation | R | WEATHER | Fuel drying, slope heating |
| Fire weather index (FWI) | R | WEATHER | Composite fire danger rating |
| Burning index (BI) | R | WEATHER | NFDRS fire intensity proxy |
| Energy release component (ERC) | R | WEATHER | NFDRS energy release potential |
| Spread component (SC) | R | WEATHER | NFDRS spread potential |
| RAWS station data coverage | I | WEATHER | Weather data quality indicator |
| Last hurricane date | U | WEATHER | Post-hurricane debris = fuel loading |
| Last ice storm date | U | WEATHER | Ice storm debris = fuel loading |

## Explosive/Hazardous Things Layer

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Gas stations | R | STRUCT | Explosion risk if fire reaches |
| Propane tanks | R | STRUCT | BLEVE risk, explosion radius |
| Chemical storage | R | STRUCT | Toxic smoke, explosion risk |
| Munitions storage | R | STRUCT | Explosion risk, evacuation trigger |
| Fertilizer storage | R | STRUCT | Ammonium nitrate explosion risk |
| Industrial chemical sites | R | STRUCT | Toxic plume generation |
| Pipeline routes | R | STRUCT | Gas line rupture/fire risk |
| Above-ground fuel tanks | R | STRUCT | Fire intensification |
| Hazmat transport routes | I | EVAC | Route conflict with fire |

## Infrastructure Attributes

### Bridges
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location/span | R | EVAC | Critical evacuation chokepoints |
| Clearance height | I | EVAC | Vehicle routing constraints |
| Load rating | I | EVAC | Heavy vehicle evacuation routing |
| Material type | I | STRUCT | Bridge combustibility |
| Condition rating | I | EVAC | Structural reliability during fire |
| Deck elevation | U | EVAC | Smoke layer relative to bridge |
| Owner / operator | U | RESPONSE | Coordination for closures |
| Over water (yes/no) | I | EVAC | Water refuge access |

### Overpasses
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location | I | EVAC | Routing constraint |
| Clearance height | I | EVAC | Vehicle routing |
| Material | U | STRUCT | Combustibility |

### Power Lines
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Route/corridor | R | SPREAD, STRUCT | Ignition source, cleared corridor |
| Voltage class | I | RESPONSE | De-energization priority |
| Conductor height | I | SPREAD | Clearance from vegetation |
| Owner / operator | I | RESPONSE | Utility PSPS coordination |
| Type (transmission/distribution) | I | RESPONSE | Grid impact of shutoff |

### Utility Poles
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location | I | STRUCT | Combustible poles as fuel |
| Material (wood/steel/concrete) | R | STRUCT | Wood poles burn and fall |
| Condition | I | STRUCT | Weakened poles fail in fire |
| Owner / operator | I | RESPONSE | Utility coordination |

### Cell Towers
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location/height | I | RESPONSE | Communication during fire |
| Coverage area | I | RESPONSE | Alert delivery capability |
| Backup power | R | RESPONSE | Comms continuity during outage |
| Owner / carrier | U | RESPONSE | Coordination |

### Satellite Dishes & Terminals
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Satellite internet terminal (Starlink etc.) | I | RESPONSE | Backup comms when cell fails |
| Satellite TV dish (receive-only) | U | RESPONSE | Emergency broadcast reception |
| VSAT terminal (commercial/institutional) | I | RESPONSE | Institutional backup comms |
| Portable satellite comms (BGAN etc.) | I | RESPONSE | EMS field comms |
| Satellite dish type | U | RESPONSE | Capability assessment |
| Satellite internet operational status | I | RESPONSE | Active comms node identification |

### Dams
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location/geometry | U | RESPONSE | Water supply for firefighting |
| Height/reservoir volume | U | RESPONSE | Water capacity |
| Owner / operator | U | RESPONSE | Water access coordination |

### Fire Hydrants
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location | R | RESPONSE | Primary urban suppression |
| Flow rate / pressure | R | RESPONSE | Suppression capacity |
| Blocked/inaccessible | R | RESPONSE | Operational status |
| Owner / operator | U | RESPONSE | Coordination |

### Water Towers
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location | I | RESPONSE | Emergency water supply |
| Capacity | I | RESPONSE | Water volume for suppression |
| Condition | I | RESPONSE | Operational reliability |
| Owner / operator | U | RESPONSE | Coordination |

### Water Systems
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Pipeline routing | I | RESPONSE | Water delivery to fire |
| Pump stations | I | RESPONSE | Pressure for firefighting |
| Treatment capacity | U | RESPONSE | Post-fire water safety |
| Operator | U | RESPONSE | Coordination |

### Power Stations / Substations
| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location | R | RESPONSE | De-energization targets |
| Type (generation/substation/solar/wind) | I | RESPONSE | Grid impact of shutoff |
| Capacity (MW) | I | RESPONSE | De-energization impact |
| Fuel type | I | STRUCT | On-site fuel fire risk |
| Service area | I | RESPONSE | Outage impact area |
| Owner / operator | I | RESPONSE | PSPS coordination |

## Hazard Mitigation Structures

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Debris basin / catch dam | U | POST | Post-fire debris flow catchment |
| Mudflow / debris flow barrier | U | POST | Post-fire debris flow protection |
| Storm drain / culvert | U | SPREAD | Fire travel through culverts |
| Retention / detention pond | I | RESPONSE | Emergency water source |
| Riprap / erosion control | U | POST | Post-fire erosion control |
| Firebreak (constructed) | R | SPREAD | Designed fire spread barrier |
| Fuel break / defensible space | R | SPREAD | Reduced fuel zone around structures |
| Wildfire sprinkler system | R | STRUCT | Active structure defense |
| Landslide retaining wall | U | POST | Post-fire slope stability |

## Critical Facilities

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Hospital location | R | EVAC | Evacuate patients, medical staging |
| Hospital capacity (beds) | R | EVAC | Patient evacuation load |
| Hospital trauma level | I | RESPONSE | Burn victim treatment capability |
| Hospital helipad | R | RESPONSE | Air medical evacuation |
| Police station location | I | EVAC | Traffic control, evacuation enforcement |
| Fire station location | R | RESPONSE | Primary response resource |
| Jail / prison location | R | EVAC | Incarcerated population evacuation |
| Jail / prison population | R | EVAC | Evacuation load |
| Nursing home location | R | EVAC | Vulnerable population evacuation |
| Nursing home capacity | R | EVAC | Evacuation transport needs |
| School location | R | EVAC | Children evacuation, shelter potential |
| Daycare location | R | EVAC | Young children, high vulnerability |
| Assisted living location | R | EVAC | Vulnerable population |
| Shelter (Red Cross/FEMA) | R | EVAC | Evacuation destination |
| Shelter ADA compliance | I | EVAC | Accessible shelter assignment |
| Morgue / medical examiner | U | POST | Mass casualty capacity |
| EMS / ambulance station | R | RESPONSE | Medical response |
| EMS station ambulance count | I | RESPONSE | Response capacity |
| Volunteer fire department | R | RESPONSE | Supplemental firefighting |
| Coast Guard station | U | RESPONSE | Coastal fire evacuation |
| National Guard armory | I | RESPONSE | Large-scale response staging |
| SAR base | I | RESPONSE | Search and rescue |
| 911 / PSAP dispatch center | R | RESPONSE | Emergency dispatch continuity |
| Emergency operations center (EOC) | R | RESPONSE | Incident command |
| Red Cross chapter office | I | RESPONSE | Shelter coordination |
| Blood bank / donation center | I | RESPONSE | Burn victim supply chain |
| Dialysis center | R | EVAC | Patients cannot miss treatment |
| Pharmacy location | I | EVAC | Medication access during evacuation |
| Veterinary clinic | I | EVAC | Animal evacuation triage |
| Animal shelter | I | EVAC | Animal evacuation capacity |
| Fuel depot / fuel station (emergency) | R | RESPONSE | Emergency vehicle refueling |
| Water treatment plant | I | RESPONSE | Firefighting water, post-fire safety |
| Wastewater treatment plant | U | POST | Post-fire infrastructure |
| Emergency radio repeater / tower | R | RESPONSE | Fireground communications |
| HAM radio club / operator location | I | RESPONSE | Backup communications |
| Staging area (pre-designated) | R | RESPONSE | Resource staging |
| Triage / field hospital site | I | RESPONSE | Mass casualty treatment |
| EMS shelter: wildfire | R | EVAC | Wildfire-specific shelter |
| EMS shelter: general | I | EVAC | General shelter capacity |
| EMS shelter pedestrian passable | I | EVAC | Shelter accessibility |
| EMS shelter wheelchair accessible | I | EVAC | Shelter accessibility |

## Transit Infrastructure

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Bus routes | I | EVAC | Mass evacuation transit |
| Bus stops | I | EVAC | Evacuation pickup points |
| Bus depots | I | EVAC | Bus staging for evacuation |
| Train / rail lines | I | EVAC | Mass evacuation corridor |
| Train stations | I | EVAC | Evacuation assembly points |
| Subway stations | I | EVAC | Underground refuge potential |
| Ferry terminals | I | EVAC | Water evacuation points |
| Airport (commercial) | I | EVAC | Large-scale evacuation, air tanker base |
| Airport (general aviation) | R | RESPONSE | Air tanker, helicopter base |
| Helicopter company base | R | RESPONSE | Helicopter firefighting, evacuation |
| Helicopter fleet size | R | RESPONSE | Available aircraft count |
| Port / deep water dock | U | EVAC | Vessel evacuation, water supply |
| Cruise ship dock | U | EVAC | Large vessel shelter capacity |
| Marina capacity | I | EVAC | Boat evacuation staging |

## Hotels, Resorts & Lodging

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Hotel location | I | EVAC | Transient population unfamiliar with area |
| Hotel room count | I | EVAC | Evacuation load, shelter capacity |
| Hotel contact info | I | EVAC | Guest notification coordination |
| Ski resort location | U | EVAC | Remote population, limited egress |
| Ski resort capacity | U | EVAC | Peak population estimate |
| Ski resort trail network | U | EVAC | Alternative evacuation paths |
| RV park location | I | EVAC | Mobile population, self-evacuation |
| RV park capacity | I | EVAC | Vehicle count for evacuation |
| Resort / lodge | I | EVAC | Remote population |

## Religious Institutions

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location | I | EVAC | Emergency shelter, gathering point |
| Denomination/type | U | RESPONSE | Community outreach network |
| Congregation size | I | EVAC | Communication hub reach |
| Parking capacity | I | EVAC, RESPONSE | Staging area potential |
| Shelter potential | R | EVAC | Emergency shelter capacity |

## Government Buildings

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Location | I | RESPONSE | Command post, coordination |
| Building type | U | RESPONSE | Function determines utility |
| Jurisdiction level | U | RESPONSE | Authority coordination |
| Public shelter capacity | I | EVAC | Shelter space |
| Backup power / generator | I | RESPONSE | Continuity of operations |
| Secure / restricted access | U | RESPONSE | Access limitations |

## Population Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Population density | R | EVAC | Evacuation load per area |
| Demographic breakdown | I | EVAC | Vulnerable population identification |
| Time-of-day population shift | R | EVAC | Dynamic evacuation load |
| Transient population zones | R | EVAC | Tourist/visitor evacuation needs |
| Disability rate (census) | I | EVAC | Accessible evacuation planning |

## Jurisdiction & Boundary Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Municipal boundaries | I | RESPONSE | Jurisdictional response coordination |
| County boundaries | I | RESPONSE | Mutual aid boundaries |
| State boundaries | I | RESPONSE | Interstate compact activation |
| Fire district boundaries | R | RESPONSE | Primary response jurisdiction |
| School district boundaries | I | EVAC | School evacuation coordination |
| Tribal lands | I | RESPONSE | Sovereign jurisdiction, BIA coordination |
| Federal land (USFS/BLM/NPS) | R | RESPONSE | Federal firefighting resources |
| State-owned land | I | RESPONSE | State forestry response |
| Federally owned land | I | RESPONSE | Federal response resources |
| Parcel boundaries | I | STRUCT | Property-level defensible space |
| Wildland-urban interface (WUI) | R | SPREAD, STRUCT | Highest risk zone definition |
| Group-drawn zones | U | EVAC | Community evacuation groups |
| EMS active evacuation zones | R | EVAC | Active fire evacuation zones |
| EMS-drawn event zones | R | RESPONSE | Active fire perimeter/zones |

## General Hazard Risk Layers (wildfire-relevant only)

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| General wildfire risk | R | SPREAD | Baseline wildfire probability |
| Extreme heat risk | I | WEATHER | Heat compounds fire danger |
| Extreme wind risk (derecho) | I | WEATHER | Extreme spread conditions |
| Lightning strike density | R | DETECT | Natural ignition source mapping |

## Human-Caused Hazard & Risk Layers

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Arson risk zones | R | DETECT | Human ignition source mapping |
| Civil unrest / protest zones | U | EVAC | Evacuation route conflicts |
| Curfew zones | U | EVAC | Movement restrictions |

## Post-Hazard Damage & Impact Assessment

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Structure damage level | R | POST | Building loss assessment |
| Structure damage type | R | POST | Fire vs other damage |
| Road damage / impassable | R | POST, EVAC | Route status during fire |
| Bridge damage / collapse | R | EVAC | Route loss |
| Debris field extent | I | EVAC | Route blockage |
| Debris type | I | POST | Structural vs vegetation debris |
| Power outage area | R | RESPONSE | Area without power |
| Utility damage (power/water/gas) | R | RESPONSE | Infrastructure status |
| Burn scar (post-fire) | R | POST, HISTORY | Fire extent, future fuel map |
| Tree / vegetation blowdown | I | FUEL | Downed trees = surface fuel |
| Downed power lines | R | RESPONSE | Ignition risk, safety hazard |
| Downed utility poles | R | RESPONSE | Road blockage, electrocution |
| Gas leak (reported) | R | RESPONSE | Explosion risk near fire |
| Downed trees blocking route | R | EVAC | Route clearance priority |
| Fire hydrant damage/inoperable | R | RESPONSE | Suppression resource loss |
| Cell tower outage | R | RESPONSE | Communications gap |
| Trapped persons (reported) | R | RESPONSE | Rescue priority |
| Looting / security concern | I | RESPONSE | Post-evacuation security |
| Road blocked (non-damage) | R | EVAC | Evacuation constraint |
| Smell of gas / chemical | R | RESPONSE | Hazmat compound incident |
| Contamination / hazmat spill | I | RESPONSE | Compound incident |
| All crop/livestock layers | U | POST | Agricultural loss tracking |

## Water Features & Drowning Risk

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Swimming pool location | I | STRUCT | Emergency water source |
| Public pool / water park | I | RESPONSE | Water source for suppression |
| Lake / pond location | R | RESPONSE | Helicopter bucket fill, water drop |
| River / stream location | R | RESPONSE | Water source, natural firebreak |
| Beach location | U | EVAC | Water refuge area |

## Geological Attributes

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Soil type | I | POST | Post-fire erosion susceptibility |
| Drainage class | U | POST | Post-fire runoff prediction |

## Accessibility & Passability

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Hiking trail location | I | EVAC | Alternative evacuation, access for crews |
| Hiking trail name | U | RESPONSE | Communication reference |
| Hiking trail difficulty | I | EVAC | Passability assessment |
| Hiking trail length | U | EVAC | Travel time estimation |
| Hiking trail surface type | I | EVAC | Vehicle/foot passability |
| Hiking trailhead location | I | EVAC, RESPONSE | Access points for crews |
| Pedestrian passable (road) | I | EVAC | On-foot evacuation |
| Pedestrian passable (trail) | I | EVAC | On-foot evacuation |
| Pedestrian passable (open terrain) | I | EVAC | Cross-country evacuation |
| Wheelchair passable (road) | I | EVAC | Accessible evacuation |
| Wheelchair passable (sidewalk) | I | EVAC | Accessible evacuation |
| Wheelchair passable (trail) | I | EVAC | Accessible evacuation |
| Wheelchair passable (open terrain) | U | EVAC | Accessible evacuation |
| Bike passable (road) | U | EVAC | Alternative evacuation |
| Bike passable (trail) | U | EVAC | Alternative evacuation |
| Bike passable (open terrain) | U | EVAC | Alternative evacuation |
| Vehicle passable (2WD) | R | EVAC | Standard vehicle evacuation |
| Vehicle passable (AWD) | R | EVAC | All-weather evacuation |
| Vehicle passable (4WD) | R | EVAC | Off-road evacuation, crew access |
| Curb cuts / ramps | I | EVAC | Accessible evacuation |
| Surface condition | I | EVAC | Route quality assessment |
| Slope passability | I | EVAC | Steep terrain evacuation |

## Sensor Locations

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Weather station location | R | WEATHER | Real-time weather input |
| Air quality monitor location | R | DETECT | Smoke detection, AQI |
| Snow telemetry (SNOTEL) | U | WEATHER | Snowpack = moisture barrier |
| Wildfire camera location | R | DETECT | Early fire detection |
| Wind speed/direction sensor | R | WEATHER | Real-time wind for spread |
| Rain gauge location | I | WEATHER | Precipitation monitoring |
| Traffic camera location | I | EVAC | Evacuation monitoring |
| User-deployed sensor location | I | DETECT, WEATHER | Citizen science fire/weather data |
| NWS forecast office (WFO) | I | WEATHER | Red flag warning source |
| Doppler radar site (NEXRAD) | I | WEATHER | Pyrocumulonimbus detection |
| Weather observatory | I | WEATHER | Upper-level weather data |
| Upper-air sounding station | I | WEATHER | Atmospheric stability (inversions) |
| Lightning detection sensor | R | DETECT | Lightning strike ignition source |

## EMS Hazard Maps

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| EMS local wildfire hazard map | R | SPREAD | Local fire risk assessment |
| EMS custom hazard zone | I | RESPONSE | Event-specific zones |
| EMS hazard map upload date | I | RESPONSE | Data currency |
| EMS hazard map version | U | RESPONSE | Version tracking |

## Discrepancy & Conflict Reporting

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| User-reported map discrepancy | I | DETECT | Ground-truth corrections |
| User-reported missing feature | I | DETECT | Gap identification |
| User-reported incorrect attribute | I | DETECT | Data quality |
| Sensor-detected vegetation change | R | FUEL | Fuel map currency |
| Sensor-detected building change | I | STRUCT | Structure map currency |
| All other discrepancy layers | U | DETECT | General QA |

## Data Availability & Coverage

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| LiDAR coverage extent | R | FUEL, TOPO | Fuel/terrain data quality |
| LiDAR data age | R | FUEL | Fuel data currency |
| High-res satellite coverage | R | FUEL, STRUCT | Detection capability |
| High-res satellite data age | R | FUEL | Data freshness |
| Medium-res satellite coverage | I | FUEL | NDVI/burn scar coverage |
| LANDFIRE coverage | R | FUEL | Fuel model availability |
| OSM completeness score | I | EVAC | Road network completeness |
| User photo density (area) | I | STRUCT | Structure data quality |
| User report density (area) | I | DETECT | Ground-truth density |
| Overall data confidence (area) | R | ALL | Model reliability indicator |
| Data gap zones | R | ALL | Where models are unreliable |
| Global base map fallback zone | R | ALL | Low-data areas |
| All other availability layers | U | ALL | General data quality |

---

## Personal Accessibility Profile

| Layer | Priority | Model Component | Wildfire Role |
|---|---|---|---|
| Mobility impairment | R | EVAC | Cannot self-evacuate, needs transport |
| Visual impairment | I | EVAC | Smoke reduces visibility further |
| Hearing impairment | I | EVAC | May not hear alerts/sirens |
| Requires supplemental oxygen | R | EVAC | Smoke is immediately life-threatening |
| Requires dialysis | R | EVAC | Must route to dialysis center |
| Requires powered medical equipment | R | EVAC | Power outage = medical emergency |
| Cannot drive | R | EVAC | Needs evacuation transport |
| Service animal | I | EVAC | Animal-friendly shelter routing |
| Cognitive impairment | I | EVAC | May need assisted evacuation |
| Has dependents requiring care | I | EVAC | Caretaker evacuation complexity |

---

## Summary Counts

| Priority | Count | Description |
|---|---|---|
| R (Required) | ~180 | Must have for wildfire model to function |
| I (Important) | ~120 | Significantly improves model accuracy |
| U (Useful) | ~40 | Adds value but not critical |
