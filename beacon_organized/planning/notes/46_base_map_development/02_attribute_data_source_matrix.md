# Attribute Data Source Matrix

Source priority per attribute. Enables source prioritization, gap identification, and multi-source fusion.

**Key:** P = Primary, S = Secondary, T = Tertiary, O = Overriding (real-time or authoritative override), — = not applicable

## Data Source Columns

| Column | Abbreviation | Description |
|---|---|---|
| LiDAR | LiDAR | USGS 3DEP 1m point cloud |
| Sat-Hi | Sat-Hi | High-res satellite (NAIP 0.6m, commercial) |
| Sat-Med | Sat-Med | Medium-res satellite (Sentinel-2 10m) |
| Street-View | SV | Mapillary, Ring doorbell, dashcam archives |
| DEM | DEM | Copernicus 30m, 3DEP 1m bare earth |
| OSM | OSM | OpenStreetMap vector data |
| Assessor | Assr | County assessor / tax records |
| LANDFIRE | LF | USGS LANDFIRE vegetation/fuel |
| Census | Cens | Census Bureau demographics |
| FEMA | FEMA | Flood maps, shelter registry, NID, NBI |
| Soil/Hydro | S/H | SSURGO soil, NHD hydrology, HydroSHEDS |
| Seismic | Seis | USGS ShakeMap, Vs30, GEM faults |
| Reference | Ref | EPA TRI/RMP, FCC towers, DOT, NBI, NID, utility GIS |
| User Photo | UPh | User-submitted geotagged photo (verified via CV) |
| User Report | URp | User text/selection report (self-reported attribute) |
| User GPS | UGPS | Aggregated anonymous GPS traces and activity |
| Group Zones | GZ | Group-drawn boundaries (neighborhood, family, community) |
| EMS Override | EMS | EMS/authority real-time override (event-driven) |
| Phone Sensors | PSn | Barometer, accelerometer, signal strength |

---

## Building Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Footprint location | P | S | T | — | — | S | S | — | — | — | — | — | — | T | — | — | — | — | — |
| Height / floors | P | S | — | S | — | T | S | — | — | — | — | — | — | T | T | — | — | — | T |
| Building material | — | T | — | P | — | T | S | — | — | — | — | — | — | S | S | — | — | — | — |
| Building purpose | — | T | — | P | — | S | S | — | — | — | — | — | — | T | P | — | — | — | — |
| Apartment building | P | S | — | S | — | S | P | — | S | — | — | — | — | T | S | — | — | — | — |
| Single family home | P | S | — | S | — | S | P | — | S | — | — | — | — | T | S | — | — | — | — |
| Neighborhood boundary | — | T | — | T | — | S | S | — | P | — | — | — | S | — | T | S | GZ | — | — |
| Year built | — | — | — | T | — | T | P | — | — | — | — | — | — | — | S | — | — | — | — |
| Soft story detection | P | — | — | S | — | — | — | — | — | — | — | — | — | T | T | — | — | — | — |
| Exits/entrances | T | — | — | P | — | S | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Detected stairwells | T | — | — | S | — | T | — | — | — | — | — | — | — | S | P | — | — | — | — |
| Number of floors | P | S | — | S | — | T | S | — | — | — | — | — | — | T | S | — | — | — | — |
| Roof geometry | P | S | — | T | — | T | — | — | — | — | — | — | — | T | — | — | — | — | — |
| Roof material | — | T | — | P | — | T | S | — | — | — | — | — | — | S | S | — | — | — | — |
| Roof flame retardant | — | T | — | S | — | — | S | — | — | — | — | — | S | — | P | — | — | — | — |
| Helicopter landable roof | P | S | — | T | — | T | — | — | — | — | — | — | — | T | S | — | — | — | — |
| Distance to other structures | P | S | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Flammability score | T | T | — | P | — | — | S | S | — | — | — | — | — | S | S | — | — | — | — |
| Population estimate | — | T | — | — | — | T | S | — | P | — | — | — | — | — | T | S | — | O | — |
| Time-of-day occupancy | — | — | — | S | — | S | T | — | S | — | — | — | — | — | S | P | — | O | — |
| Heating type | — | — | — | T | — | — | P | — | — | — | — | — | — | — | P | — | — | — | — |
| In flood zone | — | — | — | — | S | — | — | — | — | P | S | — | — | — | T | — | — | O | — |
| Tornado shelter rating | — | — | — | S | — | T | S | — | — | — | — | — | — | T | P | — | — | — | — |
| Tsunami shelter rating | P | T | — | S | S | T | S | — | — | S | — | — | — | T | S | — | — | — | — |
| Earthquake shelter rating | — | — | — | S | — | T | P | — | — | — | — | S | — | T | S | — | — | — | — |
| Building code compliance | — | — | — | T | — | T | P | — | — | — | — | — | S | — | S | — | — | — | — |
| Building status (intact/damaged/destroyed) | — | S | S | — | — | — | — | — | — | — | — | — | — | S | S | — | — | O | — |
| Fireproof certified | — | — | — | T | — | T | P | — | — | — | — | — | S | — | P | — | — | — | — |
| Power source | — | — | — | T | — | T | S | — | — | — | — | — | P | — | P | — | — | — | — |
| Has fireplace | — | — | — | S | — | — | T | — | — | — | — | — | — | S | P | — | — | — | — |
| Utility provider coverage | — | — | — | — | — | — | — | — | — | — | — | — | P | — | S | — | — | — | — |
| Official tornado shelter | — | — | — | S | — | S | — | — | — | P | — | — | S | T | S | — | — | — | — |
| Glass front / storefront | — | T | — | P | — | S | S | — | — | — | — | — | — | S | S | — | — | — | — |
| Flotation device storage | — | — | — | S | — | T | — | — | — | — | — | — | — | S | P | — | — | — | — |
| Needs retrofit (seismic) | — | — | — | S | — | — | P | — | — | — | — | S | S | — | S | — | — | O | — |
| Marked high risk building | — | — | — | S | — | T | S | — | — | — | — | — | S | T | S | — | — | O | — |
| Ignition ease (exterior) | — | T | — | P | — | — | S | S | — | — | — | — | — | S | S | — | — | — | — |
| Burn duration estimate | — | T | — | S | — | — | S | S | — | — | — | — | — | — | S | — | — | — | — |
| Fuel load (structure) | P | T | — | S | — | — | S | — | — | — | — | — | — | — | S | — | — | — | — |
| ADA accessible entrance | — | T | — | P | — | S | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Elevator present | — | — | — | S | — | S | S | — | — | — | — | — | — | T | P | — | — | — | — |
| Wheelchair navigable interior | — | — | — | T | — | T | — | — | — | — | — | — | — | — | P | — | — | — | — |

## Road Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Network topology | S | S | — | T | — | P | — | — | — | — | — | — | S | — | T | S | — | — | — |
| Road width | P | S | — | T | — | T | — | — | — | — | — | — | — | — | T | — | — | — | — |
| Number of lanes | P | S | — | S | — | S | — | — | — | — | — | — | — | T | T | — | — | — | — |
| Lane direction | — | — | — | P | — | S | — | — | — | — | — | — | S | T | S | S | — | — | — |
| One-way | — | — | — | P | — | P | — | — | — | — | — | — | S | T | S | S | — | — | — |
| Surface type | T | S | — | P | — | S | — | — | — | — | — | — | — | S | S | — | — | — | — |
| U-turn possibility | P | S | — | T | — | — | — | — | — | — | — | — | — | — | T | — | — | — | — |
| K-turn possibility | P | S | — | T | — | — | — | — | — | — | — | — | — | — | T | — | — | — | — |
| Driveway length/width/slope | P | S | — | T | S | T | — | — | — | — | — | — | — | — | S | — | — | — | — |
| Street crowding (parked cars) | S | T | — | S | — | T | — | — | — | — | — | — | — | P | P | — | — | — | — |
| Driveways (existence) | P | S | — | S | — | T | — | — | — | — | — | — | — | — | S | — | — | — | — |
| Pavement layer | P | S | T | S | — | S | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Parking areas | S | P | — | S | — | S | — | — | — | — | — | — | — | — | T | — | — | — | — |
| Docks / marinas | P | S | T | S | — | S | — | — | — | — | — | — | — | — | T | — | — | — | — |
| Private roads | — | — | — | S | — | S | P | — | — | — | — | — | — | — | S | — | — | — | — |
| Behind locked gate | T | — | — | P | — | S | T | — | — | — | — | — | — | S | P | — | — | O | — |
| Confirmed evacuation routes | — | — | — | T | — | S | — | — | — | — | — | — | S | — | T | S | — | P | — |
| Road flammability | T | T | — | S | — | — | — | P | — | — | — | — | — | S | T | — | — | — | — |
| Signs (road/warning/info) | — | T | — | P | — | S | — | — | — | — | — | — | — | S | T | — | — | — | — |

## Barrier Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fence location/extent | S | T | — | P | — | S | T | — | — | — | — | — | — | S | S | — | — | — | — |
| Fence material | — | — | — | P | — | T | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Fence rammability | — | — | — | P | — | — | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Fence flammability | — | — | — | P | — | — | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Wall location/extent | P | S | — | S | — | S | T | — | — | — | — | — | — | S | T | — | — | — | — |
| Wall material/height | S | — | — | P | — | T | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Wall flammability | — | — | — | P | — | — | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Guardrail location | S | T | — | P | — | S | — | — | — | — | — | — | — | S | — | — | — | — | — |
| Hedge location/extent | S | S | T | P | — | T | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Hedge height/density | S | T | — | P | — | T | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Hedge species | — | — | — | P | — | — | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Hedge flammability | — | — | — | S | — | — | — | S | — | — | — | — | — | — | S | — | — | — | — |
| Boulder/rock barrier | P | S | — | S | — | T | — | — | — | — | — | — | — | S | T | — | — | — | — |
| Gate (locked/unlocked) | T | — | — | P | — | S | — | — | — | — | — | — | — | S | P | — | — | O | — |
| Gate owner/contact | — | — | — | T | — | — | S | — | — | — | — | — | — | — | P | — | — | — | — |
| Barrier bypass difficulty | T | — | — | P | — | — | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Barrier fire-bridge potential | — | — | — | P | — | — | — | — | — | — | — | — | — | S | S | — | — | — | — |

## Terrain Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Elevation | P | — | — | — | S | — | — | — | — | T | — | — | — | — | T | — | — | — | T |
| Slope angle | P | — | — | — | S | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Aspect | P | — | — | — | S | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Terrain curvature | P | — | — | — | S | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Drainage direction | P | — | — | — | S | — | — | — | — | — | S | S | — | — | — | — | — | — | — |
| Soil permeability | — | — | — | — | — | — | — | — | — | — | P | T | — | — | — | — | — | — | — |
| Grass layer | T | S | S | — | — | T | — | P | — | — | — | — | — | — | — | — | — | — | — |
| Sand layer | S | P | S | — | — | T | — | — | — | — | — | — | — | — | T | — | — | — | — |
| Liquefaction zones | — | — | — | — | — | — | — | — | — | — | S | P | — | — | — | — | — | — | — |
| Landslide risk | P | — | — | — | S | — | — | — | — | — | S | — | — | — | — | — | — | — | — |
| Avalanche zones | P | S | — | — | S | — | — | — | — | — | — | — | — | — | S | — | — | — | — |
| Sinkhole risk | — | — | — | — | T | — | — | — | — | — | P | — | — | — | S | — | — | — | — |
| Snow melt flood risk zone | S | — | S | — | P | — | — | — | — | S | S | — | S | — | T | — | — | — | — |
| HAND (height above nearest drainage) | P | — | — | — | P | — | — | — | — | — | S | — | — | — | — | — | — | — | — |
| Dist to high ground (1m rise) | S | — | — | — | P | — | — | — | — | T | S | — | — | — | T | T | — | — | T |
| Dist to high ground (3m rise) | S | — | — | — | P | — | — | — | — | T | S | — | — | — | T | T | — | — | T |
| Dist to high ground (5m rise) | S | — | — | — | P | — | — | — | — | T | S | — | — | — | T | T | — | — | T |
| Dist to high ground (10m rise) | S | — | — | — | P | — | — | — | — | T | S | — | — | — | T | T | — | — | T |
| Dist to high ground (15m rise) | S | — | — | — | P | — | — | — | — | T | S | — | — | — | T | T | — | — | T |
| Fault lines | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — |
| Volcano monitoring | — | — | — | — | — | — | — | — | — | — | — | S | P | — | S | — | — | — | — |

