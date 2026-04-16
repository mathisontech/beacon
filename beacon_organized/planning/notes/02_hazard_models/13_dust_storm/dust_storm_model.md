# Dust Storm Hazard Model

## Risk Layer
**Data Source**: NOAA HRRR, NCAR, satellite visibility analysis
Primary metric: visibility distance. Dust storm thresholds:
- Moderate dust: visibility 5-10 km
- Heavy dust: visibility 1-5 km
- Severe dust (haboob): visibility <1 km, wind >30 knots, wall-like formation

**Risk Classification**:
- Advisory: visibility 1-5 km, wind >20 knots
- Warning: visibility <1 km, wind >30 knots
- Extreme: visibility <0.25 km, blowing dust across multiple counties

## Ongoing Hazard Model
**Real-time Detection**: Combine HRRR model forecasts with satellite-based visibility product.

```
visibility_km = HRRR_visibility_diagnostic(lat, lon, time)
surface_wind_knots = HRRR_wind_10m(lat, lon)
dust_concentration_ugm3 = estimate_from_visibility(visibility_km)
risk_level = classify_dust_hazard(visibility_km, wind_knots)
```

**HRRR Parameters**: Dust-weighted extinction coefficient derived from model mixing ratios. Temporal resolution: 15-minute forecasts, 48-hour window.

**API**: aws.weather.gov/HRRR/CONUS_2p5km/; visibility diagnostic available in grib2 format.

## Spread/Evolution
Dust storms propagate at 25-40 mph following strong cold frontal boundaries. Track via atmospheric pressure tendencies and vertical motion.

**Haboob Detection Algorithm**:
- Identify rapid pressure jump (+2-4 mb in 10 min)
- Confirm with satellite enhancement: IR brightness temperature gradient >5°C/50km
- Measure depth via satellite parallax and model vertical extent

**Evolution Model**: Monitor outflow boundaries; estimate dust front arrival time using satellite-tracked leading edge position and wind speed.

**API**: NOAA GOES-18 satellite (AWS: s3://noaa-goes18/); product: ACHA (Advanced Baseline Imager) Cloud Height Analysis updated every 5 min.

## Lethality
**Direct Health Impact**: Dust storms cause <1 annual death, but trigger serious morbidity:
- Respiratory exacerbations: 400-800 ED visits per severe dust event (Arizona analysis)
- Visibility-related motor vehicle crashes: 50-200 accidents per event
- Ophthalmologic injuries: 100-300 cases per event

**Population Exposure**: Estimates based on dust plume extent and population within affected area.

**Calculation**: ED_visits = population_exposed × RR_respiratory × dust_severity × wind_speed_factor

High-risk groups: asthma (8% of population), COPD (6%), age >65 (circulation-related), outdoor workers.

## Safe Zones
**Indoor Shelters**: Buildings with adequate filtration (MERV-13+ AC systems). Query building databases for HVAC specifications.

**Low Visibility Corridors**: Route avoidance for traffic; identify highways with dust-blocked sight lines using topographic analysis (wind funneling terrain).

**Hospital/Clinical Facilities**: High-capacity respiratory care facilities for respiratory failure surge.

## Evacuation
**Not primary evacuation hazard** but affects traffic safety:
- Issue travel warnings when visibility <1 km
- Restrict truck routes (high profile = blown over in 35+ mph winds)
- Reroute traffic to cleared highways (update real-time via Waze API integration)

**Closure Algorithm**: Highways closed when visibility <0.25 km for >30 min duration.

## Vulnerability
**Vulnerable Populations**:
- Asthma: 8.4% of US population, 2-4x ED visit increase
- COPD: 6.1% of population, hospitalization risk
- Cardiovascular disease: particulate exposure triggers arrhythmias
- Outdoor workers: construction, mining, agriculture
- Mobile home residents: poor seal against dust infiltration

**Census Tract Analysis**: Identify high asthma prevalence areas (>12% age-adjusted) using CDC PLACES data.

**Occupation Mapping**: OSHA worker registries for outdoor work concentration areas.

## Secondary Effects
**Transportation System**:
- I-10 corridor (Phoenix-Yuma): most dust storm exposure; 50-200 crashes per major event
- Visibility reduction: 5-10 km typical sustained duration, peak 30-60 min
- Power line outages: dust conduction and salt-laden precipitation

**Air Quality Cascade**: Dust reduces visibility first, then triggers PM10/PM2.5 health effects over 2-4 hours. Dust coat on surfaces increases heating loads.

**Agricultural**: Soil loss per haboob: 50-500 tons/acre; impacts crop productivity and wildlife habitat.

## Operational Protocols
**Tier 1 (Visibility 5-10 km)**:
- Issue dust storm advisory via WEA
- Activate real-time traffic incident management (coordinate with highway patrol)
- Public messaging: respiratory precautions for sensitive groups

**Tier 2 (Visibility 1-5 km)**:
- Declare dust storm warning
- Close vulnerable highways; reroute traffic
- Activate respiratory surge preparedness at hospitals
- Disable outdoor HVAC intakes (facilities protocol)

**Tier 3 (Visibility <1 km)**:
- Activate emergency operations center
- Mandatory roadway closures; restrict all non-essential travel
- Deploy emergency shelters for stranded motorists
- Mobilize air quality monitoring network
- Coordinate with health department for respiratory patient surge management

## Caching/Offline
**Cache Strategy**:
- Pre-download HRRR visibility forecasts every 6 hours (300MB for southwest region)
- Store highway topology and vulnerable sight-line segments
- Cache asthma prevalence maps (census tract resolution)
- GOES satellite false-color composites (6-hour archive)
- Offline: satellite cloud-top images + last pressure tendency observation

**Refresh Rate**: 15-minute HRRR updates; daily satellite product verification.

## Comms/UI
**Alert Format**: "Dust storm warning: visibility 0.3 km, winds 35 mph. I-10 closed Phoenix-Tempe. Respiratory alert: asthma patients use rescue inhalers. Seek shelter indoors."

**Dissemination**: WEA (SAME codes: DU, AFD), IPAWS, SMS to roadside assistance networks and medical facilities, in-app road closure map with alternate routes.

**Dashboard**: Real-time visibility grid (satellite + model blend), dust plume animation, 6-hour forecast, closed highway map, respiratory patient surge alerts, outdoor worker exposure zones, air quality co-hazard display.

## Sensor Input
**Primary**: GOES-18 satellite (visible/IR channels), NOAA HRRR model.
**Secondary**: Visibility observations from airport METAR stations (100+ in southwest US); ASOS automated surface station network.
**Tertiary**: Portable PM10 monitors in vulnerable areas; mobile air quality units.

**QA**: Cross-validate satellite visibility estimates against METAR/ASOS; reject outliers >50% deviation. Flag HRRR bias versus observations.
