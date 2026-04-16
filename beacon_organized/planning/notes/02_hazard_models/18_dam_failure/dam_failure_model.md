# Dam Failure Hazard Model

## Risk Layer
**Data Source**: USACE NID (National Inventory of Dams), state dam safety offices
Classification: Downstream population at risk; hazard potential rating.

**Hazard Potential Categories** (ICOLD standard):
- Low: inundation depth <2m or velocity <1 m/s downstream
- Significant: inundation 2-5m depth or 1-2 m/s velocity; isolated structures
- High: inundation >5m depth or >2 m/s velocity; significant population
- Extreme: inundation >5m, >2 m/s, major population centers or critical infrastructure

**Risk Assessment**: Probability_risk = Dam_failure_probability × Downstream_impact_severity

## Ongoing Hazard Model
**Inspection & Monitoring**: NID contains 90,000+ dams; ~2% rated high hazard potential.

**Failure Probability Assessment**:
```
inspection_status = query_NID_dam_profile(dam_id)
age_years = current_year - construction_year
structural_condition = query_dam_safety_report(dam_id)
overtopping_risk = assess_spillway_capacity_vs_probable_max_precipitation(dam_id)
seismic_risk = query_USGS_seismic_hazard(dam_location)
piping_risk = assess_foundation_geology(dam_id)
failure_probability = logistic_model(age, condition, overtopping_risk, seismic_risk, piping_risk)
```

**Data Source**: USACE NID Database (nid.usace.army.mil), state dam safety reports (annual inspections).

## Spread/Evolution
Dam failures occur within seconds to minutes once breach initiates. Inundation wave propagation downstream depends on breach size and hydraulic geometry.

**Froehlich Breach Parametric Equations** (worst-case for embankment dams):
```
breach_width_m = 0.27 * (volume_breached_km3 ^ 0.32)
failure_duration_min = (0.0133 * (volume_breached_km3 ^ 0.534))

peak_discharge_cms = 0.607 * (volume_breached_km3 ^ 0.295) * (dam_height_m ^ 0.5)
outflow_hydrograph = model_breach_flow_time_series(
  breach_width, failure_duration, initial_reservoir_volume
)
```

**Inundation Propagation**: Route outflow downstream using HEC-RAS 1D hydraulic model.
```
downstream_depth_m(x, t) = ras_model(peak_discharge, channel_geometry, roughness)
arrival_time_min(x) = distance_km / average_wave_velocity_kmh
inundation_extent_km2 = calculate_floodplain_overtopping_area(depth_grid)
```

**Forecast Window**: Warning time 5-30 minutes for downstream residents (depends on distance, topography).

## Lethality
**Mortality Estimation**: Depends on wave height, velocity, population density, warning time.

**Depth-Velocity Hazard Criterion**:
- Safe: depth <0.5m AND velocity <1 m/s
- Caution: depth 0.5-1.5m OR velocity 1-2 m/s
- Dangerous: depth 1.5-5m AND velocity 1-4 m/s (high mortality >50%)
- Extreme: depth >5m OR velocity >4 m/s (near-universal mortality, structural destruction)

**Mortality Calculation**:
```
population_exposed = query_census_downstream_to_hazard_extent(dam_id)
mortality_fraction = estimate_mortality_vs_warning_time(warning_minutes, population_density)
if warning_time_min < 5: mortality_rate = 0.50
elif warning_time_min < 15: mortality_rate = 0.30
elif warning_time_min < 30: mortality_rate = 0.10
else: mortality_rate = 0.02
expected_deaths = population_exposed × mortality_rate × depth_velocity_hazard_index
```

**Worst-Case Scenario**: Oroville Dam (California, 2017): 188,000 evacuated; 1 death from evacuation-related accident.

## Safe Zones
**Evacuation Routes**: Pre-identified upland routes perpendicular to inundation path.

**Shelter Locations**: Above estimated inundation limits; 20-30m elevation gain for 5m wave scenario.

**Pre-Event Mapping**: HEC-RAS inundation zone mapping identifies safe areas per census block.

## Evacuation
**Primary Evacuation Trigger**:
- Dam failure imminent (USACE structural assessment declares failure likely)
- Uncontrolled spillway discharge exceeding capacity for >30 min
- Seismic event >5.5 magnitude at dam location (reassess stability immediately)

**Evacuation Protocol**:
```
if dam_inspection_status == "Critical":
  issue_evacuation_order = true
  evacuation_time_available_min = assess_warning_delay(dam_to_vulnerable_pop_distance)
  evacuation_route_capacity = plan_contraflow_routes_upland()
  traffic_clearance_time = estimate_evacuation_time(population, road_network_capacity)

  if traffic_clearance_time > evacuation_time_available:
    activate_emergency_sheltering_in_place()
    issue_guidance_to_highest_ground()
```

