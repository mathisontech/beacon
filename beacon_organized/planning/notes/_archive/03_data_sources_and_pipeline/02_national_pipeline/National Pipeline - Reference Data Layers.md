# World Base Map — National Processing Pipeline

**US-specific data sources processed by project, state, or region**

## LANDFIRE Fuels Layer

---

### Source Overview

| Property | Value |
|----------|-------|
| Source | LANDFIRE (Landscape Fire and Resource Management Planning Tools) |
| Resolution | 30m |
| Coverage | CONUS, Alaska, Hawaii |
| Products used | FBFM40 (fire behavior fuel model), EVT (vegetation type), EVC (vegetation cover), EVH (vegetation height), CBD (canopy bulk density), CC (canopy cover) |
| Update cycle | Every 2-3 years |
| Format | GeoTIFF |

### Fetcher: landfire

**Spits out:** `raw/landfire/v{NNN}/{product}.tif` for each product listed above

### Processor: landfire_fuels

Downloads and standardizes all LANDFIRE products into the national base map.

**Spits out (raster per tile):**
- Fuel model: `landfire/v{NNN}/fuel_model/{tile}.tif` (UInt8, FBFM40 class code)
- Vegetation type: `landfire/v{NNN}/veg_type/{tile}.tif` (UInt16, EVT code)
- Vegetation cover: `landfire/v{NNN}/veg_cover/{tile}.tif` (UInt8, percent 0-100)
- Vegetation height: `landfire/v{NNN}/veg_height/{tile}.tif` (UInt8, height class)
- Canopy bulk density: `landfire/v{NNN}/canopy_density/{tile}.tif` (UInt16, kg/m³ × 100)
- Canopy cover: `landfire/v{NNN}/canopy_cover/{tile}.tif` (UInt8, percent 0-100)

**Why these matter:** LANDFIRE fuel models are the standard input to fire spread models (FARSITE, ELMFIRE). They define how fast fire spreads, how much heat it produces, and how it behaves in different vegetation types. Jupiter's fire modeling module consumes these directly.

**Validation:** All pixels have valid class codes. Coverage matches declared extent. Fuel model distribution plausible per state.

---

## Census & Population Layer

---

### Source Overview

| Property | Value |
|----------|-------|
| Source | US Census Bureau |
| Products | Decennial census blocks, ACS 5-year estimates, TIGER/Line shapefiles |
| Resolution | Census block level (~50-500 people per block in urban areas) |
| Update cycle | ACS: annual. Decennial: every 10 years. TIGER: annual. |
| Format | Shapefiles + CSV |

### Processor: census_population

Disaggregates census block population into building-level estimates.

**Takes in:** Census block data + building footprints (from LiDAR or NAIP or Microsoft/Google)

**Spits out:**
- Population per cell (1km): `census/v{NNN}/population/cells.parquet`
  - Fields: cell_id, total_population, households, median_age, pct_under_18, pct_over_65, pct_disabled (from ACS)
- Population per building estimate: `census/v{NNN}/population/buildings.parquet`
  - Fields: building_id, est_population, est_households, allocation_method (dasymetric / equal_area / residential_only)
  - *Dasymetric mapping: distribute block population across residential buildings proportional to footprint area × estimated floors. Commercial/industrial buildings get 0 residential population.*
- Vulnerable population flags per cell:
  - Fields: cell_id, nursing_homes_pop, school_pop, hospital_beds, prison_pop
  - *These are from known facility locations, not modeled estimates*

**Validation:** Cell populations sum to county totals. No building has more population than the block it's in.

---

## FEMA & Flood Layer

---

### Source Overview

| Property | Value |
|----------|-------|
| Source | FEMA National Flood Hazard Layer (NFHL) |
| Products | Flood zone polygons, Base Flood Elevations, floodways |
| Coverage | ~90% of US communities (some gaps in rural areas) |
| Update cycle | Ongoing community-by-community map revisions |
| Format | Shapefiles via FEMA Map Service Center |

### Processor: fema_flood

**Spits out:**
- Flood zone polygons (GeoParquet): `fema/v{NNN}/flood_zones.parquet`
  - Fields: geom, flood_zone (A/AE/AH/AO/V/VE/X/D), base_flood_elevation_m, floodway (boolean), community_id
- Flood risk per building: `fema/v{NNN}/building_flood_risk.parquet`
  - Fields: building_id, flood_zone, is_in_floodway, base_flood_elev_relative (building ground elev minus BFE)

**Validation:** Zone geometries valid. Zone hierarchy logical (floodway inside AE inside X).

---

## Government Boundaries Layer

---

### Sources

