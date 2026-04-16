# Backcountry Hazard Model

## Risk Layer

Multi-hazard overlay integrates avalanche, weather, terrain, and wildlife hazards. Avalanche hazard from NOAA Avalanche Forecast Centers (10 US regions) combining snowpack stability indices. Skier Acceptance Level (SAL): 1-5 scale. Weather hazard calculated from National Weather Service forecast data (temp, wind, precip). Terrain slope/aspect extracted from USGS DEM (10m resolution). Composite risk R = (SAL × Weather_Factor × Terrain_Exposure) / 100. High-risk zones: SAL>3, wind>35mph, slope 30-45 degrees.

## Ongoing Hazard Model

Real-time avalanche forecast from NOAA Avalanche Forecast Centers updated 0600 MST daily. Snowpack stability assessment: Rutschblock test data, shear quality tests, weak layer identification. Critical height index (CHI) calculated from SNOTEL stations (900+ automated stations measuring SWE, snow depth, temp). ECMWF weather model (0.25-degree resolution) provides 10-day trend. Lightning density from NOAA Total Lightning Network (15-min updates). Temperature lapse rate: -6.5°C/km from valley reference stations.

## Spread/Evolution

Slab avalanche trigger: cohesion loss in weak layer when shear stress τ > c + μσ_n. Propagation velocity: 20-60 m/s in open slopes. Runout distance D_reach = H × tan(atan(H/L) - δ) where H = vertical drop, L = path length, δ = angle of repose. Typical runout 50-500m beyond slope break. Multiple slides can merge (powder concentration), increasing flow velocity 20-40%. Avalanche temperature increase: 2-5°C friction heating. Powder cloud extends 100-300m lateral distance.

## Lethality

Burial depth >1.5m fatal in 60% of cases without excavation. Asphyxiation onset: 10-15 minutes in compacted snow. Avalanche speed >20 m/s: blunt trauma fatal in 90% (internal injuries). Trauma injuries (broken ribs, spine) occur in 25-35% of burials. Hypothermia in Colorado snowpack (avg -8°C): survival decreases 15%/hour post-burial. Exposure multiplier: group burial (3+ people) reduces rescue response time by 30% due to companion excavation.

## Safe Zones

Avalanche-crossed slopes >45 degrees or <30 degrees safe from slab release (either too steep or insufficient slope). Ridgelines above terrain traps safe unless cornice collapse. Forest zones (tree-locked slopes) reduce hazard by 70% (distributed load stops slab growth). Exposed ridges safe from slides, hazardous from wind/exposure. Designated backcountry hut zones rated safe if sited on stable terrain (USFS survey). Elevation above treeline transition reduces wood hazard but increases exposure/cold.

## Evacuation

SAL 4-5 or forecast avalanche: recommend area closure. Evacuation trigger: sustained human-triggered avalanche activity. Route: descend to lower elevation (reduce slope), seek forest. Pace: 10-20 min to safe zone (2-3 km lateral). Assembly point: established huts, ranger stations. Radio evacuation notification: Garmin inReach satellite messaging (15 min latency, global coverage). Coast Guard/Civil Air Patrol coordination for SAR. Helicopter rescue capability in 30-120 minutes depending on weather.

## Vulnerability

Backcountry skill level (novice vs. expert): 8x difference in avalanche risk perception. Foreign nationals: 3.2x higher fatality rate (unfamiliar terrain). Solitary travelers: 45% higher casualty rate (no companion rescue). Skiers with transceivers + probe + shovel: 65% survival rate if buried; without equipment: 5%. Physical fitness: poor cardio capacity increases exposure time to elements (2-3x fatigue). Age 20-35: 60% of avalanche fatalities (risk-taking behavior).

## Secondary Effects

Buried fellow travelers: 25% of incidents involve victim-rescuer dynamics (helper becomes victim). Avalanche-dammed streams: sudden release floods downstream 48-72 hours later. Slope destabilization: secondary slides trigger within 3-7 days post-event. Tree destruction opens canopy gaps, altering microclimate/wind exposure. Bridge wash-out from debris: trail impassable 2-8 weeks. Cumulative trauma: hypothermia + dehydration + injury = escalated mortality. PTSD in SAR responders: 20-30% develop acute stress response.

## Operational Protocols