**Alert**: Staged evacuation (zones closest to dam first); estimated warning time 10-30 min for communities 10-30km downstream.

## Vulnerability
**Vulnerable Populations**:
- Downstream residents within 10km: 5,000-100,000 depending on dam size and development
- Mobile home parks: higher vulnerability (failure structural integrity)
- Hospitals/healthcare facilities: relocation challenges, patient safety risk
- Nursing homes: age >65 population 100% mobility-impaired
- Schools: childcare dependency, busing capacity constraints
- Incarcerated populations: no evacuation autonomy
- Homeless: no sheltering option

**Critical Infrastructure**: Highway bridges, power lines, water treatment intakes, railroads.

**Occupational**: Construction crews working downstream; utility maintenance personnel.

## Secondary Effects
**Infrastructure Damage**:
- Highway bridge destruction: 5-20 bridges per major dam failure
- Power transmission line failure: cascading power outages
- Water treatment plant inundation: loss of water supply for 1-7 days
- Wastewater treatment discharge: environmental contamination
- Gas pipelines: potential rupture and fire
- Telecommunications: backbone fiber cuts

**Environmental Cascade**:
- Sediment release: 50-200 million tons for large dams; downstream water turbidity (weeks)
- Fish habitat destruction: dam removal of >20m of riverine habitat
- Aquatic ecosystem collapse: loss of benthic organisms, fish populations
- Vegetation loss: riparian die-off from silt burial
- Pollutant release: if dam contains reservoir with contamination

**Economic**:
- Property damage: $1-10 billion for major dams
- Business interruption: manufacturing, agriculture, tourism
- Recovery timeline: 5-10 years for full rebuilding

## Operational Protocols
**Pre-Event**:
- Annual dam inspection and safety certification
- Spillway capacity analysis vs. probable max precipitation
- Inundation mapping and evacuation planning (HEC-RAS models)
- Public awareness campaign (siren testing, evacuation route signs)

**Tier 1 (Increased Monitoring)**:
- Increased spillway discharge to lower reservoir level below PMF
- Activate hourly visual inspections
- Notify downstream population of heightened alert status
- Pre-position evacuation resources (buses, shelters, supplies)

**Tier 2 (Imminent Failure Assessment)**:
- Declare dam safety emergency
- Issue precautionary evacuation order for farthest communities (10-30km downstream)
- Deploy USACE hazard assessment team
- Activate emergency operations center
- Position emergency responders downstream

**Tier 3 (Imminent Failure Confirmed)**:
- Declare major disaster (FEMA coordination)
- Issue immediate evacuation order; activate contraflow routes
- Deploy law enforcement for traffic control
- Activate mass care sheltering (10,000+ capacity)
- Mobilize emergency medical response
- Close all downstream highway crossings
- Establish debris management and environmental response teams

## Caching/Offline
**Cache Strategy**:
- Download NID database with all dam attributes (50MB)
- Store pre-computed HEC-RAS inundation maps for high-hazard dams (1GB)
- Cache downstream census data and critical facility locations (100MB)
- Store evacuation route maps and contraflow plans
- Download inundation extent GIS layers (shapefile format)
- Offline: inundation depth/velocity maps; simple wave travel time estimation

**Update Frequency**: NID updated annually; dam safety reports annual to biennial; HEC-RAS models updated every 5 years (or after inspection).

## Comms/UI
**Alert Format**: "Dam Safety Emergency: Probable Max Precipitation event. Evacuation order: all residents within 15km downstream. Use Route 52 North (contraflow). Shelter opens Lincoln HS in 1 hour. Warning time: 25 minutes."

**Dissemination**: WEA (SAME codes: DM), IPAWS, SMS to all residents in inundation zone, sirens (if available), local radio/TV emergency alert, in-app evacuation route planner with traffic status.

**Dashboard**: Real-time dam status (inspection results, spillway discharge), inundation extent map with depth/velocity hazard zones, evacuation zone delineation, evacuation route traffic status, shelter capacity and openings, critical facility inundation risk, downstream population at risk estimate, wave arrival time counter.

## Sensor Input
**Primary**: USACE SCADA systems (spillway gate position, reservoir elevation), dam safety inspections.
**Secondary**: USGS stream gauges (inflow rate, downstream discharge), seismic stations (earthquake detection).
**Meteorological**: NOAA precipitation forecasts for PMF assessment (actual vs. design storm).

**QA**: Validate dam inspection reports against NID database; flag inconsistencies. Cross-check spillway design capacity against probable max precipitation estimates. Validate HEC-RAS model against historical flood data if available.
