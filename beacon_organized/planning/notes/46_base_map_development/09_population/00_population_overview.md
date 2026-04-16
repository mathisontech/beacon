# Population Estimation Overview

Population estimation from building purpose + unit count + Census data, adjusted for time-of-day. Critical for casualty modeling, evacuation planning, shelter capacity, resource allocation.

## Estimation Approach

Multi-factor population model accounting for building type, occupancy patterns, time-of-day, seasonality, special facilities.

| Factor | Data Source | Impact |
|---|---|---|
| Residential units | Building detection + county assessor | Base residential count |
| Unit occupancy | Census household size (by county) | Persons per unit |
| Time-of-day factor | Land use + business hours | Daytime/nighttime variation |
| Seasonal variation | Tourism data, college calendars | Year-round multiplier |
| Special facilities | School enrollment, nursing home beds | Capacity counts |
| Transient population | Hotel, transit occupancy | Temporary occupants |

## Pipeline Order

1. Extract building footprints + estimate unit counts
2. Classify building purpose (residential/commercial/office/etc)
3. Load Census demographic data (block group level)
4. Compute base residential population (units × household size)
5. Estimate commercial daytime population (floor area × occupancy density)
6. Apply time-of-day multipliers (peak hours, night, weekend)
7. Adjust for seasonal variation (tourist hotspots, college towns)
8. Add transient population (hotels, hospitals)
9. Aggregate to grid cells (100m resolution)

## Downstream Dependencies

| Consumer | Required Layers |
|---|---|
| All hazard models | Total population per location |
| Casualty estimation | Population by age/vulnerability |
| Evacuation routing | Population demand by time-of-day |
| Notifications | Population count for scale |
| Shelter planning | Population needing housing |
| Medical response | Population health vulnerability |

## Cost & Storage

| Component | Cost |
|---|---|
| Census data | Free (NOAA) |
| Building unit estimation | ~$15/month GPU US |
| Commercial occupancy modeling | ~$10/month GPU US |
| Storage (population grids) | ~2 TB |

## 5-Agent Monitoring

| Metric | Target | Tool |
|---|---|---|
| Residential population | Within ±15% of Census | Sample block group comparison |
| Daytime population | Within ±30% | Compare to employment/school data |
| Building unit count | Within ±20% | Field survey sampling |
| Time-of-day accuracy | Realistic patterns | Survey 1000+ building occupancy times |
| Transient population | Within ±50% | Cross-check hotel/tourism data |

## Accuracy Targets

| Layer | Metric | Target |
|---|---|---|
| Residential pop | Block group accuracy | ±15% |
| Daytime pop | Tract accuracy | ±30% |
| Building units | Building-level | ±25% |
| Time-of-day factor | Category accuracy | >85% |
| Special facilities | Capacity | ±10% beds/seats |

## ML Models

| Task | Architecture | Training Data |
|---|---|---|
| Building unit counter | ResNet CNN on rooftop | Building unit surveys |
| Commercial occupancy predictor | Occupancy time series model | Cellular anonymized data |
| Daytime pop estimator | Gradient boosting regression | Employment + school + transit data |

## Dependencies

- rasterio, gdal (building data I/O)
- numpy, pandas (population computation)
- scikit-learn (regression models)
- Census API (demographic data)
- PostgreSQL (building inventory)
- Redis (caching)
- NATS (broadcasting)
