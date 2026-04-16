# Beacon: Wildfire — Emergency Management Layers

Layers useful during any emergency: evacuation, response, communications, post-incident assessment.

**Key:** R = Required, I = Important, U = Useful

---

## Building (Evacuation)

| Layer | Priority | Role |
|---|---|---|
| Building purpose | I | Occupancy type affects evacuation priority |
| Apartment building | R | High-density population, evacuation complexity |
| Neighborhood boundary | I | Community-level evacuation zones |
| Number of floors | R | Evacuation time |
| Exits/entrances | R | Evacuation capacity per building |
| Detected stairwells | I | Vertical evacuation in multi-story |
| Helicopter landable roof | I | Aerial rescue capability |
| Population estimate | R | People at risk per structure |
| Time-of-day occupancy | R | Dynamic population for evacuation timing |
| Building status (intact/damaged/destroyed) | R | Post-fire damage tracking |
| Utility provider coverage | U | Coordinate utility shutoffs |
| ADA accessible entrance | I | Accessible evacuation routing |
| Elevator present | I | Evacuation of mobility-impaired |
| Wheelchair navigable interior | I | Interior evacuation accessibility |

## Road Network & Evacuation Routing

| Layer | Priority | Role |
|---|---|---|
| Network topology | R | Evacuation route graph |
| Road width | R | Vehicle throughput, potential firebreak |
| Number of lanes | R | Evacuation capacity |
| Lane direction | I | Contraflow evacuation planning |
| One-way | R | Routing constraints |
| Surface type | I | Passability under fire conditions |
| U-turn possibility | I | Route reversal for trapped vehicles |
| K-turn possibility | I | Route reversal for trapped vehicles |
| Driveway length/width/slope | I | Individual property egress |
| Street crowding (parked cars) | I | Effective road width reduction |
| Driveways (existence) | I | Property access points |
| Docks / marinas | I | Water evacuation points |
| Private roads | I | Access restrictions during evacuation |
| Behind locked gate | R | Access barriers for responders |
| Confirmed evacuation routes | R | Pre-planned fire evacuation routes |
| Signs (road/warning/info) | U | Wayfinding during smoke conditions |

## Barriers (Access)

| Layer | Priority | Role |
|---|---|---|
| Fence rammability | I | Emergency vehicle breach capability |
| Guardrail location | U | Road edge definition in smoke |
| Gate (locked/unlocked) | R | Responder and evacuee access |
| Gate owner/contact | I | Emergency access coordination |
| Barrier bypass difficulty | I | Evacuation obstacle assessment |

## Terrain (Post-Fire)

| Layer | Priority | Role |
|---|---|---|
| Drainage direction | U | Post-fire debris flow paths |
| Soil permeability | U | Post-fire erosion and runoff risk |
| Landslide risk | U | Post-fire slope instability |
| HAND (height above nearest drainage) | U | Post-fire flood susceptibility |

## Explosive/Hazardous (Evacuation Triggers)

| Layer | Priority | Role |
|---|---|---|
| Hazmat transport routes | I | Route conflict with fire |

## Infrastructure

### Bridges
| Layer | Priority | Role |
|---|---|---|
| Location/span | R | Critical evacuation chokepoints |
| Clearance height | I | Vehicle routing constraints |
| Load rating | I | Heavy vehicle evacuation routing |
| Condition rating | I | Structural reliability during fire |
| Deck elevation | U | Smoke layer relative to bridge |
| Owner / operator | U | Coordination for closures |
| Over water (yes/no) | I | Water refuge access |

### Overpasses
| Layer | Priority | Role |
|---|---|---|
| Location | I | Routing constraint |
| Clearance height | I | Vehicle routing |

### Power Lines
| Layer | Priority | Role |
|---|---|---|
| Voltage class | I | De-energization priority |
| Owner / operator | I | Utility PSPS coordination |
| Type (transmission/distribution) | I | Grid impact of shutoff |

### Utility Poles
| Layer | Priority | Role |
|---|---|---|
| Owner / operator | I | Utility coordination |

### Cell Towers
| Layer | Priority | Role |
|---|---|---|
| Location/height | I | Communication during fire |
| Coverage area | I | Alert delivery capability |
| Backup power | R | Comms continuity during outage |
| Owner / carrier | U | Coordination |

