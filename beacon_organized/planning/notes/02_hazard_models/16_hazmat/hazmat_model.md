# HAZMAT Hazard Model

## Risk Layer
**Data Source**: EPA EPCRA Tier II facility data, CAMEO chemical database, ERG (Emergency Response Guidebook)
Chemical release modeling: ALOHA (Areal Locations of Hazardous Atmospheres) dispersion model.

**Risk Classification** (protective action distance based on ERG):
- Distance Zone 1: Immediate hazard (evacuation zone, PAD for worst-case)
- Distance Zone 2: Secondary hazard (shelter-in-place zone, reduced PAD)
- Distance Zone 3: Minimal impact (>10km from release, monitoring only)

**Affected Population**: Query census data within PAD; estimate exposure by wind direction.

## Ongoing Hazard Model
**Inventory Assessment**: Query EPA EPCRA database for facility locations and chemical inventory quantities.

```
hazmat_facilities = fetch_EPCRA_Tier_II_data(state, county)
for facility in hazmat_facilities:
  chemical_inventory = get_reported_quantities(facility_id)
  worst_case_scenario = ALOHA_run(
    chemical=chemical_name,
    quantity=reportable_quantity_lbs,
    storage_temp=ambient_temperature,
    weather=current_wind_speed_direction,
    release_type='vapor_cloud'
  )
  PAD_km = worst_case_scenario['distance_to_erpg2_level']
  population_at_risk = query_census_within_radius(facility_coords, PAD_km)
```

**APIs**: EPA Enviromapper (EPCRA Tier II), NOAA CAMEO API for chemical properties.

## Spread/Evolution
Vapor clouds travel downwind at 1-3 m/s; liquid pool evaporation rate depends on temperature and wind speed.

**Gaussian Plume Model** (steady-state after 30+ min):
```
C(x,y,z) = (Q / (2π * u * σy * σz)) *
           exp(-y²/(2σy²)) *
           [exp(-(z-H)²/(2σz²)) + exp(-(z+H)²/(2σz²))]

where:
  Q = emission rate (g/s)
  u = wind speed (m/s)
  σy, σz = horizontal/vertical dispersion coefficients (Pasquill-Gifford)
  H = release height (m)
```

**Plume Persistence**: Typical duration 2-6 hours; depends on chemical volatility and ambient conditions.

**Forecast**: HRRR wind forecasts extend PAD prediction 6+ hours ahead.

## Lethality
**Chemical-Specific Toxicity**: CAMEO database provides ERPG (Emergency Response Planning Guideline) levels.

**ERPG Definitions**:
- ERPG-1: Reversible health effects (odor perception, eye irritation); no evacuation
- ERPG-2: Serious irreversible health effects; shelter-in-place threshold
- ERPG-3: Life-threatening effects; evacuation threshold

**Mortality Estimation**: Depends on concentration and exposure duration.
```
mortality_risk = calculate_probit_function(concentration, exposure_time, chemical_type)
LD50_inhalation = CAMEO_chemical_properties[chemical_id]['LD50_mg_m3']
concentration_ratio = peak_concentration_mg_m3 / LD50_inhalation
mortality_probability = probit(concentration_ratio, chemical_toxicity_factor)
```

**Population Exposure**: Worst-case scenario assumes all residents in PAD zone remain at home; evacuations reduce by 50-80%.

## Safe Zones
**Evacuation Zones**: Defined by ERG Distance Zones and ALOHA modeling.

**Shelter-in-Place Facilities**:
- Buildings with HEPA filtration and negative pressure capable
- Schools, hospitals, commercial buildings with operable windows and AC
- Query building permit database for structure capacity

**Upwind Refugia**: Forecast next 12-hour wind direction; recommend relocation upwind/perpendicular to plume path.

## Evacuation
**Primary Hazard for Immediate Evacuation**:
- Trigger: ALOHA modeling shows PAD >1 km and population >1000 exposed
- Evacuation zones defined by ERG Distance Zones (typically 0.5-5 km radius)
- Routes: Perpendicular to wind direction, away from high-traffic corridors

**Shelter-in-Place**: If evacuation impossible or plume minor (PAD <0.5 km, low population):
- Seal buildings (close windows, doors; turn off HVAC fresh air intakes)
- Provide emergency shelter at non-affected facilities
- Duration: until plume disperses (2-6 hours typical)