## Vegetation Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tree location/height | P | S | — | T | — | T | — | — | — | — | — | — | — | S | T | — | — | — | — |
| Tree species | — | T | — | P | — | S | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Vegetation density | P | S | S | T | — | T | — | S | — | — | — | — | — | T | T | — | — | — | — |
| Canopy cover (%) | P | S | S | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Canopy height | P | S | — | T | — | — | — | S | — | — | — | — | — | — | T | — | — | — | — |
| Canopy base height | P | T | — | T | — | — | — | S | — | — | — | — | — | — | T | — | — | — | — |
| Canopy bulk density (kg/m³) | P | T | — | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Canopy fuel loading | S | T | — | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Fire behavior fuel model (FBFM) | — | T | S | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Vegetation health/NDVI | — | S | P | T | — | — | — | S | — | — | — | — | — | — | T | — | — | — | — |
| Burn scars | — | S | P | T | — | — | — | T | — | — | — | — | — | S | S | — | — | O | — |
| Vegetation type (EVT) | T | S | S | S | — | S | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Transition fuel (ground to canopy) | P | T | — | T | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Ladder fuel density | P | T | — | T | — | — | — | S | — | — | — | — | — | — | T | — | — | — | — |
| Surface fuel depth | P | T | — | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Litter/duff depth | — | — | — | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Coarse woody fuel loading | P | — | — | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Duff loading (tons/acre) | — | — | — | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Fuel particle surface-area-to-volume ratio | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — |
| Fuel particle heat content | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — |
| Moisture of extinction | — | — | — | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| 1-hour fuel moisture | — | — | — | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| 10-hour fuel moisture | — | — | — | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| 100-hour fuel moisture | — | — | — | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| Live herbaceous moisture | — | — | S | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| Live woody moisture | — | — | S | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| Foliar moisture content | — | — | S | — | — | — | — | S | — | — | — | — | P | — | — | — | — | — | — |
| Dead fuel moisture (seasonal avg) | — | — | S | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| Live fuel moisture (seasonal avg) | — | — | S | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |

## Hazard History & Fire Risk Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Last burn date per cell | — | S | P | — | — | — | — | S | — | — | — | — | S | — | T | — | — | O | — |
| Burn-together zones (N wind) | P | S | — | — | — | — | — | S | — | — | — | — | — | — | — | — | — | — | — |
| Burn-together zones (S wind) | P | S | — | — | — | — | — | S | — | — | — | — | — | — | — | — | — | — | — |
| Burn-together zones (E wind) | P | S | — | — | — | — | — | S | — | — | — | — | — | — | — | — | — | — | — |
| Burn-together zones (W wind) | P | S | — | — | — | — | — | S | — | — | — | — | — | — | — | — | — | — | — |
| Wind history (prevailing direction) | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Wind history (seasonal patterns) | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Low burn risk zones | S | S | S | — | S | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Terrain flammability | — | T | S | — | S | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Vegetation ignition ease | — | T | S | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Vegetation burn duration | — | T | S | — | — | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Fire spread rate (per cell) | S | S | S | — | S | — | — | P | — | — | — | — | — | — | T | — | — | — | — |
| Historical fire perimeters | — | S | P | — | — | — | — | S | — | — | — | — | P | — | — | — | — | — | — |
| Fire return interval | — | T | S | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| Ember transport potential | P | S | S | — | S | — | — | P | — | — | — | — | — | — | — | — | — | — | — |
| Spotting distance (modeled) | P | S | — | — | S | — | — | P | — | — | — | — | — | — | — | — | — | — | — |
| Crown fire potential | P | S | S | — | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — |
| Wind speed grid (real-time/modeled) | — | — | — | — | S | — | — | — | — | — | — | — | P | — | — | — | — | O | T |
| Wind direction grid (real-time/modeled) | — | — | — | — | S | — | — | — | — | — | — | — | P | — | — | — | — | O | T |
| Temperature grid | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | T |
| Relative humidity grid | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | T |
| Precipitation grid | — | — | S | — | — | — | — | — | — | — | S | — | P | — | — | — | — | — | T |
| Solar radiation / insolation | — | — | — | — | P | — | — | — | — | — | — | — | S | — | — | — | — | — | — |
| Fire weather index (FWI) | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Burning index (BI) | — | — | — | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| Energy release component (ERC) | — | — | — | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| Spread component (SC) | — | — | — | — | — | — | — | P | — | — | — | — | S | — | — | — | — | — | — |
| RAWS station data coverage | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Last tornado date | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Last hurricane date | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Last earthquake date | — | — | — | — | — | — | — | — | — | — | — | P | S | — | T | — | — | — | — |
| Last flood date | — | S | S | — | — | — | — | — | — | S | — | — | P | — | T | — | — | — | — |
| Last tsunami date | — | — | — | — | — | — | — | — | — | S | — | S | P | — | T | — | — | — | — |
| Last landslide date | — | S | — | — | — | — | — | — | — | — | — | — | P | S | T | — | — | — | — |
| Last volcanic event date | — | — | — | — | — | — | — | — | — | — | — | S | P | — | T | — | — | — | — |
| Last avalanche date | — | S | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Last storm surge date | — | — | — | — | — | — | — | — | — | S | — | — | P | — | T | — | — | — | — |
| Last hail event date | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Last ice storm date | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |

Ref for hazard history: NOAA Storm Events Database (tornado, hurricane, hail, ice storm, storm surge), USGS (earthquake, volcano, landslide), FEMA (flood, tsunami), state geological surveys.

Burn-together zones computed from: structure spacing (LiDAR P), wind direction, fuel load (LANDFIRE S), topography. Pre-computed for 4 cardinal wind directions per region using prevailing wind data from NOAA/NWS (Ref P).

Fire model compatibility: Layers marked above provide the inputs required by FARSITE, FlamMap, BEHAVE/Rothermel, and NVIDIA AI surrogate models. The 8 LCP layers (elevation, slope, aspect, FBFM, canopy cover, canopy height, canopy base height, canopy bulk density) are the minimum for FARSITE/FlamMap. Fuel moisture timelag classes (1h, 10h, 100h, live herb, live woody, foliar) are required for fire behavior calculations. Weather grids (wind, temp, RH, precip) are from NOAA RAWS/ASOS stations interpolated via WindNinja or HRRR model. Fire weather indices (FWI, BI, ERC, SC) are NFDRS outputs from WFAS. Ref sources: NOAA/NWS (weather), LANDFIRE (fuels/vegetation), USFS Missoula Fire Lab (FARSITE/FlamMap), NIFC (fire perimeters), NFDRS/WFAS (fire danger indices).

## Explosive/Hazardous Things Layer

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Gas stations | — | S | — | P | — | S | — | — | — | — | — | — | — | S | T | — | — | — | — |
| Propane tanks (residential) | — | — | — | P | — | — | — | — | — | — | — | — | — | S | P | — | — | — | — |
| Ammunition stores | — | — | — | P | — | S | — | — | — | — | — | — | — | — | S | — | — | — | — |
| Hazmat facilities | — | T | — | S | — | S | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Chemical plants | — | T | — | S | — | S | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Nuclear facilities | — | T | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Fireworks storage | — | — | — | S | — | T | — | — | — | — | — | — | — | — | P | — | — | — | — |
| Fuel depots / oil tanks | — | S | — | S | — | T | — | — | — | — | — | — | P | S | T | — | — | — | — |
| Blast/plume radius | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | O | — |

Authoritative sources: EPA TRI/RMP (Ref), NRC (nuclear), DOT (pipelines), state fire marshal records.

## Infrastructure Attributes

### Bridges

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location/span | P | S | — | S | — | S | — | — | — | — | S | — | S | T | — | — | — | — | — |
| Deck elevation | P | — | — | T | S | — | — | — | — | S | — | — | S | — | — | — | — | — | — |
| Clearance height | P | — | — | S | — | T | — | — | — | — | — | — | S | T | S | — | — | — | — |
| Lane count/capacity | P | S | — | S | — | S | — | — | — | — | — | — | — | — | T | — | — | — | — |
| Condition rating | — | — | — | T | — | — | — | — | — | — | — | — | P | T | T | — | — | O | — |
| Weight limit | — | — | — | S | — | T | — | — | — | — | — | — | P | T | S | — | — | — | — |
| Flood vulnerability | P | — | — | — | S | — | — | — | — | P | S | — | — | — | T | — | — | O | — |
| Seismic vulnerability | — | — | — | — | — | — | — | — | — | — | S | P | S | — | — | — | — | — | — |

NBI (National Bridge Inventory) via Ref column is authoritative for condition, weight, seismic rating.

### Overpasses

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location | P | S | — | S | — | S | — | — | — | — | — | — | — | T | — | — | — | — | — |
| Clearance height | P | — | — | S | — | T | — | — | — | — | — | — | — | T | S | — | — | — | — |
| Collapse susceptibility | — | — | — | T | — | — | — | — | — | — | — | S | P | — | — | — | — | — | — |

### Power Lines

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Routing/location | P | T | — | S | — | T | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Voltage class | — | — | — | S | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Owner / operator | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Ignition risk (veg contact) | P | T | — | S | — | — | — | S | — | — | — | — | — | S | S | — | — | — | — |
| Downed line risk | — | — | — | T | — | — | — | — | — | — | — | — | — | S | P | — | — | O | — |

### Utility Poles

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location | P | S | — | S | — | T | — | — | — | — | — | — | — | S | T | — | — | — | — |
| Material | — | — | — | P | — | — | — | — | — | — | — | — | — | S | T | — | — | — | — |
| Owner / operator | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Road blockage fall zone | P | — | — | T | — | — | — | — | — | — | — | — | — | — | T | — | — | — | — |

### Fire Hydrants

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location | T | T | — | P | — | S | — | — | — | — | — | — | S | S | S | — | — | — | — |
| Flow capacity (cap color) | — | — | — | P | — | T | — | — | — | — | — | — | S | S | S | — | — | — | — |
| Owner / operator | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Accessibility (blocked) | — | — | — | S | — | — | — | — | — | — | — | — | — | P | P | — | — | O | — |

### Water Towers

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location | P | S | — | S | — | S | — | — | — | — | — | — | S | T | — | — | — | — | — |
| Capacity | — | — | — | T | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Structural condition | — | — | — | T | — | — | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Owner / operator | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |

