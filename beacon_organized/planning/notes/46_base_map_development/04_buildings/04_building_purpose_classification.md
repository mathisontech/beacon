# Building Purpose Classification

Classify building purpose and occupancy from multiple sources.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| classify_purpose_from_osm | OSM tags (building=, amenity=, shop=, tourism=) | Purpose category | Tag mapping |
| classify_purpose_from_street_view | Mapillary + business logos + signage | Purpose category + confidence | Logo/text recognition CV model |
| classify_purpose_from_assessor | County assessor use code | Purpose category | Jurisdiction-specific code tables |
| reconcile_purpose_sources | OSM + CV + assessor results | Final purpose label + confidence | Voting/weighted fusion |
| estimate_occupancy_capacity | Building footprint, purpose, floor count | Occupancy estimate (persons) | Density tables by purpose |
| compute_time_of_day_occupancy | Purpose, hours of operation, time of day | Occupancy multiplier 0-1 | Occupancy schedules |

## Data Storage

Purpose stored inline in building GeoParquet:

```
{
  "purpose": "residential_single_family" | "residential_apartment" | "commercial_retail" | "commercial_office" | "industrial" | "public_school" | "public_hospital" | "religious" | "mixed_use",
  "purpose_confidence": float32,
  "occupancy_estimate": int32,
  "occupancy_estimate_confidence": float32,
  "hours_of_operation": string,
  "typical_occupancy_day": float32,
  "typical_occupancy_night": float32,
  "typical_occupancy_weekend": float32
}
```

## Primary Sources

### OSM Tags

Standard building=* tags:
- residential (single-family, apartment)
- commercial (retail, office)
- industrial (factory, warehouse)
- public (school, hospital, library)
- religious
- mixed (multi-use)

Supplementary amenity= tags:
- amenity=hospital → medical facility
- amenity=school → educational facility
- amenity=fire_station → emergency services
- amenity=fuel → gas station

Confidence: 0.70-0.85 (OSM coverage varies regionally).

### Street-View Computer Vision

Fine-grained purpose from business logos and storefront classification:

| Visual Pattern | Purpose Category |
|---|---|
| Golden arches, Burger King crown | Fast food / quick service |
| Target/Walmart logo visible | Big box retail |
| Glass storefronts + mannequins | Clothing retail |
| Pharmacy signage (CVS, Walgreens, RiteAid) | Pharmacy/drugstore |
| Gas pump silhouettes | Gas station |
| Cross on steeple/signage | Religious building |
| School buses in lot, playground | School |
| Hospital H sign | Hospital |
| Home Depot/Lowes branding | Hardware store |

Model: EfficientNet-B3 fine-tuned on 1000-building Mapillary dataset.

Confidence: 0.80-0.95 (high precision on chain stores, moderate on independent businesses).

### County Assessor Use Code

Each parcel has assessor use code (varies by state but consistent within jurisdiction):

| Code Range | Typical Purpose | Example States |
|---|---|---|
| 100-199 | Residential | CA: 0100 (single family), 0105 (multi-family) |
| 200-299 | Commercial | CA: 0200 (retail), 0250 (office) |
| 300-399 | Industrial | CA: 0300 (factory), 0310 (warehouse) |
| 400-499 | Public/Institutional | CA: 0400 (government), 0410 (school) |
| 500-599 | Agricultural | CA: 0500 (farm) |

Confidence: 0.90-0.95 (official record, but sometimes outdated).

## Purpose Categories

| Category | Occupancy (persons per 100m²) | Typical Hours | Hazard Notes |
|---|---|---|---|
| Single-family residential | 0.5-1.0 | All hours | High night occupancy |
| Multi-family apartment | 2.0-4.0 | All hours | Evacuation challenges, multi-floor |
| Commercial retail | 0.5-2.0 | Business hours | Variable night occupancy |
| Commercial office | 0.3-1.0 | Business hours | Empty nights/weekends |
| Industrial warehouse | 0.1-0.5 | Shift-dependent | Low occupancy baseline |
| School | 1.0-3.0 | School days only | High daytime, empty nights/weekends |
| Hospital | 0.3-0.8 | All hours | 24/7 staffing, fragile population |
| Religious building | 0.2-0.5 | Service hours | High at specific times |
| Gas station | 0.1-0.3 | All hours | Staff-only nights |

