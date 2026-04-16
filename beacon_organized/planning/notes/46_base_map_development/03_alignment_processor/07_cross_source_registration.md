# Cross-Source Registration

Multi-source co-registration, conflict resolution, confidence scoring.

## Overview

After individual sources aligned to 1km grid, they must be co-registered (spatial offsets corrected) and conflicts resolved. Multiple sources often disagree: satellite says road here, LiDAR shows no road; OSM says building, satellite is occluded by cloud. This processor:

1. Measures systematic offsets between sources
2. Detects attribute conflicts
3. Applies iterative resolution patterns
4. Generates confidence scores per attribute

Output: unified aligned stack per tile with per-attribute confidence (0-1).

## Functions

| Function | Input | Output | Algorithm |
|----------|-------|--------|-----------|
| `compute_source_offsets` | Overlapping source datasets | Offset vectors + covariance | Feature matching + offset histogram |
| `apply_affine_correction` | Offset vectors | Corrected geometry | Affine warp per source pair |
| `detect_source_conflicts` | Multi-source attributes | Conflict flags + magnitude | Rule-based comparison |
| `resolve_by_priority` | Conflicts + priority rules | Winner selected | Resolution score |
| `resolve_by_consensus` | Multi-source predictions | Consensus class | Voting + weighted agreement |
| `compute_confidence_score` | Sources + conflicts + recency | Confidence 0-1 | Formula-based aggregation |
| `apply_cross_source_patterns` | Pass 1-6 inputs | Refined attributes | Iterative multi-step extraction |
| `generate_aligned_stack` | All processed sources | Per-tile composite | Mosaic + attribute merge |
| `tag_confidence_per_cell` | Per-attribute scores | Confidence raster | Discretized 0-1 |

## Spatial Offset Computation

Measure systematic shifts between sources.

### Algorithm

```
Per overlapping source pair (e.g., Sentinel-2 vs 3DEP DEM):
1. Extract feature correspondences (building edges, road centerlines, field boundaries)
2. Compute offset vectors for each correspondence
3. Build histogram of offsets
4. Fit Gaussian to dominant offset
5. Compute covariance (confidence in offset estimate)
6. Cache offset in Redis: offset[source1][source2]

Output:
  offset_x: mean shift in lat (meters)
  offset_y: mean shift in lon (meters)
  covariance_xx, covariance_yy: uncertainty per direction
  correlation: Pearson corr of offset magnitudes (agreement quality)
```

### GCP-Based Refinement

For critical pairs (LiDAR vs Sentinel-2), use manual GCPs:

```
1. Identify 20-30 ground control points (road junctions, building corners, field boundaries)
2. Measure coordinates in both sources
3. Compute affine transform (2D + 1 scale + 1 rotation)
4. Compare to feature-matching offset
5. Use affine if correlation >0.95; else flag for manual review
```

## Conflict Detection

Flag disagreements between sources.

### Detection Rules

| Conflict Type | Rule | Example |
|---------------|------|---------|
| Positional | Offset >3m between sources | LiDAR building 2m north of NAIP |
| Attribute | Contradictory tags | OSM says road, satellite shows forest |
| Temporal | Source timestamps >6 months apart | NAIP 2020, Sentinel-2 2024 |
| Coverage | One source missing where expected | LiDAR shadow zone, satellite cloud |
| Cardinality | Count mismatch | OSM lists 5 buildings, LiDAR detects 8 |

### Conflict Magnitude

Quantify severity (0-1, 0=no conflict, 1=irreconcilable).

```
magnitude = max(
  position_offset / threshold,
  attribute_disagreement * weight,
  temporal_gap / 6months,
  coverage_gap
)
```

## Resolution Strategies

### Strategy 1: Priority by Resolution

Higher resolution wins. Tiebreaker: recency.

| Source | Resolution | Priority |
|--------|-----------|----------|
| 3DEP LiDAR DEM | 1m | Highest (1) |
| NAIP aerial | 0.6m | 2 |
| Sentinel-2 | 10m | 3 |
| Copernicus DEM | 30m | 4 |
| OSM vector | Varies | Low (unless only source) |

When LiDAR conflicts with Sentinel-2: LiDAR attribute wins (higher resolution).

### Strategy 2: Consensus Vote

If >2 sources agree, majority wins.

```
Per attribute per cell:
  votes = [source1_class, source2_class, source3_class, ...]
  winner = most_common(votes)
  agreement_ratio = count(winner) / len(votes)
  confidence = 0.5 + agreement_ratio * 0.5  # 0.5-1.0 range
```