### Cell Towers

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location/height | P | S | — | S | — | S | — | — | — | — | — | — | S | T | — | — | — | — | — |
| Coverage area | — | — | — | — | — | — | — | — | — | — | — | — | S | — | T | — | — | — | P |
| Backup power | — | — | — | T | — | — | — | — | — | — | — | — | S | — | S | — | — | — | — |
| Owner / carrier | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |

### Satellite Dishes & Terminals

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Satellite internet terminal (Starlink etc.) | — | T | — | S | — | — | — | — | — | — | — | — | — | S | P | — | — | — | — |
| Satellite TV dish (receive-only) | — | S | — | P | — | — | — | — | — | — | — | — | — | S | S | — | — | — | — |
| VSAT terminal (commercial/institutional) | — | S | — | S | — | T | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Portable satellite comms (BGAN etc.) | — | — | — | — | — | — | — | — | — | — | — | — | S | — | P | — | — | O | — |
| Satellite dish type | — | T | — | S | — | — | — | — | — | — | — | — | — | S | P | — | — | — | — |
| Satellite internet operational status | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | O | T |

Satellite internet terminals (Starlink, HughesNet, Viasat) become critical communication hubs when cell towers and landlines fail. Receive-only TV dishes indicate households that can still get emergency broadcast info. VSAT terminals at hospitals, government, and EMS offices provide backup two-way data. Portable satellite comms (BGAN, IsatPhone) are deployed by EMS during events. Operational status is event-scoped — tracked during outages to identify working comms nodes.

### Dams

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location/geometry | P | S | — | — | — | S | — | — | — | — | S | — | S | T | — | — | — | — | — |
| Height/reservoir volume | P | T | — | — | S | — | — | — | — | S | — | — | P | — | — | — | — | — | — |
| Material type | — | — | — | S | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Downstream population | — | T | — | — | — | T | — | — | P | S | S | — | — | — | — | — | — | — | — |
| Seismic/liquefaction risk | — | — | — | — | — | — | — | — | — | — | S | P | — | — | — | — | — | — | — |
| Owner / operator | — | — | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |

NID (National Inventory of Dams) via Ref column is authoritative.

### Water Systems

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Pipeline routing | S | T | — | T | — | S | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Treatment plants | — | S | — | S | — | S | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Contamination vulnerability | — | — | — | — | — | — | — | — | — | S | S | — | P | — | T | — | — | — | — |
| Owner / operator | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |

### Power Stations / Substations

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location | P | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Type (generation/substation/solar/wind) | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Owner / operator | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Capacity (MW) | — | — | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Fuel type | — | — | — | S | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Service area | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |

Ref sources: EIA (power plants), PUC filings, utility GIS, FCC (cell towers), state dam safety offices, municipal water authorities.

## Hazard Mitigation Structures

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Avalanche breaker / deflector | P | S | — | S | S | S | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Avalanche fence / snow net | P | S | — | S | — | S | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Avalanche shed / gallery | P | S | — | S | — | S | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Flood control dam | P | S | S | S | S | S | — | — | — | S | S | — | P | T | T | — | — | — | — |
| Debris basin / catch dam | P | S | — | S | S | S | — | — | — | S | S | — | P | T | T | — | — | — | — |
| Mudflow / debris flow barrier | P | S | — | S | S | T | — | — | — | S | S | — | S | T | T | — | — | — | — |
| Levee / dike location | P | S | — | S | S | S | — | — | — | P | S | — | S | T | T | — | — | — | — |
| Levee condition / certification | — | — | — | S | — | — | — | — | — | P | — | — | S | T | S | — | — | — | — |
| Seawall / coastal armor | P | S | — | S | S | S | — | — | — | S | — | — | S | S | T | — | — | — | — |
| Breakwater / jetty | P | S | S | S | S | S | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Storm drain / culvert | P | T | — | S | — | S | — | — | — | — | S | — | P | S | T | — | — | — | — |
| Retention / detention pond | P | S | S | S | S | S | — | — | — | S | S | — | S | S | T | — | — | — | — |
| Riprap / erosion control | P | S | — | S | — | T | — | — | — | — | — | — | S | S | T | — | — | — | — |
| Firebreak (constructed) | S | P | S | S | — | T | — | S | — | — | — | — | S | S | T | — | — | — | — |
| Fuel break / defensible space | S | P | S | S | — | T | — | S | — | — | — | — | S | S | T | — | — | — | — |
| Wildfire sprinkler system | — | — | — | S | — | — | — | — | — | — | — | — | — | S | P | — | — | — | — |
| Tsunami wall / barrier | P | S | — | S | S | S | — | — | — | S | — | — | S | T | T | — | — | — | — |
| Tornado safe room (public) | — | — | — | S | — | T | — | — | — | P | — | — | S | T | S | — | — | — | — |
| Stormwater pump station | — | T | — | S | — | S | — | — | — | S | — | — | P | T | T | — | — | — | — |
| Rockfall net / catch fence | P | S | — | S | — | T | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Landslide retaining wall | P | S | — | S | — | T | — | — | — | — | — | — | S | S | T | — | — | — | — |
| Earthquake early warning sensor | — | — | — | — | — | — | — | — | — | — | — | P | S | — | T | — | — | — | — |

Mitigation structures are engineered defenses against specific hazards. Ref sources: USACE (levees, flood control), FEMA (levee certification, flood mitigation), state dam safety offices, USFS (firebreaks), NOAA (coastal structures), municipal stormwater departments. LiDAR is primary for detecting physical structures; FEMA is primary for levee certification.

## Critical Facilities

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hospital location | — | S | — | S | — | P | S | — | — | — | — | — | S | T | T | — | — | — | — |
| Hospital capacity (beds) | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Hospital trauma level | — | — | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Hospital helipad | P | S | — | S | — | T | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Police station location | — | S | — | S | — | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Fire station location | — | S | — | S | — | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Jail / prison location | — | S | — | S | — | S | — | — | — | — | — | — | P | T | — | — | — | — | — |
| Jail / prison population | — | — | — | — | — | — | — | — | S | — | — | — | P | — | — | — | — | — | — |
| Nursing home location | — | T | — | S | — | S | S | — | — | — | — | — | P | T | T | — | — | — | — |
| Nursing home capacity | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| School location | — | S | — | S | — | P | S | — | — | — | — | — | S | T | T | — | — | — | — |
| Daycare location | — | T | — | S | — | S | S | — | — | — | — | — | S | T | P | — | — | — | — |
| Assisted living location | — | T | — | S | — | S | S | — | — | — | — | — | P | T | T | — | — | — | — |
| Shelter (Red Cross/FEMA) | — | — | — | T | — | S | — | — | — | P | — | — | S | — | T | — | — | O | — |
| Shelter ADA compliance | — | — | — | T | — | T | — | — | — | S | — | — | P | — | S | — | — | — | — |
| Morgue / medical examiner | — | — | — | T | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| EMS / ambulance station | — | S | — | S | — | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| EMS station ambulance count | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Volunteer fire department | — | S | — | S | — | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Coast Guard station | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| National Guard armory | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Search and rescue (SAR) base | — | T | — | S | — | S | — | — | — | — | — | — | S | T | P | — | — | — | — |
| 911 / PSAP dispatch center | — | — | — | — | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Emergency operations center (EOC) | — | T | — | S | — | S | — | — | — | S | — | — | P | T | T | — | — | — | — |
| Red Cross chapter office | — | — | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Blood bank / donation center | — | — | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Dialysis center | — | — | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Pharmacy location | — | T | — | S | — | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Veterinary clinic | — | T | — | S | — | S | — | — | — | — | — | — | S | T | P | — | — | — | — |
| Animal shelter | — | T | — | S | — | S | — | — | — | — | — | — | S | T | P | — | — | — | — |
| Fuel depot / fuel station (emergency) | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Water treatment plant | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Wastewater treatment plant | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Emergency radio repeater / tower | — | T | — | — | — | T | — | — | — | — | — | — | P | T | T | — | — | — | — |
| HAM radio club / operator location | — | — | — | — | — | T | — | — | — | — | — | — | S | — | P | — | — | — | — |
| Staging area (pre-designated) | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| Triage / field hospital site | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: wildfire | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: flood | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: earthquake | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: tornado | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: tsunami | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: hurricane | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: volcanic | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: hazmat | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: nuclear | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: winter storm | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: extreme heat | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter: general | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS shelter pedestrian passable | — | T | — | S | — | S | — | — | — | S | — | — | — | S | P | — | — | O | — |
| EMS shelter wheelchair accessible | — | T | — | S | — | S | — | — | — | S | — | — | — | S | P | — | — | O | — |

EMS shelter designations are manually entered by emergency management authorities. EMS is primary source; FEMA is secondary where pre-planned shelter registries exist. A building may be designated for multiple hazard types.

Ref sources: CMS (nursing homes, hospitals), state licensing boards, DOJ (prisons), NCES (schools), Red Cross (shelters), FCC (PSAPs), USCG (Coast Guard), NGB (National Guard), AABB (blood banks), CMS (dialysis), EPA (water/wastewater), ARRL (HAM radio).

## Transit Infrastructure

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Bus routes | — | — | — | T | — | P | — | — | — | — | — | — | P | — | T | S | — | — | — |
| Bus stops | — | T | — | S | — | P | — | — | — | — | — | — | P | S | T | S | — | — | — |
| Bus depots | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Train / rail lines | — | S | — | T | — | P | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Train stations | — | S | — | S | — | P | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Subway / metro lines | — | — | — | T | — | P | — | — | — | — | — | — | P | — | — | S | — | — | — |
| Ferry terminals | — | S | — | S | — | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Airport location | — | P | — | S | — | S | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Airport runway capacity | — | S | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Helicopter company base | — | S | — | S | — | S | — | — | — | — | — | — | S | T | P | — | — | — | — |
| Helicopter fleet size | — | — | — | T | — | — | — | — | — | — | — | — | S | — | P | — | — | — | — |
| Port / deep water dock | P | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Cruise ship terminal | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Port vessel capacity | — | — | — | T | — | T | — | — | — | — | — | — | P | — | T | — | — | — | — |

Ref sources: GTFS (transit agencies), FRA (rail), FAA (airports), NTD (National Transit Database), USACE (ports), NOAA nautical charts.

## Hotels, Resorts & Lodging

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hotel / motel location | — | S | — | S | — | P | S | — | — | — | — | — | S | T | T | S | — | — | — |
| Hotel room count | — | — | — | T | — | T | S | — | — | — | — | — | S | — | T | — | — | — | — |
| Hotel max occupancy | — | — | — | — | — | T | S | — | — | — | — | — | S | — | T | — | — | — | — |
| Ski resort location | — | S | — | S | — | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Ski run maps / trail network | P | S | — | S | S | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| Ski resort capacity | — | — | — | T | — | T | — | — | — | — | — | — | S | — | T | S | — | — | — |
| RV park / campground | — | S | — | S | — | P | — | — | — | — | — | — | S | T | T | — | — | — | — |
| RV park / campground capacity | — | — | — | T | — | T | — | — | — | — | — | — | S | — | T | — | — | — | — |
| Resort complex | — | S | — | S | — | S | S | — | — | — | — | — | S | T | T | — | — | — | — |

Hotels/resorts matter for disaster planning: high transient population unfamiliar with the area, potential shelter capacity, evacuation coordination.

