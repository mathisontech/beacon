# Extreme Heat Hazard Model

## Risk Layer
**Data Source**: NWS API (Weather.gov), NOAA Heat Index calculations
Heat index combines temperature and humidity: HI = -42.379 + 2.04901523T + 10.14333127RH - 0.22475541TRH - 0.00683783T² - 0.05481717RH² + 0.00122874T²RH + 0.00085282TRH² - 0.00000199T²RH²

**Risk Classification**:
- Caution: HI 80-89°F
- Extreme Caution: HI 90-103°F
- Danger: HI 104-124°F
- Extreme Danger: HI ≥125°F

**Wet Bulb Globe Temperature (WBGT)**: WBGT = 0.7Tw + 0.2Tg + 0.1Ta (outdoor in sun). Threshold: 32°C unsafe for continuous activity.

## Ongoing Hazard Model
**Real-time Monitoring**: Interpolate NWS grid points (4km resolution) using inverse distance weighting. Query National Weather Service API every 5 minutes for temperature, dewpoint, wind speed.

```
HI_grid = interpolate_nws_points(lat, lon, radius=10km)
WBGT = 0.7 * wet_bulb(T, RH) + 0.2 * globe_temp(solar_radiation) + 0.1 * air_temp
risk_level = classify_heat_index(HI)
```

**Update frequency**: 5-minute polling, adaptive 1-minute during heat advisory.

## Spread/Evolution
Heat waves evolve over 3-7 day periods. Model temporal progression using HRRR (High-Resolution Rapid Refresh) 48-hour forecasts.

**Persistence Algorithm**: Thermal anomaly propagation via atmospheric blocking patterns.
- Duration extension factor: apply 1.2x multiplier to consecutive HI exceedances
- Forecast heat wave terminus from 500mb height anomalies

**API**: NOAA HRRR model (aws.weather.gov/HRRR/CONUS_2p5km_); update every hour.

## Lethality
**Mortality Risk Curve**: CDC age-stratified model.
- Age 0-4: baseline
- Age 65+: 4x baseline risk at HI>104°F
- Age 85+: 8x baseline at HI>104°F

**Heat-Related Illness Progression**:
1. Heat cramps (HI 85-90°F, 15+ min exposure)
2. Heat exhaustion (HI 90-104°F, 30+ min)
3. Heat stroke (HI >104°F, 45+ min, mortality 10-50%)

**Calculation**: Daily_Deaths = baseline_rate × age_stratified_RR × HI_duration_hours

Data: CDC Wonder mortality database, EIS heat surveillance reports.

## Safe Zones
**Cooling Centers**: Query FEMA cooling center registry, cross-reference with:
- Public buildings with AC capacity (fire stations, libraries, municipal buildings)
- Air conditioning density from OpenStreetMap and Google Places API
- Reliable power supply (prioritize locations not dependent on grid during outages)

**Urban Heat Island Mapping**: Calculate land surface temperature from MODIS satellite data (1km resolution). Prioritize parks, water features as refuge zones.

**Coverage Algorithm**: Voronoi diagram of cooling centers; flag census blocks >15min drive time as underserved.

## Evacuation
**Not primary hazard for evacuation** but triggers shelter-in-place:
- Alert indoor relocation for vulnerable populations
- Route traffic to shaded routes using OpenStreetMap

**Outdoor Event Cancellation**: Monitor WBGT; trigger cancellation threshold at 32°C and rising.

## Vulnerability
**Vulnerable Populations**:
- Age ≥65 years: CDC estimates 500 annual deaths
- Outdoor workers: 25-35% increased risk (OSHA analysis)
- Homeless: 2-4x mortality risk
- Low-income: lack AC (EIA housing data: 12% of low-income homes lack AC)
- Medication users (diuretics, antipsychotics)

**Social Vulnerability Index**: CDC/ATSDR SVI data (tract-level). Score ≥0.75 = high vulnerability.

**Medical Dependency Mapping**: Query state cardiac device registries for dialysis patients, oxygen-dependent residents.

## Secondary Effects
**Cascade Failures**:
- Power demand surge: 2% per 1°C above baseline (NERC demand data)
- Transformer derating: 1.2% capacity loss per 1°C above nameplate
- Infrastructure failures: asphalt buckling, rail expansion, AC refrigerant loss

**Health System Stress**: ED arrival surge 20-40% during HI >104°F events (CDC syndromic surveillance). Hospital bed availability impact.

**Agricultural**: Crop heat stress thresholds (corn tasseling: T>35°C = yield loss).

## Operational Protocols
**Tier 1 (HI 90-103°F)**:
- Issue heat advisories via WEA (Wireless Emergency Alerts)
- Activate cooling center hotline
- Monitor vulnerable populations via wellness checks (senior social service outreach)

**Tier 2 (HI 104-124°F)**:
- Declare local heat emergency
- Open all designated cooling centers
- Deploy mobile cooling units to underserved areas
- Close outdoor recreation areas during peak hours (2-6pm)

**Tier 3 (HI ≥125°F)**:
- Activate emergency operations center
- Mandatory workplace heat protection (OSHA 1910.268)
- Restrict commercial vehicle operation (asphalt integrity)
- Coordinate power grid demand reduction

## Caching/Offline
**Cache Strategy**:
- Pre-download HRRR forecasts every 6 hours (200MB for region)
- Store cooling center locations, hours, capacity (updated weekly)
- Cache SVI and vulnerability maps at census tract resolution
- Offline mode: last known HI status + simple extrapolation (±2°F/hour)

**Refresh**: HI updates every 5 min online; shows "forecast data" when offline.

## Comms/UI
**Alert Format**: "Heat Index 112°F; 2 of 5 cooling centers open. Elderly/outdoor workers high risk. Text HEAT to 50555 for nearest shelter."

**Dissemination**: WEA (SAME codes: HT), IPAWS, SMS to registered vulnerable populations, in-app alerts with route to nearest cooling center.

**Dashboard**: Real-time HI grid map, 48-hour forecast, cooling center finder with capacity status, vulnerable area heatmap overlay.

## Sensor Input
**Primary**: NOAA/NWS weather stations (800+ in CONUS), METAR observations.
**Secondary**: Personal weather station network (Weather Underground API), smartphone crowd-sourced temperature reports.
**Satellite**: MODIS land surface temperature (1km, 1-2 day latency), Landsat 8 (30m, 16-day repeat).

**QA**: Flag stations with data gaps >30min; validate against neighboring stations (outlier detection: zscore >3).
