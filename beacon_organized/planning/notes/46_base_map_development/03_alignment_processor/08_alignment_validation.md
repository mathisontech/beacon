# Alignment Validation

Quality assurance for alignment processor output before promotion to live.

## Overview

All aligned tiles validated before live promotion. QA/QC checks automated + sampled manual review. Tiles scoring <30 confidence quarantined, 30-50 flagged for review, >50 auto-promoted.

## Validation Functions

| Function | Input | Output | Check Type |
|----------|-------|--------|-----------|
| `check_positional_accuracy` | Aligned raster/vector + ground truth | RMSE per layer, per source | Automated |
| `check_temporal_consistency` | Per-tile source timestamps | Timeline report, flags >6mo gaps | Automated |
| `measure_tile_completeness` | Aligned stack | % coverage per attribute | Automated |
| `detect_coverage_gaps` | Coverage raster | Polygon masks (<50% areas) | Automated |
| `compute_quality_score` | All checks + metadata | 0-100 composite score | Formula |
| `flag_for_quarantine` | Quality score | Quarantine records (score <30) | Automated |
| `flag_for_manual_review` | Quality score + confidence | Review queue (30-50 score) | Automated |
| `auto_promote` | Quality score | Promotion logs (score >50) | Automated |
| `generate_qa_report` | All checks + decisions | Tile + source summary | Report generation |
| `track_alignment_drift` | Current vs previous version | Drift analysis + alerts | Monitoring |

## Positional Accuracy Validation

Compare aligned data to ground truth.

### Ground Truth Sources

| Source | Use | Density | Accuracy |
|--------|-----|---------|----------|
| Field surveys (USGS benchmarks) | DEM validation | ~1 per 1000 km² | ±0.3m vertical |
| High-res commercial imagery | Building footprint + road validation | Selected cities | ±0.5m horizontal |
| Manual visual inspection | Spot-check 2% sample | ~500 tiles/month | Qualitative |
| USGS 3DEP quality assessments | LiDAR data quality | Per-project | Published RMSE |

### Accuracy Checks Per Layer

| Layer | Metric | Ground Truth | Target | Action |
|-------|--------|--------------|--------|--------|
| DEM | Vertical RMSE | Field benchmarks | <1m (3DEP), <5m (Copernicus) | Flag if exceeded |
| Satellite | Horizontal RMSE | High-res imagery | <10m (Sentinel-2), <3m (NAIP) | Reprocess if >20m |
| Building footprints | Intersection-over-union (IoU) | Manual digitization | >0.7 IoU | Quarantine if <0.6 |
| Road centerlines | Hausdorff distance | GPS/LiDAR baseline | <5m 95th percentile | Flag if exceeded |

### Automated RMSE Calculation

Per-tile, per-source:

```
RMSE = sqrt(mean((observed - ground_truth)²))

1. Load aligned data + ground truth for overlapping areas
2. Sample 20-100 points per tile
3. Compute error per point
4. Calculate RMSE
5. Log per tile + per source
6. Aggregate to per-month report
```

## Temporal Consistency

Flag tiles using sources with mismatched timestamps.

| Check | Condition | Confidence Penalty |
|-------|-----------|-------------------|
| All sources <6 months old | Max age OK | None |
| One source 6-12 months | Aging data | -0.1 |
| One source >12 months | Very old | -0.2 |
| Sources >12 months apart | Temporal mismatch | -0.3 |

Example: Sentinel-2 from 2024, NAIP from 2021 → penalty -0.2 for temporal span.

## Tile Completeness

Measure % of cells with data per attribute.

```
Per tile, per attribute:
  completeness = (cells_with_data / total_cells) * 100%

Thresholds:
  >70%: good coverage
  50-70%: acceptable
  <50%: flag for quarantine
```

Tracked per attribute:

| Attribute | Expected Coverage |
|-----------|-------------------|
| DEM elevation | 98%+ (only water as nodata) |
| Satellite RGB | 70%+ (accounts for cloud, shadow) |
| Buildings | Varies by land use (10-40% urban, 0-5% rural) |
| Roads | Varies by region (1-10% area) |
| Land cover | 95%+ |

## Coverage Gap Detection

Identify contiguous areas with <50% attribute coverage.

```
Algorithm:
1. Rasterize confidence layer (0-1)
2. Threshold at 0.5
3. Find connected components of low-confidence cells
4. Output polygon masks of gaps
5. Flag tile if gap area >20% of tile
```

Gaps indicate:
- Cloud/shadow (satellite)
- LiDAR shadow zones
- Unmapped source (OSM incomplete)
- Processing failure

## Quality Score Formula

Composite 0-100 score combining all checks.

```
quality_score = base_score
              + coverage_bonus          # 0-20 points
              + accuracy_bonus          # 0-20 points
              + source_diversity_bonus  # 0-15 points
              + recency_bonus           # 0-15 points
              + completeness_bonus      # 0-15 points
              + validation_pass_bonus   # 0-5 points

Where:
  base_score = 20

  coverage_bonus = completeness_pct * 0.2 (max 20)
  accuracy_bonus = (1 - normalized_rmse) * 20 (max 20)
  source_diversity = min(num_sources / 4, 1.0) * 15 (max 15 at 4+ sources)
  recency_bonus = exp(-age_days / 180) * 15 (max 15 for fresh data)
  completeness = (1 - gap_ratio) * 15 (max 15 if no gaps)
  validation_pass = 5 if all checks pass else 0

Clamped to [0, 100].
```

