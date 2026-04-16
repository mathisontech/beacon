# Reference Data Alignment

County assessor records, LANDFIRE, SSURGO soil, EPA facilities, NBI bridges, seismic data registration.

## Sources

| Source | Coverage | Format | Update | Use |
|--------|----------|--------|--------|-----|
| County assessor records | US, ~3000 counties | CSV, PDF | Annually (county-specific) | Building attributes, property boundaries |
| LANDFIRE | US, 30m | GeoTIFF | Every 2 years | Fire fuel models, vegetation |
| SSURGO soil | US, polygons | Shapefiles | Annually | Soil type, drainage, permeability |
| EPA facilities | US, point | CSV/shapefile | Quarterly | Hazmat storage, TRI releases, Superfund |
| NBI bridges | US, point/line | Shapefiles | Annually | Bridge condition, load capacity, scour |
| USGS seismic | Global, vector/raster | Shapefiles, GeoJSON | Continuously updated | Fault lines, Vs30, hazard maps |

## Functions

| Function | Input | Output | Algorithm |
|----------|-------|--------|-----------|
| `geocode_assessor_records` | Property address | Lat/lon point | USPS geocoder + manual correction |
| `normalize_assessor_schema` | County assessor CSV | Standardized table | Transform 3000+ schemas to unified |
| `join_assessor_to_buildings` | Assessor points + building footprints | Matched pairs | Spatial join, address fuzzy matching |
| `download_landfire_layers` | Tile list | GeoTIFFs (EVT, EVC, EVH, FBFM40) | USGS EROS API |
| `align_landfire_to_grid` | 30m LANDFIRE | 1km composite | Disaggregate 30m to 1km (mode) |
| `download_ssurgo_soil` | Tile list | Shapefiles | NRCS SoilWeb API |
| `compute_soil_permeability` | Soil texture | Permeability rate | USDA K-factor lookup |
| `download_epa_facilities` | Region | Point layer | EPA FRS API, RMP, TRI, UST downloads |
| `download_nbi_bridges` | State | Shapefile | FHWA NBI download |
| `load_seismic_data` | Global | GeoJSON + rasters | USGS fault database, Vs30 maps |
| `spatial_join_all` | All reference layers | Per-tile summary | Join all reference data to 1km grid |

## County Assessor Records

Property-level building attributes: footprint, value, construction date, materials.

### Geocoding

Transform address strings to lat/lon.

```
Workflow:
1. Parse address (street, city, state, ZIP)
2. Submit to USPS geocoder (free, authoritative)
3. Receive point + accuracy confidence (rooftop vs street-level vs ZIP centroid)
4. If confidence <0.7: manual correction or reject
5. Write geocoded point to database
6. Spatial join to nearest building footprint (LiDAR + satellite)
```

Challenges: inconsistent address format across 3000+ US counties, address points may not match building footprints (property line vs building).

### Schema Normalization

3000+ US county assessor databases with different schemas. Normalize to:

| Field | Type | Source |
|-------|------|--------|
| parcel_id | VARCHAR | County-specific ID |
| owner_name | VARCHAR | Owner(s) |
| address | VARCHAR | Mailing address |
| lat | FLOAT | Geocoded |
| lon | FLOAT | Geocoded |
| structure_type | VARCHAR | Single family, multi-family, commercial, industrial, mobile home, other |
| year_built | INT | Year of construction |
| total_sqft | INT | Total building square footage |
| lot_sqft | INT | Lot area |
| est_market_value | INT | Assessed value (USD) |
| property_class | VARCHAR | County-specific zoning/class code |

Many counties missing most fields (especially rural counties).

### Joining to Buildings

Match geocoded assessor points to building footprints.

```
Per point:
1. Find all building footprints within 30m
2. If 1 match: join
3. If >1 match: use nearest footprint (confidence 0.7)
4. If no match within 30m: create standalone record
5. Check: assessed value reasonable for building size (sanity check)
```

Confidence tracking:
- Rooftop geocoded + exact footprint match: 0.95
- Street-level geocoded + nearest footprint: 0.7
- ZIP centroid + nearest footprint: 0.4

## LANDFIRE

