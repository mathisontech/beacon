# User-Reported Changes

Real-time change detection from phone cameras and manual damage reports. Street-level perception system feeds into base map updates for persistent changes (>24 hours) while transient obstruction updates go directly to routing layer.

## Change Detection Pipeline

```
Phone Camera Capture
    ↓
On-Device RAFT Optical Flow (detects motion)
    ↓
On-Device MobileNetV3 Classification (0-100 confidence)
    ↓
GPS Geotag + Map Matching (snap to road)
    ↓
Anomaly Score Computation (>70 triggers upload)
    ↓
Encrypted Upload to Server
    ↓
Server-Side U-Net Segmentation (100-150ms inference)
    ↓
Obstruction/Damage Classification
    ↓
Persistent Change Detection (>24 hours same location)
    ↓
Base Map Update if Persistent
    ↓
Routing Layer Update if Transient
```

## Functions: Server-Side Processing

| Function | Input | Output | Confidence Threshold | Role |
|----------|-------|--------|----------------------|------|
| receive_user_submission | Encrypted photo/video | Submission record | Any | Ingest upload |
| classify_change_type | Image + location | Class (road/vegetation/structure/lighting) | >50% U-Net softmax | Categorize change |
| compute_anomaly_score | Classification result | Confidence 0-100 | Per-class | Assess reliability |
| deduplicate_submissions | Location, time window | Deduplicated set | 50m radius, 24h | Prevent flooding |
| assess_routing_impact | Change type, severity | Passability (1-10) | Per-class | Determine urgency |
| update_passability_layer | Passability score, location | Road segment update | >5 = impassable | Real-time routing |
| validate_persistent_change | Submissions over time | Persistent? (bool) | >3 confirmations, >24h | Base map eligible |
| flag_for_manual_review | Ambiguous classifications | Review queue entry | 0.3-0.7 confidence | QA process |
| reward_reporter | Submission ID, outcome | Gamification credit | Verified only | User incentive |

## Change Classification

| Class | Detection Method | Passability Impact | Base Map Update? | Example |
|-------|-----------------|------------------|------------------|---------|
| Road surface | Optical flow + texture CNN | Varies (1-8) | If persistent | Pothole, water, debris |
| Vegetation | Silhouette + color change | Varies (2-9) | If persistent | Tree down, branch debris |
| Structural | Edge detection + damage CNN | Varies (3-9) | Yes, always | Building collapse, fence |
| Lighting | Temporal stability + shadow detection | None (0) | No | Shadows, reflections |

False positives filtered aggressively: lighting changes suppressed, road surface changes require 2+ confirmations before base map update.

## Confidence Scoring

Anomaly score combines:

```
anomaly_score = (
    0.4 × optical_flow_magnitude +
    0.4 × cnn_classification_confidence +
    0.2 × geolocation_accuracy_factor
) × 100

where:
  optical_flow_magnitude = clipped to [0, 1]
  cnn_classification_confidence = softmax[true_class]
  geolocation_accuracy_factor = 1.0 if GPS<10m, 0.8 if 10-30m, 0.6 if 30-50m

Threshold: >70 → upload to server
            50-70 → local storage (upload on Wi-Fi)
            <50 → discard
```

## Deduplication Strategy

Multi-modal matching:

1. Spatial: all submissions within 50m radius of same location
2. Temporal: within 24-hour window
3. Semantic: same change classification
4. If 3+ matching submissions: deduplicate to single "verified" entry
5. Count additional submissions as "confirmations" (increases confidence)

Deduplication log tracks which submissions merged into single entry.

## Routing Impact Assessment

Passability severity (1-10 scale):

| Severity | Description | Routing Action |
|----------|-------------|-----------------|
| 1-2 | Minor surface damage, full passage | No change |
| 3-4 | Debris/small obstruction, detour possible | Add cost to segment |
| 5-6 | Significant obstruction, single-lane passage | Mark slow/caution |
| 7-8 | Mostly blocked, emergency vehicles only | Mark impassable to civilians |
| 9-10 | Completely blocked, no passage | Mark impassable to all |

Routing layer applies update immediately (real-time for severity >5). Base map layer waits for persistence validation.

