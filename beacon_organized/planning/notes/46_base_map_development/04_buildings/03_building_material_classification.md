# Building Material Classification

Classify building materials from street-view imagery and building age inference.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| classify_material_from_street_view | Mapillary image tiles around building | Material class label + confidence | ResNet-50 CV model |
| infer_material_from_age | Year built, jurisdiction, building type | Likely material class | Building code era tables |
| compute_fire_resistance_score | Material class, roof material | Score 0-1 (0=combustible, 1=fire-proof) | Material vulnerability tables |
| compute_seismic_vulnerability_score | Material class, height, age, soft-story flag | Score 0-1 (0=fragile, 1=robust) | HAZUS fragility curves |
| classify_roof_material | Street-view + LiDAR surface type | Roof material class | Reflectance + visual signature |

## Data Storage

Materials stored inline in building GeoParquet:

```
{
  "material_class": "wood_frame" | "masonry" | "concrete" | "steel" | "mobile_home" | "mixed",
  "material_confidence": float32,
  "material_source": "street_view" | "age_inference" | "assessor",
  "roof_material": "asphalt_shingle" | "metal" | "tile" | "concrete" | "tar_gravel" | "synthetic" | "unknown",
  "fire_resistance_score": float32,
  "seismic_vulnerability_score": float32,
  "year_built": int32,
  "building_code_era": string
}
```

## Primary Method: Street-View CV

**Target accuracy: 85% F1 score**

Model: ResNet-50 fine-tuned on building material dataset

Classes:
- Wood frame (siding, shingles, log)
- Masonry (brick, stone, CMU block)
- Concrete (cast, precast, tilt-up)
- Steel (visible members, metal siding)
- Manufactured/mobile home
- Mixed (two+ materials visible)

Processing:

1. Query Mapillary API for image tiles within 50m of building centroid
2. Filter by ground-level view angle (15-60° pitch)
3. Crop image patches showing building facade (avoid sky, trees)
4. Run ResNet-50 inference on each patch
5. Aggregate predictions: majority vote or mean confidence
6. Output: material_class + confidence

Training data: Curated 500-building Mapillary dataset (10+ images per building, hand-labeled per visible wall face).

Confidence scoring:
- 0.9-1.0: All image patches agree + recent imagery (<2 years)
- 0.7-0.9: Majority agreement + moderate imagery age
- 0.5-0.7: Partial agreement or older imagery (>3 years)
- <0.5: Conflicting patches or no street-view available

## Secondary Method: Age-Based Inference

**Fallback when street-view unavailable (e.g., rural areas, global coverage)**

Building code eras by jurisdiction and year:

| Era | Year Range | Typical Materials | Seismic Resilience |
|-----|---|---|---|
| Pre-Code | 1900-1950 | Wood frame, masonry | Poor (unreinforced) |
| Early Code | 1950-1980 | Wood frame, reinforced masonry | Moderate |
| Modern Code | 1980-2000 | Steel, reinforced concrete | Good |
| Current Code | 2000+ | Engineered frame, seismic restraints | Excellent |

Lookup: jurisdiction + year_built → building_code_era → typical_materials

Confidence: 0.5-0.7 (lower than street-view CV).

## Roof Material Classification

From street-view + LiDAR surface characteristics:

| Visual Signature | LiDAR Reflectance | Material |
|---|---|---|
| Dark shingles | 0.15-0.25 (absorptive) | Asphalt shingles |
| Metallic sheen | 0.30-0.50 (reflective) | Metal roofing |
| Clay tiles | 0.20-0.30 (moderate) | Tile |
| Concrete appearance | 0.35-0.50 (reflective) | Concrete/flat |
| Gravel texture | 0.20-0.35 (moderate) | Tar & gravel |

## Fire Resistance Scoring

Combustibility by material:

| Material | Base Score | Modifiers |
|----------|---|---|
| Wood frame | 0.2 | +0.1 if roof not metal |
| Masonry (unreinforced) | 0.5 | -0.1 if pre-code |
| Masonry (reinforced) | 0.7 | +0.1 if modern code |
| Concrete | 0.8 | No change |
| Steel | 0.8 | -0.05 if unprotected |
| Mobile home | 0.15 | +0.1 if aluminum siding |

Adjusted score = base + vegetation_proximity_modifier + roof_modifier

Example: Wood frame, pre-code, metal roof near vegetation → 0.2 + 0.1 - 0.2 = 0.1 (high fire risk)

## Seismic Vulnerability Scoring

HAZUS fragility curves by material + height + age:

| Material | Low-Rise | Mid-Rise | High-Rise |
|----------|----------|----------|-----------|
| Masonry (unreinforced) | 0.9 | 0.95 | N/A |
| Masonry (reinforced) | 0.6 | 0.75 | 0.85 |
| Steel | 0.4 | 0.5 | 0.6 |
| Reinforced concrete | 0.5 | 0.6 | 0.75 |

Adjust for soft-story flag: +0.3 if present.

Adjust for code era: -0.15 if post-2000 code.

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| materials.classification.tile_done | Tile complete | Per-tile |
| materials.cv_model_updated | New ResNet-50 deployed | Weekly |
| materials.confidence_alert | <50% confidence buildings | Per 1km region |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `materials:tile:{tile_id}:distribution` | 7 days | Histogram of materials per tile |
| `materials:model_metrics` | 7 days | CV model F1, precision, recall |
| `materials:fire_resistance_avg` | 7 days | Mean fire score per tile |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| Mapillary API calls (5M image tiles) | $200-300 |
| ResNet-50 inference (4× A100, 30 days) | $200-300 |
| Image preprocessing + cropping (CPU) | $80-120 |
| Age inference + code era lookup | $50-80 |
| S3 storage (results) | $30-50 |
| **Total** | **$560-850** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Material classification F1 | 0.85 | 200-building curated Mapillary set |
| Age inference accuracy | 75% | Assessor record validation |
| Roof material accuracy | 80% | Field survey subset |
| Fire resistance agreement (EMS expert) | >0.70 Kappa | 100-building expert review |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Street-view image availability | >70% per tile | Flag low-coverage areas |
| CV model confidence mean | >0.65 | Proceed |
| Age inference coverage | >50% per tile | Proceed, supplement with CV |
| Material-seismic score agreement | >75% multi-source | Proceed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Classification cycle | <20 days (US) |
| Mapillary tile query latency | <0.2 sec per building |
| ResNet-50 inference latency | <0.1 sec per building |
| Mean confidence (street-view CV) | >0.72 |
| Mean confidence (global, age-inferred) | >0.58 |