### Satellite Dishes & Terminals
| Layer | Priority | Role |
|---|---|---|
| Satellite internet terminal (Starlink etc.) | I | Backup comms when cell fails |
| Satellite TV dish (receive-only) | U | Emergency broadcast reception |
| VSAT terminal (commercial/institutional) | I | Institutional backup comms |
| Portable satellite comms (BGAN etc.) | I | EMS field comms |
| Satellite dish type | U | Capability assessment |
| Satellite internet operational status | I | Active comms node identification |

### Dams
| Layer | Priority | Role |
|---|---|---|
| Location/geometry | U | Water supply for firefighting |
| Height/reservoir volume | U | Water capacity |
| Owner / operator | U | Water access coordination |

### Fire Hydrants
| Layer | Priority | Role |
|---|---|---|
| Location | R | Primary urban suppression |
| Flow rate / pressure | R | Suppression capacity |
| Blocked/inaccessible | R | Operational status |
| Owner / operator | U | Coordination |

### Water Towers
| Layer | Priority | Role |
|---|---|---|
| Location | I | Emergency water supply |
| Capacity | I | Water volume for suppression |
| Condition | I | Operational reliability |
| Owner / operator | U | Coordination |

### Water Systems
| Layer | Priority | Role |
|---|---|---|
| Pipeline routing | I | Water delivery to fire |
| Pump stations | I | Pressure for firefighting |
| Treatment capacity | U | Post-fire water safety |
| Operator | U | Coordination |

### Power Stations / Substations
| Layer | Priority | Role |
|---|---|---|
| Location | R | De-energization targets |
| Type (generation/substation/solar/wind) | I | Grid impact of shutoff |
| Capacity (MW) | I | De-energization impact |
| Service area | I | Outage impact area |
| Owner / operator | I | PSPS coordination |

## Hazard Mitigation (Post-Fire)

| Layer | Priority | Role |
|---|---|---|
| Debris basin / catch dam | U | Post-fire debris flow catchment |
| Mudflow / debris flow barrier | U | Post-fire debris flow protection |
| Retention / detention pond | I | Emergency water source |
| Riprap / erosion control | U | Post-fire erosion control |
| Landslide retaining wall | U | Post-fire slope stability |

## Critical Facilities

| Layer | Priority | Role |
|---|---|---|
| Hospital location | R | Evacuate patients, medical staging |
| Hospital capacity (beds) | R | Patient evacuation load |
| Hospital trauma level | I | Burn victim treatment capability |
| Hospital helipad | R | Air medical evacuation |
| Police station location | I | Traffic control, evacuation enforcement |
| Fire station location | R | Primary response resource |
| Jail / prison location | R | Incarcerated population evacuation |
| Jail / prison population | R | Evacuation load |
| Nursing home location | R | Vulnerable population evacuation |
| Nursing home capacity | R | Evacuation transport needs |
| School location | R | Children evacuation, shelter potential |
| Daycare location | R | Young children, high vulnerability |
| Assisted living location | R | Vulnerable population |
| Shelter (Red Cross/FEMA) | R | Evacuation destination |
| Shelter ADA compliance | I | Accessible shelter assignment |
| Morgue / medical examiner | U | Mass casualty capacity |
| EMS / ambulance station | R | Medical response |
| EMS station ambulance count | I | Response capacity |
| Volunteer fire department | R | Supplemental firefighting |
| Coast Guard station | U | Coastal fire evacuation |
| National Guard armory | I | Large-scale response staging |
| SAR base | I | Search and rescue |
| 911 / PSAP dispatch center | R | Emergency dispatch continuity |
| Emergency operations center (EOC) | R | Incident command |
| Red Cross chapter office | I | Shelter coordination |
| Blood bank / donation center | I | Burn victim supply chain |
| Dialysis center | R | Patients cannot miss treatment |
| Pharmacy location | I | Medication access during evacuation |
| Veterinary clinic | I | Animal evacuation triage |
| Animal shelter | I | Animal evacuation capacity |
| Fuel depot / fuel station (emergency) | R | Emergency vehicle refueling |
| Water treatment plant | I | Firefighting water, post-fire safety |
| Wastewater treatment plant | U | Post-fire infrastructure |
| Emergency radio repeater / tower | R | Fireground communications |
| HAM radio club / operator location | I | Backup communications |
| Staging area (pre-designated) | R | Resource staging |
| Triage / field hospital site | I | Mass casualty treatment |
| EMS shelter: wildfire | R | Wildfire-specific shelter |
| EMS shelter: general | I | General shelter capacity |
| EMS shelter pedestrian passable | I | Shelter accessibility |
| EMS shelter wheelchair accessible | I | Shelter accessibility |