### Strategy 3: Time-Weighted Recency

Newer data higher weight.

```
age_days = today - acq_date
recency_weight = exp(-age_days / 365)  # Decay over 1 year
```

Older data (>2 years) confidence capped at 0.6.

## Cross-Source Patterns (6-Pass Extraction)

Iterative multi-step extraction combining multiple sources. Adapted from Feature Extraction doc.

### Pattern A: LiDAR Candidate, Street-View Confirm

LiDAR geometric anomaly → street-view classification.

```
1. Extract from LiDAR: linear feature at consistent height, width, length
2. Query street-view imagery at coordinates
3. Visual classification: fence/wall/gate/dumpster
4. Assign material (chain-link, brick, metal, etc.) from imagery
5. Final attribute: barrier type + material + rammability
```

Examples: fences, walls, fire hydrants, power lines, solar panels.

### Pattern B: Satellite Candidate, LiDAR Refine

Satellite broad extent → LiDAR precise measurement.

```
1. Extract from Sentinel-2: water surface (MNDWI), vegetation gap, impervious cluster
2. Query LiDAR:
   - Water: depth profile, surface elevation
   - Vegetation: exact boundary from point density
   - Impervious: count of structures, heights
3. Refine: pool vs pond (size + shape), road vs parking lot (aspect)
```

### Pattern C: DEM + LiDAR + Street-View Triple Pass

Full characterization needs three sources.

**Dirt roads:**
```
1. DEM: slope analysis suggests passable grade along unmapped route
2. LiDAR: vegetation clearing pattern along grade (density drop)
3. Street-view: surface type (visible in Mapillary)
→ Confidence: high if all 3 agree; medium if 2/3; low if only DEM
```

**Driveways:**
```
1. LiDAR: measures length, width, slope
2. DEM: confirms grade is drivable
3. Street-view: confirms surface type (paved/gravel), gate presence, vehicle clearance
→ Output: full driveway profile
```

**Building earthquake vulnerability:**
```
1. DEM: soil type (via SSURGO overlay)
2. LiDAR: building height, soft-story detection
3. Street-view: building material (wood/brick/concrete), age (architectural style)
→ Score: earthquake collapse probability
```

### Pattern D: OSM Candidate, Satellite + LiDAR Validate

OSM claim → multi-source verification.

| OSM Tag | Satellite Check | LiDAR Check | Result |
|---------|-----------------|-------------|--------|
| amenity=fuel | Structure visible | Canopy structure height | Gas station confirmed + footprint |
| leisure=marina | Water + dock visible | Dock elevation, slip count | Marina confirmed + capacity |
| building=church | Roof shape visible | Steeple height, footprint | Church confirmed + shelter capacity |
| highway=residential | Linear feature visible | Width measurement | Road confirmed + width |
| landuse=cemetery | Pattern visible | Low, flat, open space | Cemetery confirmed (non-flammable) |

### Pattern E: Model Output, Secondary Source Override

ML prediction vs observed data.

```
If (initial_model_prediction) AND (secondary_source_contradicts):
  Use secondary_source
  confidence *= 0.7  # Penalize inconsistency

Examples:
  - LANDFIRE says grassland, but LiDAR shows dense brush → upgrade fuel
  - Census says low density, but buildings show apartment complex → upgrade population
  - FEMA NFHL says Zone X (minimal), but DEM shows closed depression → flag unmapped risk
  - Road model says passable, but user reports flooding → override to impassable
  - Material model says wood, but assessor says concrete → use assessor (authoritative)
```

### Pattern F: Temporal Cross-Source (Event-Active)

Real-time sources override static data during events.

```
if (EVENT_ACTIVE):
  base_map_attribute = static_data
  event_observation = real_time_input  # NEXRAD, user report, VIIRS

  if (conflict):
    resolution_logic:
      - NEXRAD heavy rain + USGS gauge rising + base_map says open road
        → Flag as probably flooded (before user reports)
      - User phone camera shows rubble vs LiDAR prior
        → Mark building collapsed, update routing
      - VIIRS shows fire hot spot + Sentinel-2 shows burn scar
        → Mark area burned, flag as potential safe zone
      - Utility reports downed power line + marks road segment
        → Mark as electrocution hazard
```

## Confidence Formula

Per-attribute confidence (0-1) based on sources + agreement.