## Vulnerability
**Vulnerable Populations**:
- Age <4 years: higher breathing rate (5x adult rate)
- Age >65: reduced lung capacity and respiratory reserve
- Respiratory disease: asthma (25M), COPD (16M); affected populations 2-5x more sensitive to irritants
- Cardiac disease: sympathomimetic chemicals trigger arrhythmias
- Mobility-limited: require assistance for evacuation
- Limited English proficiency: need multi-language alert dissemination

**Occupational Exposure**: Emergency responders, industrial workers within 1 km of facilities.

**Proximity Mapping**: Census tracts within 5 km of facilities; high-density facilities (>100 employees) near residential areas.

## Secondary Effects
**Infrastructure Damage**:
- Corrosive chemical attack on materials (steel, concrete, plastics)
- Power system contamination (insulator tracking, conductor failure)
- Water supply contamination if plume enters surface intakes

**Environmental Cascade**:
- Soil/groundwater contamination: long-term remediation (months to years)
- Vegetation damage: chemical burn; ecosystem recovery delayed
- Aquatic ecosystem: fish kills if release enters waterways

**Health System Surge**:
- Mass casualty event: 100-1000+ ED arrivals in minutes
- Triage challenge: differentiation between chemical exposure levels
- Decontamination infrastructure: limited capacity (2-4 showers per hospital)

## Operational Protocols
**Pre-Event Preparedness**:
- Maintain facility inspection program; verify engineering controls (containment, leak detection)
- Conduct tabletop exercises quarterly; test evacuation routes
- Pre-position emergency supplies: N95 masks, atropine auto-injectors (nerve agent response)
- Establish mutual aid agreements with neighboring agencies

**Tier 1 (Minor Release, PAD <0.5 km)**:
- Activate facility incident commander
- Issue shelter-in-place advisory for immediate area
- Monitor plume with real-time air monitoring equipment
- Deploy first responders to incident site

**Tier 2 (Significant Release, PAD 0.5-2 km)**:
- Declare local emergency
- Issue shelter-in-place or evacuation order (per ERG guidance)
- Activate emergency operations center
- Deploy hazmat response teams and decontamination units
- Notify hospitals of mass casualty incoming

**Tier 3 (Major Release, PAD >2 km)**:
- Activate state emergency management
- Implement mandatory evacuation
- Deploy National Guard for traffic control and security
- Coordinate mutual aid with neighboring counties
- Activate emergency sheltering and mass care operations

## Caching/Offline
**Cache Strategy**:
- Download EPCRA Tier II facility inventory (updated annually, <10MB)
- Store CAMEO chemical database (5,000+ chemicals, <50MB)
- ERG guidebook (PDF, <20MB)
- Pre-compute ALOHA worst-case scenarios for top 50 facilities by inventory quantity
- HRRR wind forecast grids (updated 6-hourly, 200MB per cycle)

**Offline Capability**: Manual lookup of facility chemicals; use wind direction observation for simple plume path estimation (no modeling).

## Comms/UI
**Alert Format**: "HAZMAT: Chlorine release at Industrial Park. Evacuate 2-km radius. Drive north (upwind). No windows/doors. Call 911 for pickup. Alert: 10,000 residents affected."

**Dissemination**: WEA (SAME codes: HZ), IPAWS, SMS push to facility workers, sirens (if available), local radio/TV emergency alert, in-app evacuation route mapping with real-time traffic avoidance.

**Dashboard**: Real-time facility inventory map, ALOHA plume modeling (animated), PAD distance zones, affected population estimate, evacuation route planner, shelter locations, hospital mass casualty surge status, real-time air quality monitoring from response teams.

## Sensor Input
**Primary**: EPCRA Tier II facility reporting (annual), facility self-monitoring systems (when available).
**Secondary**: Real-time air quality sensors (Fidas monitors, photoionization detectors) deployed by emergency responders.
**Meteorological**: NOAA HRRR wind and stability class forecasts; local weather station observations.

**QA**: Validate EPCRA data against facility permits; cross-check chemical quantities against storage capacity. Validate ALOHA modeling assumptions (release type, weather conditions) against observed plume extent if release occurs.
