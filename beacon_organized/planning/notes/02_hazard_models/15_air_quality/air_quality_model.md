# Air Quality Hazard Model

## Risk Layer
**Data Source**: EPA AirNow API, NOAA HYSPLIT smoke transport model
AQI Calculation (EPA standard):

```
breakpoint_pairs = {
  0: (0, 50, 0, 50),          # Good (0-50 AQI)
  1: (51, 100, 51, 100),      # Moderate (51-100)
  2: (101, 150, 101, 150),    # Unhealthy for Sensitive Groups (101-150)
  3: (151, 200, 151, 200),    # Unhealthy (151-200)
  4: (201, 300, 201, 300),    # Very Unhealthy (201-300)
  5: (301, 500, 301, 500)     # Hazardous (301+)
}
AQI = ((BP_hi - BP_lo) / (C_hi - C_lo)) * (concentration - C_lo) + BP_lo
```

**Primary Pollutants**: PM2.5, PM10, O3, NO2, SO2, CO

**Risk Classification**:
- 0-50 AQI: Good
- 51-100: Moderate (children, elderly, those with respiratory disease should limit outdoor exertion)
- 101-150: Unhealthy for Sensitive Groups
- 151-200: Unhealthy (general population begins experiencing adverse effects)
- 201-300: Very Unhealthy
- 301+: Hazardous (all groups at serious health risk)

## Ongoing Hazard Model
**Real-time Monitoring**: EPA AirNow API provides current AQI at 50,000+ monitoring locations nationwide.

```
aqi_current = fetch_airnow_api(lat, lon, pollutant_list)
health_message = map_aqi_to_health_guidance(aqi_current)
respiratory_alert = aqi_current > 150
```

**Temporal Resolution**: 1-hour updates for EPA monitors; 24-hour average for PM2.5.

**APIs**:
- EPA AirNow API: /AirQuality/HourlyData/ and /Forecast/
- NOAA HYSPLIT: https://www.ready.noaa.gov/HYSPLIT_access.php (smoke trajectories)

## Spread/Evolution
Smoke plumes from wildfires propagate across continents over 3-7 days. Model transport using HYSPLIT (Hybrid Single Particle Lagrangian Integrated Trajectory).

**HYSPLIT Algorithm**:
```
forward_trajectory = hysplit_run(
  source_location=(lat_fire, lon_fire),
  height_m=1000,  # typical smoke injection height
  forecast_hours=72,
  meteorology=GFS_winds
)
smoke_arrival_time = interpolate_trajectory_at_location(target_lat, target_lon)
PM25_concentration = estimate_from_source_strength(smoldering_area_km2, fuel_type)
```

**Wildfire Emission Estimates**: Use NOAA Hazard Mapping System (HMS) satellite-detected fire pixels.

**Forecast**: EPA/AirNow provides 2-day AQI forecast; extend with HYSPLIT trajectory ensemble.

## Lethality
**Mortality Risk**:
- Short-term exposure (hours): 1% mortality increase per 10 μg/m³ PM2.5 rise above 35.5 μg/m³ (EPA Gold Standard)
- Long-term exposure (years): 6-7% mortality per 10 μg/m³ (Harvard Six Cities Study)

**Daily Deaths Calculation**:
```
excess_deaths = population × baseline_mortality_rate × RR_per_AQI_unit × (AQI - baseline_AQI)
RR_per_10ug = 1.01 (short-term), 1.06 (long-term)
```

**High-Risk Groups**:
- Asthma: 8.4% of population; 40-50% ED visit increase per 10 μg/m³ PM2.5
- COPD: 6.1% of population; 30-40% hospitalization increase
- Cardiovascular disease: 5.2% of population; arrhythmia and MI risk
- Age >65: 20% of population; 25-30% mortality risk increase
- Outdoor workers: construction, agriculture

## Safe Zones
**Indoor Shelter with HEPA Filtration**: Buildings with MERV-13+ or portable HEPA (99.97% PM2.5 capture).

**Low-AQI Corridors**: Forecast air quality patterns to identify nearby counties with lower AQI; route outdoor activities to clean-air zones.

**Hospital/Clinical Facilities**: Respiratory care capacity; ICU beds with mechanical ventilation.

## Evacuation
**Not primary evacuation hazard** but triggers "shelter-in-place" and activity relocation:
- Cancel outdoor events when AQI >150
- Route traffic away from high-traffic corridors (concentrates exposure)
- Transition sensitive populations indoors

