# Street-View Alignment

Mapillary, Ring doorbell cameras, user-submitted photos. Geolocation and temporal baseline creation.

## Sources

| Source | Coverage | Imagery | Update | Use |
|--------|----------|---------|--------|-----|
| Mapillary | ~10M miles, emphasis urban/suburban | Street-level sequences | Monthly | Barriers, buildings, infrastructure, condition |
| Ring doorbells | Partnership deployments | High-quality residential | Real-time | Activity patterns, vehicle types, snow depth |
| User photos | Event-triggered submissions | Variable quality | Event-based | Damage assessment, post-event change detection |

## LiDAR-to-Street Reprojection

Pre-event baseline: synthetic street-level images derived from LiDAR.

### Pipeline

```
1. Download 3DEP LiDAR for US coverage
2. For each road segment (OpenStreetMap):
   a. Extract LiDAR elevation at centerline + offsets (shoulders)
   b. Identify obstructions: trees >10ft overhanging, power lines, buildings
   c. Identify surface: paved vs unpaved (from intensity/texture)
3. Render synthetic 1920x1080 image at 1.3m camera height
   - View: forward along road, 60° FOV
   - Content: road, shoulders, sky, obstructions labeled
4. Store as baseline for each road segment
5. Use during events for change detection
```

Output: ~1B synthetic baseline images = 2TB S3.

### Obstruction Detection

Automated labeling in reprojected images:

| Type | Detection | Use |
|------|-----------|-----|
| Vegetation (trees, shrubs) | Height > 2m above road | Fallable risk, road access |
| Debris | <2m height, on road surface | Immediate obstruction |
| Building | Fixed structure within 5m | Proximity, shelter potential |
| Power line | Sagging wire crossing road | Electrocution hazard |
| Flood water | Ponding detection from DEM | Impassable road |

## Mapillary Alignment

Ingested imagery geo-registered to 1km grid.

### Functions

| Function | Input | Output | Algorithm |
|----------|-------|--------|-----------|
| `download_mapillary_sequence` | Region + date range | Image metadata + S3 refs | Mapillary API pagination |
| `correct_gps_position` | Raw GPS + road network | Corrected lat/lon | Differential GPS + map matching |
| `estimate_camera_pose` | Image + road geometry | Intrinsic/extrinsic calibration | Vanishing point analysis, SfM |
| `temporal_tag_image` | Image EXIF + metadata | Unified timestamp | EXIF extraction + API timestamp |
| `detect_coverage_gaps` | Coverage per road segment | Gap polygons | Network analysis |
| `blur_faces_plates` | Raw image | Anonymized image | MobileNet face detector + TFLite OCR |
| `strip_exif_metadata` | Raw image | Stripped JPEG | Remove all EXIF fields |

### GPS Correction

Target accuracy: ±10m after map matching.

```
1. Extract raw GPS from image metadata
2. Map-match to nearest road centerline
3. Apply differential GPS correction if reference network available
4. Snap to 1km tile grid
5. Store corrected coordinates with confidence (0-1)
```

Confidence scoring:

| Condition | Confidence |
|-----------|-----------|
| Road matched unambiguously, GPS tight | 0.9-1.0 |
| Road matched, GPS offset >10m | 0.7-0.9 |
| Near-ambiguous junction, multiple candidates | 0.5-0.7 |
| GPS only, no road match (parking) | 0.3-0.5 |

### Camera Pose Estimation

Intrinsic + extrinsic from image geometry.

```
1. Detect vertical lines (building edges, poles, lane marks)
2. Find vanishing points
3. Infer horizon line and camera tilt
4. Cross-check with reported heading (phone compass)
5. Estimate pitch (tilt angle up/down)
6. Store: focal length, principal point, rotation matrix
```

Used for street-level-to-3D projection (linking to LiDAR).

### Privacy Pipeline

Mandatory. >99% face/plate coverage on output images.