Vegetation and fuel model layers, 30m resolution.

### Layers

| Acronym | Full Name | Use |
|---------|-----------|-----|
| EVT | Existing Vegetation Type | Vegetation classification (800+ classes) |
| EVC | Existing Vegetation Cover | Canopy cover % |
| EVH | Existing Vegetation Height | Height classes |
| FBFM40 | Fire Behavior Fuel Model | 40 standardized fuel models for fire modeling |
| CBD | Canopy Bulk Density | Crown fire potential (kg/m³) |
| CBH | Canopy Base Height | Surface-to-crown fire transition (m) |

### Disaggregation to 1km

LANDFIRE 30m → 1km grid. Strategy: mode (most common 30m cell) per 1km tile.

```
Per 1km tile:
1. Extract all 30m cells within tile bounds
2. For categorical (EVT, FBFM40): select mode (most common)
3. For continuous (CBD, CBH): select mean or median
4. Assign confidence based on modal cell count:
   - Mode represents 80%+ of cells: confidence 0.9
   - Mode represents 50-80%: confidence 0.7
   - Mode represents <50% (mixed): confidence 0.5
5. Write to 1km raster
```

## SSURGO Soil Survey

Soil properties per map unit (typically <1 km² polygons).

### Key Attributes

| Attribute | Type | Use |
|-----------|------|-----|
| Drainage class | Categorical | Flood frequency, water table depth |
| Hydrologic soil group | A-D | Runoff potential, infiltration |
| Permeability | cm/hour | Infiltration rate |
| K-factor | Unitless | Erosion potential |
| Depth to bedrock | cm | Foundation, excavation difficulty |
| Liquefaction risk | Binary | Seismic hazard |

### Computation

Soil permeability from texture (sand/silt/clay fractions).

```
Permeability lookup:
  Sand >85%: high (100+ cm/hr)
  Sand-loam mix: moderate (10-50 cm/hr)
  Clay >30%: low (<1 cm/hr)
```

Lookup against USDA soil texture triangle. Output: permeability raster per 1km tile.

## EPA Facilities

Hazardous chemical inventory: TRI (Toxics Release Inventory), RMP (Risk Management Program), UST (Underground Storage Tanks).

### Layers

| Database | Features | Count |
|----------|----------|-------|
| FRS (Facility Registry Service) | All EPA-regulated facilities | ~1M |
| TRI | Annual chemical releases | ~23,000 active |
| RMP | Worst-case release scenarios | ~13,000 |
| UST | Underground storage tank locations | ~600,000 |

### Integration

```
Per EPA facility record:
1. Geocode address
2. Spatial join to 1km tile
3. Extract chemicals (TRI + RMP)
4. Compute worst-case plume extent (RMP modeling)
5. Flag population exposure
6. Mark confidence 1.0 (official data)
```

Output: EPA facilities layer (GeoParquet) per tile.

## NBI Bridges

National Bridge Inventory: structural condition, load capacity, vulnerability.

### Key Fields

| Field | Use |
|-------|-----|
| Condition rating | 0-9, 0=failed, 9=excellent |
| Scour rating | Vulnerability to water erosion |
| Load capacity | Tons, restricts vehicle weight |
| Year built | Age |
| Deck width | Lane count inference |

Output: bridges layer (GeoParquet) per tile. Used for evacuation routing (flagging weight-restricted routes).

## Seismic Data

Fault lines, Vs30 (site amplification), historical earthquakes.

### Layers

| Source | Use |
|--------|-----|
| USGS fault database | Fault location, slip rate, max magnitude |
| Vs30 maps | Site amplification factor for earthquake shaking |
| ShakeMaps | Observed intensity from historical earthquakes |
| Focal mechanisms | Earthquake mechanism type |

### Integration

Spatial join fault lines + Vs30 per 1km tile. Compute seismic hazard score (fault proximity + Vs30 amplification).

## Databases

**assessor_buildings** — Joined assessor + building footprints.

| Field | Type | Notes |
|-------|------|-------|
| parcel_id | VARCHAR | Unique identifier |
| building_id | INT | FK to LiDAR/satellite buildings |
| owner_name | VARCHAR | Owner(s) |
| structure_type | VARCHAR | Single-family, etc. |
| year_built | INT | Age estimate |
| total_sqft | INT | Building size |
| est_market_value | INT | Property value (USD) |
| confidence | FLOAT | Join confidence |

