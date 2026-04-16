### 4.2 Roads & Transportation

## Still Needs Research
- Private road owner contact database management and maintenance
- K-turn vs. U-turn possibility indexing by vehicle type (threshold calculations)
- Fence rammability assessment (material, height, post spacing)
- Street crowding detection confidence and seasonal variation
- Traffic congestion prediction model training on evacuation scenarios
- Pile-up risk zone mapping and speed/visibility correlation
- Snow plow route tracking system integration
- Driveway accessibility evaluation post-disaster
- Train schedule reliability and operational status during events
- Road shoulder vs. pavement identification at scale

- Formal road layer: one-ways, number of lanes, shoulders, dirt lots, parking lots, private roads (with owner contact lookup)
- **Number of lanes:** LiDAR + satellite for measurement. Police accounts can designate a road as one-way during an evacuation.
- **Road width (LiDAR-measured):** Width at all points along roads for vehicle clearance calculations
- Bridges
- **Overpasses layer:** Height limits (impassable by tall vehicles), collapse susceptibility for earthquakes. Identified via LiDAR clearance + DOT records.
- Gates: locked gates + database of owners. Open gates layer during events. Confirmation gates are open/blocked access layer.
- Passability model: what can a standard 2WD, 4WD, or fire truck traverse; updated after events imply permanent destruction or long-term damage. Adapts to active hazard (plowed roads become passable during blizzard; fallen trees reroute during wildfire).
- **U-turn possibility:** LiDAR width + terrain slope. Where full 180-degree turn is possible. Indexed by vehicle size via vehicle manager.
- **K-turn possibility:** LiDAR width + backing space + terrain slope. Where 3-point turn is possible. Linked to vehicle manager specs so system knows which vehicles can make each k-turn.
- **Dirt roads / gravel roads layer:** Identified via terrain slope analysis (primary) and LiDAR vegetation clearing patterns (secondary). Includes drivable dirt terrain not typically considered roads.
- **Driveways:** LiDAR for length/width, terrain for slope. Includes driveway clearing status (user-reported).
- **Street crowding / illegal parking:** LiDAR-detected parked cars reducing actual drivable width in emergencies
- **Pavement layer:** Roads + driveways + shoulders + parking lots = unburnable area. Important for fire routing.
- **Public parking:** Pavement + dirt lots. Unburnable during fires.
- **Private roads/parking:** Part of private roads layer. Includes gate status.
- **Driveways that are fence-rammable:** Long enough to back up and facing a fence (not wall). Relevant for emergency vehicle access.
- Transit layers: public/private bus terminals, Greyhound terminals, planes, boats (with boat type model), subway maps, train schedules (user reports + official contacts to determine if trains are running), cruise ship ports where large ships can dock
- Train/bus/ship depots, marinas
- **Docks layer:** Identified via satellite + LiDAR (structure) and OSM (leisure=marina). For water evacuation and maritime resource staging.
- **Boats/ships nearby layer:** Tracked vessels for water evacuation feasibility
- Tow companies
- Snow plow routes (plowers turn on tracking setting so wherever they go, map marks when it was last plowed; special "request plow" button for police)
- Road shoulders, sidewalks, bike lanes
- Sidewalk conditions (user-reported)
- Flat open fields and drivable terrain not typically considered roads
- Fence types and most rammable sections (chain link for bolt cutters, weakest points for vehicle ramming)
- **Barriers layer:** Fences, walls, guardrails, hedges, boulders — places vehicles can't drive through. Primary: street view (material type visible); secondary: LiDAR (height, extent).
- Road hazards layer
- Trees at risk of blocking road if they fall
- **Traffic congestion prediction layer:** Draws from traffic model, identifies areas that get congested — proxy for evacuation congestion/bottlenecks
- **Pile-up risk zones:** Areas with high crash/pile-up likelihood based on road geometry, visibility, and conditions
- Public transit layer (buses, trains, subway schedules, ferries)