| Step | Algorithm | Coverage Target |
|------|-----------|-----------------|
| Face detection | MobileNet (3MB, on-device) | >99% faces |
| Face blurring | Gaussian blur, σ=20px | Irreversible |
| Plate detection | OCR-based text region finding | >95% plates |
| Plate OCR | TensorFlow Lite (8MB) | Verify format (CA ###XXX) |
| Plate blurring | Pixelation, 10x10px blocks | Irreversible |
| EXIF stripping | Remove all metadata fields | Timestamp replaced with server-side only |

Output: server-side only timestamp, hashed user ID, submission location.

## Ring Doorbell Integration

Partnership data: real-time feeds from select deployments.

### Functions

| Function | Input | Output |
|----------|-------|--------|
| `geotag_ring_footage` | Device registration + timestamp | Lat/lon from device registration |
| `extract_activity_patterns` | 30-day video | Vehicle/pedestrian counts, times |
| `detect_vehicle_types` | Video frame | Car/truck/SUV classification |
| `measure_snow_depth` | Driveway video + prior baseline | Estimated depth (cm) |

Geolocation accuracy: ±50m (device registration accuracy).

## User-Submitted Photos

Event-triggered submissions during disasters.

### Functions

| Function | Input | Output |
|----------|-------|--------|
| `geotag_user_photo` | Photo GPS + map matching | Corrected lat/lon ±10m |
| `detect_damage_type` | Image + ML model | Damage classification (structure/veg/fire/flood/debris) |
| `assess_severity` | Image + prior baseline | Severity score 1-10 |
| `compare_to_baseline` | User photo + synthetic LiDAR baseline | Change mask, areas affected |
| `blur_faces_plates` | Raw submission | Anonymized image |

## Temporal Baseline

Per-road-segment baseline image for change detection.

| Scenario | Baseline Source | Frequency | Accuracy |
|----------|-----------------|-----------|----------|
| Pre-LiDAR era (no 3DEP) | Oldest Mapillary image | Per-image timestamp | Visual baseline |
| LiDAR available (US) | Synthetic LiDAR-reprojected | 1x (static, updated per LiDAR refresh) | Geometric baseline |
| Post-LiDAR refreshes | Newest Mapillary in window | Monthly or on request | Visual baseline |

Usage: during events, compare user/Ring footage to baseline to flag new damage.

## Databases

**mapillary_sequences** — Downloaded image sequences.

| Field | Type | Notes |
|-------|------|-------|
| sequence_id | VARCHAR | Mapillary sequence ID |
| tile_id | INT | Primary 1km cell |
| acq_date | DATE | Capture date |
| image_count | INT | # images in sequence |
| coverage_pct | FLOAT | % of road segments in tile |
| gps_accuracy | FLOAT | Meters, after map matching |
| last_updated | TIMESTAMP | Fetch date |

**street_view_baselines** — Pre-event baseline images per road segment.

| Field | Type | Notes |
|-------|------|-------|
| segment_id | VARCHAR | OpenStreetMap way ID |
| baseline_type | ENUM | lidar_synthetic, mapillary_visual |
| baseline_date | DATE | Image acquisition or LiDAR date |
| image_path | VARCHAR | S3 path |
| gps_bounds | POLYGON | Coverage area |
| last_used_for_change_detection | TIMESTAMP | Track usage |

## Storage

```
s3://beacon-atlas/alignment_processor/street_view/v{NNN}/
├── mapillary_metadata/
│   └── sequences.parquet         # Downloaded sequence index
├── baselines/                    # Pre-event baselines
│   ├── lidar_synthetic/          # ~1B images, 2TB total
│   └── mapillary_visual/         # Recent Mapillary snapshots
├── ring_footage/                 # Partnership data (real-time)
│   └── geotag_log.parquet
└── user_submissions/             # Event submissions (deleted after 2 yrs)
    └── event_id/
        └── anonymized_photos/
```

## Quality Validation

| Check | Threshold | Action |
|-------|-----------|--------|
| Face/plate blurring coverage | >99% | Reject if <99% |
| GPS accuracy after map matching | ±10m | Flag if > 10m |
| Camera pose inference success | >90% images | Log warnings if <90% |
| Baseline image clarity | Visual inspection | Reject if occluded |
| Temporal consistency | Latest <1 year | Flag if older |

## Integration with Alignment

Street-view serves two roles in alignment:

1. **Baseline validation:** Synthetic LiDAR baselines confirmed by Mapillary (does road actually have that width/obstruction?)
2. **Attribute classification:** Barriers, buildings, materials confirmed or refined by street-level observations

Street-view does NOT participate in geometric registration (GPS accuracy too low, Mapillary not everywhere). Instead, it validates and enriches output from satellite + LiDAR alignment.

## Cost Estimates

| Component | Cost |
|-----------|------|
| Mapillary API downloads (monthly) | $50-100 |
| LiDAR-to-street synthesis (one-time) | $200-400 |
| Privacy processing (blurring, anonymization) | $30-60 per 1M images |
| Ring partnership integration | ~$100 setup |
| User submission storage (per major event) | $50-100 |

## Privacy & Legal

- End-to-end encryption for user submissions
- No unblurred images stored server-side
- Audit trail: who viewed, when, justification
- User can request data deletion (within retention period)
- GDPR / CCPA compliant anonymization