| Source | What | Format |
|--------|------|--------|
| Census TIGER | State, county, city, census tract, block boundaries | Shapefiles |
| NCES | School district boundaries | Shapefiles |
| HIFLD | Fire station response areas | Shapefiles |
| Census TIGER | Law enforcement agency boundaries | Shapefiles |
| PAD-US | Federal/state/local protected areas | GeoPackage |

### Processor: boundaries

**Spits out (GeoParquet per boundary type):**
- `boundaries/v{NNN}/states.parquet`
- `boundaries/v{NNN}/counties.parquet`
- `boundaries/v{NNN}/cities.parquet`
- `boundaries/v{NNN}/census_tracts.parquet`
- `boundaries/v{NNN}/school_districts.parquet`
- `boundaries/v{NNN}/fire_districts.parquet`
- `boundaries/v{NNN}/police_jurisdictions.parquet`
- `boundaries/v{NNN}/protected_areas.parquet` (national parks, forests, wilderness areas, military)

All share: geom (polygon), name, source_id, authority_name, authority_type

**Why these matter:** Jurisdiction boundaries determine which agencies respond to incidents. School districts identify where children concentrate during school hours. Protected areas affect access restrictions and resource availability.

**Validation:** Boundaries tile without gaps within each type. State boundaries sum to CONUS.

---

## Utility Infrastructure Layer

---

### Sources

| Source | What | Coverage Quality |
|--------|------|-----------------|
| HIFLD | Transmission lines, substations, power plants | Good for transmission, poor for distribution |
| OSM | Power lines, substations (crowdsourced) | Variable, better in urban areas |
| EIA | Utility service territories | Authoritative for territory, not for line locations |
| HIFLD | Natural gas pipelines | Interstate only, not local distribution |
| EPA | Drinking water systems | System boundaries, not pipe locations |

### Processor: utilities

**Spits out (GeoParquet):**
- Power transmission lines: `utilities/v{NNN}/power_transmission.parquet`
  - Fields: geom (linestring), voltage_kv, owner, line_type (transmission/sub-transmission)
- Substations: `utilities/v{NNN}/substations.parquet`
  - Fields: geom (point), name, max_voltage_kv, owner
- Utility territories: `utilities/v{NNN}/utility_territories.parquet`
  - Fields: geom (polygon), utility_name, utility_type (electric/gas/water), contact_info
  - *Knowing which utility controls a power line tells emergency managers who to call for shutoff*
- Gas pipelines (interstate): `utilities/v{NNN}/gas_pipelines.parquet`
  - Fields: geom (linestring), diameter_inches, operator, pipeline_type

**What's missing:** Distribution-level power lines (the ones on poles in neighborhoods) are poorly mapped publicly. LiDAR and street view detection of power line poles fills this gap. The fusion model will combine HIFLD transmission data with LiDAR/street view pole detections to build a more complete power network.

**Validation:** Transmission lines connect between substations. Utility territories tile without gaps. Pipeline counts match EIA statistics.

---

## Seismic & Earthquake Layer

---

### Sources

| Source | What |
|--------|------|
| USGS Quaternary Faults | Active fault line locations |
| USGS NSHM | National Seismic Hazard Model — probabilistic ground motion maps |
| USGS ShakeAlert | Earthquake early warning zones |

### Processor: seismic

**Spits out:**
- Fault lines (GeoParquet): `seismic/v{NNN}/fault_lines.parquet`
  - Fields: geom (linestring), fault_name, slip_rate_mm_yr, last_event_age, fault_type
- Seismic hazard (raster): `seismic/v{NNN}/hazard/{tile}.tif`
  - PGA (peak ground acceleration) at 2% probability of exceedance in 50 years
- Liquefaction susceptibility (raster): `seismic/v{NNN}/liquefaction/{tile}.tif`
  - Derived from NSHM soil class + groundwater depth where available

**Validation:** Fault lines in known seismic zones. PGA values highest near plate boundaries.

---

## Burn History Layer

---

### Sources

| Source | What |
|--------|------|
| MTBS | Monitoring Trends in Burn Severity — historical fire perimeters |
| NIFC | National Interagency Fire Center — fire perimeters |
| FIRMS | NASA active fire detections (for recency overlay) |

### Processor: burn_history

**Spits out:**
- Fire perimeters (GeoParquet): `burn_history/v{NNN}/perimeters.parquet`
  - Fields: geom (polygon), fire_name, year, area_km2, burn_severity (from MTBS: unburned/low/moderate/high)
- Years since last burn (raster): `burn_history/v{NNN}/years_since_burn/{tile}.tif`
  - UInt8. 0 = burned this year, 255 = no recorded burn.
  - *Recent burns reduce fuel load. Old burns have regrown. This feeds fire spread models.*

**Validation:** Fire perimeters match known major fires. Years-since-burn consistent across overlapping sources.