## Religious Institutions

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location | — | S | — | S | — | P | S | — | — | — | — | — | S | T | T | — | — | — | — |
| Type (church/mosque/synagogue/temple/etc) | — | T | — | P | — | S | S | — | — | — | — | — | — | T | P | — | — | — | — |
| Seating capacity | — | — | — | T | — | T | S | — | — | — | — | — | — | — | P | — | — | — | — |
| Shelter potential | — | — | — | S | — | T | S | — | — | T | — | — | — | T | S | — | — | — | — |
| Congregation size | — | — | — | — | — | T | — | — | — | — | — | — | — | — | P | — | — | — | — |

Religious institutions: often used as emergency shelters, community gathering points, and distribution centers during disasters. Large congregation size = communication hub.

## Government Buildings

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Location | — | S | — | S | — | P | S | — | — | — | — | — | P | T | T | — | — | — | — |
| Type (city hall/courthouse/post office/DMV/etc) | — | T | — | P | — | S | S | — | — | — | — | — | S | T | P | — | — | — | — |
| Federal / state / county / municipal | — | — | — | T | — | S | S | — | — | — | — | — | P | — | T | — | — | — | — |
| Backup power / generator | — | — | — | T | — | — | — | — | — | — | — | — | S | — | P | — | — | — | — |
| EOC (Emergency Operations Center) | — | — | — | T | — | T | — | — | — | S | — | — | P | — | T | — | — | — | — |
| Public shelter capacity | — | — | — | T | — | T | S | — | — | S | — | — | S | — | S | — | — | — | — |

Government buildings: EOCs coordinate disaster response, courthouses/city halls are command post candidates, post offices are distribution points.

## Population Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Population density | — | T | — | — | — | T | S | — | P | — | — | — | — | — | T | S | — | O | — |
| Time-of-day occupancy | — | — | — | T | — | S | T | — | S | — | — | — | — | — | S | P | — | O | — |
| Vulnerable facilities | — | T | — | S | — | S | — | — | — | — | — | — | S | T | S | — | — | — | — |
| Group quarters | — | — | — | T | — | S | — | — | P | — | — | — | — | — | S | — | — | — | — |
| Disability rate (area) | — | — | — | — | — | — | — | — | P | — | — | — | S | — | — | — | — | — | — |

## Jurisdiction & Boundary Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| State boundaries | — | — | — | — | — | S | — | — | P | — | — | — | S | — | — | — | — | — | — |
| County boundaries | — | — | — | — | — | S | S | — | P | — | — | — | S | — | — | — | — | — | — |
| City/town lines | — | — | — | — | — | S | S | — | P | — | — | — | S | — | — | — | — | — | — |
| Fire districts | — | — | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| School districts | — | — | — | — | — | T | — | — | S | — | — | — | P | — | — | — | — | — | — |
| Flood zones | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — | O | — |
| Evacuation zones (pre-planned) | — | — | — | — | — | — | — | — | — | S | — | — | P | — | — | — | — | P | — |
| EMS active evacuation zones | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |
| Tribal lands | — | — | — | — | — | T | — | — | P | — | — | — | S | — | — | — | — | — | — |
| National parks / forests | — | — | — | — | — | S | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Military installations | — | — | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| State-owned land | — | — | — | — | — | S | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Federally owned land | — | — | — | — | — | S | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Group-drawn zones | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — |
| EMS-drawn event zones | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |

## General Hazard Risk Layers

Baseline risk layers per cell. These are the static foundations that hazard models consume as inputs. Hazard models use these baselines + real-time conditions to produce active predictions. Post-event updates (building destroyed, road impassable, etc.) feed back into the base map via the update protocols.

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| General wildfire risk | S | S | S | — | S | — | — | P | — | — | — | — | S | — | T | — | — | O | — |
| Riverine flood risk | — | — | — | — | P | — | — | — | — | P | S | — | S | — | T | — | — | O | — |
| Coastal flood risk | — | — | — | — | P | — | — | — | — | P | S | — | S | — | T | — | — | O | — |
| Flash flood risk | S | — | — | — | P | — | — | — | — | S | P | — | S | — | T | — | — | O | — |
| Urban flood risk (impervious) | — | S | S | — | S | S | — | — | — | S | S | — | S | — | T | — | — | O | — |
| Dam failure flood risk | — | — | — | — | P | — | — | — | — | S | S | — | P | — | — | — | — | — | — |
| Storm surge flood risk | — | — | — | — | P | — | — | — | — | S | S | — | P | — | — | — | — | — | — |
| General earthquake risk | — | — | — | — | — | — | — | — | — | — | S | P | S | — | — | — | — | — | — |
| Lava flow risk zone | — | — | — | — | S | — | — | — | — | — | — | P | S | — | T | — | — | — | — |
| Pyroclastic flow risk zone | — | — | — | — | S | — | — | — | — | — | — | P | S | — | T | — | — | — | — |
| Lahar / volcanic mudflow risk zone | — | — | — | — | P | — | — | — | — | — | S | P | S | — | T | — | — | — | — |
| Volcanic ash fall risk zone | — | — | S | — | — | — | — | — | — | — | — | S | P | — | T | — | — | — | — |
| Volcanic bomb / tephra risk zone | — | — | — | — | — | — | — | — | — | — | — | P | S | — | T | — | — | — | — |
| Volcanic gas / vog risk zone | — | — | S | — | — | — | — | — | — | — | — | S | P | — | T | — | — | — | — |
| Volcanic flank collapse risk | — | — | — | — | S | — | — | — | — | — | — | P | S | — | — | — | — | — | — |
| Distance to active volcano | — | — | — | — | P | — | — | — | — | — | — | P | S | — | — | — | — | — | — |
| Volcano alert level (current) | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | O | — |
| General tornado risk | — | — | — | — | — | — | — | — | — | S | — | — | P | — | T | — | — | — | — |
| General tsunami risk | — | — | — | — | P | — | — | — | — | S | — | S | P | — | — | — | — | — | — |
| General landslide risk | P | — | — | — | S | — | — | — | — | — | S | — | S | — | T | — | — | — | — |
| General hurricane risk | — | — | — | — | — | — | — | — | — | S | — | — | P | — | — | — | — | — | — |
| General avalanche risk | P | S | — | — | S | — | — | — | — | — | — | — | S | — | S | — | — | — | — |
| General drought risk | — | — | S | — | — | — | — | S | — | — | S | — | P | — | T | — | — | — | — |
| General storm surge risk | — | — | — | — | P | — | — | — | — | S | S | — | S | — | — | — | — | — | — |
| General sinkhole risk | — | — | — | — | T | — | — | — | — | — | P | — | S | — | S | — | — | — | — |
| Snow melt flood risk | S | — | S | — | P | — | — | — | — | S | S | — | S | — | T | — | — | — | — |
| Extreme heat risk | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Extreme cold risk | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Extreme rain risk | — | — | — | — | S | — | — | — | — | S | S | — | P | — | T | — | — | — | — |
| Extreme snow risk | — | — | S | — | S | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Ice storm risk | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Hailstorm risk | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Dust storm risk | — | — | S | — | — | — | — | — | — | — | S | — | P | — | T | — | — | — | — |
| Fog risk | — | — | — | — | S | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Lightning strike density | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Derecho / straight-line wind risk | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Sulfur dioxide (SO2) risk | — | — | S | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |

Ref column for risk layers: NOAA (tornado, hurricane, storm surge), USGS (earthquake, volcano, landslide, lava/pyroclastic/lahar hazard zones), FEMA (flood, tsunami), state geological surveys, EPA (SO2 monitoring). USGS volcano hazard assessments provide lava flow, pyroclastic flow, lahar, and tephra fall zone maps per volcano.

## Human-Caused Hazard & Risk Layers

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Violent crime rate (area) | — | — | — | — | — | — | — | — | S | — | — | — | P | — | — | — | — | — | — |
| Property crime rate (area) | — | — | — | — | — | — | — | — | S | — | — | — | P | — | — | — | — | — | — |
| Sex offender registry locations | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Gang activity zones | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Drug activity zones | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Human trafficking risk areas | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | O | — |
| Active shooter / mass casualty history | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Arson risk zones | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Active conflict / war zone | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Militia / armed group territory | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Unexploded ordnance (UXO) zones | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Landmine risk zones | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Piracy risk zones (maritime) | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Carjacking / road ambush zones | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Kidnapping risk zones | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Civil unrest / protest zones | — | — | — | — | — | — | — | — | — | — | — | — | S | — | P | S | — | O | — |
| Curfew zones | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |
| Terrorism risk level (area) | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | O | — |
| Border conflict zones | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | O | — |
| Illegal dumping / toxic waste sites | — | — | — | — | — | — | — | — | — | — | — | — | P | S | S | — | — | O | — |

Ref sources: FBI UCR/NIBRS (crime), state sex offender registries (NSOPW), DOJ, State Dept travel advisories, ACLED (conflict data), UN OCHA (humanitarian), UNMAS (UXO/mines), EPA (illegal dumping). Crime rate layers are aggregated to census block group level minimum to protect individual privacy. Sex offender locations are sourced from public registries only.

## Post-Hazard Damage & Impact Assessment

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Structure damage level | — | S | S | — | — | — | — | — | — | S | — | — | — | P | S | — | — | O | — |
| Structure damage type (fire/wind/water/seismic) | — | S | S | — | — | — | — | — | — | S | — | — | — | P | S | — | — | O | — |
| Road damage / impassable | — | S | — | — | — | — | — | — | — | — | — | — | — | P | S | S | — | O | — |
| Bridge damage / collapse | — | S | — | — | — | — | — | — | — | — | — | — | — | P | S | — | — | O | — |
| Flood high water mark | — | T | — | S | — | — | — | — | — | S | S | — | — | P | S | — | — | O | — |
| Flood extent (observed) | — | S | P | — | — | — | — | — | — | S | S | — | — | S | S | S | — | O | — |
| Flood depth (observed) | — | — | — | S | — | — | — | — | — | S | — | — | — | P | S | — | — | O | — |
| Standing water / ponding | — | S | S | — | — | — | — | — | — | — | S | — | — | P | S | S | — | O | — |
| Crop damage extent | — | S | P | — | — | — | — | S | — | — | — | — | S | S | P | S | — | — | — |
| Crop damage type (flood/hail/wind/drought/fire) | — | S | S | — | — | — | — | S | — | — | — | — | S | S | P | — | — | — | — |
| Crop loss percentage | — | T | S | — | — | — | — | S | — | — | — | — | S | — | P | — | — | — | — |
| Livestock loss area | — | — | — | — | — | — | — | — | — | — | — | — | S | — | P | — | — | O | — |
| Power outage area | — | — | — | — | — | — | — | — | — | — | — | — | S | — | S | — | — | O | — |
| Utility damage (power/water/gas) | — | T | — | — | — | — | — | — | — | — | — | — | S | S | S | — | — | O | — |
| Debris field extent | — | P | S | — | — | — | — | — | — | — | — | — | — | S | S | S | — | O | — |
| Debris type (structural/vegetation/mixed) | — | S | — | — | — | — | — | — | — | — | — | — | — | P | S | — | — | — | — |
| Landslide / ground failure | S | S | S | — | S | — | — | — | — | — | S | S | — | S | S | S | — | O | — |
| Sinkhole occurrence | — | S | — | — | S | — | — | — | — | — | S | — | — | S | P | S | — | O | — |
| Contamination / hazmat spill | — | — | — | — | — | — | — | — | — | — | — | — | S | S | P | — | — | O | — |
| Displaced population area | — | — | — | — | — | — | — | — | — | S | — | — | — | — | S | — | — | P | — |
| Shelter-in-place zone | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |
| Evacuation compliance area | — | — | — | — | — | — | — | — | — | — | — | — | — | — | S | S | — | P | — |
| Burn scar (post-fire) | S | P | S | — | — | — | — | S | — | — | — | — | — | S | T | — | — | — | — |
| Tree / vegetation blowdown | S | S | S | — | — | — | — | — | — | — | — | — | — | P | S | S | — | — | — |
| Coastal erosion (post-storm) | S | P | S | — | S | — | — | — | — | — | — | — | — | S | T | — | — | — | — |
| Downed power lines | — | T | — | — | — | — | — | — | — | — | — | — | — | P | P | S | — | O | — |
| Downed utility poles | — | T | — | — | — | — | — | — | — | — | — | — | — | P | P | S | — | O | — |
| Gas leak (reported) | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | O | — |
| Water main break | — | — | — | — | — | — | — | — | — | — | — | — | — | S | P | — | — | O | — |
| Sewer overflow | — | — | — | — | — | — | — | — | — | — | — | — | — | S | P | — | — | O | — |
| Downed trees blocking route | — | T | — | — | — | — | — | — | — | — | — | — | — | P | P | S | — | O | — |
| Fire hydrant damage/inoperable | — | — | — | — | — | — | — | — | — | — | — | — | — | S | P | — | — | O | — |
| Cell tower outage | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | O | T |
| Trapped persons (reported) | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | S | — | O | — |
| Looting / security concern | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | O | — |
| Road blocked (non-damage) | — | — | — | — | — | — | — | — | — | — | — | — | — | S | P | S | — | O | — |
| Smell of gas / chemical | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | S | — | O | — |