## Persistent Change Validation

Transient vs. persistent determined by temporal clustering:

```
validate_persistent_change(submissions_by_location):
  for each unique location:
    submissions_over_24h = filter(submissions, time_window=24h)
    if len(submissions_over_24h) >= 3:
      time_gaps = [t[i+1] - t[i] for i in 0..len(t)-2]
      if max(time_gaps) < 6h:  # continuous observations
        return persistent = True
      if min(time_gaps) < 2h and max(time_gaps) < 12h:
        return persistent = True
    if len(submissions_over_24h) == 1 and age > 48h:
      return persistent = True  # single old report
  return persistent = False
```

Examples:
- Road blocked at 10am, 11am, 2pm (observations 1h, 3h apart): persistent
- Water on road at 6am, 4pm, next 8am (observations with 10h gap): persistent
- Single user report of tree down, no follow-up: transient (check again in 24h)
- Fallen tree reported 3x by different users over 2 days: persistent

## Update Pathways

### Transient Update (Routing Only)

```
→ Passability change event
  → NATS topic: beacon.routing.obstruction_detected
  → Payload: location, severity, duration_estimate, reporter_count
  → Routing engine subscribes, updates local graph weights
  → Propagates via mesh to offline devices
  → Expires: when hazard resolved or >24h stale (check reporter count)
```

No base map version bump. User sees real-time routing changes but map layer unchanged.

### Persistent Update (Base Map)

```
→ Validated persistent change
  → Create new digital_twin_version
  → Merge update: roads/buildings/vegetation layer modified
  → Run diff report: what changed vs. prior version
  → Promote to live: new version is current
  → NATS topic: beacon.atlas.updates (standard notification)
  → Archive prior version (retention: 10 hot, 1y warm, 5y cold)
```

Base map version increments. All consumers notified. Historical tracking retained.

## Manual Review Queue

```
flag_for_manual_review(submission):
  if anomaly_score in [0.3, 0.7]:
    send to review_queue
    → Base Map team triages within 2 hours (critical) or 24 hours (standard)
    → Classify as: valid, false_positive, or uncertain
    → If valid: promote to persistent update process
    → If false_positive: tag submission, improve model
    → If uncertain: wait for more confirmations

review_queue metrics:
  - count_reviewed_per_day
  - accept_rate (valid / total)
  - false_positive_rate
```

High false-positive rates trigger model retraining.

## Gamification and Rewards

```
reward_reporter(submission_id, outcome):
  if outcome == "verified_persistent_change":
    award_points = 100
  elif outcome == "verified_routing_improvement":
    award_points = 50
  elif outcome == "valid_dangerous_hazard_detection":
    award_points = 250
  else:
    award_points = 0

  user.points += award_points
  if user.points % 500 == 0:
    send achievement notification
```

Leaderboard: top reporters per month, featured in app. Engagement metric.

## Privacy and Data Handling

All images processed server-side (U-Net inference) for obstruction/damage classification only. Classification results stored (location, type, severity); original images archived to encrypted storage and deleted after 30 days unless:
- Part of active emergency event (retained for 6 months)
- Flagged for manual review (retained until review complete, then deleted)
- User consents to long-term storage (can revoke anytime)

Faces and license plates blurred on-device before upload (see Street-Level Perception doc). Metadata (phone model, OS version) stripped.

## Integration with Hazard Events

User submissions during active event (e.g., evacuation alert level 4+) expedited:

```
if event_active AND submission.anomaly_score > 60:
  → Route to fast-track validation (1 hour vs. 24 hours)
  → NATS broadcast: beacon.events.user_damage_report
  → EMS dispatch can view submissions in real-time
  → If verified: immediately update routing + base map v_event
```

Post-event damage reports aggregated into official damage assessment (feeds FEMA, insurance).

## Cost Model

| Component | Cost per 1M Submissions |
|-----------|----------------------|
| Server-side inference (U-Net) | ~$200 |
| Storage (30-day retention) | ~$50 |
| NATS message volume | ~$20 |
| Manual review (QA team) | ~$5K |
| **Total** | **~$5.3K per 1M** |

Target: 1M submissions per major event (10M population evacuating). Cost per submission: ~$0.005.