## Transit Infrastructure

| Layer | Priority | Role |
|---|---|---|
| Bus routes | I | Mass evacuation transit |
| Bus stops | I | Evacuation pickup points |
| Bus depots | I | Bus staging for evacuation |
| Train / rail lines | I | Mass evacuation corridor |
| Train stations | I | Evacuation assembly points |
| Subway stations | I | Underground refuge potential |
| Ferry terminals | I | Water evacuation points |
| Airport (commercial) | I | Large-scale evacuation, air tanker base |
| Airport (general aviation) | R | Air tanker, helicopter base |
| Helicopter company base | R | Helicopter firefighting, evacuation |
| Helicopter fleet size | R | Available aircraft count |
| Port / deep water dock | U | Vessel evacuation, water supply |
| Cruise ship dock | U | Large vessel shelter capacity |
| Marina capacity | I | Boat evacuation staging |

## Hotels, Resorts & Lodging

| Layer | Priority | Role |
|---|---|---|
| Hotel location | I | Transient population unfamiliar with area |
| Hotel room count | I | Evacuation load, shelter capacity |
| Hotel contact info | I | Guest notification coordination |
| Ski resort location | U | Remote population, limited egress |
| Ski resort capacity | U | Peak population estimate |
| Ski resort trail network | U | Alternative evacuation paths |
| RV park location | I | Mobile population, self-evacuation |
| RV park capacity | I | Vehicle count for evacuation |
| Resort / lodge | I | Remote population |

## Religious Institutions

| Layer | Priority | Role |
|---|---|---|
| Location | I | Emergency shelter, gathering point |
| Denomination/type | U | Community outreach network |
| Congregation size | I | Communication hub reach |
| Parking capacity | I | Staging area potential |
| Shelter potential | R | Emergency shelter capacity |

## Government Buildings

| Layer | Priority | Role |
|---|---|---|
| Location | I | Command post, coordination |
| Building type | U | Function determines utility |
| Jurisdiction level | U | Authority coordination |
| Public shelter capacity | I | Shelter space |
| Backup power / generator | I | Continuity of operations |
| Secure / restricted access | U | Access limitations |

## Population

| Layer | Priority | Role |
|---|---|---|
| Population density | R | Evacuation load per area |
| Demographic breakdown | I | Vulnerable population identification |
| Time-of-day population shift | R | Dynamic evacuation load |
| Transient population zones | R | Tourist/visitor evacuation needs |
| Disability rate (census) | I | Accessible evacuation planning |

## Jurisdiction & Boundaries

| Layer | Priority | Role |
|---|---|---|
| Municipal boundaries | I | Jurisdictional response coordination |
| County boundaries | I | Mutual aid boundaries |
| State boundaries | I | Interstate compact activation |
| Fire district boundaries | R | Primary response jurisdiction |
| School district boundaries | I | School evacuation coordination |
| Tribal lands | I | Sovereign jurisdiction, BIA coordination |
| Federal land (USFS/BLM/NPS) | R | Federal firefighting resources |
| State-owned land | I | State forestry response |
| Federally owned land | I | Federal response resources |
| Group-drawn zones | U | Community evacuation groups |
| EMS active evacuation zones | R | Active fire evacuation zones |
| EMS-drawn event zones | R | Active fire perimeter/zones |

## Human-Caused Hazard (Evacuation Impact)

| Layer | Priority | Role |
|---|---|---|
| Civil unrest / protest zones | U | Evacuation route conflicts |
| Curfew zones | U | Movement restrictions |

## Post-Hazard Damage & Impact Assessment

| Layer | Priority | Role |
|---|---|---|
| Structure damage level | R | Building loss assessment |
| Structure damage type | R | Fire vs other damage |
| Road damage / impassable | R | Route status during fire |
| Bridge damage / collapse | R | Route loss |
| Debris field extent | I | Route blockage |
| Debris type | I | Structural vs vegetation debris |
| Power outage area | R | Area without power |
| Utility damage (power/water/gas) | R | Infrastructure status |
| Burn scar (post-fire) | R | Fire extent, future fuel map |
| Tree / vegetation blowdown | I | Downed trees = surface fuel |
| Downed power lines | R | Ignition risk, safety hazard |
| Downed utility poles | R | Road blockage, electrocution |
| Gas leak (reported) | R | Explosion risk near fire |
| Downed trees blocking route | R | Route clearance priority |
| Fire hydrant damage/inoperable | R | Suppression resource loss |
| Cell tower outage | R | Communications gap |
| Trapped persons (reported) | R | Rescue priority |
| Looting / security concern | I | Post-evacuation security |
| Road blocked (non-damage) | R | Evacuation constraint |
| Smell of gas / chemical | R | Hazmat compound incident |
| Contamination / hazmat spill | I | Compound incident |
| All crop/livestock layers | U | Agricultural loss tracking |