Post-hazard layers update the base map after an event. EMS Override is primary for active-event designations (evacuations, shelter-in-place). User photos and reports are primary for ground-truth damage and condition assessment. Satellite imagery is primary for large-area impact (flood extent, burn scars, crop damage). USDA RMA and FEMA IA are Ref sources for crop loss and disaster declarations. EMS Override is primary for active-event designations (evacuations, shelter-in-place). User photos are primary for ground-truth damage assessment. Satellite imagery is primary for large-area impact (flood extent, burn scars, crop damage). USDA RMA and FEMA IA are Ref sources for crop loss and disaster declarations.

## Water Features & Drowning Risk

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Swimming pool location | S | P | T | S | — | S | S | — | — | — | — | — | — | S | S | — | — | — | — |
| Swimming pool type (in-ground/above) | — | S | — | P | — | T | S | — | — | — | — | — | — | S | S | — | — | — | — |
| Pool fenced/secured | — | T | — | P | — | — | T | — | — | — | — | — | — | S | S | — | — | — | — |
| Public pool / water park | — | S | — | S | — | P | S | — | — | — | — | — | S | S | T | — | — | — | — |
| Beach location | S | P | S | S | — | S | — | — | — | — | — | — | S | S | T | S | — | — | — |
| Beach type (sand/rock/mixed) | — | S | — | P | — | T | — | — | — | — | — | — | — | S | T | — | — | — | — |
| Beach access points | — | T | — | P | — | S | — | — | — | — | — | — | — | S | S | S | — | — | — |
| Beach lifeguard station | — | T | — | P | — | S | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Lake / pond location | S | P | S | — | S | P | — | — | — | — | S | — | — | S | T | — | — | — | — |
| River / stream location | S | P | S | — | S | P | — | — | — | — | S | — | — | — | T | — | — | — | — |
| Drowning risk (residential pool) | — | S | — | S | — | T | S | — | — | — | — | — | — | — | S | — | — | — | — |
| Drowning risk (beach) | — | S | — | S | — | T | — | — | — | — | S | — | S | — | S | — | — | O | — |
| Drowning risk (open water) | — | S | S | — | S | T | — | — | — | — | S | — | S | — | T | — | — | O | — |
| Rip current zones | — | — | — | — | — | — | — | — | — | — | S | — | P | — | T | — | — | O | — |

Drowning risk is computed from water body proximity, access, depth, current patterns, and historical incident data. Residential pool risk factors in fencing/securing. Ref sources: NOAA (rip currents), USACE (waterways), state beach safety programs.

## Geological Attributes

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Soil type | — | — | — | — | — | — | — | — | — | — | P | T | — | — | — | — | — | — | — |
| Drainage class | — | — | — | — | — | — | — | — | — | — | P | S | — | — | — | — | — | — | — |
| Water table depth | — | — | — | — | — | — | — | — | — | — | P | S | — | — | T | — | — | — | — |
| Vs30 (seismic velocity) | — | — | — | — | — | — | — | — | — | — | T | — | P | — | — | — | — | — | — |
| Liquefaction susceptibility | — | — | — | — | — | — | — | — | — | — | S | — | P | — | — | — | — | — | — |

## Accessibility & Passability

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hiking trail location | S | S | — | S | S | P | — | — | — | — | — | — | S | S | S | S | — | — | — |
| Hiking trail name | — | — | — | S | — | P | — | — | — | — | — | — | S | — | S | — | — | — | — |
| Hiking trail difficulty | — | — | — | S | S | S | — | — | — | — | — | — | S | — | P | — | — | — | — |
| Hiking trail length | — | — | — | — | S | P | — | — | — | — | — | — | S | — | S | S | — | — | — |
| Hiking trail surface type | — | T | — | S | — | S | — | — | — | — | — | — | S | S | P | — | — | — | — |
| Hiking trailhead location | — | S | — | S | — | P | — | — | — | — | — | — | S | S | S | S | — | — | — |
| Pedestrian passable (road) | S | T | — | P | — | S | — | — | — | — | — | — | — | S | S | S | — | O | — |
| Pedestrian passable (trail) | S | T | — | S | S | S | — | — | — | — | — | — | — | S | P | S | — | O | — |
| Pedestrian passable (open terrain) | P | S | T | — | S | — | — | S | — | — | S | — | — | — | S | S | — | O | — |
| Wheelchair passable (road) | S | T | — | P | — | S | — | — | — | — | — | — | — | S | S | — | — | O | — |
| Wheelchair passable (sidewalk) | S | T | — | P | — | S | — | — | — | — | — | — | — | S | S | — | — | O | — |
| Wheelchair passable (trail) | S | T | — | S | S | S | — | — | — | — | — | — | — | S | P | — | — | O | — |
| Wheelchair passable (open terrain) | P | S | T | — | S | — | — | S | — | — | S | — | — | — | S | — | — | O | — |
| Bike passable (road) | S | T | — | P | — | S | — | — | — | — | — | — | — | S | S | S | — | O | — |
| Bike passable (trail) | S | T | — | S | S | S | — | — | — | — | — | — | — | S | P | S | — | O | — |
| Bike passable (open terrain) | P | S | T | — | S | — | — | S | — | — | S | — | — | — | S | S | — | O | — |
| Vehicle passable (2WD) | S | T | — | S | S | T | — | — | — | — | — | — | — | S | S | S | — | O | — |
| Vehicle passable (AWD) | S | T | — | S | S | T | — | — | — | — | — | — | — | S | S | S | — | O | — |
| Vehicle passable (4WD) | S | T | — | S | S | T | — | — | — | — | — | — | — | S | S | S | — | O | — |
| Curb cuts / ramps | — | T | — | P | — | S | — | — | — | — | — | — | — | S | S | — | — | — | — |
| Surface condition | S | T | — | P | S | T | — | — | — | — | — | — | — | S | S | — | — | O | — |
| Slope passability | P | — | — | — | P | — | — | — | — | — | — | — | — | — | S | — | — | — | T |

Passability is assessed across all terrain types, not just roads. Pedestrian, wheelchair, bike, and vehicle passability each have road, trail, and open terrain variants. EMS Override applies during active events when routes become blocked or opened. Phone sensors (accelerometer, GPS) provide real-time surface condition data.

## Discrepancy & Conflict Reporting

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| User-reported map discrepancy | — | — | — | — | — | — | — | — | — | — | — | — | — | S | P | S | — | — | — |
| User-reported missing feature | — | — | — | — | — | — | — | — | — | — | — | — | — | S | P | S | — | — | — |
| User-reported incorrect attribute | — | — | — | — | — | — | — | — | — | — | — | — | — | S | P | — | — | — | — |
| Sensor-detected terrain mismatch | P | S | S | — | S | — | — | — | — | — | — | — | — | — | — | — | — | — | T |
| Sensor-detected building change | S | P | S | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Sensor-detected vegetation change | S | S | P | — | — | — | — | S | — | — | — | — | — | — | — | — | — | — | — |
| Sensor-detected road change | S | P | — | S | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Cross-source attribute conflict | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Temporal data staleness flag | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Photo vs satellite discrepancy | — | S | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — |
| GPS drift / location mismatch | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | T |

User and sensor discrepancies flag areas where data sources disagree or where ground truth contradicts existing map data. Cross-source conflicts are auto-generated when P and S sources disagree. Temporal staleness flags data that exceeds freshness thresholds. These layers drive QA review queues and prioritize resurvey areas.

## Data Availability & Coverage

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LiDAR coverage extent | P | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| LiDAR data age | P | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| High-res satellite coverage | — | P | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| High-res satellite data age | — | P | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Medium-res satellite coverage | — | — | P | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Street-level imagery coverage | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Street-level imagery age | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| DEM resolution available | — | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| OSM completeness score | — | — | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — | — | — |
| County assessor coverage | — | — | — | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — | — |
| LANDFIRE coverage | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — | — | — | — | — |
| Census data vintage | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — | — | — | — |
| FEMA flood map coverage | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — | — | — |
| FEMA flood map vintage | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — | — | — |
| Soil/hydro survey coverage | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — | — |
| Seismic hazard map coverage | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — | — |
| User photo density (area) | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — |
| User report density (area) | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — |
| User GPS track density | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — |
| Overall data confidence (area) | S | S | S | S | S | S | S | S | S | S | S | S | S | S | S | S | — | — | — |
| Data gap zones | S | S | S | S | S | S | S | S | S | S | S | S | S | S | S | S | — | — | — |
| Global base map fallback zone | S | S | S | S | S | S | S | S | S | S | S | S | S | S | S | S | — | — | — |

Data availability layers are meta-layers that track which sources exist, how old they are, and where gaps remain. Overall data confidence is computed from available source count and age. Data gap zones highlight areas relying on fewer than 3 sources. Global base map fallback zones mark areas where only global/low-res data is available and local sources are absent. These layers drive data acquisition prioritization.