## Promotion Rules

Automatic routing based on quality score.

| Score | Action | SLA |
|-------|--------|-----|
| >70 | Auto-promote to live | Immediate |
| 50-70 | Promote + flag for monitoring | Within 24 hours |
| 30-50 | Queue for manual review | Human review within 48 hours |
| <30 | Quarantine + alert | Escalate + investigation |

## Manual Review Workflow

Tiles in 30-50 range reviewed by QA team.

```
1. Display tile in QA dashboard (side-by-side: base map + aligned stack)
2. Review checklist:
   - Visual inspection: any obvious errors?
   - Confidence distribution: too many low-confidence areas?
   - Source agreement: do sources visually agree?
   - Temporal mismatch: are sources from same epoch?
3. Decision:
   - Approve: promote to live
   - Reject: quarantine + flag processor for investigation
   - Partial: promote but flag attribute(s) as uncertain
```

Estimated time per tile: 2-3 minutes. Target: process ~200 tiles/week.

## Quarantine Protocol

Tiles <30 score + failed validation.

```
Quarantine actions:
1. Move to quarantine/failed/{tile_id}_{timestamp}/
2. Copy validation report + all source data
3. Alert processing team: which checks failed?
4. Investigate:
   - Processor bug? (rerun)
   - Source issue? (alert source team)
   - Ground truth mismatch? (update reference)
5. Decision: retry/reprocess or manual fix
6. Document findings for future improvements
```

Retention: 30 days pending decision, then archive or delete.

## Monitoring & Drift Detection

Continuous monitoring of quality metrics over time.

### Metrics Tracked

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Mean quality score | >60 | <50 for 3 consecutive weeks |
| Mean RMSE (DEM) | <2m | >3m consistently |
| Mean positional offset | <1m | >2m consistently |
| Source agreement rate | >80% | <70% consistently |
| Temporal span | <4 months | >6 months average |

### Drift Detection

```
Per month:
1. Compute quality metrics for all promoted tiles
2. Compare to previous month
3. Detect trends:
   - Mean quality declining? Flag processor
   - RMSE increasing? Investigate source degradation
   - New offset appearing? Check co-registration
4. Alert if trend significant (>10% month-over-month)
```

## Databases

**validation_results** — Per-tile validation record.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | 1km cell |
| version | VARCHAR | Data version |
| check_type | VARCHAR | positional, temporal, completeness, etc. |
| check_result | VARCHAR | pass/fail/warning |
| metric_value | FLOAT | RMSE, %, coverage, etc. |
| threshold | FLOAT | Expected value |
| action | VARCHAR | auto_promote / review / quarantine |
| validated_at | TIMESTAMP | Validation date |

**quality_scores** — Composite tile scores.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | 1km cell |
| version | VARCHAR | Data version |
| quality_score | INT | 0-100 |
| component_scores | JSONB | coverage, accuracy, diversity, etc. |
| promotion_decision | VARCHAR | promoted / flagged / quarantined |
| promoted_at | TIMESTAMP | Live date (null if not promoted) |
| reviewed_by | VARCHAR | Human reviewer (if applicable) |

**alignment_drift_log** — Monthly trend tracking.

| Field | Type | Notes |
|-------|------|-------|
| month | DATE | Period covered |
| mean_quality | FLOAT | Average tile score |
| mean_rmse | FLOAT | Average positional error |
| mean_offset | FLOAT | Average registration offset |
| source_agreement | FLOAT | % tiles with >80% agreement |
| alert_flag | BOOLEAN | Trend detected? |
| notes | TEXT | Observations |

## QA Team Monitoring

5-agent team for continuous validation:

| Role | Responsibility | Hours |
|------|-----------------|-------|
| QA Lead | Triage, complex cases, trend analysis | 40h/week |
| Validator 1-3 | Manual review of flagged tiles | 40h/week each |
| QA Reporting | Dashboard, metrics, monthly report | 20h/week |

Estimated capacity: ~200 flagged tiles/week with this team.

## Reporting

Monthly QA report to pipeline team.

| Section | Contents |
|---------|----------|
| Summary | Total tiles validated, promotion rate, quarantine count |
| Metrics | Quality score distribution, RMSE trends, source agreement |
| Issues | Top failure modes, processor bugs identified |
| Recommendations | Actions for improvement |

## Integration with Alignment

Validation is the *final gate*. No tile enters live without:
1. Automated checks pass (quality score computed)
2. Promotion decision (>50) or manual approval (30-50)
3. Quarantine + investigation (if <30)

Failed tiles never corrupt live data. Quarantine allows investigation + reprocessing without service impact.

## Cost Estimates

| Component | Cost |
|-----------|------|
| Automated validation infrastructure | $100-150 |
| Manual review (5 QA staff) | $20,000 month |
| Ground truth data acquisition | $500-1000 month |
| Monitoring + alerting | $50-100 |
| Dashboard + reporting | $30-50 |
| **Total monthly** | **$21,000-22,000** |

Represents ~10-15% of total alignment processor cost.

## Acceptance Criteria for Go-Live

Before production deployment:

- [ ] Validation infrastructure tested on 1000 sample tiles
- [ ] Quality score distribution validated (>60 mean expected)
- [ ] Manual review workflow proven (<3 min/tile)
- [ ] Quarantine + reprocessing workflow tested
- [ ] Alert thresholds calibrated to 3-month baseline
- [ ] QA team trained and staffed
- [ ] Dashboard implemented and operational