**landfire_fuel_models** — Aggregated LANDFIRE per tile.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | 1km cell |
| fbfm40 | INT | Fuel model 1-40 (mode) |
| evt_class | VARCHAR | Vegetation type |
| cbd | FLOAT | Canopy bulk density kg/m³ |
| cbh | FLOAT | Canopy base height m |
| confidence | FLOAT | Modal confidence |

**soil_properties** — SSURGO per tile.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | 1km cell |
| drainage_class | VARCHAR | Well/moderately/poorly drained |
| hydrologic_group | CHAR | A/B/C/D |
| permeability_cmhr | FLOAT | Infiltration rate |
| liquefaction_risk | INT | 0=none, 1=moderate, 2=high |

**epa_facilities** — EPA-regulated sites per tile.

| Field | Type | Notes |
|-------|------|-------|
| facility_id | VARCHAR | EPA FRS ID |
| geom | POINT | Geocoded location |
| tile_id | INT | Primary 1km cell |
| facility_type | VARCHAR | Manufacturing, chemical storage, etc. |
| chemicals | ARRAY[VARCHAR] | List of chemicals (TRI) |
| rmp_worst_case | POLYGON | RMP worst-case plume (if applicable) |

**nbi_bridges** — Bridge inventory per tile.

| Field | Type | Notes |
|-------|------|-------|
| bridge_id | VARCHAR | NBI ID |
| geom | LINESTRING | Bridge centerline |
| tile_id | INT | Primary 1km cell |
| condition_rating | INT | 0-9 |
| load_capacity_tons | INT | Vehicle weight limit |
| year_built | INT | Age |

**seismic_hazards** — Fault + Vs30 per tile.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | 1km cell |
| fault_proximity_m | FLOAT | Distance to nearest fault |
| vs30_mps | FLOAT | Shear wave velocity |
| seismic_hazard_score | FLOAT | 0-1, combined fault+Vs30 |

## Spatial Join

All reference data joined to 1km tile grid.

```
Per tile:
1. Load all reference layers (assessor, LANDFIRE, soil, EPA, NBI, seismic)
2. Perform spatial join: layer -> tile
3. Aggregate per-tile statistics:
   - Count of buildings with assessor data
   - Count of EPA facilities
   - Mean/median soil properties
   - Weighted fuel model
4. Write summary to tile metadata
5. Compute tile-level confidence from layer counts (more sources = higher confidence)
```

## Quality Validation

| Check | Threshold | Action |
|-------|-----------|--------|
| Assessor join success | >50% buildings (by county) | Flag low-coverage counties |
| LANDFIRE currency | <5 years old | Flag if older |
| Soil coverage | 100% (by NRCS mapping) | Flag gaps |
| EPA facility geocoding | >95% accuracy | Manual review if <95% |
| NBI bridge match | >90% within 30m | Flag if worse |
| Seismic data | Latest USGS version | Update quarterly |

## Cost Estimates

| Component | Cost |
|-----------|------|
| Assessor record compilation (3000 counties) | $300-500 (one-time) |
| Geocoding (parallel, USPS API) | $200-300 monthly |
| LANDFIRE download + disaggregate | $50-100 one-time |
| SSURGO processing | $30-50 one-time |
| EPA facility ingestion | $20-30 quarterly |
| NBI bridge data | $10-20 annually |
| Seismic data (USGS) | Free |
| PostGIS storage + indexing | $100-150 |
| **Total (amortized)** | **$150-300 monthly** |

## Integration with Alignment

Reference data does NOT participate in geometric alignment. Instead:

1. **Validation:** Assessor buildings validate LiDAR extraction (count, structure type)
2. **Enrichment:** Assessor property value + SSURGO permeability + EPA chemicals merged with raster-detected features
3. **Hazard context:** LANDFIRE fuel models + seismic hazards inform downstream risk modeling

Reference layers provide *attribute enrichment* and *hazard context*, not *geometric positioning*.