## Sensor Locations

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Weather station location | — | T | — | — | — | S | — | — | — | — | — | — | P | S | T | — | — | — | — |
| Air quality monitor location | — | — | — | — | — | T | — | — | — | — | — | — | P | S | T | — | — | — | — |
| Seismograph location | — | — | — | — | — | — | — | — | — | — | — | P | S | — | — | — | — | — | — |
| Stream gauge location | — | — | — | — | — | S | — | — | — | — | P | — | S | T | T | — | — | — | — |
| Tide gauge location | — | — | — | — | — | S | — | — | — | — | P | — | S | — | T | — | — | — | — |
| Snow telemetry (SNOTEL) location | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Wildfire camera location | — | T | — | — | — | — | — | — | — | — | — | — | P | S | T | — | — | — | — |
| Flood sensor location | — | — | — | — | — | — | — | — | — | S | P | — | S | T | T | — | — | — | — |
| Radiation monitor location | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| SO2 / volcanic gas monitor | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Wind speed/direction sensor | — | — | — | — | — | T | — | — | — | — | — | — | P | S | T | — | — | — | — |
| Rain gauge location | — | — | — | — | — | S | — | — | — | — | S | — | P | T | T | — | — | — | — |
| Traffic camera location | — | — | — | — | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| User-deployed sensor location | — | — | — | — | — | — | — | — | — | — | — | — | — | S | P | S | — | — | — |
| NWS forecast office (WFO) | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Doppler radar site (NEXRAD) | — | S | — | — | — | T | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Weather observatory | — | S | — | S | — | S | — | — | — | — | — | — | P | T | T | — | — | — | — |
| Upper-air sounding station | — | — | — | — | — | — | — | — | — | — | — | — | P | — | T | — | — | — | — |
| Tsunami warning center | — | — | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Volcano observatory | — | S | — | S | — | S | — | — | — | — | — | P | S | T | T | — | — | — | — |
| Hurricane hunter base | — | S | — | — | — | T | — | — | — | — | — | — | P | — | — | — | — | — | — |
| Lightning detection sensor | — | — | — | — | — | — | — | — | — | — | — | — | P | — | — | — | — | — | — |

Ref sources: NOAA (weather stations, tide gauges, WFOs, NEXRAD, tsunami warning centers, hurricane hunters), USGS (stream gauges, seismographs, SNOTEL, volcano observatories), EPA (air quality, radiation), ALERTWildfire (cameras), state DOTs (traffic cameras), Vaisala/NLDN (lightning detection). User-deployed sensors include personal weather stations, PurpleAir monitors, and other IoT devices.

## EMS Hazard Maps

| Attribute | LiDAR | Sat-Hi | Sat-Med | SV | DEM | OSM | Assr | LF | Cens | FEMA | S/H | Seis | Ref | UPh | URp | UGPS | GZ | EMS | PSn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EMS local flood hazard map | — | — | — | — | — | — | — | — | — | S | S | — | — | — | — | — | — | P | — |
| EMS local wildfire hazard map | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | — | — | P | — |
| EMS local earthquake hazard map | — | — | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | P | — |
| EMS local tornado hazard map | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |
| EMS local tsunami hazard map | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS local hurricane hazard map | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS local landslide hazard map | — | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | P | — |
| EMS local avalanche hazard map | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |
| EMS local volcanic hazard map | — | — | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | P | — |
| EMS local hazmat hazard map | — | — | — | — | — | — | — | — | — | — | — | — | S | — | — | — | — | P | — |
| EMS local dam failure hazard map | — | — | — | — | — | — | — | — | — | S | — | — | S | — | — | — | — | P | — |
| EMS local storm surge hazard map | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | — | P | — |
| EMS local sinkhole hazard map | — | — | — | — | — | — | — | — | — | — | S | — | — | — | — | — | — | P | — |
| EMS custom hazard zone | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |
| EMS hazard map upload date | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |
| EMS hazard map version | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | P | — |

EMS hazard maps are uploaded by local emergency management agencies. These represent their own area-specific risk assessments and override general hazard risk layers where available. Secondary sources (FEMA, LANDFIRE, seismic, soil/hydro) serve as fallback where no EMS map exists. EMS custom hazard zone allows freeform polygon drawing for hazards not covered by standard types.

---

## Source Priority Rules

1. **P (Primary):** Highest-fidelity source for this attribute. Used as ground truth when available.
2. **S (Secondary):** Reliable supplementary source. Used to fill gaps or cross-validate primary.
3. **T (Tertiary):** Low-fidelity or indirect inference. Used only when P and S unavailable.
4. **O (Overriding):** Real-time or authoritative override that supersedes all other sources during active events (EMS declarations, user photo confirmation, post-event damage reports).
5. **— :** Not applicable. This source provides no useful signal for this attribute.

## Confidence Scoring

Final confidence per attribute is computed from available sources:

| Condition | Confidence |
|---|---|
| P available + S agrees | High |
| P available, no S | Medium-High |
| S only, no P | Medium |
| T only | Low |
| O active | Overrides all (event-scoped) |
| P and S conflict | Flagged for review |
| No sources available | Suppressed, flag for data acquisition |

## User Data Source Details

| Source | How Collected | Verification | Trust Level |
|---|---|---|---|
| User Photo (UPh) | Geotagged camera submission | CV model classification + GPS match | Medium (verified by CV) |
| User Report (URp) | In-app form (e.g., "my building has a basement") | Cross-referenced with assessor/OSM | Low-Medium (self-reported) |
| User GPS (UGPS) | Anonymous aggregated movement data | Volume-based (many traces = high trust) | Medium-High (aggregated) |
| Group Zones (GZ) | Group leader draws boundary on map | Group membership verification | Medium (community-validated) |
| EMS Override (EMS) | Authority declaration during active event | EMS account verification | High (authoritative) |
| User image confirmation (UPh) | Photo of damage, flood, post-event conditions | CV damage/flood detection model | High when CV-confirmed |

---

## User-Collectible Attributes

Attributes that can be improved by asking users for input. Classification:

- **Public:** Contributes to shared base map visible to all users. Attribute describes a place, not a person.
- **Private:** Tied to user account. Describes personal property, preferences, or household details. Never exposed to other users.
- **Group-Private:** Visible only within the user's group. Describes shared community knowledge.
- **Event-Scoped:** Real-time report visible during active events only, then archived.

### Building Attributes — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Building material | Photo of exterior | "Take a photo of your building exterior" | Public |
| Building purpose | Selection | "What is this building used for?" (residential, office, school, church, etc.) | Public |
| Apartment building | Yes/no | "Is this an apartment or multi-unit building?" | Public |
| Single family home | Yes/no | "Is this a single family home?" | Public |
| Neighborhood boundary | Draw on map | "Draw your neighborhood boundary" | Public (named), Group-Private (custom) |
| Year built | Text input | "Approximately when was this building built?" | Public |
| Exits/entrances | Photo + count | "How many exits does your building have?" | Public |
| Detected stairwells | Count input | "How many stairwells does your building have?" | Private |
| Number of floors | Selection | "How many floors?" | Public |
| Roof material | Photo | "Photo of roof — what material?" (asphalt shingle, tile, metal, wood shake) | Public |
| Roof flame retardant | Yes/no | "Is your roof made of fire-rated materials?" (Class A/B/C) | Public |
| Helicopter landable roof | Yes/no + photo | "Is the roof flat and large enough for helicopter landing?" | Public |
| Flammability score | Material selection | "Exterior material?" (wood siding, brick, stucco, metal) | Public |
| Heating type | Selection | "What heating does your home use?" (gas, electric, oil, wood, propane) | Private |
| Tornado shelter rating | Yes/no | "Does your building have a basement or interior safe room?" | Private |
| Earthquake shelter rating | Selection | "Building construction type?" (wood frame, steel, unreinforced masonry) | Public |
| Building code compliance | Text/selection | "What building code was this built to?" (year, standard) | Public |
| Building status | Photo + report | "Is this building damaged or destroyed?" | Public |
| Population estimate | Number input | "How many people typically occupy this building?" | Public |
| Time-of-day occupancy | Schedule input | "Building hours?" (always, business hours, school hours, seasonal) | Public |
| In flood zone | Yes/no | "Has this building flooded before?" | Public |
| Fireproof certified | Yes/no (self-cert) | "Is your building fireproof certified?" | Private (self-cert), Public (official) |
| Power source | Selection | "How is your building powered?" (grid, solar, generator, off-grid) | Private |
| Has fireplace | Yes/no | "Does your building have a fireplace?" | Private |
| Utility provider coverage | Auto/selection | "Who is your electric/gas provider?" | Private (user), Public (provider-submitted) |
| Official tornado shelter | Yes/no | "Is this a FEMA-designated tornado shelter?" | Public |
| Glass front / storefront | Photo + yes/no | "Does this building have large glass frontage?" | Public |
| Flotation device storage | Yes/no | "Surf shack, boat storage, or flotation devices here?" | Public |
| Needs retrofit | Yes/no | "Has this building been flagged for seismic retrofit?" | Public |
| Marked high risk building | Report | "Is this building condemned or marked unsafe?" | Public |
| Ignition ease (exterior) | Photo + selection | "Exterior cladding?" (wood, vinyl, stucco, brick, metal) | Public |
| Burn duration estimate | Selection | "Building contents?" (heavy timber, light frame, concrete, steel) | Public |
| ADA accessible entrance | Photo + yes/no | "Does this building have a wheelchair-accessible entrance?" | Public |
| Elevator present | Yes/no | "Does this building have an elevator?" | Public |
| Wheelchair navigable interior | Yes/no | "Can a wheelchair user navigate inside this building?" | Public |

### Road Attributes — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Lane direction | Selection | "Which direction does traffic flow on this road?" | Public |
| One-way | Yes/no | "Is this road one-way?" | Public |
| Surface type | Selection | "Road surface?" (paved, gravel, dirt, sand) | Public |
| Street crowding (parked cars) | Photo | "Photo of street parking conditions" | Public |
| Private roads | Yes/no | "Is this a private road?" | Public |
| Behind locked gate | Yes/no | "Is access gated? Is the gate usually locked?" | Public |
| Confirmed evacuation routes | Report | "Has this been used as an evacuation route?" | Public |
| Signs (road/warning/info) | Photo | "Photo of road sign" | Public |

### Barrier Attributes — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Fence material | Photo | "Photo of fence" | Public |
| Fence rammability | Selection | "Fence type?" (chain link, wood, iron, wire) | Public |
| Wall material/height | Photo | "Photo of wall" | Public |
| Gate (locked/unlocked) | Yes/no | "Is this gate typically locked?" | Public |
| Gate owner/contact | Text input | "Gate access contact info" | Private |
| Barrier bypass difficulty | Selection | "Could a person on foot get past this barrier?" | Public |
| Hedge height/density | Photo + estimate | "Photo of hedge, estimated height?" | Public |
| Hedge species | Photo | "Photo of hedge for species ID" | Public |
| Fence flammability | Selection | "Fence material?" (wood = high, vinyl = medium, metal/chain link = low) | Public |
| Wall flammability | Selection | "Wall material?" (wood = high, stucco = low, concrete = none) | Public |
| Hedge flammability | Selection | "Hedge type?" (evergreen, deciduous, dry) | Public |
| Barrier fire-bridge potential | Yes/no | "Could fire travel along this barrier?" | Public |

### Terrain Attributes — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Elevation | Auto (phone) | Collected via phone barometer | Public |
| Sinkhole risk | Report | "Have you seen ground subsidence here?" | Public |
| Avalanche zones | Report | "Has this area had avalanches?" | Public |

### Vegetation Attributes — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Tree species | Photo | "Photo of tree for species ID" | Public |
| Burn scars | Photo | "Photo of burn area" | Public |
| Vegetation health/NDVI | Photo | "Photo of vegetation conditions" | Public |
| Ladder fuel / brush buildup | Photo + report | "Is there heavy brush or ladder fuel connecting ground to trees?" | Public |
| Surface fuel depth | Photo | "Photo of ground cover (leaves, needles, debris depth)" | Public |
| Coarse woody fuel | Photo | "Photo of downed logs and woody debris" | Public |
| Canopy cover estimate | Photo + estimate | "Photo looking up, estimated canopy cover %?" | Public |

