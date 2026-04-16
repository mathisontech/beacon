# Beacon Development Modules

## Module 1: Inputs
Ground truth conditions and public data feeds.

### 1.1 Map & Baseline
- Base map
- Related events baseline
- Recent conditions risk map

### 1.2 Official Feeds
- Alerts (IPAWS/WEA/EAS/NWS)
- Official hazard condition reports
- Public weather models (current + short-term projections)
- External simulated events (non-Beacon)

### 1.3 Remote Sensing
- Satellite and radar
- Live weather data
- Solar activity

### 1.4 Field Sensing
- Ground sensors and cameras
- Drone integrations
- User-owned sensors (raw data + detected features/incidents)

### 1.5 Crowd Signals
- User sightings
- Social media posts
- Discrepancy reports (user or sensor vs. official)

---

## Module 2: Models

### 2.1 Regional Risk
Likelihood/triggers across an area.
- Heuristic risk models
- Beacon weather forecast models
- Activity summarizer

### 2.2 Hazard Zones
Shape and extent as the event unfolds.
- Hazard movement models
- Ongoing event footprints

### 2.3 User Location Relative Models
User position relative to hazard, plus targeted asks tied to it.
- Location status overview
- Heuristic location alerts
- Custom condition reporting requests
- Daily surveys