## Vulnerability
**Vulnerable Populations**:
- Asthma: 25 million Americans; 40-50% ED visit increase at AQI >100
- COPD: 16 million; respiratory exacerbations and hospitalizations
- Cardiovascular disease: 48 million; increased cardiac events and arrhythmias
- Age >65: 56 million; 20-30% mortality increase
- Outdoor workers: construction (3.5M), agriculture (2.1M)
- Low-income: disproportionate exposure (proximity to highways, industrial sites)

**Census Tract Analysis**: CDC PLACES data (asthma prevalence), deprivation index, proximity to emission sources.

**Occupational Exposure**: OSHA outdoor worker concentration maps.

## Secondary Effects
**Respiratory Cascade**:
- Acute inflammation: airway constriction in asthma/COPD patients (minutes to hours)
- Hospital surge: ED visits 40-100% increase during PM2.5 spike episodes (CDC syndromic surveillance)
- School absence: 8-12% attendance reduction during AQI >150 events

**Cardiovascular Linkage**:
- Systemic inflammation: C-reactive protein elevation
- Autonomic dysregulation: heart rate variability reduction
- Thrombosis risk: platelet activation and coagulation cascade

**Visibility Impact**: PM2.5 > 200 reduces visibility to <1km; coincides with dust storms and wildfire smoke events.

**Economic**: Productivity loss from illness (sick days), outdoor recreation cancellation.

## Operational Protocols
**AQI 51-100 (Moderate)**:
- Issue air quality advisory via EPA AirNow; recommend outdoor exertion reduction for sensitive groups
- Distribute N95 mask availability notifications
- Activate respiratory patient outreach hotline

**AQI 101-150 (Unhealthy for Sensitive Groups)**:
- Issue air quality alert; restrict outdoor activities for sensitive populations
- Distribute free N95 masks at senior centers, clinics
- Activate hospital respiratory surge preparedness

**AQI 151-200 (Unhealthy)**:
- Declare air quality emergency
- Cancel outdoor public events
- Distribute N95 masks to general public
- Activate respiratory patient check-in program
- Deploy mobile air quality sensors in underserved areas

**AQI 201+ (Very Unhealthy/Hazardous)**:
- Activate emergency operations center
- Mandate workplace air quality protection (filtration, SCBA if needed)
- Issue shelter-in-place guidance
- Activate respiratory hospitalization surge protocols
- Deploy emergency respiratory supplies (inhalers, oxygen)

## Caching/Offline
**Cache Strategy**:
- Download EPA AirNow historical data and 2-day forecast daily (100MB)
- Store HYSPLIT fire-to-location trajectory models (updated with new fire detections)
- Cache respiratory prevalence maps (census tract resolution)
- Store N95 mask distribution site locations
- Offline: last known AQI + simple decay model (±5 AQI/hour)

**Refresh**: Hourly EPA monitor updates, daily forecast refresh, real-time wildfire detection updates.

## Comms/UI
**Alert Format**: "Air Quality Hazardous (AQI 187). Smoke plume from Oregon fires. Avoid outdoor activity; use N95 masks if outside. Free masks: clinic.local. Call 311 for respiratory support."

**Dissemination**: EPA AirNow alerts, IPAWS for emergencies, SMS to asthma/COPD patient registries, in-app alerts with health guidance and resource finder.

**Dashboard**: Real-time AQI grid map, 48-hour forecast, pollutant breakdown (PM2.5, O3, NO2), smoke plume animation (HYSPLIT trajectories), sensitive group health alerts, respiratory patient surge tracking, mask distribution finder, hospital respiratory bed capacity.

## Sensor Input
**Primary**: EPA AirNow monitors (50,000+ locations), Continuous Ambient Monitoring Stations (CAMS).
**Secondary**: PurpleAir sensor network (crowdsourced PM2.5, 50,000+ devices worldwide).
**Satellite**: NOAA GOES-18 aerosol optical depth, MODIS fire detection (fire radiative power).
**Tertiary**: Hospital respiratory ED data (syndromic surveillance).

**QA**: Validate EPA monitors against co-located PurpleAir; flag bias >20%. Reject HYSPLIT outliers using ensemble member variance. Check for sensor malfunction (rapid spikes >200 μg/m³, same-hour stability).
