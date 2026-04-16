# Fallback Confidence Scoring

Mechanism to tag, classify, and report on data coverage gaps in global fallback system. Enables downstream consumers to adjust hazard models and warnings based on confidence level.

## Functions: Coverage Assessment

| Function | Input | Output | Purpose | SLA |
|----------|-------|--------|---------|-----|
| compute_data_coverage_score | Tile attributes | Score 0.0-1.0 per tile | % of expected attributes present | Real-time |
| classify_coverage_tier | Coverage score + location | Tier (full/enhanced/global/insufficient) | Assign data tier | Real-time |
| tag_fallback_tiles | Tier classification | Tile metadata JSON | Mark tiles for downstream flagging | Real-time |
| compute_attribute_confidence | Attribute source + age + quality | Per-attribute confidence 0.0-1.0 | Blend multiple source confidences | Real-time |
| generate_coverage_gap_report | All tiles + population | CSV: location, gap type, priority | Identify areas needing data acquisition | Monthly |
| estimate_accuracy_degradation | Hazard model + tier + missing attributes | Accuracy delta (% or absolute) | Predict model performance loss | Ad-hoc |
| flag_for_data_acquisition | Gap report + EMS feedback | Acquisition request (location, attributes) | Queue for LiDAR/street-view collection | Monthly |

## Coverage Tier Definition

### Full Coverage (US+Limited High-Risk Areas)

Sources: LiDAR 3DEP, NAIP 0.6m, Mapillary street-view, county assessor, FEMA, LANDFIRE.

Attributes: 40+ (elevation, slope, aspect, terrain type, building materials, soft-story, road width, turn radii, vegetation species, fire fuel, drainage, structures, barriers, gates, etc.)

Confidence: 0.7-0.9 per attribute.

Use: Primary hazard models, detailed evacuation routing, damage assessment.

### Enhanced Coverage (US Without Full Sensors, High-Pop Fallback)

Sources: Satellite (NAIP or Sentinel-2), OSM, some reference data, sparse street-view.

Attributes: 20-25 (elevation, slope, aspect, basic land cover, road topology, buildings, basic barriers, population baseline).

Confidence: 0.4-0.7 per attribute.

Use: Secondary hazard models, general evacuation routing, public alerting.

### Global Fallback

Sources: Copernicus DEM 30m, Sentinel-2 10m, OpenStreetMap, HydroSHEDS, volcano/tsunami catalogs.

Attributes: 12-15 (elevation, slope, aspect, terrain class, land cover 11-class, road topology, buildings rough, POIs, major water, hazard zones).

Confidence: 0.2-0.5 per attribute.

Use: Basic evacuation routing, international EMS support, conservative hazard predictions.

### Insufficient Coverage

Coverage score <0.2. Missing critical sources (no elevation, no roads, no buildings).

Confidence: <0.2, suppress from live map.

Use: Archive only, flag for manual review or data acquisition.

## Scoring Methodology

Per-tile confidence computed as:

```
coverage_score = (attributes_present / attributes_expected) × source_quality_factor

where:
  attributes_present = count of non-null attributes in tile
  attributes_expected = 12 for global, 25 for enhanced, 40 for full
  source_quality_factor = weighted blend of source recency/error rates
    = 0.95 × fresh + 0.85 × month-old + 0.70 × year-old + 0.50 × archive
```

Per-attribute confidence:

```
attr_confidence = Σ(source_weight[i] × source_confidence[i]) / Σ(source_weight[i])

Examples:
  Elevation via Copernicus DEM only: 0.4 (global source)
  Elevation via LiDAR + NAIP fusion: 0.85 (full coverage)
  Building footprints via OSM only: 0.25 (sparse coverage)
  Building footprints via LiDAR + Mapillary: 0.8 (multi-source)
```

## Tile Tagging

Each 1km tile tagged with:

```json
{
  "tile_id": "N45W090_001_002",
  "coverage_tier": "global",
  "coverage_score": 0.35,
  "data_sources": ["copernicus_dem", "sentinel2", "osm"],
  "missing_sources": ["lidar", "naip", "mapillary", "assessor"],
  "attribute_confidences": {
    "elevation": 0.40,
    "slope": 0.38,
    "aspect": 0.38,
    "land_cover": 0.45,
    "buildings": 0.25,
    "roads": 0.35,
    "water_bodies": 0.60
  },
  "last_updated": "2026-03-01T00:00:00Z",
  "next_update_eligible": "2026-06-01T00:00:00Z"
}
```

## Downstream Impact: Hazard Model Degradation

| Hazard | Full (0.8) | Enhanced (0.55) | Global (0.35) | Insufficient (0.2) |
|--------|-----------|-----------------|---------------|--------------------|
| Wildfire spread | 85% ROC AUC | 72% ROC AUC (-13pp) | 62% ROC AUC (-23pp) | Suppress |
| Flood inundation | 78% recall | 65% recall (-13pp) | 48% recall (-30pp) | Suppress |
| Tsunami runup | 72% MAE ±2m | 85% MAE ±3m (-13m) | 140% MAE ±5m (-68m) | Suppress |
| Landslide runout | 68% recall | 52% recall (-16pp) | 38% recall (-30pp) | Flag manual |
| Evacuation routing | 95% passability | 82% passability (-13pp) | 68% passability (-27pp) | Conservative |
| Building damage | 70% precision | 50% precision (-20pp) | N/A | N/A |

Accuracy delta columns show performance loss vs. full coverage. Suppress = tile excluded from live hazard map. Conservative = route with safety margin (assume worst case).

## Coverage Gap Report

Monthly report generated by `generate_coverage_gap_report`:

```
Location,Lat,Lon,PopDensity,CoverageScore,MissingSources,Priority,AcquisitionType
N45W090_001_002,45.5,-90.5,850,0.35,[lidar,naip],1,lidar_survey
N42W088_005_010,42.3,-88.2,2100,0.25,[lidar,naip,mapillary],1,lidar_survey
```

Priority scored by: `(population / coverage_score) × missing_criticality`. High-population low-coverage areas prioritized for acquisition.

Acquisition types: lidar_survey, naip_collection, mapillary_drive, assessor_records, manual_survey.

## Transient vs. Persistent Updates

- Transient (24-hour lifespan): road blockage, flooding during event
  - Updated via street-level perception in real-time
  - Not persisted to fallback base map
  - Expires when hazard passes

- Persistent (>1 month lifespan): structure destroyed, new building, terrain changed
  - Updated via post-event resurvey or official data release
  - Committed to fallback base map version
  - Requires validation before promotion

## Data Acquisition Prioritization

`flag_for_data_acquisition` output feeds into acquisition planning:

1. Rank by population exposure: (population × missing_attributes)
2. Filter by hazard risk: exclude low-seismic/non-coastal areas if budget limited
3. Estimate cost-benefit: coverage_gain / acquisition_cost
4. Schedule in multi-year campaign: 500 tiles/year per survey team

Target: raise all high-population areas (>1000/km²) to enhanced tier (0.55+) within 5 years.

## Client-Side Display

Clients should:
- Show confidence badge in UI (full/enhanced/global/low)
- Suppress hazard predictions on insufficient tiles
- Apply gray overlay to low-confidence areas
- Display warning: "This area has limited data. Plan for uncertainty."
- Link to acquisition request form for critical areas
