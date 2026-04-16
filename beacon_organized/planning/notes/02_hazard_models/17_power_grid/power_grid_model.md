# Power Grid Hazard Model

## Risk Layer
**Data Source**: DOE Office of Energy Policy & Systems Analysis (OEPSA), NERC, utility SCADA systems
Outage risk factors: weather hazards (wind, ice), aging infrastructure, demand surge, cascading failures.

**Risk Classification**:
- Minimal: <1% of region without power, duration <1 hour
- Moderate: 1-5% affected, duration 1-4 hours
- Significant: 5-15% affected, duration 4-12 hours
- Major: 15-50% affected, duration 12-48 hours
- Catastrophic: >50% affected, duration >48 hours

**Critical Infrastructure Impact**: Hospitals, water treatment, emergency services, data centers.

## Ongoing Hazard Model
**Grid Monitoring**: Integrate utility SCADA data (when available) with weather-based outage prediction.

```
weather_hazard_score = assess_extreme_weather_threat(wind_speed, ice_accumulation, temperature_stress)
transformer_loading = estimate_peak_demand(time_of_day, temperature, special_events)
grid_vulnerability = assess_network_topology_risk(transmission_line_status, reserve_capacity)
outage_probability = logistic_model(weather_score, loading, vulnerability)
```

**Operational Data**: NERC EOP (Event Occurrences) database logs ~300-400 significant events/year in CONUS.

**API**: DOE OE Dashboards (oasis.energy.gov) provides near-real-time outage data; NERC events: 15-min lag.

## Spread/Evolution
Cascading failures propagate seconds to minutes; initial event triggers protective relay actions across network.

**Cascade Model**:
```
initial_line_failure = transmission_line_outage(high_wind, ice_weight, temperature)
load_redistribution = recalculate_power_flow_away_from_failed_line
overload_lines = identify_lines_exceeding_thermal_limit
secondary_failures = number_of_protective_relays_triggered
network_fragmentation = assess_island_formation_and_stability
```

**Restoration Sequence**: Operators follow manual restoration procedures (30-60 min typical black start). Depends on availability of quick-start generation (gas turbines, hydro).

**Forecast Window**: Weather-based outage risk extends 48 hours ahead using HRRR and GFS models.

## Lethality
**Direct Deaths**: Power outages cause ~2,000 annual US deaths (CDC analysis) via:
- Heating failure (hypothermia): 40% of deaths
- Loss of life support (ventilators, dialysis, insulin refrigeration): 30%
- Traffic accidents (failed signals): 20%
- Other (heat, medication loss): 10%

**Mortality Calculation**:
```
excess_deaths_heating = population_age65+ × (days_without_heat / 7) × 0.1 per_day_rate
excess_deaths_medical = life_support_dependent_population × outage_duration_hours × 0.02 per_hour_rate
excess_deaths_traffic = outage_area_population × outage_duration_hours × traffic_accident_rate
```

**High-Risk Populations**: Age >65 (50% of cold-related deaths), homebound (100% dependent on power), critically ill.

## Safe Zones
**Backup Power Facilities**:
- Hospitals with 72+ hour onsite fuel capacity for generators
- Data centers with UPS (uninterruptible power supply) systems
- Municipal shelters with generators and heating fuel
- Battery charging stations for power-dependent medical devices

**Mapping Algorithm**: Query hospital permit data for backup power specs; identify healthcare facilities with <24 hour capacity as high-risk.

## Evacuation
**Not primary evacuation trigger** but affects evacuation operations:
- Fuel pump failures in outage areas limit vehicle refueling
- Traffic signal failures create congestion
- Real-time evacuation routing requires working cell towers and internet

## Vulnerability
**Vulnerable Populations**:
- Life-support dependent: 3-5 million Americans on home medical equipment
- Dialysis patients: 750,000 in US; 3-4 hour treatment windows, power-dependent
- Oxygen-dependent: 1-2 million; portable tanks last 4-8 hours
- Insulin-dependent diabetics: 3.7 million; refrigeration critical for long-term supply
- Age >65: 56 million; heating/cooling sensitivity
- Homeless: no backup shelter
- Incarcerated: no evacuation option

