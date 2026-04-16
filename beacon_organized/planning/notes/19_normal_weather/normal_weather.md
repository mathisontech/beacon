# Normal Weather

## Overview

Beacon's normal weather display provides 7-day forecasts, real-time conditions, and hourly weather trends. Primary data source is National Weather Service API (api.weather.gov), supplemented by radar, satellite imagery, and historical climate patterns. Weather display serves dual purposes: user situational awareness and model input for severe weather detection thresholds.

## NWS API Integration

Primary endpoint: https://api.weather.gov/points/{latitude},{longitude} returns forecast grid point metadata including gridX, gridY, and forecast URLs.

Data refresh rate: Hourly forecasts updated every 60 minutes by NWS. Beacon syncs at :15 minutes past each hour (15 min after NWS update). Archive updates daily at 6am Pacific.

Forecast periods: NWS API provides 7-day forecast (168-hour rolling window), divided into 12-hour periods during day (6am-6pm) and overnight (6pm-6am). Beacon displays simplified: 7 day/night period pairs.

Weather elements: Temperature, humidity, wind speed/direction, precipitation probability, precipitation amount, sky cover (clear/mostly clear/partly cloudy/mostly cloudy/overcast), hazard flags (thunderstorm, winter weather, dense fog, dust/sand).

Spatial coverage: NWS grid resolution ~2.5 km. Beacon interpolates forecast for exact user coordinates using inverse distance weighting (IDW) from 4 nearest grid points.

## Forecast Display

Mobile UI: Card-based design, current conditions prominent, 7-day scrollable row, hourly expandable detail. Current conditions show: temperature, condition icon, wind (speed + direction cardinal), humidity, UV index, air quality.

Hourly detail: For selected day, shows 24-hour timeline: temperature curve, wind gust indicators, precipitation chance bar, condition icon per hour. User can swipe to adjacent days.

Alert integration: Watch/Warning/Advisory bar appears above forecast if active for area. Color-coded by severity (red=warning, orange=watch, yellow=advisory).

Historical context: 7-day display includes average high/low for date (from 30-year climate normals). User can see if forecasted temps are above/below normal.

Accuracy metrics: Beacon displays NWS forecast confidence interval (high/medium/low) per period. Helps users understand uncertainty in forecast.

## Watch/Warning/Advisory Transition Logic

NWS issues watches when conditions favor hazard but not imminent. Warnings when hazard imminent or occurring. Advisories for less-severe hazards.

State machine per hazard type:
- Normal → Watch (NWS issues watch product, Beacon receives via CAP) → Warning (watch upgrades to warning) → Post-event (warning expires)
- Watch can expire without warning (conditions weaken)
- Multiple watches/warnings can be active simultaneously (e.g., both tornado watch and wind advisory)

Beacon display: Each hazard shows current status (none/watch/warning/advisory) and time remaining. Time remaining calculated from expires field in CAP feed minus current time. Flashing alert if less than 1 hour remaining.

Threshold-based escalation: Beacon's severe weather detector (Section 2) monitors real-time conditions (wind speed, radar reflectivity, lightning, etc.). If Beacon-detected condition severity exceeds NWS watch criteria, Beacon triggers local alert (Level 2 Advisory) within group to increase awareness even if NWS hasn't issued watch yet. Example: "Strong winds developing in your area (30+ mph gusts detected). Monitor weather.gov for watch updates."

Transition notifications: When watch issues, Beacon sends Level 3 (Watch) alert. When watch upgrades to warning, Level 4 (Warning) alert. NWS provides metadata (reason for upgrade, expected impacts) which Beacon includes in message.

## Weather Simulator Feature

Interactive tool for scenario planning. Users input hypothetical weather (temperature, wind speed, direction, precipitation) and Beacon simulates:
- Fire behavior: spread rate, flame length (using Rothermel fire spread model), evacuation trigger thresholds
- Flood risk: runoff + watershed model, inundation extent
- Avalanche risk: slope stability model, trigger probability
- Visibility impact: sight distance for driving, visibility radius

Use cases: Fire department plans prescribed burn window; community plans evacuation drill; individual evaluates home defensibility under various conditions.

Interface: Weather condition sliders (temp -20 to 120F, wind 0-60 mph, humidity 10-100%), time of day selector (affects fire behavior), fuel moisture preset (green/active/cured). Simulation results shown as color-coded hazard map overlay.

Validation: Simulator uses same hazard models as real-time system, tested against historical events (RMSE accuracy).

## Severe Weather Threshold Detection

Real-time sensor network (wind stations, rain gauges, lightning, radar) continuously monitored for conditions exceeding severe weather thresholds.

Wind threshold: NWS sustained wind ≥40 mph OR gusts ≥60 mph → trigger Level 3+ alert.

Precipitation threshold: NWS rainfall rate ≥2 in/hour for ≥15 min → flash flood alert.

Lightning threshold: NOAA lightning mapper detecting ≥100 cloud-ground strikes per 10-min window → thunderstorm alert.

Radar threshold: NEXRAD reflectivity ≥50 dBZ (strong convection) in rotating couplet or hook echo pattern → severe thunderstorm alert.

Temperature threshold: Forecasted high ≥105F or low ≤-10F in populated area → heat/cold advisory.

Event trigger: When threshold exceeded, Beacon issues local alert (Level 3 Watch or Level 4 Warning depending on confidence, proximity to populated areas, NWS current products). Alert includes: condition detected, magnitude, expected duration, recommended action (prepare/monitor/evacuate).

False positive management: Thresholds set conservatively (slightly above actual severe threshold) to favor sensitivity over specificity. User can suppress recurring alerts in same location/condition if they perceive as false alarms. Feedback logged for algorithm refinement.

## Data Pipeline and Storage

Ingestion: NWS API call every 60 min, parse JSON response, extract grid forecast. Store raw forecast as blob (JSON) in database. Timestamp stored for version tracking.

Processing: Interpolate forecast to user coordinates (lazy, on-demand). Compare current forecast to previous hour's forecast, detect major changes (≥10F temp change, ≥10 mph wind change) and flag as "Significant change detected" in UI.

Archival: Keep last 7 days of forecasts (history of how forecast changed over time). Older forecasts deleted. Post-event, export forecast archive for validation (compare forecast to actual observations).

Quality checks: Flag missing data (NWS outage), interpolation failures, outlier values (temp >130F, wind >100 mph). Skip updates if quality fail.

## Implementation Notes

Mesh network caching: Cached forecasts stored on-device, synced with mesh network hourly. Forecast bundle ~50KB (48 grid points of hourly data for 7 days).

Offline fallback: User can view cached forecast from up to 24 hours ago if offline. Timestamp shown ("Last updated: 3 hours ago").

Battery optimization: Forecast refresh runs during periodic WiFi sync; does not trigger data radio if WiFi available.

Scale: Beacon covers western US (12M+ grid points). 1M concurrent requests = ~100MB/sec peak bandwidth. NWS API SLA: 99% uptime.
