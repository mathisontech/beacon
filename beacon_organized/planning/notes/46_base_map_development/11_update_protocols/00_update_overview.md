# Base Map Update Protocols

System to keep the digital twin current via three update channels: scheduled data releases, post-event resurveys, and user-reported changes. Pipeline enforces validation before live promotion.

## Update Triggers

### 1. Scheduled Source Refresh

Official data releases on predictable schedules. Examples:

| Source | Release Frequency | Trigger Type | Owner |
|--------|------------------|--------------|-------|
| Sentinel-2 | Every 5 days | Automatic digest | Source Refresh Coordinator |
| NAIP | Annual per state | Manual, calendar-driven | Source Refresh Coordinator |
| 3DEP LiDAR | Per-project (1-2/year) | Manual, email notification | Source Refresh Coordinator |
| OSM | Continuous | Weekly diff extraction | Source Refresh Coordinator |
| LANDFIRE | Biennial (even years) | Manual, December | Source Refresh Coordinator |
| Census | Annual ACS, decennial full | Manual, calendar | Source Refresh Coordinator |
| FEMA flood maps | Irregular (post-study) | Manual, email | Source Refresh Coordinator |
| County assessor | Annual | Manual, varies by county | Source Refresh Coordinator |
| Volcanic/tsunami | Ad-hoc | Manual, catalog update | Hazard Specialist |

### 2. Post-Event Resurvey

Hazard event alters base map (structures destroyed, terrain changed, roads blocked). Automatic trigger if event magnitude exceeds threshold; manual trigger by Base Map Director or EMS.

| Event Type | Trigger Threshold | Survey Assets |
|------------|-------------------|----------------|
| Wildfire | >5000 acres | Satellite tasking, aerial survey, street-level |
| Earthquake | >Magnitude 5.5 | Satellite tasking, aerial survey, assessor updates |
| Flood | >100 buildings affected | Satellite tasking, street-level perception |
| Hurricane/tornado | >Level 3 damage | Aerial survey, street-level perception |
| Landslide | >major event | Satellite tasking, aerial survey |

### 3. User-Reported Changes

Real-time change detection from phone cameras and manual reports. Persistent changes (>24 hours) trigger base map update. Transient changes (event-duration) update routing only.

| Submission Type | Confidence Threshold | Action |
|-----------------|----------------------|--------|
| Street-level photo | >70% anomaly score | Server-side review |
| Video (30sec) | >60% confidence per frame | Automatic processing |
| Manual text report | EMS/staff only | Automatic if authorized |
| Damage report form | Severity >5 (scale 1-10) | Batched daily review |

## Update Pipeline

```
Trigger Event
    ↓
Validate Data Quality
    ↓
Stage in Staging Layer
    ↓
Run Alignment (if new satellite/LiDAR)
    ↓
Run Extraction Processors
    ↓
Stage Test Deployment
    ↓
Compare Old vs. New Quality Scores
    ↓
Validate No Regression
    ↓
(PASS) → Promote to Live
    ↓
(FAIL) → Quarantine + Alert
    ↓
Notify Downstream Consumers
    ↓
Archive Previous Version
```

## Ownership and Roles

| Role | Responsibility | Team |
|------|-----------------|------|
| Source Refresh Coordinator | Track release calendar, detect new data, trigger ingestion | Data Ops |
| Post-Event Update Specialist | Coordinate satellite tasking, manage resurvey assets | Field Ops |
| Base Map Director | Approve major updates, escalate conflicts, coordinate with EMS | Director-level |
| Validation Specialist | Run quality checks, flag regressions, sign off on promotion | Data Quality |
| NATS/Notification Lead | Broadcast update events to downstream consumers | Ops |

## Update SLAs

| Trigger Type | Validation | Promotion | Notification | Consumer Update |
|--------------|-----------|-----------|--------------|-----------------|
| Scheduled (planned) | 4-8 hours | After business hours | +30 min | +2 hours |
| Post-event first update | 4-6 hours | Expedited | Immediate | +1 hour |
| Post-event follow-up | 8-12 hours | Standard | Immediate | +2 hours |
| User report (verified) | 1-2 hours | Same day | Immediate | +30 min |

## Version Control

Each update creates a new version snapshot:

```
Digital Twin v127 (current live)
    ↓ (tile affected by Sentinel-2 update)
Digital Twin v128 (after scheduled refresh)
    ↓ (post-earthquake update)
Digital Twin v129 (after post-event resurvey)
```

All versions immutable. Can roll back to any prior version if new version introduces errors. Retention: last 10 versions hot (PostgreSQL), 1 year warm (S3 Standard), 5 years cold (S3 Glacier).

## Conflict Resolution

If two updates target the same tile in <24 hours:

1. Newer update (post-event) overrides older (scheduled) if confidence higher
2. User-reported persistent change overrides automated extraction if >3 confirmations
3. Manual review required if confidences within 10 percentage points
4. Base Map Director decides tie-break; logged in audit trail

## Notifications

NATS topic: `beacon.atlas.updates`

Message schema:

```json
{
  "version": 129,
  "trigger": "post_event",
  "tiles_affected": ["N45W090_001_002", "N45W090_001_003"],
  "timestamp": "2026-03-09T14:30:00Z",
  "confidence_delta": [0.05, -0.02],
  "consumer_sla_seconds": 3600,
  "url": "s3://beacon-atlas/live/digital_twin/v129/"
}
```

Hazard models, routing, notifications, and client apps subscribe and update local caches.