### Hazard History & Fire Risk — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Last burn date per cell | Report | "When did this area last burn?" | Public |
| Low burn risk zones | Report | "Is this area recently cleared or firebreaked?" | Public |
| Last tornado date | Report | "When was the last tornado here?" | Public |
| Last hurricane date | Report | "When was the last hurricane here?" | Public |
| Last flood date | Report | "When did this area last flood?" | Public |
| Last landslide date | Report | "When was the last landslide here?" | Public |
| Last avalanche date | Report | "When was the last avalanche here?" | Public |

### Explosive/Hazardous Things — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Gas stations | Photo | "Photo confirming gas station location" | Public |
| Propane tanks (residential) | Yes/no | "Do you have propane tanks on your property?" | Private |
| Ammunition stores | Yes/no | "Significant ammunition storage at this location?" | Private |
| Fireworks storage | Report | "Fireworks stored at this location?" | Private |
| Fuel depots / oil tanks | Photo + report | "Photo of fuel storage" | Public (commercial), Private (residential) |

### Infrastructure — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Bridge clearance height | Report | "Estimated clearance height?" | Public |
| Bridge condition rating | Photo + report | "Photo of bridge condition" | Public |
| Bridge weight limit | Photo of sign | "Photo of weight limit sign" | Public |
| Overpass clearance height | Report | "Estimated clearance?" | Public |
| Power line downed | Photo + report | "Report downed power line" | Event-Scoped |
| Fire hydrant location | Photo | "Photo of hydrant" | Public |
| Fire hydrant blocked | Photo + report | "Is this hydrant accessible?" | Public |
| Cell tower coverage | Auto (phone) | Signal strength readings | Public |
| Cell tower backup power | Report | "Does this tower have backup power?" | Public |
| Cell tower carrier | Report | "Which carrier operates this tower?" | Public |
| Power line owner | Report | "Which utility owns these lines?" | Public |
| Power station location | Photo + confirm | "Confirm power station/substation here?" | Public |
| Power station owner | Report | "Which utility operates this station?" | Public |
| Water system operator | Report | "Which utility provides water here?" | Public |
| Dam owner | Report | "Who operates this dam?" | Public |
| Satellite internet terminal | Yes/no + type | "Do you have satellite internet (Starlink, HughesNet, Viasat)?" | Private |
| Satellite internet willing to share | Yes/no | "Would you share your satellite internet during an emergency?" | Private |
| Satellite TV dish | Yes/no | "Do you have a satellite TV dish?" | Private |
| VSAT terminal | Report + confirm | "Confirm VSAT terminal at this facility?" | Public |
| Portable satellite comms | Report | "Does this agency have portable satellite comms?" | Public |

Satellite internet ownership is Private because it's property-level info. Willingness to share during emergencies enables EMS to identify potential neighborhood communication hubs during outages.

### Population — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Time-of-day occupancy | Report | "Roughly how many people are here right now?" | Public |
| Vulnerable facilities | Report | "Is this a nursing home, daycare, hospital, school?" | Public |

### Jurisdiction & Boundaries — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Group-drawn zones | Draw on map | "Draw your neighborhood/family zone boundary" | Group-Private |
| EMS active evacuation zones | Draw on map | "Designate evacuation zone for this event" | Event-Scoped |
| EMS-drawn event zones | Draw on map | "Draw the affected area" | Event-Scoped |

### Hazard Mitigation Structures — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Avalanche breaker / deflector | Photo + GPS | "Photo of avalanche breaker" | Public |
| Avalanche fence / snow net | Photo + GPS | "Photo of avalanche fence or snow net" | Public |
| Flood control dam | Photo + confirm | "Confirm flood control dam here?" | Public |
| Debris basin / catch dam | Photo + GPS | "Photo of debris basin" | Public |
| Mudflow / debris flow barrier | Photo + GPS | "Photo of mudflow barrier" | Public |
| Levee / dike | Photo + GPS | "Photo of levee or dike" | Public |
| Levee condition | Photo + report | "Photo of levee condition, any damage?" | Public |
| Seawall / coastal armor | Photo + GPS | "Photo of seawall" | Public |
| Breakwater / jetty | Photo + GPS | "Photo of breakwater or jetty" | Public |
| Storm drain / culvert | Photo + GPS | "Photo of storm drain or culvert" | Public |
| Retention / detention pond | Photo + GPS | "Photo of retention pond" | Public |
| Firebreak | Photo + GPS | "Photo of constructed firebreak" | Public |
| Fuel break / defensible space | Photo + GPS | "Photo of fuel break or cleared area" | Public |
| Wildfire sprinkler system | Report | "Wildfire sprinkler system at this property?" | Public |
| Tsunami wall / barrier | Photo + GPS | "Photo of tsunami barrier" | Public |
| Tornado safe room (public) | Confirm | "Is there a public tornado safe room here?" | Public |
| Rockfall net / catch fence | Photo + GPS | "Photo of rockfall protection" | Public |
| Landslide retaining wall | Photo + GPS | "Photo of retaining wall" | Public |
| Riprap / erosion control | Photo + GPS | "Photo of riprap or erosion control" | Public |

### Critical Facilities — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Hospital location | Photo + confirm | "Confirm hospital at this location?" | Public |
| Hospital helipad | Photo | "Photo of hospital helipad" | Public |
| Police station location | Photo + confirm | "Confirm police station at this location?" | Public |
| Fire station location | Photo + confirm | "Confirm fire station at this location?" | Public |
| Nursing home location | Confirm | "Is this a nursing home / assisted living?" | Public |
| School location | Confirm | "Is this a school? What type?" | Public |
| Daycare location | Report | "Is there a daycare at this location?" | Public |
| Shelter (Red Cross/FEMA) | Report | "Is this a designated emergency shelter?" | Public |
| Shelter ADA compliance | Yes/no | "Is this shelter wheelchair accessible?" | Public |
| EMS / ambulance station | Photo + confirm | "Confirm EMS/ambulance station here?" | Public |
| Volunteer fire department | Photo + confirm | "Is this a volunteer fire department?" | Public |
| Coast Guard station | Photo + confirm | "Confirm Coast Guard station here?" | Public |
| National Guard armory | Photo + confirm | "Confirm National Guard armory here?" | Public |
| SAR base | Report | "Search and rescue team based here?" | Public |
| 911 / PSAP dispatch center | Report | "Is this a 911 dispatch center?" | Public |
| Emergency operations center | Report | "Is this an EOC?" | Public |
| Red Cross chapter office | Confirm | "Confirm Red Cross office here?" | Public |
| Blood bank / donation center | Confirm | "Confirm blood bank at this location?" | Public |
| Dialysis center | Confirm | "Is this a dialysis center?" | Public |
| Pharmacy location | Photo + confirm | "Confirm pharmacy at this location?" | Public |
| Veterinary clinic | Photo + confirm | "Confirm vet clinic here?" | Public |
| Animal shelter | Photo + confirm | "Confirm animal shelter here?" | Public |
| Fuel depot (emergency) | Report | "Emergency fuel depot at this location?" | Public |
| Water treatment plant | Photo + confirm | "Confirm water treatment plant here?" | Public |
| Wastewater treatment plant | Photo + confirm | "Confirm wastewater plant here?" | Public |
| Emergency radio repeater | Report + GPS | "Emergency radio repeater/tower here?" | Public |
| HAM radio operator | Report | "Are you a licensed HAM radio operator at this location?" | Public |
| Staging area (pre-designated) | EMS manual entry | Designated by EMS authority | Public |
| Triage / field hospital site | EMS manual entry | Designated by EMS authority | Event-Scoped |
| EMS shelter: wildfire | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: flood | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: earthquake | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: tornado | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: tsunami | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: hurricane | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: volcanic | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: hazmat | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: nuclear | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: winter storm | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: extreme heat | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter: general | EMS manual entry | Designated by EMS authority | Public |
| EMS shelter pedestrian passable | EMS manual + report | "Can a person walk to and enter this shelter?" | Public |
| EMS shelter wheelchair accessible | EMS manual + report | "Is this shelter wheelchair accessible?" | Public |

### Transit Infrastructure — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Bus stops | Photo + confirm | "Confirm bus stop at this location?" | Public |
| Bus routes | Report | "What bus routes serve this stop?" | Public |
| Train stations | Photo + confirm | "Confirm train station at this location?" | Public |
| Ferry terminals | Photo + confirm | "Confirm ferry terminal here?" | Public |
| Port / deep water dock | Photo + confirm | "Confirm port/dock at this location?" | Public |
| Cruise ship terminal | Photo + confirm | "Confirm cruise terminal here?" | Public |
| Helicopter company base | Report | "Is there a helicopter company here? (tours, charter, EMS)" | Public |
| Helicopter fleet size | Report | "How many helicopters based here?" | Public |

### Hotels, Resorts & Lodging — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Hotel / motel location | Photo + confirm | "Confirm hotel/motel at this location?" | Public |
| Hotel room count | Report | "Approximately how many rooms?" | Public |
| Ski resort location | Confirm | "Confirm ski resort at this location?" | Public |
| Ski run maps / trail network | Report + photo | "Photo of trail map or confirm trail route?" | Public |
| RV park / campground | Photo + confirm | "Confirm RV park/campground here?" | Public |
| Resort complex | Confirm | "Confirm resort at this location?" | Public |

### Religious Institutions — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Location | Photo + confirm | "Confirm place of worship at this location?" | Public |
| Type | Selection | "What type?" (church, mosque, synagogue, temple, other) | Public |
| Seating capacity | Report | "Approximate seating capacity?" | Public |
| Shelter potential | Yes/no | "Could this building serve as emergency shelter?" | Public |
| Congregation size | Report | "Approximate congregation size?" | Public |

### Government Buildings — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Location | Photo + confirm | "Confirm government building at this location?" | Public |
| Type | Selection | "What type?" (city hall, courthouse, post office, DMV, etc.) | Public |
| Federal/state/county/municipal | Selection | "Which level of government?" | Public |
| Backup power / generator | Yes/no | "Does this building have backup power?" | Public |
| EOC | Yes/no | "Is this an Emergency Operations Center?" | Public |

### General Hazard Risk — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| General wildfire risk | Report | "Has this area had wildfires?" | Public |
| Riverine flood risk | Report | "Has this area flooded from a river?" | Public |
| Coastal flood risk | Report | "Has this area flooded from the ocean/coast?" | Public |
| Flash flood risk | Report | "Has this area experienced flash flooding?" | Public |
| Urban flood risk | Report | "Does this area flood during heavy rain (street flooding)?" | Public |
| General tornado risk | Report | "Has this area experienced tornadoes?" | Public |
| General landslide risk | Report | "Have you seen landslides in this area?" | Public |
| General sinkhole risk | Report | "Have you seen sinkholes or ground collapse here?" | Public |
| Lava flow risk zone | Report | "Has lava flowed through this area historically?" | Public |
| Lahar / volcanic mudflow zone | Report | "Has this area experienced lahars or volcanic mudflows?" | Public |
| Volcanic ash fall | Report | "Has this area experienced volcanic ash fall?" | Public |
| Volcanic gas / vog | Report | "Does this area experience volcanic gas or vog?" | Public |
| General avalanche risk | Report | "Has this area had avalanches?" | Public |
| Snow melt flood risk | Report | "Does this area flood during spring snowmelt?" | Public |
| Extreme heat risk | Report | "Does this area experience dangerous heat waves?" | Public |
| Extreme cold risk | Report | "Does this area experience dangerous cold snaps?" | Public |
| Extreme rain risk | Report | "Does this area get extreme rainfall events?" | Public |
| Extreme snow risk | Report | "Does this area get extreme snowfall?" | Public |
| Ice storm risk | Report | "Does this area get ice storms?" | Public |
| Hailstorm risk | Report | "Does this area get damaging hail?" | Public |
| Dust storm risk | Report | "Does this area experience dust storms?" | Public |
| Sulfur dioxide (SO2) risk | Report | "Sulfur/rotten egg smell in this area?" | Public |