SAL 4-5 or storm: issue area closure. Coordinate with USFS, state parks, private hut operators. Activate SAR team standby (Colorado Search and Rescue Board). Issue smartphone push alert: "Avalanche danger HIGH. Backcountry access closed. Terrain hazard likely triggered." Radio monitoring (121.5 MHz emergency frequency). Deploy avalanche dogs (4-6 hour response). Helicopter rescue staging at nearest hub. Post-incident: accident investigation, terrain assessment, reopen decision (24-72 hour timeline).

## Caching/Offline

Pre-cache avalanche forecast center boundaries (GeoJSON). Store SNOTEL historical data (5-year climatology, 30MB). Cache NOAA/NWS forecast model data (96-hour outlook). Offline avalanche terrain database (slope aspect/angle) at 10m resolution. Store Rutschblock/shear test historical patterns. Cache emergency contact list (SAR teams, hut operators, ranger stations). Background tiles at zoom 11-15 in mountain regions. Timestamp all data; sync on network recovery (daily 0600 UTC ideal).

## Comms/UI

Alert (SAL 4): "AVALANCHE DANGER EXTREME. Maroon Bells region closed. Backcountry slide activity reported. SAR on standby. Do not travel." Push every 6 hours during forecast window. SMS: "AVALANCHE: Area closed through 3/10. Remote trigger probability 95%." Web: interactive forecast severity by zone, SNOTEL profile plots, recent slide locations (crowd-sourced), SAR team contact info. In-app: SOS button triggers satellite messenger (Garmin inReach API, APRS network). Voice: automated recording from USFS dispatch.

## Sensor Input

Primary: NOAA Avalanche Forecast Centers (daily bulletins, 10 US regions). Secondary: SNOTEL automated stations (snowpack profiles, 900+ locations). Tertiary: ECMWF weather model (10-day forecast). Quaternary: Total Lightning Network (15-min density maps). Quinary: USGS DEM terrain data. Mobile sensors: user trip reports (geofenced, photo validation). Remote: avalanche dog handler reports. Satellite: Sentinel-1 SAR coherence loss indicates avalanche activity. Seismic arrays: weak ground motion from avalanche remote sensing.

## Avalanche Propagation Mechanics

Failure initiation: weak layer stress ratio τ/c reaches unity (critical state). Slab thickness determines release potential energy: E_pot = 0.5 × ρ × g × H × L × sin(θ). Running distance: Heim coefficient model D_run = (0.5 × H)^0.5 × K_terrain where K_terrain = 0.9-1.1. Alpha angle (mass momentum angle): low-angle paths (α<20°) indicate extreme runout (terrain ramping). Entrainment rate: avalanche mass increases with path distance at M(x) = M0 + k×x (typically 0.2-0.4 m³/m path). Temperature rise during descent: 2-5°C average from friction + energy dissipation.

## Backcountry Rescue Integration

Beacon trigger: user missing >2 hours (SAR activation threshold). Satellite SOS activation: Garmin inReach device sends emergency coordinates (±50m accuracy) to NORAD Rescue Coordination Centers. Response time model: helicopter 30-90 min (weather-dependent), ground teams 2-6 hours. Burial location prediction: flow model simulates avalanche trajectory, excavation probability weighted by depth/terrain. Companion rescue success: 90% if buried 0-10 min, 35% if >35 min. Incident command structure: USFS Ranger District -> County SAR -> State Emergency Management. Resources: 20-50 personnel (SAR volunteers + professional guides), 1-2 helicopters, 5-8 dogs, 50+ shovels/probes.

## Environmental Hazard Layering

Whiteout conditions (visibility <50m): disorient navigation, ground truth loss 80% of time. Cornice collapse: 1-3 meter thickness failure triggers slide without human loading. Spindrift accumulation: wind-loaded slopes prone to remote-trigger avalanches (human-triggered probability increases 40%). Aspect effect: northerly slopes (cool, stable) vs. southerly (solar radiation, weaker). Elevation gain fatigue: altitude hypoxia at >12k feet reduces physical capacity 30-50%. Exposure danger (fall risk): terrain traps (cliffs, trees) increase entrapment probability. Wind-slab formation: precipitation redeposition creates unstable layers (peak hazard 24-36 hours post-storm).
