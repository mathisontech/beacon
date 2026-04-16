# Extreme Cold Hazard Model

## Risk Layer
**Data Source**: NWS Wind Chill Index, NOAA Surface Analysis
Wind chill combines temperature and wind speed: WC = 35.74 + 0.6215T - 35.75(V^0.16) + 0.4275T(V^0.16)

**Risk Classification**:
- Caution: WC -20°F to -34°F
- Extreme Caution: WC -35°F to -59°F
- Danger: WC -60°F to -99°F
- Extreme Danger: WC ≤-100°F

**Frostbite Onset Times** (exposed skin):
- WC -20°F: 30 min
- WC -40°F: 10 min
- WC -60°F: 5 min
- WC -100°F: 1 min

## Ongoing Hazard Model
**Real-time Monitoring**: NWS API polling for temperature and wind speed at 5-minute intervals (4km grid resolution).

```
WC = 35.74 + 0.6215*T - 35.75*(V^0.16) + 0.4275*T*(V^0.16)
frostbite_time_min = interpolate_frostbite_table(WC)
risk_level = classify_wind_chill(WC)
```

**Trigger thresholds**: WC <-20°F generates cold weather advisory; <-40°F triggers warning.

## Spread/Evolution
Cold fronts advance 20-40mph. Track Arctic high-pressure systems using 500mb geopotential height anomalies from NOAA GFS (Global Forecast System).

**Duration Prediction**: Model cold snap persistence via North Atlantic Oscillation (NAO) index and Siberian High position.
- NAO negative phase: +3-7 day cold persistence
- Blocking pattern analysis: detect when stationary high locks in cold air mass

**API**: NOAA GFS 0.25° resolution, 10-day forecast; update every 6 hours.

## Lethality
**Hypothermia Progression Stages**:
1. Mild (32-35°C core): shivering, confusion
2. Moderate (28-32°C): loss of shivering, lethargy
3. Severe (<28°C): unconscious, arrhythmia risk (60-70% mortality if rescue delayed >30min)

**Mortality Risk**: CDC data shows 1,500 annual cold-related deaths (US). Age >65 accounts for 50% of deaths.

**Calculation**: Daily_Deaths = baseline × RR_age × WC_severity × exposure_hours

High-risk groups: homeless (16x mortality), outdoor workers, substance use disorder.

## Safe Zones
**Warming Shelters**: Query FEMA warming shelter registry and local emergency management databases.
- Priority: facilities with backup heating (natural gas or generator)
- Capacity tracking: maximum occupancy and current utilization from real-time updates
- Accessibility: ADA compliance, pet policies, transportation availability

**Heat Source Density**: OpenStreetMap heating infrastructure; identify neighborhoods with <15min walk to heated public space.

**Coverage Algorithm**: Voronoi diagram of warming shelters; flag vulnerable census tracts as underserved.

## Evacuation
**Not primary evacuation hazard** but triggers relocation:
- Mandate indoor shelter for homeless populations via emergency order
- Route traffic away from exposed areas (bridges, high-elevation highways)
- School closures when WC <-35°F for 2+ consecutive hours

## Vulnerability
**Vulnerable Populations**:
- Age ≥65 years: 50% of cold deaths, risk factors (medication, reduced circulation)
- Homeless: 16x mortality (NIH analysis)
- Outdoor workers: construction, agriculture, utility crews
- Rural populations: heating fuel access, road conditions
- Low-income: inadequate heating (12% of low-income housing <65°F in winter)

**LIHEAP Data**: Low-Income Home Energy Assistance Program identifies households requiring heating assistance.

**Medication Impact**: Beta-blockers, antipsychotics reduce peripheral vasoconstriction.

## Secondary Effects
**Infrastructure Failures**:
- Pipe burst risk: frozen when T<0°C for 6+ hours in unheated buildings
- Heating demand surge: 15% per 1°C below 65°F baseline (EIA data)
- Power outages: ice storm accumulation (>0.5" causes 20% infrastructure damage)
- Transportation: road icing (>5% accident rate increase per 1°C drop), flight cancellations

**Health System Impact**: Increased cardiac events (cold-induced vasoconstriction), respiratory infections surge 30-50%.

**Agricultural**: Livestock exposure risk, irrigation system freeze-up.

## Operational Protocols
**Tier 1 (WC -20 to -34°F)**:
- Issue winter weather advisory via WEA
- Activate warming shelter hotline
- Public information campaign: exposed skin risk messaging
- Implement homeless outreach and sheltering

**Tier 2 (WC -35 to -59°F)**:
- Declare winter storm warning
- Open all designated warming shelters
- Deploy mobile warming units to underserved areas
- Cancel outdoor public events; close playgrounds
- Issue workplace safety alerts (OSHA 1910.95 cold exposure limits)

**Tier 3 (WC ≤-60°F)**:
- Activate emergency operations center
- Restrict vehicle traffic (salt resources, emergency access only)
- Door-to-door wellness checks for elderly and disabled
- Coordinate shelter capacity with state emergency management
- Ground air operations if icing conditions persist

## Caching/Offline
**Cache Strategy**:
- Pre-download GFS forecasts every 6 hours (wind chill grids, 500MB)
- Store warming shelter locations, hours, capacity, pet policies (weekly update)
- Cache vulnerable population census data and heating access metrics
- Frostbite/hypothermia progression tables (local lookup)
- Offline: last known WC + simple persistence forecast (±2°F/hour, ±2mph wind)

**Data Size**: ~50MB for 72-hour region coverage.

## Comms/UI
**Alert Format**: "Wind Chill -28°F; frostbite in 15 min on exposed skin. 3 of 4 warming shelters open. Call 311 for transportation."

**Dissemination**: WEA (SAME codes: WC, WW), IPAWS, SMS to homeless outreach networks and social services, in-app notifications with route to nearest warming shelter.

**Dashboard**: Real-time WC grid, frostbite onset timer, 72-hour forecast, warming shelter finder with capacity/amenities, vulnerable census tract overlay, pipe burst risk zones.

## Sensor Input
**Primary**: NWS stations (800+ CONUS), METAR/SYNOP observations at 1-hour intervals.
**Secondary**: Personal weather station network (Weather Underground), utility company weather stations.
**Satellite**: NOAA visible/infrared satellite for cloud cover and surface conditions.

**QA**: Reject stations with missing wind data; validate temperature against lapse rate (3.5°F/1000ft elevation change). Flag outliers >10°F from neighbors.
