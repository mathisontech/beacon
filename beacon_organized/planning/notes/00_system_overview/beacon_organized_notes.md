     1→# Beacon: Disaster Management Platform — Organized Notes
     2→
     3→**Source:** Handwritten notes transfer 02/17/26
     4→**Organized:** 02/27/26
     5→
     6→---
     7→
     8→## 0. Development Module Index & Account Mapping
     9→
    10→Each major system component maps to a development module with its own environment, team, and account-type relevance. This index shows which account types interact with each module.
    11→
    12→### Account Types
    13→
    14→- **Beacon Employee (BE):** Server-side map building, data pipeline management, model training, client management
    15→- **EMS Admin (EA):** Emergency management leadership, zone drawing, event declaration, resource management
    16→- **EMS Team Member (ET):** Field operations, route confirmation, condition reporting, resource deployment
    17→- **Dispatch (DI):** Specialized dispatch layer, call management, resource coordination
    18→- **Special Designations (SD):** School principal, utility rep, plower, tornado tracker, storm chaser, fire spotter — each with unique functions granted via invite code
    19→- **Public User (PU):** Evacuation, reporting, help requests, location sharing, animal rescue
    20→
    21→### Module Map
    22→
    23→| Module | BE | EA | ET | DI | SD | PU | Notes |
    24→|---|---|---|---|---|---|---|---|
    25→| Atlas (Base Map) | Build | View | View | View | View | View (tiles) | Server-side build; 1km tile delivery |
    26→| Hazard Models (per hazard) | Train/adjust | Configure | Use | Use | Use | Use (compressed) | Each hazard = own module + environment |
    27→| Map Layers (static) | Build | Configure | View | View | View | View | Property lines, buildings, terrain, etc. |
    28→| Map Layers (event) | Monitor | Draw/edit | Draw/edit | View | Report | Report | Evac routes, destruction, conditions |
    29→| Mesh Networking | Build | Priority | Priority | Priority | Use | Use | EMS traffic first |
    30→| Account & Auth | Manage all | Manage team | — | — | — | Self-manage | Invite codes, special designations |
    31→| Contacts/Stakeholder DB | Populate | Use/update | Use | Use | — | — | Landowners, bus cos, school reps |
    32→| Event Declaration | — | Declare/manage | Participate | Dispatch | Report status | Receive alerts | Auto-thresholds + manual |
    33→| Evacuation Manager | — | Command | Execute | Coordinate | Report (schools etc.) | Follow routes | Routes, shelters, staging |
    34→| Backup & Mutual Aid | — | Manage | Use codes | — | — | — | Secure codes for non-Beacon units |
    35→| Modeling & Simulation | Build | Run scenarios | — | — | — | — | Server + compressed on-phone |
    36→| Public Safety Features | — | Monitor | Monitor | — | — | Use | Shelter sharing, animal rescue, help |
    37→| Vehicle Manager | Build DB | Use | Use | — | — | Set vehicles | Market specs + manual input |
    38→| Notifications & Alerts | Build | Send custom | Receive | Dispatch | Receive | Receive | Automatic + custom from EMS |
    39→| Ski Resort Module | Build | — | — | — | Ski patrol | Use | Runs, conditions, avalanche |
    40→| Permissions & Legal | Build | Configure | — | — | — | Accept | Notices, agreements, ToS |
    41→| Normal Weather Interface | Build | — | — | — | — | Use | Forecasts, simulator |
    42→| Automatic Sensor Input | Build | Monitor | Monitor | — | — | Passive | Crash, collapse, quake, fire alarm |
    43→| Street-Level Perception | Build | Monitor | Monitor | — | — | Camera input | LiDAR prior vs. phone camera |
    44→| Beacon World Model | Train | Use | Use | Use | — | Guided by | Goal-engine for emergency decisions |
    45→
    46→### Development Architecture Note
    47→
    48→Start development with the shared skeleton. EMS accounts are special types of groups built on the same underlying public user functionality, with dispatch access, on-duty tracking, team-based interface, and additional features layered on top. The interface is the same core but EMS sees team locations, different icons, and dispatch markings.
    49→
    50→### Special Designation Workflows
    51→
    52→**School Principal (SD):** Receives invite code from EMS. Reports school evacuation status directly to EMS. Creates/joins parent-community group for trusted updates.
    53→
    54→**Utility Representative (SD):** Confirmed by EMS or Beacon employee. Manually marks utility personnel locations, outage zones, and repair updates on the map.
    55→
    56→**Plower (SD):** Activates "currently plowing" mode; map tracks plowed areas in real time. Can see other plowers' paths for coordination. Receives plow requests from EMS/police.
    57→
    58→**Dispatch (DI):** Only dispatch members of an organization can mark on the dispatch layer. Coordinates resource deployment, call management.
    59→
    60→**Tornado Tracker / Storm Chaser (SD):** Images triangulated against radar for tornado positioning. Reports rain-wrapped status and other conditions. EMS can request search and rescue from chasers. Chasers report S&R activity, hospital transport (EMS can call for victim status, escort, or alert hospital).
    61→
    62→**Fire Spotter (SD):** Designated watchers. All fire personnel can manually draw fire line locations, mark water drops, and report conditions.
    63→
    64→**Client Admin (SD):** Responsible for account setup and sending invite links to emergency personnel.
    65→
    66→**Fire Chief / Police Chief (SD):** Designate their hierarchy, keep a resource manager, make it easy for volunteer fire to say they are responding.
    67→
    68→**Ambulance/EMS (SD):** Field EMS with special dispatch coordination.
    69→
    70→**State Emergency Rep (SD):** State-level emergency coordination.
    71→
    72→**State Politician (SD):** Government official coordination during declared emergencies.
    73→
    74→**Federal Emergency Rep (SD):** Federal-level emergency coordination with inventory of available resources.
    75→
    76→**Hospital Rep (SD):** Any nurse or hospital staff can report what their hospital needs, available beds, supply shortages. Most useful for mass casualty events, pandemics, or post-hurricane resource coordination.
    77→
    78→**Ski Resort Manager / Ski Patrol (SD):** Mark avalanches, manage run conditions, coordinate on-mountain rescue. See section 11.11.
    79→
    80→**Note:** All special accounts should have a direct connection to the Beacon founder account so if they are having system issues or need to get a message out, they can get real-time support.
    81→
    82→---
    83→
    84→## 1. Hazard Model Framework
    85→
    86→Every hazard model follows this standardized structure. Each hazard model is its own development module with its own training environment, employee tracking, and visual component approval process (must adhere to style guide).
    87→
    88→### 1.1 Modeling & Predictive Core
    89→
    90→- **Analysis methodology:** Physics-based simulations + deep learning surrogates
    91→- **Risk modeling:** General area risk models + adaptive models that update with incoming data
    92→- **Evolution & pathing:** Hazard evolution over time and "path of disaster" trajectory modeling
    93→- **Visibility & environment:** Indoor/outdoor visibility models; road condition models (car crashes, pile-ups)
    94→- **Secondary effects:** Tree fall models, utility risk (including cell service loss), connected/cascading hazard chains
    95→- **Base map adjustment predictions:** Account for destruction (structures burned/collapsed) and terrain changes (earthquake shifts elevation before tsunami arrives)
    96→- **Fire survival tracking:** Track fire, smoke, heat, oxygen, and CO2 levels for survival assessment
    97→- **Out of control burn point detector:** A single house fire under high enough winds can quickly get out of control. At some point the entire area is going to burn. Detect this inflection point.
    98→- **Burn together groups:** Depending on high winds from main directions, calculate groups of buildings close together and flammable enough that if one burns, the entire group will likely burn. Server-side model recalculates adjustments based on current wind speed and direction. Guides where fire resources should focus.
    99→- **Casualty prediction via battery drain:** Track battery drain patterns to infer potential casualties
   100→- **Danger rating projection:** "If you leave in X minutes" danger rating — project risk over near-future timeframes
   101→- **Traffic death cascade modeling:** A user dying in their car (being in the death zone — too much heat, too much smoke for too long) will block that entire line of traffic. Model should discourage routing that leads to this outcome.
   102→- **Suspected arson detector**
   103→- **Car crash / pile-up / plane crash detection**
   104→- **Power outage detection**
   105→
   106→### 1.1b Automatic Sensor-Driven Input (Beacon On)
   107→
   108→Automatic detection triggers from phone sensors:
   109→
   110→- Building collapse + sudden fall detection (or someone manually reports a building collapse — warn user if their region is not directly covered by EMS)
   111→- Car crash / pile-up detection
   112→- Stranded driver detection
   113→- Extreme heat + stop of phone activity = needs help immediately
   114→- Explosion / tornado lofting detection (may have similar sensor signatures — research needed)
   115→- Shaking / earthquake detection
   116→- Fire alarm sensing
   117→
   118→### 1.2 Fire Spread Model (Wildfire Module)
   119→
   120→- **Ignition by direct flame:** Contact duration threshold given heat/humidity/drought status
   121→- **Radiant heat threshold:** Ignition distance given heat/humidity/drought status/direction
   122→- **Ember intensity:** Being downwind of enough embers
   123→- **Vegetation flammability layer:** Terrain fire pass-by rate (high for grass, low for structures, adjusted for drought)
   124→- **Wind speed and direction integration**
   125→- **Projected fatal zones over time:** Oxygen depletion, heat, smoke, and all lethal exposure vectors
   126→
   127→### 1.3 Operational Protocols & Safety
   128→
   129→- **Event triggering:** Defined thresholds for when to activate an event; protocols for data recording during events. Automatic thresholds trigger event and start data storage, adjust suggested map layers (e.g., show oxygen depletion, heat layers).
   130→- **Default layers by region:** Areas prone to certain disasters should have default layers that account for regional risk profiles
   131→- **Evacuation logic:** Criteria for evacuation vs. shelter-in-place decisions
   132→- **Safe zone modeling:** Two layers: (1) "safer zone" layers per hazard baked into the base map, and (2) a model for predicted safety given active forecasts including phone sensor input and nearby sightings. Safe zones must be unburnable, won't overheat, and won't produce excessive smoke.
   133→- **Recent burn zones as safe zones:** As burned areas cool down, they become safe zones. Track cooling progression.
   134→- **Smoke survival advice:** Advise people to bring blankets for smoke protection
   135→- **Lethality assessment:** Models for "ways people die" per hazard (suffocation, electrocution, radiant heat, crush, etc.)
   136→- **In-building evacuation with no visibility:** Elaborate system using UWB to create a path that a person takes out of the building. When one person gets out, they confirm successful evacuation. GPS from outdoors marks the exit point and shifts the path, confirming to everyone still in the building that there is an evacuation route. Low visibility guidance relies on spoken guidance and the phone shaking more intensely when the user is oriented toward the evacuation route.
   137→- **Beacon coverage check:** See if area is covered by Beacon emergency management. If it isn't, connect with 911.
   138→- **Last resort evacuation locations:** Visible to EMS only for liability reasons. EMS can manually share or designate as shelters of last resort (as done during the Paradise fire).
   139→
   140→### 1.4 Technical Reliability & Edge Cases
   141→
   142→- **Validation specs:** Performance validation during real-time events + model training validation
   143→- **Edge case resilience:** Risk of losing service (what to cache and when); update trackers for new or user-reported events
   144→- **Deployment tiers:** Optimized "on-phone" compressed versions vs. high-compute "advanced" server versions
   145→- **Hazard-specific caching:** Specify what should be cached on the phone given the active hazard type
   146→- **Low intensity models:** Stripped-down model versions for no-service times
   147→- **Outdated data warning:** Warn users that routing may be built on outdated data — use caution
   148→- **Battery consciousness:** Entire system must be conscious of battery usage. Battery saver mode for emergencies.
   149→
   150→### 1.5 Communications & UI
   151→
   152→- **Hazard-specific icons and localized messaging**
   153→- **Supporting party info** (e.g., tornado tracker feeds)
   154→- **Pre-saved scenario info** for rapid deployment
   155→- **Specialized controls** for specific users (e.g., ski patrol)
   156→- **"Use at your own risk" banner:** Displayed at top of screen; user must swipe it off to acknowledge
   157→- **Flame reporting reminder:** If the user sees flames not on the app, remind them to mark them on the map
   158→- **Vehicle icons:** Icons showing people's locations should show the vehicle they are in (firetruck, helicopter, ambulance) and a number showing how many occupants
   159→- **Map declutter system:** Fire sightings behind confirmed fire line can be minimized/removed. Users can contradict sightings and push to remove them. Users can add pictures showing things have changed. Most map icons should have a timeout feature.
   160→
   161→### 1.6 Vulnerability & Assistance
   162→
   163→- **At-risk populations:** Kids in school, hospitals, homeless, people with disabilities, elderly, nursing homes, jails/prisons, trailer parks, single-story homes, people without vehicles
   164→- **Resource mapping:** What each user type needs for preparation and/or evacuation
   165→- **Vulnerable populations data layer:** State health department licensing databases (nursing homes, assisted living, group homes, hospitals, dialysis centers), CMS (Medicare) facility databases, state education agencies (schools and licensed daycare), HUD (homeless shelter locations). Individual self-reporting or reporting loved ones is critical.
   166→- **Pre-registered representatives:** Representatives for all schools and vulnerable populations should be in the contacts database before disasters. This is a major part of EMS setup.
   167→
   168→---
   169→
   170→## 2. Hazard Categories
   171→
   172→### 2.1 Atmospheric & Wind
   173→
   174→- Tornado
   175→- Extreme wind (derecho, lateral winds, general storm systems)
   176→- Hurricane (wind + rain-driven flooding)
   177→- Blizzard (snow + high-velocity wind)
   178→- Hail
   179→- Air quality (dust storms, allergens)
   180→
   181→### 2.2 Hydrological (Water)
   182→
   183→- Flash flooding (precipitation-based)
   184→- Meltwater flooding (ice/snow)
   185→- Storm surge (from hurricanes or blizzards)
   186→- Tsunami (triggered by earthquakes, landslides, or volcanoes)
   187→- Dam/levee breach ("wall of water" scenarios)
   188→- Electrocution risk (specific to flooded areas)
   189→
   190→### 2.3 Geological & Winter
   191→
   192→- Earthquake
   193→- Landslide / mudslide
   194→- Volcano (smoke, flows, vent locations, rising risk levels)
   195→- Avalanche
   196→- Ice hazards (buildup, accretion)
   197→- Snow drift
   198→
   199→### 2.4 Thermal & Fire
   200→
   201→- Wildfire (flames, radiant heat, smoke)
   202→- Extreme heat (ambient vs. radiant heat from fires/volcanoes)
   203→- Extreme cold
   204→- Drought
   205→- Explosions
   206→- Arson (suspected arson detection)
   207→
   208→### 2.5 Chemical, Biological & Gas
   209→
   210→- Toxic gas (sulfur bubbles, CO, CO2 tracking)
   211→- Suffocation risk (oxygen level tracking for volcanoes, wildfires)
   212→- Toxic waste spill
   213→- Radiation
   214→- Pandemic
   215→- Blight
   216→
   217→---
   218→
   219→## 3. Base Map System (Atlas)
   220→
   221→Server-side module, Beacon employees only. Some layers accept EMS and public user input (evacuation routes, destruction reports, condition reports) that feed into the base map. Event-specific input (hazard sightings, status updates) is stored in event records, not the base map.
   222→
   223→### 3.1 Multi-Source Fusion Approach
   224→
   225→The final base map is produced through a pipeline:
   226→
   227→1. **Source prioritization:** For each map attribute, determine which data type (LiDAR, satellite, street-view, OSM, etc.) is most effective at identifying it. Factor in recency.
   228→2. **Primary prediction:** Use the best-suited data source for initial attribute predictions.
   229→3. **Cross-source calibration model:** A model that calibrates different data types so predictions at a specific location can be compared. Critical for Mapillary data where location accuracy can drift.
   230→4. **Secondary validation:** Cross-check primary predictions against secondary data sources to validate or refute.
   231→5. **Final prediction model:** Aggregates all evidence into final predictions.
   232→6. **Visualization module:** Responsible for rendering the final map.
   233→
   234→### 3.2 Development Approach Per Layer
   235→
   236→For each map layer/attribute, a development agent should:
   237→
   238→- Study what data sources are most effective for that information
   239→- Evaluate computer vision options (e.g., Mapillary street-view with JEPA self-supervised learning, commercial CV models)
   240→- Consider combining multiple data layers for inference (LiDAR describes box store shape + street-view sees Target logo = probably a Target)
   241→- Assess legality of third-party options
   242→- Scale effectiveness against cost (paid vs. unpaid)
   243→- Develop a validation model for predictions (e.g., once a Target is identified, look it up to confirm)
   244→- Integrate user input (EMS personnel reports, public self-reporting)
   245→- Build update mechanisms: as hazard models predict destruction and/or users confirm it, map layers should update accordingly
   246→- Make a list of things to identify with different data sources (primary/secondary) — e.g., satellite + LiDAR to identify cell towers
   247→
   248→### 3.3 Creation/Update Manager & Tile System
   249→
   250→Beacon employee-side system:
   251→
   252→- Takes in data from sources and user input (evacuation routes, gate owner info, evacuation zones)
   253→- Includes models for assembling final layers
   254→- Final layers pushed to users as 1km tiles
   255→- Each user has saved locations that always precache tiles
   256→- Tiles also precached if user is at risk of an active hazard
   257→- Alerts triggered when user reports conflict with existing map data
   258→- Alerts triggered when user GPS shows them floating above ground level, implying a building exists there that isn't on the map
   259→
   260→### 3.4 Data Storage Note
   261→
   262→Since many features are sparsely populated, store data as features relative to a location. If a feature isn't in a location's attributes, it's assumed not applicable.
   263→
   264→### 3.5 Street-Level Real-Time Perception Model
   265→
   266→A system that bridges the aerial base map with ground-level reality using phone cameras for real-time change detection.
   267→
   268→**Prior Generation (Server-Side):**
   269→
   270→- Reproject aerial LiDAR point clouds into simulated street-level perspectives at known vantage points (intersections, road segments)
   271→- The reprojection creates a "prior" of what the world should look like from ground level — expected building outlines, tree canopy positions, road edges, infrastructure
   272→- This prior is pre-computed and compressed into the 1km tile delivery system alongside other base map data
   273→
   274→**Real-Time Change Detection (Phone-Side):**
   275→
   276→- When a user's phone camera captures a street-level view, the app compares the live image against the pre-computed prior for that location and angle
   277→- Discrepancies between expected and observed scenes indicate real-world changes: fallen trees, collapsed structures, new water/flooding, debris fields, road blockages
   278→- Detected changes are classified (obstruction type, severity) and geolocated
   279→- Classifications are pushed back through the mesh/network to update routing for all users in real time
   280→
   281→**Real-Time Loop:**
   282→
   283→1. Pre-computed map prior (aerial LiDAR reprojected to street-level)
   284→2. Phone camera observation at that location
   285→3. Difference detection and classification
   286→4. Geolocation of detected change
   287→5. Routing updates propagated to all affected users
   288→
   289→**Synthetic Training Data Generation:**
   290→
   291→- In areas without Mapillary street-view coverage, the aerial-to-street reprojection can generate synthetic street-level views
   292→- These synthetic views paired with the aerial source create training pairs for LeJEPA fusion cross-modal models
   293→- Enables training of models that fuse aerial and street-level data even where ground-truth street imagery doesn't exist
   294→- Strengthens the multi-source fusion pipeline (Section 3.1) by extending cross-modal learning to data-sparse regions
   295→
   296→### 3.6 Layer Data Source Identification
   297→
   298→For each map layer, designate which data source is primary (most effective for identification) and which is secondary (for validation/supplementation). This guides the development approach per layer (Section 3.2).
   299→
   300→| Layer | Primary Source | Why Primary | Secondary Source | Why Secondary |
   301→|---|---|---|---|---|
   302→| Barriers (fences, walls, guardrails, hedges, boulders) | Street View / Mapillary | Material type visible | LiDAR | Height, extent visible |
   303→| Trees | LiDAR | Height, lean, precise location | Street View / Mapillary | Species, damage/dryness susceptibility |
   304→| Gates | Street View / Mapillary | Visual details (hinges, lock type) | LiDAR | Gap detection |
   305→| Driveways | LiDAR | Length, width measurement | Terrain (DEM) | Slope analysis |
   306→| Dirt Roads | Terrain (DEM) | Slope analysis | LiDAR | Vegetation clearing patterns |
   307→| Passable Terrain | Terrain (DEM) | Slope is critical | LiDAR | Vegetation density |
   308→| Road Width | LiDAR | Measured width at all points | — | — |
   309→| U-Turn Possibility | LiDAR width + Terrain slope | Where full 180-degree turn possible | — | — |
   310→| K-Turn Possibility | LiDAR width + backing space + Terrain | Where 3-point turn possible by vehicle size (link to vehicle manager specs) | — | — |
   311→| Street Crowding (illegal parking) | LiDAR | Detect parked cars reducing drivable width | Street View / Mapillary | Visual confirmation |
   312→| Power Lines | Street View / Mapillary | Visual identification, provider signs | LiDAR + Satellite | Height, routing between poles |
   313→| Fire Hydrants | Street View / Mapillary | Visual identification | — | — |
   314→| Open Doors Model (sheltering access) | Google / OSM + time-of-day | Commercial vs. residential, hours of operation | Street View / Mapillary | Entrance visibility |
   315→| Population Estimation | Census + demographics | Baseline counts | Building purpose + time-of-day model | Weekday/weekend adjustment |
   316→| Number of Lanes | LiDAR + Satellite | Width measurement + lane marking detection | OSM | Tagged lane counts |
   317→| Building Materials | Street View / Mapillary | Visual material identification | LiDAR | Reflectance properties |
   318→| Building Age | County assessor records | Year built data | Street View + CV model | Visual age estimation |
   319→| Overpasses | LiDAR | Height clearance measurement | OSM / DOT records | Weight/height limit data |
   320→| Docks | Satellite + LiDAR | Structure identification | OSM (leisure=marina) | Tagged locations |
   321→| Camping Grounds | OSM + Satellite | Tagged locations + clearing identification | Street View / Mapillary | Visual confirmation |
   322→
   323→---
   324→
   325→## 4. Map Layers
   326→
   327→### 4.1 Terrain & Elevation
   328→
   329→- DEM (global: Copernicus DEM; US: 3DEP LiDAR)
   330→- Slope (derived from DEM)
   331→- Aspect
   332→- Terrain classification
   333→- LiDAR (roof geometry for fire model, bare earth)
   334→- **Landcover layer:** Global: ESA WorldCover (10m); US: NLCD (30m). Supplemented by LiDAR, Mapillary, Sentinel-2.
   335→- **Traversability layer (LiDAR-derived):** Walkable/climbable, bikeable, driveable (2WD, AWD, 4WD), max car length, passable by firetruck. Includes elevation, pavement, water, grass, dirt, sand, farm terrain.
   336→- **Terrain passability from 8 main directions layer:** Directional traversability for routing from any approach angle
   337→- Elevation layer for tsunami impact modeling
   338→- Drainage direction
   339→- Terrain permeability (susceptibility to drought, ground saturation capacity)
   340→- Grass layer (feeds into terrain flammability and traversability)
   341→- Sand layer (terrain subtype — traversability and fire resistance)
   342→- Liquefaction risk zones
   343→- Landslide/avalanche/mudslide likelihood (slope-derived)
   344→- Sinkhole risk (underground water, limestone, etc.)
   345→- Fault lines with most recent slip likelihood
   346→- Volcano monitoring (signs of activity)
   347→
   348→### 4.2 Roads & Transportation
   349→
   350→- Formal road layer: one-ways, number of lanes, shoulders, dirt lots, parking lots, private roads (with owner contact lookup)
   351→- **Number of lanes:** LiDAR + satellite for measurement. Police accounts can designate a road as one-way during an evacuation.
   352→- **Road width (LiDAR-measured):** Width at all points along roads for vehicle clearance calculations
   353→- Bridges
   354→- **Overpasses layer:** Height limits (impassable by tall vehicles), collapse susceptibility for earthquakes. Identified via LiDAR clearance + DOT records.
   355→- Gates: locked gates + database of owners. Open gates layer during events. Confirmation gates are open/blocked access layer.
   356→- Passability model: what can a standard 2WD, 4WD, or fire truck traverse; updated after events imply permanent destruction or long-term damage. Adapts to active hazard (plowed roads become passable during blizzard; fallen trees reroute during wildfire).
   357→- **U-turn possibility:** LiDAR width + terrain slope. Where full 180-degree turn is possible. Indexed by vehicle size via vehicle manager.
   358→- **K-turn possibility:** LiDAR width + backing space + terrain slope. Where 3-point turn is possible. Linked to vehicle manager specs so system knows which vehicles can make each k-turn.
   359→- **Dirt roads / gravel roads layer:** Identified via terrain slope analysis (primary) and LiDAR vegetation clearing patterns (secondary). Includes drivable dirt terrain not typically considered roads.
   360→- **Driveways:** LiDAR for length/width, terrain for slope. Includes driveway clearing status (user-reported).
   361→- **Street crowding / illegal parking:** LiDAR-detected parked cars reducing actual drivable width in emergencies
   362→- **Pavement layer:** Roads + driveways + shoulders + parking lots = unburnable area. Important for fire routing.
   363→- **Public parking:** Pavement + dirt lots. Unburnable during fires.
   364→- **Private roads/parking:** Part of private roads layer. Includes gate status.
   365→- **Driveways that are fence-rammable:** Long enough to back up and facing a fence (not wall). Relevant for emergency vehicle access.
   366→- Transit layers: public/private bus terminals, Greyhound terminals, planes, boats (with boat type model), subway maps, train schedules (user reports + official contacts to determine if trains are running), cruise ship ports where large ships can dock
   367→- Train/bus/ship depots, marinas
   368→- **Docks layer:** Identified via satellite + LiDAR (structure) and OSM (leisure=marina). For water evacuation and maritime resource staging.
   369→- **Boats/ships nearby layer:** Tracked vessels for water evacuation feasibility
   370→- Tow companies
   371→- Snow plow routes (plowers turn on tracking setting so wherever they go, map marks when it was last plowed; special "request plow" button for police)
   372→- Road shoulders, sidewalks, bike lanes
   373→- Sidewalk conditions (user-reported)
   374→- Flat open fields and drivable terrain not typically considered roads
   375→- Fence types and most rammable sections (chain link for bolt cutters, weakest points for vehicle ramming)
   376→- **Barriers layer:** Fences, walls, guardrails, hedges, boulders — places vehicles can't drive through. Primary: street view (material type visible); secondary: LiDAR (height, extent).
   377→- Road hazards layer
   378→- Trees at risk of blocking road if they fall
   379→- **Traffic congestion prediction layer:** Draws from traffic model, identifies areas that get congested — proxy for evacuation congestion/bottlenecks
   380→- **Pile-up risk zones:** Areas with high crash/pile-up likelihood based on road geometry, visibility, and conditions
   381→- Public transit layer (buses, trains, subway schedules, ferries)
   382→
   383→### 4.3 Structures & Buildings
   384→
   385→Each building should aggregate all descriptive info:
   386→
   387→- Type/purpose (residential, commercial, office, storefront, mall, public, etc.)
   388→- Address
   389→- Year built
   390→- Presumed building codes (module that collects country/city codes by building type — relevant for earthquake and tornado damage prediction)
   391→- Roof features (for snow collapse model + helicopter landing assessment)
   392→- Building materials
   393→- Number of floors
   394→- Number of apartments/units (for evacuation count)
   395→- Soft story identification
   396→- Exits and entrances (assembled from OSM, street-view, sensor data)
   397→- Building distances from each other
   398→- Power source per building (including backup like fireplace)
   399→- Heating method (gas, electric, oil, solar)
   400→- Commercial vs. private (with time-of-day accessibility — e.g., corporate office locked after hours, residential locked by default)
   401→- Fence details: type, rammability, gate locks, whether bolt cutters could work
   402→- **Building age layer:** Year built data (county assessor records primary, street-view CV estimation secondary). Feeds into building codes and building vulnerability models.
   403→- **Building material predictor layer:** Street-view CV identifies visible materials. Feeds into shelter prediction (including flammability) and building purpose prediction.
   404→- **Building purpose layer:** Used for shelter viability and population layers. Residential, commercial, industrial, public, etc.
   405→- **Space between structures:** Measured from LiDAR. Critical for fire spread modeling and burn together groups.
   406→- **Open doors model (sheltering access):** Residential vs. commercial model. Where are there shelters a user can run to at any given time? Uses building purpose + hours of operation + time of day. Google/OSM for hours; street-view for entrance visibility.
   407→- **Camping grounds:** OSM + satellite for tagged locations and clearing identification. Useful to distinguish campfire smoke from wildfire smoke.
   408→
   409→**Building subcategories:**
   410→
   411→- Hospitals, police stations, firehouses, urgent care
   412→- Pharmacies (anaphylactic shock — go to Walgreens if can't reach hospital; goes in user guide)
   413→- Schools, nursing homes, retirement communities, jails, prisons
   414→- Historic sites
   415→- Big box stores (Target, Walmart, Home Depot, Lowes — for collapse risk), supermarkets
   416→- Places with walk-in freezers (tornado sheltering): beer stores, ice cream stores, restaurants
   417→- Places with bank vaults (tornado/blast sheltering)
   418→- Churches / mosques / temples / houses of worship (identify via Mapillary street-view CV)
   419→- Homeless shelters
   420→- Single family homes, condos/connected single family houses
   421→- Apartment buildings, office buildings (note: closed on weekends)
   422→- Storefronts, glass-front stores (vulnerability), malls, retail shops
   423→- Hotels, museums, restaurants, summer camps
   424→- Gas stations, ammunition stores (hazard risk)
   425→- Hazardous chemical plants, nuclear facilities
   426→- Factories
   427→- Trailer parks (high risk for tornadoes)
   428→- Public buildings with open hours (libraries, legislative buildings)
   429→- Bus depots, train stations, surf shacks, marinas
   430→- Subway stations (depth data for radiation sheltering; some are essentially shelters)
   431→
   432→### 4.4 Hazard Risk Layers
   433→
   434→**Earthquake & Geological:**
   435→- Earthquake high-collapse risk (soft story buildings on liquefaction-prone soil, precomputed)
   436→- Earthquake building safety predictions (which buildings are unlikely to collapse)
   437→- Earthquake likelihood zone (per-hazard likelihood for each 1km grid square, part of overall hazard likelihood module)
   438→- Avalanche/landslide/mudslide possible zones (slope + snowpack + rainfall derived)
   439→
   440→**Tornado & Wind:**
   441→- Tornado shelter ratings per building; storm shelter locations; walk-in freezer predictions
   442→- Tornado-prone areas
   443→
   444→**Tsunami & Coastal:**
   445→- Tsunami shelter layer rating
   446→- Tsunami risk layers (predetermined based on low-lying land relative to ocean)
   447→- Tidal layer: tracks tides for ocean water levels, condition reports from counties/beaches, rip tide warnings, shark warnings. Alert users when they walk onto a beach. Lifeguards have a place to report conditions, similar to ski condition reporting on slopes.
   448→- Distance to high ground along coastal regions (on foot + by car)
   449→
   450→**Fire & Flammability:**
   451→- Fire-prone areas
   452→- **Heat prediction/detection layer**
   453→- **Building flammability layer:** Per-building flammability based on building materials predictor
   454→- **Terrain flammability layer:** Ground surface flammability based on landcover, drought conditions
   455→- **Plant life flammability layer:** Vegetation flammability based on species, moisture, drought status
   456→- **Flammability composite:** Combination of how flammable each mapped object is. The most flammable thing in the path of fire is the most likely to ignite and move the fire along next.
   457→- Vegetation layer (type via CV + physical attributes + region; flammability rating; tree trunk thickness, height, species guessing model for drought/flammability predictions)
   458→- **Bushes / transition fuel layer:** Brush and bushes that serve as transition fuel between terrain types
   459→- **Flame pass-through rate layer:** Calculates how quickly a fire coming from each of the 8 major directions will spread through an area
   460→- Certified fireproofed homes (self-reported by users)
   461→- Fire speed spread point layers (simplified)
   462→- Fire intensifier layer
   463→- Known flammable objects layer
   464→- Residential-to-woodland transition line (for fire spread model); individual homes in woodland areas
   465→- Burn together groups layer (precomputed clusters of buildings likely to burn together under directional high winds; 8 main wind directions)
   466→- Safe non-flammable regions (show high-certainty fire areas + flammability heatmap to let users decide — avoids liability)
   467→- Parking lot layer (safe during fires)
   468→- **"In the black" layer:** Areas predicted to have already stopped burning, based on objects in the area and whether satellite smoke readings have lowered in alignment with predicted burn time. Feeds into safe zone identification.
   469→- **Fire alarm detection layer:** Where fire alarms going off have been detected
   470→
   471→**Flood & Water:**
   472→- Flood-prone areas (all types)
   473→- **Flood susceptibility layer:** Based on terrain, drainage, proximity to water, ground saturation
   474→- **Current risk layers based on historical weather:** Drought status, recent snowfall (flash flood risk from ground saturation, avalanche risk from snowfall, controlled avalanche status — locals can report if it looks like there was an avalanche overnight)
   475→
   476→**Atmospheric & Smoke:**
   477→- **Smoke model layer**
   478→- **Oxygen pools/levels layer:** Areas of oxygen depletion (volcano, wildfire)
   479→- **Visibility model layer:** For users (how far can you see) and for radio waves (signal propagation). Contains several sublayers.
   480→- Snow drift levels (user-reported)
   481→- Wind change prediction layer (stays non-visible until barometric measurements indicate current wind predictions are inaccurate or there is about to be a sudden shift)
   482→
   483→**Radiation & Chemical:**
   484→- Radiation safety layer: building radiation protection ratings, subway station depths, concrete building ratings for shelter-in-place, route to deepest subway stations if trains are running
   485→- Explosive/hazardous materials locations
   486→- Toxic/industrial hazards layer
   487→
   488→**Traversability & Shelter:**
   489→- **Walkable terrain layer** (derived from traversability)
   490→- **Bikeable terrain layer** (derived from traversability)
   491→- **2WD driveable terrain layer**
   492→- **4WD driveable terrain layer**
   493→- **Firetruck driveable terrain layer**
   494→- **Helicopter landing layer:** Derived from roof features, open spaces, LiDAR clearance assessment
   495→- **Barriers layer:** Fences, walls, guardrails, hedges, boulders — places people/cars can't pass through
   496→- Flammability rating by material
   497→
   498→**Survivability:**
   499→- **Survivable zones over time layers:** Takes into account all possible danger layers combined. Shows projected safe areas at future time intervals.
   500→
   501→### 4.5 Explosive Things Layer — Data Sources
   502→
   503→| Source | Identifies |
   504→|---|---|
   505→| EPA RMP Databases | Bulk propane, fuel deposits, industrial chemicals |
   506→| OSM (amenity=fuel) | Gas stations |
   507→| PHMSA National Pipeline Mapping System | Pipelines (requires registration) |
   508→| OSM (leisure=marina) + satellite imagery | Marinas with fuel, boats and docks |
   509→| OSM (shop=car) | Car dealerships |
   510→| OSM (shop=weapons, shop=guns, brand=Cabelas/Bass Pro/Academy) | Ammunition stores |
   511→| Mapillary CV / utility service maps | Residential propane (proxy: areas without natural gas service usually have propane) |
   512→
   513→### 4.6 Jurisdictions & Administrative
   514→
   515→- Police, fire, town, city, school district boundaries (allow manual adjustment + verification process)
   516→- **Fire jurisdictions** (within jurisdictions/zones tracking)
   517→- **Utility jurisdictions** (within jurisdictions/zones tracking)
   518→- County and state lines
   519→- **City lines** (explicit municipal boundaries)
   520→- Police jurisdictions: Census TIGER covers ~90% nationally. City police = incorporated areas, county sheriff = unincorporated. State GIS clearinghouses for more layers. Edge cases: university police, transit police
   521→- Federal land (military, national parks)
   522→- State land
   523→- Military bases (by branch — useful to know where coast guard is)
   524→- **Nearby military layer:** State National Guard and federal military installations. Relevant for resource mobilization during declared emergencies.
   525→- **Neighborhoods layer:** Where streets join larger roads may define natural neighborhood boundaries. Formal lines where they exist, inferred lines otherwise.
   526→- Major property owners
   527→- Property lines with contacts for landowners/leaseholders in the stakeholder database
   528→- **Client area boundaries:** EMS-defined boundaries for their coverage areas
   529→- **Group area boundaries:** Module suggests town/city/community coverage for a group. Same module that suggests groups for users to join. User admins can define boundaries; Beacon tracks where the main group of users is located in the background.
   530→
   531→### 4.7 Utilities & Infrastructure
   532→
   533→A collection of sub-layers. In the interface, infrastructure layers should be categorized together and the user should be able to select water, gas, power, etc. individually.
   534→
   535→- Automatically identify as much as possible from map builder
   536→- Special accounts for utility providers to designate coverage zones
   537→- If users report power/water outages, utilities can assume that zone is affected
   538→- **Water lines:** Location and provider. Interface for utilities to draw and place.
   539→- Water mains
   540→- **Gas lines:** Location and provider
   541→- How each building gets power
   542→- Cell tower locations (identify via satellite + LiDAR combination)
   543→- **Power lines:** Location and provider. Identified via street-view (primary) and LiDAR + satellite (height, routing between poles).
   544→- **Fire hydrants with pressure rating** (identified via street-view CV)
   545→- Water towers, wells
   546→- **Pools as water sources** (identified via satellite/LiDAR for fire suppression potential)
   547→- Power grid status layer (clearly show confirmed power-off areas; notify EMS of mismatches e.g., downed power line blocking road but power still on)
   548→
   549→### 4.8 Population & Demographics
   550→
   551→- Census layer with population estimation model that accounts for time-of-day (office buildings and schools empty at night)
   552→- **Population by building by weekday/time:** Inhabitant count per building adjusted for weekday vs. weekend and time of day (office buildings empty at night, schools empty on weekends)
   553→- **Population density by region**
   554→- Evacuation zone layers (tsunami has national coverage; regional designations vary)
   555→- Vulnerable populations layer: state health department licensing databases (nursing homes, assisted living, group homes, hospitals, dialysis centers), CMS (Medicare) facility databases, state education agencies (schools and licensed daycare), HUD (homeless shelter locations), individual self-reporting
   556→- **Elderly population layer:** Nursing homes, retirement homes, assisted living, and other indicators of elderly populations (e.g., bingo halls — no place has bingo without old people)
   557→- **Where the children are layer:** Schools, daycares, summer camps, school districts. Time-of-day aware.
   558→- **Schools layer:** Distinct from school districts. Individual school locations, populations, evacuation plans.
   559→- **Disabled people locations layer:** Self-reported disabilities, group homes, facilities
   560→- **People needing evacuation assistance layer:** Vulnerable populations + people who've self-reported they need assistance. Combines disabled, elderly, vehicle-less, and anyone who self-identifies.
   561→- People without vehicles layer (collected when users self-report disability/household status)
   562→
   563→### 4.9 Imagery & Signs
   564→
   565→- Satellite imagery
   566→- Landfire recent burn layer
   567→- Signs and what they say
   568→- Store signs (including logo recognition model for common brands)
   569→
   570→### 4.10 User-Reported Layers
   571→
   572→- Animals (with descriptions)
   573→- Elderly people
   574→- Children
   575→- People with disabilities
   576→- Users with verified location (ID verifier confirmed address)
   577→- Retired police and fire (so EMS can geofence and ask specific people for help)
   578→- Confirmed evacuation routes (EMS-drawn)
   579→- Confirmed clear evacuation routes (routes successfully used, including unorthodox paths — EMS decides whether to make public)
   580→- Potential evacuation routes by vehicle type: official (set by police) + auto-suggested by Beacon
   581→- User-reported destruction or permanent base map alterations
   582→- Who has a boat, axe, supplies, relevant skillsets (tentative — useful during flooding)
   583→- Community-reported changes in access ways (given less weight than EMS confirmation)
   584→- User equipment: snow plow, excavator, bulldozer, bolt cutters, ladder, surfboard
   585→- Swimming ability and nearby watercraft
   586→- Sidewalk conditions and driveway clearing status
   587→- Snow drift levels and wind levels
   588→- Visibility reports (users report how far they can see; map judges distance or accepts low/medium/high)
   589→- Geiger counter readings (for radiation events)
   590→- Water pressure reports
   591→- Confirmed evacuated buildings (including police-confirmed and neighbor-confirmed)
   592→- Where pets are located
   593→- Who is actively rescuing someone vs. who has no one coming (critical for EMS triage)
   594→- **Confirmed pets evacuated layer:** Pets confirmed safe, where they are, who has them
   595→- **Fatalities tracking layer:** Confirmed by auto sensors (overheated/stopped phones) and EMS reports during disaster aftermath
   596→- Controlled avalanche reports from locals (whether it looks like unstable snow was cleared overnight)
   597→
   598→### 4.11 Event-Active Layers (Wildfire Example)
   599→
   600→During a wildfire event, these layers become active:
   601→
   602→- Population heatmap showing predicted and confirmed locations
   603→- Risk heatmap (darkest red = most at risk due to fire/smoke direction + evacuation chokepoints, like Lahaina's Kuhua Camp with limited exits)
   604→- Smoke prediction, heat, oxygen levels, all lethal exposure vectors
   605→- **Oxygen levels layer** (real-time tracking during volcanic/wildfire events)
   606→- **Visibility model layer** (for users and radio waves; contains sublayers)
   607→- **Live weather layers** (real-time conditions overlaid during active events)
   608→- Water locations + low water pressure reports
   609→- 911 call locations + reported hazards/evacuation blockers
   610→- Already-burned areas (black layer) including ground temperature estimation
   611→- **"In the black" layer:** Predicted already stopped burning based on objects in area + satellite smoke readings
   612→- Stuck people, injured people, confirmed casualties/fatalities (overheated phones)
   613→- EMS drawing function for alerts to geofenced areas
   614→- **Confirmed evacuation routes:** EMS-managed routes + routes users successfully used to get to safety
   615→- Wave and water conditions for water evacuation feasibility
   616→- Coast guard relevance if people evacuate into water
   617→- Fire alarm detection layer (where alarms going off have been detected)
   618→
   619→### 4.12 Hydrology & Water Bodies
   620→
   621→- **Watershed boundaries** (HydroSHEDS)
   622→- **Streams, lakes, and tertiary water bodies**
   623→- **Rivers at different gauge heights** (USGS Water Services gauge data)
   624→- **Rivers and oceans layer:** Including ocean conditions to assess swimmability for water evacuation
   625→- **Dams/levees layer:** Locations and breach risk assessment
   626→- **Flood zones layer** (FEMA NFHL)
   627→- Hydrology (flow direction, catchments from NHD Plus)
   628→
   629→---
   630→
   631→## 5. Data Sources
   632→
   633→### 5.1 Global Static (Permanent / Semi-Permanent)
   634→
   635→| Source | Provides | Update Freq | Size |
   636→|---|---|---|---|
   637→| Copernicus DEM | Elevation, slope, aspect | Every few years | 100–150 GB |
   638→| SoilGrids | Sand/silt/clay %, drainage class, depth to bedrock | Rarely | 50–100 GB |
   639→| USGS Global Vs30 | Shear wave velocity (soil stiffness) | Rarely | 1–2 GB |
   640→| ESA WorldCover | Land cover classification (Sentinel-2 based) | Annually | 300–500 GB |
   641→| HydroSHEDS | Watershed boundaries, flow direction, stream network, upstream areas | Never | 50–100 GB |
   642→| GEM Faults | Fault geometry, type, slip rate, max magnitude | Rarely | Small |
   643→| Fan et al Water Table | Depth to water table (meters) | Never | 500 MB–1 GB |
   644→| Natural Earth | Land/water polygons | Rarely | <100 MB |
   645→| WorldPop | Population density rasters | Annually | 20–50 GB |
   646→| Google Open Buildings | Building footprints, centroids, area | Quarterly | 100–200 GB |
   647→| Microsoft Building Footprints | Building footprints, centroids, area | Quarterly | 50–100 GB |
   648→
   649→### 5.2 US Static
   650→
   651→| Source | Provides | Update Freq | Size |
   652→|---|---|---|---|
   653→| USGS 3DEP | LiDAR elevation, bare earth DEM | Check quarterly | 10–50 TB (download areas, process, keep rasters, remove raw LiDAR) |
   654→| SSURGO | Soil properties, drainage, flood freq, water table | Annually | 20–40 GB |
   655→| NLCD | Land cover, impervious surface %, tree canopy % | 2–3 years | 10–20 GB |
   656→| FEMA NFHL | Flood zones, floodway, base flood elevation | Annually | 30–60 GB |
   657→| NHD Plus | Stream network, flow direction, catchments | Every few years | 30–50 GB |
   658→| NOAA Atlas 14 | Precipitation frequency, IDF curves | Rarely | 1–5 GB |
   659→| National Bridge Inventory | Bridge locations, vulnerability, scour rating | Annually | <500 MB |
   660→| NOAA Digital Coast | Coastal LiDAR, bathymetry, sea level scenarios | Varies | 1–10 TB (coastal) |
   661→| LANDFIRE FBFM40 | Fire fuel models (40 types) | Every 2 years | 5–10 GB |
   662→| LANDFIRE CBD/CBH/CC/CH | Canopy bulk density, base height, cover, height | Every 2 years | 15–25 GB |
   663→| LANDFIRE EVT | Existing vegetation type | Every 2 years | 5–10 GB |
   664→| MTBS | Burn perimeters, severity classification | Annually | 2–5 GB |
   665→| EPA FRS | Hazmat facility locations, chemicals, permits | Annually | <500 MB |
   666→| EPA UST Finder | Underground tank locations, status, leaks | Annually | <200 MB |
   667→| Census Decennial | Population, housing units, group quarters | Every 10 years | 5–10 GB |
   668→| American Community Survey | Age, disability, language, vehicles, housing, income | Annually | 10–20 GB |
   669→| CDC SVI | Social vulnerability index | Annually | 1–2 GB |
   670→| State Health Dept Licensing | Nursing homes, assisted living, group homes, hospitals, dialysis | Varies | Small |
   671→| CMS Medicare Databases | Facility databases | Varies | Small |
   672→| State Education Agencies | Schools and licensed daycare | Varies | Small |
   673→| HUD | Homeless shelter locations | Varies | Small |
   674→
   675→### 5.3 Global Periodic (Weekly to Monthly)
   676→
   677→| Source | Provides | Update Freq | Size |
   678→|---|---|---|---|
   679→| OpenStreetMap | Roads, POIs, buildings with tags | Weekly–monthly | 70–100 GB |
   680→| Sentinel-2 | NDVI, burn scars, custom analysis | Weekly (fire season) | On-demand |
   681→| Mapillary | Fences, walls, gates, barriers, bollards, road condition, bridge condition, building entrances, underpasses, building descriptions | Monthly | 10–50 GB features (10–100 TB raw) |
   682→
   683→### 5.4 Global Real-Time Feeds
   684→
   685→| Source | Provides | Frequency | Size |
   686→|---|---|---|---|
   687→| USGS Earthquake API | Magnitude, depth, lat/long, time | Every 1–2 min | <10 MB |
   688→| NASA FIRMS | Active fire detections | Every 3 hours | 10–50 MB |
   689→| NASA GPM | Precipitation (mm/hr) | Every 30 min–3 hrs | 1–5 GB |
   690→| GFS | Wind, temp, humidity, CAPE, shear, snow | Every 6 hours | 5–20 GB |
   691→| GloFAS | River discharge, flood forecasts | Daily | 500 MB–2 GB |
   692→| SWOT | Water surface elevation | As available | 100–500 MB |
   693→| Sentinel-1 | Flood extent (during events) | Every 6–12 days | On-demand |
   694→| Sentinel-3 / Jason-3 | Water level altimetry | Every few days | 100–500 MB |
   695→| IBTrACS / JTWC / NHC | Storm tracks, intensity, forecasts | Every 6 hours | ~10 MB |
   696→| NOAA CO-OPS | Tide predictions, observed water levels | Every 6 minutes | <50 MB |
   697→| FES 2014 / TPXO | Global tide model (predictions anywhere) | On-demand | 5–10 GB |
   698→| IOC Sea Level Monitoring | Global tide gauge network, observed levels | Hourly–real-time | <100 MB |
   699→
   700→### 5.5 US Real-Time Feeds
   701→
   702→| Source | Provides | Frequency | Size |
   703→|---|---|---|---|
   704→| NWS Alerts API | All warnings with polygons | 30–60 seconds | 10–50 MB |
   705→| USGS Water Services | Gauge levels, discharge, flood stage | 15 minutes | 50–200 MB |
   706→| NOAA GOES | Imagery, lightning, fire hot spots, winds | 5–15 minutes | 5–20 GB |
   707→| NOAA NEXRAD | Radar reflectivity, velocity, hail, rotation | 5 minutes | 50–200 GB raw / 5–20 GB processed |
   708→| NOAA MRMS | Merged precipitation, QPE | 2 minutes | 10–30 GB |
   709→| NHC | Hurricane tracks, wind radii, storm surge | 6 hours | <50 MB |
   710→| SPC | Outlooks, probabilities, watches | Multiple daily | <100 MB |
   711→| NIFC | Fire perimeters, containment, behavior | Daily | 50–200 MB |
   712→
   713→### 5.6 Storage Summary
   714→
   715→| Category | Size |
   716→|---|---|
   717→| Global base layer (static) | 500 GB–1 TB |
   718→| Global buildings/roads | 200–400 GB |
   719→| Global real-time daily ingest | 10–30 GB/day |
   720→| US refinement (static, no LiDAR) | 100–200 GB |
   721→| US LiDAR (3DEP + Digital Coast) | 10–50 TB |
   722→| US real-time daily ingest | 50–200 GB/day |
   723→
   724→---
   725→
   726→## 6. Mesh Networking System
   727→
   728→Activates when cell towers are down.
   729→
   730→### 6.1 Core Capabilities
   731→
   732→- **Traffic routing:** Intelligent message routing across the mesh
   733→- **Compression algorithms:** Minimize data size for constrained bandwidth
   734→- **Bandwidth management:** Dynamically turn on/off user features depending on available bandwidth
   735→- **Battery management:** Minimize drain during emergencies; low battery mode
   736→- **Encryption & safety protocols:** Secure data sharing across the mesh
   737→- **Alert confirmation relay:** Relay back to emergency services that alerts were received by users
   738→
   739→### 6.2 Mesh Traffic Management
   740→
   741→- **Delta encoding:** Use delta encoding wherever possible to minimize transmission size
   742→- **Group representation:** Represent groups of people by distributions rather than individual data points
   743→- **DL-based compression:** Use deep learning for compression wherever possible (research required)
   744→- **Standardized messages:** Adjust standard observations, map tags, and standard messages depending on the nature of the emergency. Standard messages can be heavily compressed. Standardized messages always get priority over custom messages. Users should always see if their message was delivered and be notified to try a standardized message after a timeout.
   745→- **Traffic priority ordering:** EMS traffic goes first. Help requests before tags. Order all network traffic based on necessity. Prioritize showing EMS where stuck/help-needed people are.
   746→- **Simplified map download:** Can a user download a simplified map over the mesh if they don't have the app and service is down?
   747→
   748→### 6.3 Mesh Partnerships & Expansion
   749→
   750→- Can existing EMS networks be integrated later?
   751→- Starlink partnership for bandwidth augmentation
   752→- Ring partnership to extend mesh coverage and monitor for looters/arsonists
   753→
   754→---
   755→
   756→## 7. Account Types & Hierarchy
   757→
   758→### 7.0 Free vs. EMS-Integrated Versions
   759→
   760→The app is separated into a free public version and functionality that unlocks when the EMS of a town/county/region starts using the system. Goal: make it easy for users to advocate to whoever runs their local budget that they want EMS integration. The free version provides weather, hazard awareness, personal safety features, and community help. EMS integration unlocks official evacuation routes, real-time EMS coordination, dispatch layers, and the full stakeholder system.
   761→
   762→**User-reported hazard liability concern:** When a user reports something like a building collapse, other users should NOT assume EMS is on it. If the region is not directly covered by an EMS Beacon account, the app must warn the reporting user that EMS may not have received this report. Beacon should NOT automatically bridge to 911 (e.g., auto-texting 911) because: (1) EMS could hold Beacon accountable for bad information, and (2) EMS might not pay for Beacon services if they get reports for free. This needs careful design — the user should be guided to call 911 themselves if EMS is not on Beacon.
   763→
   764→### 7.1 Beacon Super Admin
   765→
   766→- Atlas access: all layers, all alerts, all versions, all code
   767→- Version history / update history
   768→- Beacon employee management
   769→- Client management
   770→- User/public management
   771→- Event records
   772→
   773→### 7.2 Beacon Employee / Account Manager
   774→
   775→- Assigned to client accounts
   776→- Access to client usage stats, setup tracking
   777→- Authorization to update map for clients
   778→- Authorization to view all map data
   779→- Can confirm special designation accounts
   780→
   781→### 7.3 Client Accounts (EMS / Government / Agencies)
   782→
   783→Set up by Beacon admin. Each standard EMS account has all functionality of public user accounts (so they can check on their families during emergencies). The interface is the same core skeleton but EMS sees team locations, different icons, dispatch markings, and additional tools. Includes:
   784→
   785→- **EMS Admin:** Full emergency management leadership, event declaration, zone drawing, resource management
   786→- **EMS Team Member:** Field operations, route confirmation, condition reporting
   787→- **Hierarchy manager:** Mirror client org structure (e.g., police hierarchy)
   788→- **Mutual aid agreements:** Cross-jurisdiction resource sharing with controlled visibility
   789→- **Team management:** Scheduling, overtime announcements, tracking
   790→- **Call-up systems:** Call all off-duty police/fire; call all retired police/fire
   791→- **Setup link sent to client for onboarding**
   792→
   793→### 7.4 Special / Partner Accounts
   794→
   795→Granted via invite code from EMS or Beacon employee. Each gets a special designation with unique functions:
   796→
   797→- **Utilities:** Can draw coverage zones, place infrastructure on map, mark personnel locations, post outage and repair updates
   798→- **Transportation:** Buses, trains, planes, helicopters, boats
   799→- **Plowers:** "Currently plowing" mode with real-time tracking, see each other's paths for coordination, receive plow requests from EMS/police
   800→- **National Guard / .gov agencies**
   801→- **Tornado trackers / storm chasers:** Image triangulation against radar, rain-wrapped reporting, search and rescue on request from EMS, report S&R activity and hospital transport
   802→- **Retired fire, law enforcement, EMS, CERT**
   803→- **Dispatch:** Special account; only dispatch members can mark on the dispatch layer
   804→- **Fire spotter:** Designated watchers; all fire personnel can draw fire lines, mark water drops, report conditions
   805→- **School principal:** Report school evacuation status to EMS, create/join parent-community group for trusted updates. Secondary contact collected in case primary isn't available.
   806→- **Other vulnerable population representatives:** Similar to school principal workflow for nursing homes, daycare, special needs homes, etc.
   807→- **Client admin:** Responsible for account setup and sending invite links to emergency personnel
   808→- **Fire chief / police chief:** Designate their hierarchy, keep a resource manager, make it easy for volunteer fire to say they are responding
   809→- **State emergency rep**
   810→- **State politician**
   811→- **Federal emergency rep:** Has an inventory of available resources
   812→- **Hospital rep:** Any nurse or staff can report hospital needs, available beds, supply shortages. Useful for mass casualty events, pandemics, post-hurricane coordination.
   813→- **Ski resort manager / ski patrol:** Mark avalanches, manage run conditions (see section 11.11)
   814→
   815→### 7.5 Public / User Accounts
   816→
   817→- Profile: name, forward-facing photo
   818→- Car: type, year, make, model (feeds into vehicle manager database: length, width, height, turn radius, number of seats, 4WD capability). Users can manually input vehicle dimensions or select a vaguely similar vehicle if they don't know exact make/model. Should ask about snow tires or other capabilities. Public users and police set default and presaved vehicles; asked to report which car they're in when an emergency notification fires.
   819→- Home location + saved locations (also used for precaching; if someone spends a lot of time at a location where a known sex offender lives, they should not be eligible to pick up someone's kids in an emergency)
   820→- Emergency contacts (import contacts, invite to Beacon)
   821→- Disabilities, elderly status, children, animals
   822→- Retired fire/police/EMS/CERT/plower self-identification
   823→- **Trusted neighbors system:** Users can put out a request to their building that they need someone they can trust for help in an emergency. Loved ones can select a trusted neighbor to help evacuate their grandma. Users can designate contacts as trusted neighbors. Include EMS accounts.
   824→- Trust contact requests for assisting elderly
   825→- Location sharing settings (with legal agreements)
   826→- Easy "share location" with specific EMS personnel (like sharing with a contact)
   827→- ID verification module (verify ID matches reported address)
   828→- Next of kin / emergency contacts visible to admin in emergencies
   829→- Battery level sharing (low battery warning so loved ones don't worry when someone stops responding)
   830→- Equipment and skills: snow plow, excavator, bulldozer, bolt cutters, ladder, surfboard, swimming ability, boat access
   831→- Car model specs automatically looked up from make/model for routing and evacuation calculations
   832→- Vehicle without (ask users when collecting disability/household info)
   833→
   834→### 7.6 Groups
   835→
   836→- Group manager for public
   837→- Suggested groups module
   838→- Private family group that works simultaneously with EMS account (see family locations, check if loved ones are safe)
   839→
   840→---
   841→
   842→## 8. Contacts / Stakeholder Database
   843→
   844→A major system component. Pre-populated before emergencies as part of EMS onboarding.
   845→
   846→### 8.1 Purpose
   847→
   848→- Database of contacts/representatives for stakeholders during emergencies: landowners, business owners, bus companies, school principals, utility reps, etc.
   849→- When fire risk is high: who owns the land with gates and private evacuation routes so they can be told to leave gates open or at least be aware
   850→- EMS-specific users can request location from accounts during active events
   851→
   852→### 8.2 Setup Workflow
   853→
   854→- EMS sends invite code over SMS or email to the representative
   855→- Representative creates account (or adds special designation to existing account) via the link
   856→- Primary and secondary contacts collected (in case primary isn't available on the day)
   857→- Representatives for all schools and vulnerable populations should be registered in advance
   858→
   859→### 8.3 Contents
   860→
   861→- Landowner/leaseholder contacts (linked to property lines layer)
   862→- Bus company contacts
   863→- School principal contacts (primary + secondary)
   864→- Nursing home/daycare/special needs home contacts
   865→- Utility provider contacts
   866→- Tow company contacts
   867→- Transit authority contacts
   868→- Hospital representative contacts (for mass casualty, pandemic, post-hurricane bed/supply coordination)
   869→- Greyhound / major bus company contacts
   870→- Cruise line / port authority contacts
   871→
   872→---
   873→
   874→## 9. Event Declaration & Management
   875→
   876→### 9.1 Event Declaration
   877→
   878→- EMS can manually declare an event
   879→- Automatic thresholds trigger event declaration and start data storage
   880→- Event triggers adjust suggested map layers (e.g., activate oxygen depletion, heat layers for wildfire)
   881→- Default layers should account for regional disaster proneness
   882→
   883→### 9.2 Event Data Storage
   884→
   885→- All event-specific input stored in event records (not base map) unless it represents permanent change
   886→- Reports of destruction/damage that affect base map get pushed to base map
   887→- Hazard sightings, status updates, conditions — stored in event records
   888→
   889→### 9.3 EMS Event Tools
   890→
   891→- Draw zones for team operations and send alerts to drawn areas (polygon-based)
   892→- Mark affected areas
   893→- Designate road areas to keep clear for operational purposes (beyond hazard-based routing)
   894→- Manually mark location of backup units or equipment not tracked on Beacon
   895→- Request help from users near a location via geofenced notification
   896→- Generate secure backup codes for non-Beacon departments/users to temporarily join the effort and appear on the same map
   897→
   898→---
   899→
   900→## 10. EMS / Admin Capabilities
   901→
   902→### 10.1 Zone & Route Management
   903→
   904→- Draw zones for team operations
   905→- Confirm or deny safe zone predictions
   906→- Set formal evacuation routes
   907→- Send alerts to drawn area (polygon-based, shape changes based on source)
   908→- Mark affected areas
   909→- Redesignate traffic directions from dashboard (e.g., make a two-way road two lanes in one direction)
   910→- Show slowed bottlenecks to all users so they can make their own decisions
   911→- All first responders can write or confirm official evac routes as they open up (not dependent on a central figure to keep up)
   912→- Assign meeting points in advance of emergency
   913→- Water-based evacuation points
   914→- Mass evacuation staging spots (safe during emergency, accessible after disaster passes)
   915→- Designate road areas to keep clear for operational purposes
   916→
   917→### 10.2 Resource & Team Management
   918→
   919→- Manage team schedules
   920→- Request resources
   921→- Resource manager: vehicles of all kinds on hand, people on shift, link to backup manager
   922→- Team vehicle manager
   923→- Manage backup requests and issue visibility codes
   924→- Generate codes for backup resources to see EMS view instead of public view
   925→- Manually mark location of backup units or equipment not being automatically tracked
   926→
   927→### 10.3 Backup & Mutual Aid
   928→
   929→- Backup manager / who's in charge manager
   930→- Shows mutual aid agreements
   931→- Facilitates communications between all stakeholders
   932→- Provides a list of backup resources
   933→- Brings state, emergency, and federal stakeholders into the picture when an emergency is declared
   934→- **Backup module:** Generate secure codes shared with other departments or non-Beacon users. Coded users temporarily join the effort; their location shown on the same map.
   935→
   936→### 10.4 Intelligence & Reporting
   937→
   938→- Ask public for help
   939→- Confirm structures destroyed
   940→- Geofence in real-time and ask users at that location to report conditions
   941→- Admin can see next of kin / emergency contacts during emergencies
   942→- **Can A reach B model:** Determine if resources can be connected with people who need them
   943→- Utility crew tracking and repair processing queue
   944→- EMS "unable to reach location" reporting
   945→- Evacuation confirmation module: ask users if they plan on staying or have evacuated so EMS doesn't worry about empty houses. Layer shows if evacuator has retired fire/police designation.
   946→- Beacon coverage check: if area not covered by Beacon, connect with 911
   947→- Designate zones for limited all-terrain vehicles to cover when ambulances can't get around
   948→- Dispatch public for welfare checks, driving people places, and other low-priority tasks when EMS is stretched
   949→- Ask public for high-priority tasks if the ATV group can't reach people immediately
   950→- Vehicle accessibility model: judge where vehicles can get at a given time given current conditions. Know where EMS can and can't reach so public users with 4WD/snow tires can fill the gap (Buffalo blizzard precedent: citizens coordinated 30+ rescues when EMS couldn't reach people)
   951→- Track who is actively rescuing someone vs. who has no one coming (EMS triage priority)
   952→- 911 call locations displayed prominently
   953→
   954→---
   955→
   956→## 11. Public User Features
   957→
   958→### 11.1 Core Features
   959→
   960→- Add images/reports to incidents
   961→- Ask nearby public for help
   962→- Regional alerts from EMS, NWS, other official sources
   963→- Weather simulator: dial forward in time to see forecast progression
   964→- Current weather display
   965→- Official alerts display
   966→- Status system: confirmed evacuation, stuck, needs help (with severity), notifications/triggers to ask user
   967→- If you see flames not on the app, reminder to mark them on the map
   968→- Contradict/dispute map sightings with evidence (photos)
   969→
   970→### 11.2 Evacuation & Safety
   971→
   972→- Evacuation routing (standard + low visibility)
   973→- Routing to someone willing to take you in (tracking both locations + account activity for safety; abuse detection for the "ask for help" system)
   974→- Shelter sharing: let people open their shelter to nearby users (tornado shelters etc.), report available capacity
   975→- Charging station manager (phones are the lifeline)
   976→- Vehicle evacuation through fire guidance (what to grab: axe, etc.)
   977→- Go bag guidance
   978→- Scanning all important documents guidance
   979→- Water refuge guide
   980→- Safe zone evacuation guide
   981→- How to break down a fence
   982→- Near a boat guidance and watercraft evacuation
   983→- Route impassable propagation: user marks route impassable, propagated along mesh. User given guidance including driving backwards, u-turns, or k-turns when traffic allows (check road width and cars behind). Alert everyone behind to back up if someone in front needs to reverse.
   984→- 2WD drivers routed to less obstructed paths
   985→- Advise people without cars to go to streets where vehicles are evacuating
   986→- Routing built on outdated data warning — use caution
   987→- Encourage carpooling with strangers when lives are at stake. Make it clear it's to save lives.
   988→- People on the side (out of the direct path of flame spread) take slower side routes so people closer to the fire can get away
   989→- Count exit routes (standard routes, off-road but low risk, high risk) and route users to the route with fewest people relative to escape route bandwidth. In simulations, assume one less car on other routes so traffic moves faster.
   990→- Allow pulling over on shoulder, illegal u-turns, and driving backwards in EXTREME life-threatening situations (e.g., tornado headed your way). Driving backwards is last possible option.
   991→- Once users evacuate the disaster zone, system navigates them around it to emergency contacts
   992→
   993→### 11.3 Animal Rescue Workflow
   994→
   995→- User clicks on their home on the map and reports "my dog is in my apartment, can someone get them?"
   996→- Include description, hide-a-key location, any access info
   997→- Nearby verified users are alerted and can offer to help
   998→- Dog owner sees the verified neighbor offering, accepts the offer
   999→- Messaging opens for hide-a-key details
  1000→- Once offer is accepted, helper must share location automatically for a few hours or until animal is returned
  1001→- System reports if someone is attempting rescue, if animal is confirmed safe, where animal is, who has it
  1002→
  1003→### 11.4 Blizzard & Shelter-in-Place Features
  1004→
  1005→- Tagging specifically for sheltering in place and requesting resources
  1006→- Reporting visibility, road conditions, snow drift levels, wind levels
  1007→- **"I'm stuck" button:** Allows nearby users to offer shelter
  1008→- **"I'm stuck but safe" status:** Track people sheltering in a temporary location who can't get home
  1009→- Request basic help from neighbors or people near a location (e.g., let the dogs out while someone is stuck at work/hospital)
  1010→- Offer heat to neighbors who mark that they have no access to heat
  1011→- Carbon monoxide warnings: people die sheltering in cars when exhaust gets covered by snow, or burning materials indoors without understanding CO/air quality risks. User guides should be available.
  1012→- Power is critical: track who has power, who has a fireplace or alternative heat source
  1013→- Report sidewalk conditions and when driveways are cleared
  1014→
  1015→### 11.5 Search & Rescue
  1016→
  1017→- Send Bluetooth beacon to searchers in rubble piles
  1018→- Start beeping and displaying directional arrows when searcher is in Bluetooth range
  1019→- Directional guidance systems: internal evacuation guidance, search and rescue guidance, and standard outside GPS guidance (on-road vs off-road) should all be styled consistently. Related features and underlying path algorithms vary but the UI pattern is the same.
  1020→
  1021→### 11.6 Radiation Event Features
  1022→
  1023→- General radiation guidance for users
  1024→- Building radiation protection ratings: some buildings are safer than others
  1025→- Route to deepest subway stations if trains are still running
  1026→- Concrete building shelter-in-place guidance for smaller-scale events
  1027→- Accept Geiger counter readings from users who have them
  1028→- Radiation user guides (shielding, exposure limits, when to shelter vs. evacuate)
  1029→
  1030→### 11.7 Social Features
  1031→
  1032→- "Stories of people helping people"
  1033→- Events (need help — with severity levels; everyday needs like diapers, dog walk)
  1034→- Banner: "someone needs help" (e.g., old lady stuck)
  1035→- Contacts management
  1036→
  1037→### 11.8 Navigation
  1038→
  1039→- Map page
  1040→- Groups
  1041→- Contacts
  1042→- Help page
  1043→- Around the world hazards
  1044→- My people
  1045→- My saved locations
  1046→
  1047→### 11.9 Interface Design
  1048→
  1049→- Visual bar describing regional weather / emergency / natural disasters
  1050→- Within emergency view: evacuation module with routes and shelters
  1051→- Left-hand side menu: resource/team breakdown, messages
  1052→- "Use at your own risk" banner at top — user must swipe to dismiss
  1053→
  1054→### 11.10 Vehicle Manager Module
  1055→
  1056→A standalone module tracking all current vehicles on the market with sizes, capabilities, and turn radiuses:
  1057→
  1058→- Auto-lookup from make/model/year for length, width, height, turn radius, seat count, 4WD capability, undercarriage clearance
  1059→- Manual input option for custom vehicles or if user doesn't know exact make/model (select a vaguely similar vehicle)
  1060→- Ask about snow tires, chains, or other special capabilities
  1061→- Includes all-terrain vehicles that police use (e.g., Buffalo NY police have special snow vehicles that respond to 911 calls when ambulances can't get through — they draw zones, split into groups, and patrol)
  1062→- Undercarriage clearance relevant for extreme scenarios (driving over recently burned brush areas that are still hot)
  1063→- Public users set default vehicles and presaved vehicles they might be in; asked to report which car when emergency notification fires
  1064→- EMS vehicle tracking feeds into resource manager (what equipment and vehicles are on hand)
  1065→- Plan to manage public and private transit in the base map with schedules: all bus stations, Greyhound terminals, cruise ship ports where large ships can dock, all transit hubs. After Katrina, people needed buses to evacuate — need to know where all transit options are.
  1066→
  1067→### 11.11 Ski Resort Module
  1068→
  1069→- Model to scan ski maps and determine runs
  1070→- Suggest boundary polygon for a ski area that can be adjusted by ski patrol
  1071→- Users tracked when they come down a run and asked how conditions were
  1072→- Users can report needing help to ski patrol
  1073→- Report if runs are open/closed
  1074→- Report avalanche-risky snow
  1075→- Ski patrol side: see predicted avalanche risk based on snowpack conditions
  1076→- Mark where they did explosions and how much runoff was triggered (indicating whether they got all the unstable snow)
  1077→- Ski patrol as special account with on-mountain coordination tools
  1078→
  1079→### 11.12 Privacy & Location Controls
  1080→
  1081→- Beacon stores user location at all times but only shares with government when something happens
  1082→- Explain to users exact parameters for data release (e.g., what constitutes a car crash)
  1083→- Dedicated page controlling the circumstances where government gets location (toggle on/off, link to legal releases)
  1084→
  1085→---
  1086→
  1087→## 12. Map Processing Tools
  1088→
  1089→- **Atlas map processor:** The core multi-source fusion pipeline
  1090→- **Automatic map processor:** For specific areas like ski resorts
  1091→- **Manual map processor:** For town EMS personnel to mark evacuation regions, meeting points, shelters
  1092→- **Map layers allow manual adjustment with a verification process**
  1093→- **Police/fire/jurisdictional layers allow EMS to configure and verify boundaries**
  1094→
  1095→---
  1096→
  1097→## 13. Modeling & Simulation
  1098→
  1099→### 13.1 AI-Enhanced Offline Hazard Modeling
  1100→
  1101→- Train deep learning models on physics-based simulations
  1102→- Compress models to work offline on phones
  1103→- Deployment tiers: on-phone (compressed) vs. advanced (server)
  1104→
  1105→### 13.2 Real-Time Sensor Integration
  1106→
  1107→- User barometric pressure data
  1108→- Other phone sensors
  1109→- Update and enhance models for flooding, fire spread, etc.
  1110→- If communication lines stay open: maintain shared real-time understanding of disaster; who needs help, where
  1111→- **Street-level perception model:** Phone cameras compare live views against pre-computed aerial LiDAR priors to detect fallen trees, collapsed structures, flooding, and debris in real time (see Section 3.5)
  1112→
  1113→### 13.3 Specific Models
  1114→
  1115→- **Regional risk calculator:** Pre-computed per-hazard risk scores (earthquake: high, tsunami: high, etc.)
  1116→- **Mass evacuation simulation:** Individual navigation algorithms given time-of-day of event, number of people, open roads, available transit (buses, trains)
  1117→- **Mass evacuation planner:** Given X people, Y open roads, Z trains and buses — what is the outcome?
  1118→- **"People are dead" model:** Phone overheated / stopped transmitting, inference about casualties
  1119→- **Passability model:** What vehicles can traverse where, updated post-event
  1120→- **Can A reach B model:** Route feasibility between resources and people who need them
  1121→- **Population estimation:** Time-of-day aware (offices empty at night, schools empty on weekends)
  1122→- **Timeline manager:** Future hazard projections over time
  1123→- **Jupiter hazard models:** Weather forecasts, integrating sightings, models with projections. Low intensity versions for no-service times. Specify what should be cached on phone given the active hazard.
  1124→- **Traffic stuck detection:** Automatically sense where evacuees are getting stuck and which evacuees are most at risk
  1125→- **Exit route optimization:** Count possible exit routes (standard, off-road low risk, high risk). Route users to the path with fewest people relative to escape bandwidth. Consider gradient descent for routing.
  1126→- **Community access reports:** Communities can register changes in access ways (less weight than EMS confirmation)
  1127→
  1128→### 13.4 Low-Coverage Worldwide Flood Tracking
  1129→
  1130→- GloFAS as baseline: modeled flood forecasts for large river flooding (slow rise over days)
  1131→- Monitor Sentinel-1 for flood extent detection during events
  1132→- Integrate SWOT data as it becomes available (more detailed than other altimetry)
  1133→- Satellite altimetry (Sentinel-3, Jason-3, SWOT) only works on large rivers
  1134→- Flash flooding (hours): prediction only using rainfall + terrain + watersheds via NASA GPM
  1135→- Satellite-based river level estimation: compare visible terrain on satellite around rivers with underlying terrain model to gauge water level. Simulate satellite view at different water levels, find the image that matches closest, and refine with gauge data.
  1136→
  1137→### 13.5 Storm Chaser Module
  1138→
  1139→- Triangulate tornado locations from official storm chaser imagery + location data
  1140→- Cross-reference with radar data
  1141→- Account for all observers' positions and reports
  1142→
  1143→---
  1144→
  1145→## 14. Labeling, Training & Partnerships
  1146→
  1147→### 14.1 Data & Training
  1148→
  1149→- Models require labeled datasets
  1150→- Outreach to institutions that have training data
  1151→- Computer vision training for: building identification, store logo recognition, vegetation classification, worship building identification, sign reading
  1152→- Self-supervised learning approaches (JEPA) for street-view analysis
  1153→- Synthetic training pairs from aerial LiDAR reprojection for LeJEPA fusion cross-modal models in areas without Mapillary coverage (see Section 3.5)
  1154→
  1155→### 14.2 Strategic Partnerships
  1156→
  1157→- **Ring:** Fire monitoring, mesh network improvement, property protection (identify looters and arsonists)
  1158→- **Starlink:** Bandwidth augmentation for mesh networking
  1159→- **Nvidia incubator:** Compute resources and access to models
  1160→- **Microsoft incubator:** Compute resources and access to models
  1161→
  1162→---
  1163→
  1164→## 15. Future / Later Features
  1165→
  1166→- **Evacuation/disaster simulator:** Set parameters for disaster type, blocked roads. Judges: how many people died, property destruction costs, infrastructure damage.
  1167→- **Demos system:** Run multiple accounts at once and screen-record for demonstration purposes
  1168→- **Full sensor fusion from all user devices during active disasters**
  1169→- **Initial test alert:** Send test alert telling people to download the app
  1170→- **Smoke alarm detection integration** (tentative — needs evaluation)
  1171→
  1172→---
  1173→
  1174→## 16. Legal & Safety Considerations
  1175→
  1176→- Legal agreements for location sharing
  1177→- Emergency contact sharing agreements
  1178→- Legality assessment for all third-party data sources and CV models
  1179→- ID verification for address confirmation
  1180→- Way to verify retired police/fire credentials
  1181→- Abuse detection for "ask for help" / "take someone in" features (track locations + account activity)
  1182→- When users help strangers, locations tracked for record-keeping, liability, and deterring criminal behavior
  1183→- Enhanced ID verification for stranger interactions: Face ID matches government ID, address matches location. Exact address match = extra comfort for neighbor help. Regional match = still relevant for letting a stranger in during emergencies.
  1184→- Before letting someone into your home: preliminary access to their name, image, and info so people can better judge
  1185→- Sex offender registry check and any available background checks before routing unknown people to homes
  1186→- Location frequency analysis: if a user spends significant time at a location where a known sex offender lives, that user should not be eligible to pick up someone's kids in an emergency
  1187→- Minimize chances of sending known offenders into people's homes under the guise of needing shelter
  1188→- Flammability display approach: show fire certainty + flammability heatmap rather than "safe zones" to avoid liability
  1189→- Privacy controls on visibility (who can see what, controlled by bandwidth + admin settings)
  1190→- Location data stored at all times; shared with government only during events with specific defined parameters
  1191→- User-facing page with toggles controlling when government receives location, linked to legal releases
  1192→- "Use at your own risk" banner requirement on all hazard views
  1193→- Last resort evacuation locations: EMS-only visibility to limit liability; EMS manually decides whether to share with public
  1194→- Unorthodox evacuation routes: EMS decides whether to publicize (liability concern)
  1195→
  1196→---
  1197→
  1198→## 17. Development Approach
  1199→
  1200→### 17.1 Agentic Team Development Planning
  1201→
  1202→1. Start by categorizing major components into as distinct of units as possible
  1203→2. Move a layer down and do the same thing, and so on until the smallest functions are identified
  1204→3. Break it down as much as possible
  1205→4. Each agent should identify how each appendage on the lowest level is connected
  1206→5. File paths and other functions that might not have been created yet should go at the top of the code file
  1207→6. File paths can be initialized in code; overview sentence for the function and other custom functions referenced should be documented
  1208→
  1209→### 17.2 Major Development Modules
  1210→
  1211→Sections to develop separately (each is its own module/team):
  1212→
  1213→- **Base Map Builder:** Everything for updating and maintaining the base map. Map developer on Beacon employee side, pushed to users.
  1214→- **Hazard Modeler:** Each hazard developed independently. Each hazard has: risk layer that evolves, model for ongoing hazard, shelter/evacuate layers, resource layers for EMS. General pattern: physics-based models → DL surrogates → compressed for low-bandwidth/offline use.
  1215→- **Mesh Networking:** Including emergency traffic access and Starlink partnership
  1216→- **Permissions Module**
  1217→- **Legal Notices Module**
  1218→- **Vehicle Manager Module:** Market vehicle database + user vehicle management + EMS resource tracking
  1219→- **User Accounts / Trusted Neighbors**
  1220→- **ID Verification Module:** Face verification, background checks, sex offender registry
  1221→- **Location Calculator**
  1222→- **Evacuation Engines:** Routing — mass, individual, inside building, outside (low visibility)
  1223→- **Search & Rescue Functions**
  1224→- **Notifications:** Automatic alerts + custom alerts from EMS
  1225→- **Simulators:** Disaster simulation + evacuation simulation
  1226→- **Normal Weather Interface:** Forecasts, weather simulator
  1227→- **User Input Module:** Manual reporting + automatic sensor input
  1228→- **Ski Resort Module:** Run mapping, condition reporting, avalanche tracking
  1229→- **Special Accounts Module:** All designation types and their unique functions
  1230→- **Event Manager Module:** Automatically creates events for designated hazards, gives EMS control
  1231→- **Beacon World Model:** Goal-engine trained on base map + hazard data + historical outcomes to guide emergency actions using pack-hierarchy logic (see Section 19)
  1232→
  1233→### 17.3 Company Standards
  1234→
  1235→- **File naming:** Descriptive file names. The goal is to be able to follow the codebase.
  1236→- **Company mission:** Save lives, and ideally mitigate disasters with the assistance of all that technology has to offer.
  1237→- **Documentation standards:** Standards for documenting modules (standard file to be added)
  1238→- **Package question:** Should Beacon make its own package like numpy but with Beacon functions? TBD on whether there is real benefit.
  1239→
  1240→---
  1241→
  1242→## 18. Brand
  1243→
  1244→- **Primary color:** #0B0F2A (dark navy)
  1245→- **Secondary color:** #0097B2 (teal/cyan)
  1246→
  1247→---
  1248→
  1249→## 19. Human Intelligence vs. LLMs — Beacon World Model Foundation
  1250→
  1251→This section documents the foundational philosophy for Beacon's decision-making architecture. It serves three purposes: (1) guiding the system's algorithmic architecture toward human-like goal management rather than pure prediction, (2) informing the training of the Beacon World Model that uses base map and hazard data to guide emergency actions (save the cat, save the baby, flee to safety), and (3) laying groundwork for future robotic systems trained on Beacon data to think in line with the best of humanity.
  1252→
  1253→### 19.1 How Humans Actually Think (vs. How LLMs Simulate Thinking)
  1254→
  1255→**Human perception is goal-directed, not predictive.** Humans see an object and immediately associate what they can extract from that object to serve survival — first their own, then their pack's. This is fundamentally different from LLMs, which simulate final actions without modeling the underlying process. The human cognitive loop is: perceive → assess utility toward active goals → act. LLMs skip the goal assessment layer entirely.
  1256→
  1257→**Humans manage goals, not sequences.** The core of human intelligence is not "see one thing and predict the next." It is to manage goals — to figure out which goals are worth pursuing given the current state of the world and the needs of the people around them. This distinction is critical for Beacon's architecture: the system should not just predict what happens next, it should evaluate which goals matter most right now and route toward them.
  1258→
  1259→**Humans learn from observed consequences to others.** Humans don't need to personally experience a fire to understand fire is lethal. They observe what happens to others and weight the implications for their own pack at a near-catastrophic level. Example: observing that people die in fires should create an extreme weight against any action that could lead to that outcome for the pack. Beacon's World Model should similarly learn from historical disaster data at asymmetric weights — mortality events should dominate the loss function.
  1260→
  1261→### 19.2 The Pack Hierarchy Model
  1262→
  1263→Human decision-making operates within a hierarchy of packs. Beacon's goal engine should mirror this structure:
  1264→
  1265→**Layer 1 — Dependents (highest priority):** People who are fully dependent on an individual get the greatest consideration. Parents consider their children's survival above all else. The system should understand that a parent will not evacuate without their children and should never route a parent away from a dependent.
  1266→
  1267→**Layer 2 — Immediate pack (family):** Most of an individual's interest in their own survival is to help their loved ones. Self-preservation is not selfish — it's instrumental to serving the immediate pack. The system should factor in that a user's willingness to take risks is bounded by their obligations to their closest pack.
  1268→
  1269→**Layer 3 — Extended pack (friends, neighbors, community):** Humans are trained to value the survival of the pack they are currently with. Obligations to this pack might temporarily supersede obligations to the closest pack. Example: a firefighter on duty serves the community pack even at some cost to their family pack, but within limits.
  1270→
  1271→**Layer 4 — Wider pack (town, region, humanity):** Individuals don't take personal risks for a wider pack that endanger their ability to serve their more immediate pack. The system should not ask a parent to take heroic risks for strangers if it means orphaning their children.
  1272→
  1273→**Self-preservation as pack service:** A human wants to survive because they see themselves as useful to the pack. A person who felt they were harmful to the pack would not prioritize self-preservation. This is not selfishness — it is the primary model of human intelligence. The urge to serve the group supersedes everything, and for people seen as part of one's pack, humans start to see objects purely in terms of what can serve those people's survival, completely disregarding their own needs.
  1274→
  1275→**The psychopath exception:** Psychopaths lack this secondary intellectual instinct — the pack-service layer. They may feel superior, but they are actually missing the primary model. This is relevant for system design: Beacon's World Model should be trained on the pack-serving majority, not edge cases that optimize for individual gain.
  1276→
  1277→### 19.3 Implications for Beacon's Architecture
  1278→
  1279→**Goal engine, not prediction engine:** Beacon's core decision system should be structured as a goal manager, not a next-token predictor. Given the current state of the world (base map + hazard data + user positions + pack relationships), it should evaluate: what goals matter most right now, for whom, and what actions serve those goals?
  1280→
  1281→**Asymmetric loss weighting:** Deaths and injuries should be weighted at catastrophic levels in the loss function. The model should be extremely conservative about any routing or recommendation that could lead to mortality, reflecting how humans weight observed death against all other considerations.
  1282→
  1283→**Pack-aware routing:** Evacuation routing should account for pack structure. Don't route family members apart. Don't ask a parent to leave a child behind. Understand that people will not follow "optimal" routes that separate them from their dependents — route around this reality, not against it.
  1284→
  1285→**Dependency graph:** The system should maintain a dependency graph: who depends on whom. Children, elderly, disabled, pets — and who is responsible for each. This should directly influence evacuation priority, routing, and resource allocation.
  1286→
  1287→**Obligation-bounded risk:** The system should not ask users to take risks that exceed their obligation level. A parent should not be dispatched for community welfare checks. A single person with no dependents can be asked to help neighbors. The risk/obligation ratio should be computed per user.
  1288→
  1289→**Temporary pack reassignment:** During emergencies, people form temporary packs (a group of strangers trapped together becomes a pack). The system should recognize this — when users are grouped together in a crisis, their behavior shifts to pack-serving mode for that group. Route and communicate accordingly.
  1290→
  1291→### 19.4 Beacon World Model Training
  1292→
  1293→**Training objective:** Use all available Beacon data (base map, hazard models, historical disaster outcomes, user behavior during events) to train a world model that can guide emergency actions. The model should learn to reason about goals, not just patterns.
  1294→
  1295→**Decision categories the model should learn:**
  1296→- Save the dependent (baby, child, elderly, pet, disabled person)
  1297→- Flee to safety (self-preservation in service of pack)
  1298→- Help the vulnerable (extend aid within obligation bounds)
  1299→- Sacrifice comfort for survival (e.g., ram a fence, drive through fire, shelter with strangers)
  1300→- Accept loss (triage decisions — when you can't save everyone, prioritize dependents and the most vulnerable)
  1301→
  1302→**Human-aligned training signal:** Even if the operational Beacon World Model doesn't become fully autonomous, training a system on this data and this philosophy creates a foundation for future AI and robotics that thinks in line with the best of humanity. The core principle: humans are on earth to bond with and help each other, and the system for our intelligence is designed to ultimately serve that goal.
  1303→
  1304→**Future application:** Robotic systems trained on Beacon's World Model data should inherit this pack-hierarchy goal structure. A rescue robot should prioritize the same way a human rescuer does — children first, then the most vulnerable, then the wider group — bounded by its ability to continue operating (self-preservation as instrumental, not terminal).
  1305→