## Water Features (Water Sources & Refuge)

| Layer | Priority | Role |
|---|---|---|
| Swimming pool location | I | Emergency water source |
| Public pool / water park | I | Water source for suppression |
| Lake / pond location | R | Helicopter bucket fill, water drop |
| River / stream location | R | Water source, natural firebreak |
| Beach location | U | Water refuge area |

## Geological

| Layer | Priority | Role |
|---|---|---|
| Soil type | I | Post-fire erosion susceptibility |
| Drainage class | U | Post-fire runoff prediction |

## Accessibility & Passability

| Layer | Priority | Role |
|---|---|---|
| Hiking trail location | I | Alternative evacuation, access for crews |
| Hiking trail name | U | Communication reference |
| Hiking trail difficulty | I | Passability assessment |
| Hiking trail length | U | Travel time estimation |
| Hiking trail surface type | I | Vehicle/foot passability |
| Hiking trailhead location | I | Access points for crews |
| Pedestrian passable (road) | I | On-foot evacuation |
| Pedestrian passable (trail) | I | On-foot evacuation |
| Pedestrian passable (open terrain) | I | Cross-country evacuation |
| Wheelchair passable (road) | I | Accessible evacuation |
| Wheelchair passable (sidewalk) | I | Accessible evacuation |
| Wheelchair passable (trail) | I | Accessible evacuation |
| Wheelchair passable (open terrain) | U | Accessible evacuation |
| Bike passable (road) | U | Alternative evacuation |
| Bike passable (trail) | U | Alternative evacuation |
| Bike passable (open terrain) | U | Alternative evacuation |
| Vehicle passable (2WD) | R | Standard vehicle evacuation |
| Vehicle passable (AWD) | R | All-weather evacuation |
| Vehicle passable (4WD) | R | Off-road evacuation, crew access |
| Curb cuts / ramps | I | Accessible evacuation |
| Surface condition | I | Route quality assessment |
| Slope passability | I | Steep terrain evacuation |

## Sensors (Operations)

| Layer | Priority | Role |
|---|---|---|
| Traffic camera location | I | Evacuation monitoring |

## EMS Operations

| Layer | Priority | Role |
|---|---|---|
| EMS custom hazard zone | I | Event-specific zones |
| EMS hazard map upload date | I | Data currency |
| EMS hazard map version | U | Version tracking |

## Discrepancy & Data Quality

| Layer | Priority | Role |
|---|---|---|
| User-reported map discrepancy | I | Ground-truth corrections |
| User-reported missing feature | I | Gap identification |
| User-reported incorrect attribute | I | Data quality |
| Sensor-detected building change | I | Structure map currency |
| All other discrepancy layers | U | General QA |

## Data Availability (General)

| Layer | Priority | Role |
|---|---|---|
| OSM completeness score | I | Road network completeness |
| User photo density (area) | I | Structure data quality |
| User report density (area) | I | Ground-truth density |
| Overall data confidence (area) | R | Model reliability indicator |
| Data gap zones | R | Where models are unreliable |
| Global base map fallback zone | R | Low-data areas |
| All other availability layers | U | General data quality |

## Personal Accessibility Profile

| Layer | Priority | Role |
|---|---|---|
| Mobility impairment | R | Cannot self-evacuate, needs transport |
| Visual impairment | I | Smoke reduces visibility further |
| Hearing impairment | I | May not hear alerts/sirens |
| Requires supplemental oxygen | R | Smoke is immediately life-threatening |
| Requires dialysis | R | Must route to dialysis center |
| Requires powered medical equipment | R | Power outage = medical emergency |
| Cannot drive | R | Needs evacuation transport |
| Service animal | I | Animal-friendly shelter routing |
| Cognitive impairment | I | May need assisted evacuation |
| Has dependents requiring care | I | Caretaker evacuation complexity |