General risk layers are primarily computed from authoritative datasets (NOAA, USGS, FEMA). User reports serve as tertiary validation only.

### Human-Caused Hazard & Risk — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Civil unrest / protest zones | Report + GPS | "Is there active unrest in this area?" | Event-Scoped |
| Illegal dumping / toxic waste | Photo + GPS | "Photo of illegal dumping site" | Public |
| Active conflict zone | Report | "Is this area in an active conflict zone?" | Public |
| UXO / landmine zones | Report + GPS | "Unexploded ordnance or mines in this area?" | Public |
| Curfew zones | Report | "Is there a curfew active in this area?" | Event-Scoped |

Crime rates, sex offender registries, terrorism risk, and gang/drug activity zones are sourced exclusively from authoritative datasets. Not user-collectible.

### Post-Hazard Damage & Impact — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Structure damage level | Photo + selection | "Photo of damage. Minor, major, or destroyed?" | Event-Scoped |
| Structure damage type | Photo + selection | "Fire, wind, water, or earthquake damage?" | Event-Scoped |
| Road damage / impassable | Photo + GPS | "Photo of road damage. Is it passable?" | Event-Scoped |
| Bridge damage | Photo + report | "Photo of bridge condition" | Event-Scoped |
| Flood high water mark | Photo + height | "Photo of high water mark, estimated height?" | Event-Scoped |
| Flood depth (observed) | Photo + estimate | "Photo of flooding, estimated depth?" | Event-Scoped |
| Standing water / ponding | Photo + GPS | "Photo of standing water" | Event-Scoped |
| Crop damage extent | Photo + GPS | "Photo of crop damage, area affected?" | Event-Scoped |
| Crop damage type | Photo + selection | "Flood, hail, wind, drought, or fire damage?" | Event-Scoped |
| Crop loss percentage | Estimate | "Estimated % of crop lost in this field?" | Event-Scoped |
| Livestock loss area | Report | "Livestock losses in this area?" | Event-Scoped |
| Utility damage | Photo + report | "Photo of damaged utility infrastructure" | Event-Scoped |
| Debris field | Photo + GPS | "Photo of debris" | Event-Scoped |
| Debris type | Selection | "Structural, vegetation, or mixed debris?" | Event-Scoped |
| Landslide / ground failure | Photo + GPS | "Photo of ground failure" | Event-Scoped |
| Sinkhole occurrence | Photo + GPS | "Photo of sinkhole" | Event-Scoped |
| Contamination / hazmat spill | Report + GPS | "Hazmat spill or contamination observed?" | Event-Scoped |
| Tree / vegetation blowdown | Photo + GPS | "Photo of fallen trees or vegetation damage" | Event-Scoped |
| Downed power lines | Photo + GPS | "Photo of downed power line, stay clear" | Event-Scoped |
| Downed utility poles | Photo + GPS | "Photo of downed utility pole" | Event-Scoped |
| Gas leak | Report + GPS | "Do you smell gas in this area?" | Event-Scoped |
| Water main break | Photo + GPS | "Photo of water main break / flooding from pipe" | Event-Scoped |
| Sewer overflow | Photo + GPS | "Photo of sewer overflow" | Event-Scoped |
| Downed trees blocking route | Photo + GPS | "Photo of tree blocking path/road" | Event-Scoped |
| Fire hydrant inoperable | Photo + report | "Is this fire hydrant damaged or non-functional?" | Event-Scoped |
| Cell tower outage | Report | "No cell service in this area?" | Event-Scoped |
| Trapped persons | Report + GPS | "People trapped at this location?" | Event-Scoped |
| Looting / security concern | Report + GPS | "Security concern at this location?" | Event-Scoped |
| Road blocked | Report + GPS | "Road blocked at this location?" | Event-Scoped |
| Smell of gas / chemical | Report + GPS | "Unusual gas or chemical smell here?" | Event-Scoped |

### Water Features & Drowning Risk — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Swimming pool location | Photo + confirm | "Is there a pool at this property?" | Public |
| Swimming pool type | Selection | "In-ground or above-ground pool?" | Public |
| Pool fenced/secured | Yes/no + photo | "Is this pool fenced or secured?" | Public |
| Public pool / water park | Confirm | "Is this a public pool or water park?" | Public |
| Beach location | Photo + GPS | "Photo of beach" | Public |
| Beach type | Selection | "Sand, rock, or mixed beach?" | Public |
| Beach access points | Photo + GPS | "Photo of beach access point" | Public |
| Beach lifeguard station | Photo + confirm | "Is there a lifeguard station here?" | Public |
| Lake / pond location | Photo + GPS | "Photo of lake or pond" | Public |
| Rip current zones | Report | "Are rip currents common at this beach?" | Public |

### Accessibility & Passability — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Hiking trail location | GPS track + photo | "Record this trail via GPS" | Public |
| Hiking trail name | Text | "What is this trail called?" | Public |
| Hiking trail difficulty | Selection | "Easy, moderate, difficult, or expert?" | Public |
| Hiking trail surface type | Selection + photo | "Paved, gravel, dirt, rock, or mixed?" | Public |
| Hiking trailhead location | Photo + GPS | "Photo of trailhead" | Public |
| Pedestrian passable (road) | Yes/no | "Can a person walk this road safely?" | Public |
| Pedestrian passable (trail) | Yes/no + photo | "Can a person walk this trail?" | Public |
| Pedestrian passable (open terrain) | Report + GPS | "Can you walk through this area?" | Public |
| Wheelchair passable (road) | Yes/no | "Could a wheelchair user travel this road?" | Public |
| Wheelchair passable (sidewalk) | Yes/no + photo | "Can a wheelchair use this sidewalk?" | Public |
| Wheelchair passable (trail) | Yes/no | "Is this trail wheelchair accessible?" | Public |
| Wheelchair passable (open terrain) | Report | "Could a wheelchair cross this terrain?" | Public |
| Bike passable (road) | Yes/no | "Can you bike this road?" | Public |
| Bike passable (trail) | Yes/no | "Can you bike this trail?" | Public |
| Bike passable (open terrain) | Report + GPS | "Can you bike through this area?" | Public |
| Curb cuts / ramps | Photo | "Are there curb cuts at this intersection?" | Public |
| Surface condition | Photo + report | "Photo of surface condition" | Public |

### Discrepancy & Conflict Reporting — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Map discrepancy | Report + photo + GPS | "Something wrong with the map here? Describe." | Public |
| Missing feature | Report + photo + GPS | "What's missing from the map at this location?" | Public |
| Incorrect attribute | Report + photo | "What's incorrect about this feature?" | Public |
| Photo vs map mismatch | Photo + GPS | "Photo showing map doesn't match reality" | Public |
| GPS drift / location error | Auto (GPS) | Auto-detected when user GPS conflicts with mapped location | Public |

Sensor-detected discrepancies, cross-source conflicts, temporal staleness, and all data availability layers are system-computed. Not user-collectible.

### Sensor Locations — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Weather station location | Photo + GPS | "Photo of weather station" | Public |
| Air quality monitor location | Photo + GPS | "Photo of air quality monitor" | Public |
| Stream gauge location | Photo + GPS | "Photo of stream gauge" | Public |
| Wildfire camera location | Report + GPS | "Wildfire camera at this location?" | Public |
| Traffic camera location | Photo + GPS | "Photo of traffic camera" | Public |
| User-deployed sensor location | GPS + type | "Register your personal sensor (weather, air quality, etc.)" | Public |
| User-deployed sensor type | Selection | "Weather station, PurpleAir, rain gauge, other?" | Public |
| NWS forecast office | Photo + confirm | "Confirm NWS office here?" | Public |
| Doppler radar site | Photo + confirm | "Confirm radar site here?" | Public |
| Weather observatory | Photo + confirm | "Confirm weather observatory here?" | Public |
| Volcano observatory | Photo + confirm | "Confirm volcano observatory here?" | Public |

### EMS Hazard Maps — User Collectible

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| EMS local flood hazard map | EMS file upload | Upload local flood hazard map | Public |
| EMS local wildfire hazard map | EMS file upload | Upload local wildfire hazard map | Public |
| EMS local earthquake hazard map | EMS file upload | Upload local earthquake hazard map | Public |
| EMS local tornado hazard map | EMS file upload | Upload local tornado hazard map | Public |
| EMS local tsunami hazard map | EMS file upload | Upload local tsunami hazard map | Public |
| EMS local hurricane hazard map | EMS file upload | Upload local hurricane hazard map | Public |
| EMS local landslide hazard map | EMS file upload | Upload local landslide hazard map | Public |
| EMS local avalanche hazard map | EMS file upload | Upload local avalanche hazard map | Public |
| EMS local volcanic hazard map | EMS file upload | Upload local volcanic hazard map | Public |
| EMS local hazmat hazard map | EMS file upload | Upload local hazmat hazard map | Public |
| EMS local dam failure hazard map | EMS file upload | Upload local dam failure hazard map | Public |
| EMS local storm surge hazard map | EMS file upload | Upload local storm surge hazard map | Public |
| EMS local sinkhole hazard map | EMS file upload | Upload local sinkhole hazard map | Public |
| EMS custom hazard zone | EMS draw on map | Draw custom hazard zone polygon | Public |

EMS hazard map uploads require verified EMS account. All uploads are public once approved.

### Personal Accessibility Profile — User Collectible (Private)

Not base map data. Stored in user profile only. Used to personalize evacuation routing, shelter assignment, and alert priority.

| Attribute | Ask User | Example Prompt | Public/Private |
|---|---|---|---|
| Mobility impairment | Yes/no + type | "Do you use a wheelchair, walker, or have limited mobility?" | Private |
| Visual impairment | Yes/no + severity | "Do you have a visual impairment?" | Private |
| Hearing impairment | Yes/no + severity | "Do you have a hearing impairment?" | Private |
| Requires supplemental oxygen | Yes/no | "Do you require supplemental oxygen?" | Private |
| Requires dialysis | Yes/no | "Do you require regular dialysis?" | Private |
| Requires power for medical equipment | Yes/no | "Do you depend on electrically powered medical equipment?" | Private |
| Cannot drive | Yes/no | "Are you unable to drive?" | Private |
| Service animal | Yes/no + type | "Do you have a service animal?" | Private |
| Cognitive/developmental disability | Yes/no | "Do you have a cognitive or developmental disability?" | Private |
| Number of dependents needing assistance | Number | "How many people in your household need evacuation assistance?" | Private |

### Not User-Collectible

These attributes require specialized equipment or authoritative datasets and cannot be meaningfully collected via user input: LiDAR-derived elevation models, slope/aspect/curvature, DEM derivatives, soil type/permeability, drainage class, water table depth, Vs30 seismic velocity, liquefaction susceptibility, fault lines, canopy fuel loading, canopy base height, wind history (prevailing/seasonal), burn-together zone computation, blast/plume radius modeling, dam height/reservoir volume, water system pipeline routing, voltage class, seismic vulnerability ratings, nuclear facility data.