```
confidence = base_confidence
           + source_bonus           # +0.1 per agreeing source
           + resolution_bonus       # +0.2 higher resolution
           + recency_bonus          # +0.15 recent (<6 months)
           + human_confirmation    # +0.3 verified by EMS
           - conflict_penalty       # -0.2 per conflict
           - weakness_penalty       # -0.1 known weakness

Clamped to [0, 1].

Examples:
  - Sentinel-2 alone (cloud masked): 0.3
  - Sentinel-2 + NAIP agree: 0.3 + 0.1 + 0.2 (NAIP res) = 0.6
  - LiDAR + Sentinel-2 + street-view all agree: 0.5 + 0.1 + 0.1 + 0.2 = 0.9
  - Building in LiDAR shadow: 0.5 + 0.1 (satellite) - 0.1 (shadow weakness) = 0.5
  - User-confirmed damage vs LiDAR prior: 0.5 + 0.3 = 0.8
```

Thresholds:
- confidence >0.7: trusted for downstream use
- confidence 0.4-0.7: use with caution, flag uncertain
- confidence <0.4: require human review or omit

## Aligned Stack Output

Per-tile composite with all sources merged and confidence tagged.

```
Per 1km tile:
├── dem.tif                    # Merged elevation (1m where 3DEP, 30m Copernicus)
├── dem_confidence.tif         # Per-pixel confidence (0-1)
├── dem_source.tif             # Source ID (0=3DEP, 1=Copernicus)
├── satellite_rgb.tif          # Sentinel-2 / NAIP true color
├── cloud_shadow_mask.tif      # Cloud/shadow detection
├── buildings.parquet          # Vector buildings + confidence
│   ├── geom (polygon)
│   ├── height (meters)
│   ├── material (string)
│   ├── confidence (float)
│   └── sources (array)        # Which sources detected
├── roads.parquet              # Vector roads + confidence
├── barriers.parquet           # Fences/walls + material/rammability
├── trees.parquet              # Individual trees from LiDAR
├── land_cover.tif             # 12-class land cover
├── fuel_model.tif             # LANDFIRE 40 fuel models
├── confidence_summary.json
│   ├── tile_id
│   ├── mean_confidence_per_layer
│   ├── coverage_pct_per_source
│   └── detected_conflicts (count)
└── metadata.json
    ├── version
    ├── acq_date_range
    ├── sources_used
    └── processing_timestamp
```

## Databases

**source_offsets** — Cached spatial offsets.

| Field | Type | Notes |
|-------|------|-------|
| source_pair | VARCHAR | "sentinel2_3dep" |
| tile_id | INT | Computed for region |
| offset_x | FLOAT | Meters (lat) |
| offset_y | FLOAT | Meters (lon) |
| covariance_xx | FLOAT | Uncertainty lat |
| covariance_yy | FLOAT | Uncertainty lon |
| correlation | FLOAT | GCP agreement quality |
| cached_at | TIMESTAMP | Age (refresh monthly) |

**cross_source_conflicts** — Detected disagreements.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | Location |
| attribute | VARCHAR | Building height, road width, etc. |
| source1 | VARCHAR | First source |
| source1_value | VARCHAR | Its estimate |
| source2 | VARCHAR | Second source |
| source2_value | VARCHAR | Its estimate |
| conflict_magnitude | FLOAT | 0-1 severity |
| resolution_method | VARCHAR | priority / consensus / temporal |
| winner | VARCHAR | Resolved value |
| confidence | FLOAT | Final confidence |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Offset agreement (GCP vs feature match) | Correlation >0.90 | Fail if <0.85 |
| Conflicts resolved | >95% automated | Escalate remainder to human |
| Confidence distribution | >20% high (>0.7) | Flag if too many low-confidence cells |
| Temporal coherence | <6 months span | Flag if exceeded |
| Coverage (sources per tile) | >3 sources | Promote / hold if fewer |

## Cost Estimates

| Component | Cost |
|-----------|------|
| Offset computation (per month) | $50-80 |
| Conflict detection + resolution | $40-60 |
| Confidence scoring (full stack) | $30-50 |
| Pattern-based extraction (6 passes) | $100-150 |
| Aligned stack I/O + storage | $50-100 |
| **Total per month** | **$270-440** |

Parallelizable per-tile (26,000 tiles, 4-8 hour runtime).

## Integration

Cross-source registration is the *final gate* before data enters alignment/live. All individual source processors feed here. Output is the definitive per-tile aligned stack used by all downstream attribute extraction processors.
