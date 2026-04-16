# Street-Level Perception

## Overview

Street-level perception detects obstructions, damage, and accessibility issues from mobile device cameras and LiDAR sensors. System combines three data sources: pre-event LiDAR-to-street-level reprojection (baseline), real-time phone camera change detection, and post-event damage assessment from user submissions. Privacy-preserving pipeline: faces and license plates blurred server-side before storage.

## LiDAR-to-Street-Level Reprojection

Data source: USGS 3DEP (3D Elevation Program) LiDAR tiles (1m post-spacing). Beacon obtains tiles via OpenTopography (https://cloud.sdsc.edu/v1/AUTH_opentopography). Tiles cover entire western US at 1m horizontal resolution.

Reprojection workflow: For each road segment (OpenStreetMap geometry), sample LiDAR elevation at road centerline and offset 5m left/right (shoulder position). Extract building outlines (from USGS 3DEP raster + OpenStreetMap relations). Identify obstructions: trees overhanging road (elevation peak >10ft above road surface within 5m), power lines (visual signature in LiDAR intensity), buildings/walls encroaching road shoulder.

Street-level perspective: Using computer vision, reproject 3D LiDAR point cloud to camera viewpoint (typical dash-cam height 1.3m above road). Generate synthetic 1920x1080 image showing road ahead, shoulder, and sky.

Obstruction labeling: Segment obstruction types in reprojected image:
- Vegetation (trees, shrubs): >2m height blocking road/shoulder
- Debris (fallen branches): <2m height on road surface
- Building: fixed structure adjacent road
- Power line: sagging line crossing road
- Flood water: ponding on road surface from terrain analysis

Baseline storage: For each road segment, store synthetic LiDAR-reprojected image. Tiles processed at launch (day 0 of platform), used as pre-event baseline for damage assessment.

## Phone Camera Change Detection

Real-time mobile input: When user drives or walks, phone camera streams to Beacon via local processing (on-device inference). Beacon uses RAFT (Recurrent All-Pairs Field Transforms) optical flow to detect pixel-level motion differences between frames.

Architecture: Extract optical flow per frame, accumulate flow magnitude over 5-second windows. Peaks in flow magnitude indicate sudden scene change: fallen tree, debris, flooded road, building collapse.

Classification: Detected change regions fed to on-device vision model (MobileNetV3, quantized to 4MB), classified as:
- Road surface change (potholes, cracks, water, debris)
- Vegetation change (new obstruction, tree down)
- Structural change (building damage, fence down)
- Lighting change (shadows, reflections) → filtered as false positive

Geolocation: Phone GPS + map matching (snap position to nearest road) + heading (phone gyro) + camera pointing direction (ML pose estimation) localizes detected change to road segment ±10m accuracy.

Anomaly scoring: Model outputs confidence (0-100) per detection. Threshold: >70 confidence triggers server submission.

Server-side filtering: Received change detection deduped against prior submissions in same location (within 50m, past 24 hours). Dedupe prevents flooding from multiple users passing same obstruction.

## Privacy-Preserving Pipeline

Face blurring: On-device preprocessing detects faces using MobileNet face detector (3MB model). Detected face regions blurred with Gaussian kernel (σ=20px). Applied before any upload.

License plate blurring: On-device OCR-based detector finds rectangular regions with text. Text recognized (TensorFlow Lite OCR model). If recognized as license plate format (CA ###XXX), region blurred.

Metadata stripping: EXIF data (camera make, timestamp, etc.) removed from submitted images. Beacon server adds only: submission timestamp, segmented location, user ID (hashed).

Encryption: Images encrypted end-to-end (user's public key) when uploaded. Only authorized personnel (fire dispatch, city planning) receive decryption key, and only for incidents they have authority over.

Audit trail: Every decryption logged: who decrypted, when, which image, justification. User can request audit log.

## Post-Event Damage Assessment

Event trigger: When evacuation alert (Level 4-5) issued for area, system activates damage assessment mode. Users encouraged to submit photos of surroundings as they evacuate/return.

Submission interface: Quick-snap tool: one-tap to enable 30-second video (captures 30 frames at 30fps). Auto-processes as above (blur + change detection). Minimal friction to encourage participation.

Damage types: System classifies submissions as:
- Structure damage (roof, wall, windows destroyed)
- Vegetation damage (trees, structures flattened)
- Fire damage (charring, burned structures)
- Flood damage (water line, sediment deposits)
- Debris field (scattered materials)

Before/after comparison: Post-event submissions compared against baseline LiDAR-reprojected images. Change detection algorithm identifies new damage. Geolocation accuracy: within 50m. Severity scored 1-10 based on:
- Obstruction extent (% of road surface blocked)
- Height of obstruction (blocking passage vs. just accessible)
- Access urgency (fire evacuation route vs. secondary street)

Routing impact: Detected road obstructions fed to evacuation routing engine (Section 12). Routes avoid blocked roads, reroute to open paths. Severity >5 marks road as impassable.

## Inference and Model Architecture

On-device models (user-facing):
- RAFT optical flow: 40MB model, 100-200ms inference (GPU), outputs flow field per frame
- MobileNetV3 for obstruction classification: 4MB, 20ms inference
- MobileNet face detector: 3MB, 15ms inference
- LiteOCR for plate recognition: 8MB, 50ms inference

Server-side models (damage assessment):
- Segmentation (U-Net, 50M params): identifies obstruction boundary, 500ms inference per image, 2GB VRAM
- Classification: obstruction type, severity (XGBoost, 10MB), 20ms inference

Model updates: Models versioned and distributed via system updates (Section 40). New model epochs posted monthly if accuracy improved ≥1% on validation set.

## Scale and Storage

Scale: Beacon targets 10M road miles (western US). LiDAR baseline generates ~1B synthetic images (street-level reprojections). Stored in cloud S3 as mosaics (1000 images per 100km2 tile), ~2TB total baseline storage.

User submissions: Estimated 10M submissions during major event (e.g., state-wide evacuation). Submissions 640x480 JPEG (~50KB compressed). Total: 500GB per major event. Retained for 2 years (for post-event analysis, routing validation), then deleted.

Mesh network: Change detection results (not images) synced via mesh. Metadata only: obstruction type, location, severity. Used for local routing updates on offline devices.

Implementation notes: Change detection runs asynchronously (doesn't block camera or UI). Submissions queued if offline, uploaded when connectivity available. Server consolidates submissions by location; single obstructed road segment might have 50+ submissions deduplicated into one "Road blocked" entry.

## Validation and Testing

Synthetic data: CARLA simulator generates synthetic street scenes with known obstructions (fallen trees, water ponding, debris). Test optical flow and classification accuracy on synthetic data. Ground truth: manually annotated CARLA scenes with pixel-level obstruction masks.

Real validation: Post-event ground-truthing with fire department reports. Compare Beacon-detected obstructions to dispatch records of actual field conditions. Target: 85% recall (detect actual obstructions), 95% precision (minimize false positives).
