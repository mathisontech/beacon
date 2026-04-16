# Drought Hazard Model

## Risk Layer
**Data Source**: NOAA US Drought Monitor, NRCS Palmer Drought Severity Index (PDSI), SPI
Classification follows US Drought Monitor methodology (5-category scale):

- D0 (Abnormally Dry): 20-30% of normal precipitation for season
- D1 (Moderate): 30-40% of normal, crop stress visible
- D2 (Severe): 40-50% of normal, widespread water restrictions
- D3 (Extreme): 50-60% of normal, major crop failure, severe water shortage
- D4 (Exceptional): >60% precipitation deficit, widespread emergency conditions

**Composite Index**: Combine multiple metrics:
```
drought_index = 0.4*PDSI + 0.3*SPI_12mo + 0.2*soil_moisture_deficit + 0.1*streamflow_percentile
category = classify_drought_index(drought_index)
```

## Ongoing Hazard Model
**Monthly Assessment**: NOAA NRCS updates PDSI on 15th of each month.

PDSI Calculation: PDSI = (X - mean_X) / standard_dev_X where X is computed from temperature, precipitation, and available water capacity (AWC).

**SPI (Standardized Precipitation Index)**: Cumulative probability of precipitation deficits over 1, 3, 6, 12-month windows.
```
SPI_n = (P_sum - P_mean) / standard_dev
drought_flag = SPI < -1.0 (moderate), < -1.5 (severe)
```

**Soil Moisture Deficit**: Query NOAA Global Land Data Assimilation System (GLDAS) 0.25° resolution; track against 30-year climatology.

**APIs**: NRCC CRN (Climate Reference Network), NOAA Drought Monitor API.

## Spread/Evolution
Droughts develop over weeks to months, driven by persistent high-pressure systems and warm-season temperature anomalies.

**Predictability**: Use NOAA Climate Prediction Center (CPC) drought outlook (30/60/90-day outlook).
- Teleconnections: monitor ENSO (El Niño/La Niña), NAO, Pacific Decadal Oscillation for multi-month persistence
- Temperature anomaly: each 1°C above normal increases evapotranspiration 5-8% (Trenberth et al.)

**Forecast Algorithm**:
```
drought_persistence = CPC_drought_outlooks + ENSO_phase_factor
termination_probability = precipitation_forecast_anomaly / climatological_deficit_rate
```

## Lethality
**Direct Mortality**: Drought rarely causes direct deaths in developed nations. Indirect effects dominate:

**Wildfire Amplification**: Fuel moisture <12% triggers rapid fire spread; 40% of wildfires occur in drought-stricken areas (NIFC analysis).

**Cascade to Wildfire Mortality**: Use NFDRS (National Fire Danger Rating System) to estimate fire risk amplification.

**Crop Failure Impact**: Iowa drought reduces corn yield 30-50%; feeds livestock price surge and food security impact in vulnerable populations.

**Health System Stress**: Wildfire-smoke PM2.5 surge coincides with drought peak; combined air quality + heat exhaustion mortality multiplier = 2.3x for sensitive groups.

## Safe Zones
**Not primary hazard for evacuation** but triggers wildfire refugia planning:
- Identify fuel-reduced defensible space zones (Forest Service Healthy Forests Initiative areas)
- Map water supply backup sources (groundwater reserves, desalination capacity)

**Agricultural Transition Zones**: High-capability soils with irrigation backup; route climate refugees to sustainable agriculture regions.

## Evacuation
**No direct evacuation** but prevents wildfire evacuation zones preparation:
- Pre-position fuel reduction crews in D2+ drought areas (6-month lead time)
- Activate contingency water rationing (riparian flow restrictions)
- Coordinate with agriculture extension for crop transition planning

## Vulnerability
**Vulnerable Populations**:
- Farmers/ranchers: 20-40% income loss in D2+ droughts (USDA analysis)
- Rural water systems: 10-15% of rural public water systems inadequate in D2+ (EPA data)
- Low-income: higher food security impact (ERS Food Access Research Atlas)
- Outdoor recreation economy: 5-10% revenue loss in tourism-dependent regions

**Agricultural Vulnerability**: High-value crops (alfalfa for dairy, specialty horticulture) most at-risk.

**Groundwater Depletion**: Aquifer stress mapping; flag areas with >2% annual depletion (USGS GRACE satellite).

## Secondary Effects
**Water Supply Cascade**:
- Surface water availability: streamflow drops 50-80% in D3-D4 droughts
- Groundwater extraction surge: triggers long-term aquifer depletion and subsidence
- Reservoir levels: trigger water rationing (e.g., Lake Mead <1075' elevation triggers Colorado River cuts)

**Agricultural System**:
- Crop failure: corn yield loss 30-50%, alfalfa 60-80% in severe drought
- Livestock herd liquidation: cattle sales surge 20-30%, feeder lot closures
- Commodity price spike: feed costs increase 40-60%

**Wildfire Linkage**: Vegetation stress and fuel moisture <12% increases fire probability 3-5x (MTBS analysis).

**Ecosystem Collapse**: Fish kills from low streamflow, riparian vegetation die-off.

## Operational Protocols
**D0-D1 (Abnormally Dry)**:
- Issue drought advisory via NOAA Drought Monitor
- Public messaging: water conservation tips
- Monitor groundwater trends and wildfire fuel moisture

**D2-D3 (Severe-Extreme)**:
- Declare drought emergency
- Activate water rationing (agricultural 20%, non-essential outdoor use 50%)
- Trigger agricultural disaster assessment (USDA Farm Service Agency)
- Increase wildfire suppression funding and fuel reduction
- Coordinate with livestock extension for herd management

**D4 (Exceptional)**:
- Activate emergency operations center
- Implement mandatory water restrictions (no outdoor irrigation, car washing banned)
- Evacuate livestock from drought-stricken areas (transport assistance)
- Suspend recreational water uses
- Deploy emergency food assistance (SNAP supplement authorization)
- Restrict water-intensive industry operations

## Caching/Offline
**Cache Strategy**:
- Store PDSI/SPI climatological statistics (30-year normals, standard deviations)
- Download GLDAS soil moisture grids monthly (1GB for region)
- Cache NFDRS fire danger thresholds and vegetation fuel maps
- Store agricultural capability class maps (NRCS SSURGO database)
- Offline: last drought category + simple persistence forecast (linear SPI trend)

**Update Frequency**: Monthly PDSI/NASS crop updates, weekly soil moisture, daily wildfire danger.

## Comms/UI
**Alert Format**: "Severe drought (D2) 8-month duration. Crop yield: -35%. Water rationing: 50% outdoor use. Wildfire danger elevated. Livestock emergency assistance available."

**Dissemination**: NOAA Drought Monitor email subscriptions, IPAWS for emergency declarations, in-app push to agricultural extension and water utility networks.

**Dashboard**: US Drought Monitor category map, PDSI/SPI timeseries (12-month history), soil moisture deficit grid, precipitation anomaly forecast, wildfire danger overlay, crop impact assessment, water supply status (reservoir levels, streamflow percentiles).

## Sensor Input
**Primary**: NOAA CRN (hourly precipitation/soil moisture), NASS precipitation data, USGS streamflow gauges (8,000+ stations).
**Secondary**: Satellite soil moisture (SMAP L-band radiometer, 9km resolution), MODIS vegetation indices (NDVI, NDII).
**Tertiary**: Farmer-reported crop condition (USDA NASS), local water utility data.

**QA**: Gap-fill missing precipitation using radar-based estimates (Stage IV, 4km); validate streamflow trends against 30-year normals. Flag crop condition reports >2 std dev from neighbors.