**Medical Device Mapping**: Utility companies maintain optional medical baseline registries; integrate with emergency management systems.

**Socioeconomic Vulnerability**: Low-income households 30% more likely to lose power in mixed-income outages (infrastructure age correlation).

## Secondary Effects
**Infrastructure Cascade**:
- Water treatment: 4-6 hour capacity on backup power; longer outages risk waterborne disease
- Water heating: loss of hot water (hygiene, sanitation concerns)
- Wastewater treatment: discharge to environment without power-driven treatment
- Cell tower outage: backup battery 4-8 hours; communication failure after
- Internet infrastructure: ISP equipment without UPS loses power immediately

**Economic Impact**:
- Data center shutdown: $5,600 per minute (IDC estimate)
- Industrial production: $100-200M per hour for major manufacturing
- Retail/hospitality: inventory loss, lost sales

**Traffic System**:
- Signal failures: 3-5 minute intersection capacity loss
- Accident rate increase: 25-50% during signal-out period
- Emergency vehicle response time: +3-5 minutes in major outages

**Food Security**: Refrigerated food loss in homes and retail; spoilage within 4-6 hours.

## Operational Protocols
**Pre-Event**:
- Issue conservation appeals when demand forecast >85% of peak capacity
- Activate demand response programs (industrial curtailment, thermostat management)
- Verify generator fuel reserves at critical facilities

**Tier 1 (Localized Outage, <5% affected, <4 hours)**:
- Issue outage notification via utility website
- Deploy field crews to restore power
- Monitor for secondary failures in adjacent feeders
- Public messaging: reasonable outage duration expectation

**Tier 2 (Regional Outage, 5-15% affected, 4-12 hours)**:
- Declare local emergency
- Activate shelter opening and emergency operations
- Deploy generators to critical facilities (hospitals, water treatment)
- Restrict traffic in affected areas (signals out)
- Activate medical device emergency support (loaner equipment, battery shipments)
- Issue water boil orders if water system affected

**Tier 3 (Major Outage, >15% affected, >12 hours)**:
- Activate state emergency operations center
- Deploy National Guard for fuel distribution and traffic management
- Implement gas rationing (fuel line management)
- Activate mass care sheltering (cooling/heating centers)
- Coordinate mutual aid from neighboring utilities
- Establish fuel and generator distribution points
- Issue health advisories (food safety, water quality, medication storage)

## Caching/Offline
**Cache Strategy**:
- Download NERC grid topology maps and critical facility locations (10MB)
- Store hospital backup power specifications (updated quarterly)
- Cache medical device registry (if available) with addresses
- Download HRRR weather forecasts for outage risk model
- Store generator fuel depot locations and current inventory levels
- Offline: last known outage status; simple persistence model (assume restoration in progress)

**Update Frequency**: SCADA data 5-10 min when available; weather forecasts 6-hourly; utility infrastructure data quarterly.

## Comms/UI
**Alert Format**: "Power Outage: 120,000 affected, estimated restoration 6 hours. Hospitals and water plant on backup power. Open shelters: Lincoln HS (cooling, no power devices). Fuel: station on Main St operational."

**Dissemination**: Utility customer notification (SMS, app), WEA for emergency declarations, SMS to life-support registrants with equipment loaner info, in-app shelter finder with backup power status.

**Dashboard**: Real-time outage extent map (percentage of area affected), restoration time estimate, critical facility backup power status (hospitals, water, comms), open shelter locations with capacity, generator deployment status, fuel availability, medical device loaner distribution sites, restoration progress forecast.

## Sensor Input
**Primary**: Utility SCADA systems (when integrated), distribution automation sensors.
**Secondary**: Weather data (HRRR, mesonet stations) for outage risk prediction.
**Tertiary**: Crowdsourced outage reports (Outage Central, social media monitoring).

**QA**: Validate SCADA data against known network topology; flag impossible load flows. Cross-check crowdsourced reports against utility data (50+ reports = high confidence). Validate weather-based outage risk model against historical events.