## Occupancy Estimation

Occupancy = footprint_area × density_by_purpose × time_of_day_factor

Example: 2,000 m² office building:
- Daytime (8am-6pm): 2000 × 0.5 persons/100m² × 1.0 = 10 persons
- Evening (6pm-11pm): 2000 × 0.5 × 0.1 = 1 person (cleaning staff)
- Night (11pm-8am): 2000 × 0.5 × 0 = 0 persons

Time-of-day factors:
- Residential: 0.2 (day) → 1.0 (night)
- Office: 1.0 (day) → 0.05 (night)
- Retail: 0.8 (day) → 0.1 (night)
- School: 1.0 (school day) → 0 (off-hours)
- Hospital: 0.7 (constant 24/7)

## Occupancy Schedules

Hours of operation sourced from:
1. Google Maps API (business hours)
2. OSM opening_hours tag
3. Purpose-based default (schools close weekends, offices close nights)

Schedule types:
- Always open (hospitals, gas stations, some retail)
- Standard business hours (9am-5pm, offices)
- Extended hours (6am-10pm, retail)
- Limited hours (schools, libraries)

Stored as: `"09:00-17:00 Mon-Fri,12:00-16:00 Sat"` (iCalendar format compatible).

## Multi-Source Reconciliation

When sources disagree:

| Scenario | Resolution |
|---|---|
| OSM says residential, assessor says commercial | Assessor wins (0.95 vs. 0.70 confidence) |
| Street-view shows Walmart logo, OSM generic commercial | Update OSM, use "commercial_retail_big_box" |
| No street-view, assessor code ambiguous | Use OSM as primary, confidence 0.65-0.70 |
| All sources agree (rare) | Confidence 0.95 |

Fused confidence = weighted_mean(osm_conf × 0.30, cv_conf × 0.40, assessor_conf × 0.30)

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| purpose.classification.tile_done | Tile complete | Per-tile |
| purpose.cv_model_updated | New EfficientNet-B3 deployed | Weekly |
| purpose.occupancy_schedule_updated | Hours of operation refreshed | Daily |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `purpose:tile:{tile_id}:distribution` | 7 days | Histogram of purpose categories |
| `purpose:estimated_population:by_hour` | 24 hours | Dynamic population per hour |
| `purpose:occupancy_multiplier:{hour}` | 24 hours | Average occupancy factor by hour |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| Google Maps API (hours lookup, 2M queries) | $300-400 |
| Mapillary logo detection CV (2× A100) | $150-200 |
| County assessor bulk data acquisition | $200-300 |
| OSM tag processing (CPU) | $50-80 |
| Schedule reconciliation (manual spot-checks) | $150-200 |
| **Total** | **$850-1,180** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Purpose classification accuracy | 0.85 | 500-building manual audit |
| Occupancy estimate (vs. field survey) | ±20% MAPE | 50-building time-study |
| Hours of operation accuracy | 90% match with official | 200-business verification |
| Multi-source agreement rate | >75% | 1000-building consensus check |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| OSM tag coverage | >60% per tile | Proceed, supplement with CV |
| CV model confidence mean | >0.70 | Proceed |
| Assessor record availability | >50% per tile | Proceed |
| Reconciliation agreement rate | >70% | Proceed, flag conflicts |

## Success Metrics

| Metric | Target |
|--------|--------|
| Classification cycle | <25 days (US) |
| Google Maps API latency | <0.3 sec per building |
| Logo detection latency | <0.1 sec per image |
| Mean occupancy confidence | >0.75 |
| Population model sensitivity (test run) | >0.85 correlation with census |
