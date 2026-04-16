# Post-Event Update Protocol

Rapid base map updates when hazard event alters the landscape: structures destroyed, terrain changed, roads blocked. Triggered automatically by event declaration or manually by Base Map Director/EMS.

## Event-Triggered Resurvey

Automatic triggers by event type and severity:

| Event Type | Trigger Threshold | Auto-Trigger | Manual Trigger Authorized |
|------------|-------------------|--------------|---------------------------|
| Wildfire | >5000 acres OR evacuation level 4+ | Yes | EMS, Base Map Director |
| Earthquake | Magnitude >5.5 OR ShakeCast alert | Yes | USGS, EMS, Base Map Director |
| Flood | >100 structures at risk OR >2000 people | Yes | NWS, EMS, Base Map Director |
| Hurricane/Tornado | Level 3+ OR >1000 people | Yes | NWS, EMS, Base Map Director |
| Landslide | Major event alert (>10 structures) | Manual | Geotechnical team, EMS, Director |
| Volcano | Eruption declared OR alert level 2+ | Yes | USGS VHP, EMS, Director |
| Tsunami | Official warning issued | Yes | NOAA, EMS, Director |

## Resurvey Initiation

```
trigger_post_event_resurvey(event_id, event_type, bbox, severity)
    → Create event_context: {event_id, location, timestamp, assets_available}
    → Assess available survey assets: satellite, aerial, street-level
    → Queue requests in order of time-to-availability
```

Survey assets by latency:

| Asset | Time to First Data | Cost/hour | Coverage |
|-------|--------------------|-----------|----------|
| Satellite tasking (Sentinel-2, Planet) | 4-24 hours | $0 (free) to $5K | Cloudless, nadir |
| Aerial survey (helicopter/drone) | 2-6 hours | $5K | Detailed orthophoto, variable weather |
| Street-level perception (user submissions) | Real-time | $0 | Ground truth, mobile coverage |
| Lidar (if platform available) | 6-48 hours | $50K+ | High accuracy, clear skies required |

### Satellite Tasking

```
request_satellite_tasking(bbox, priority, desired_time)
    → Queue request with Planet Labs / Copernicus emergency program
    → Return: request_id, estimated_delivery_time
    → Download when ready → raw/post_event/satellite_v{N}/
    → Upon delivery: trigger alignment + extraction pipeline
```

### Aerial Survey

```
request_aerial_survey(bbox, priority, platforms_available)
    → Dispatch helicopter/drone based on platform availability
    → Coordinate with field ops, local air traffic control
    → Return: flight_plan_id, estimated_coverage_time
    → Upon flight: collect orthophoto + georeferencing
    → Download → raw/post_event/aerial_v{N}/
    → Trigger alignment + extraction pipeline
```

### User-Submitted Damage Reports

```
collect_user_damage_reports(event_id, bbox, start_time)
    → Ingest street-level perception submissions for affected area
    → Deduplicate: 50m radius, 24-hour window
    → Filter by anomaly score (>70) and damage classification
    → Aggregate submissions per tile: damage_count, severity_distribution
    → Return: submission_summary per tile
```

## Processing Pipeline

```
flag_affected_tiles(event_bbox)
    → Identify all 1km tiles overlapping event_bbox
    → Mark for priority re-processing
    → Return: tile_list with prior_version for diff tracking

fast_track_alignment(new_imagery, prior_basemap)
    → SIFT feature matching: new image ↔ prior orthophoto
    → Sub-pixel registration (<10m error)
    → Homography or polynomial warping
    → Return: aligned_raster

extract_damage_assessment(aligned_imagery, event_type)
    → Run specialized extractors per event type:
        - Wildfire: burn severity (pre/post NDVI, NDBI)
        - Earthquake: structural damage (building change detection)
        - Flood: water extent, debris field
        - Tornado: vegetation swath, destroyed structures
    → Return: damage_raster (severity 0-10 per pixel), confidence_map

update_building_status(damage_raster, prior_buildings)
    → Spatial join: intersect damage raster with prior building footprints
    → Classify per structure: intact, damaged, destroyed
    → Return: buildings_updated table with status_change, damage_severity

update_road_passability(damage_raster, prior_roads)
    → Detect road segment obstruction: debris, water, collapse
    → Severity >5 (0-10 scale) → mark impassable
    → Return: roads_updated table with passability_change

update_terrain_model(damage_raster, event_type, dem_prior)
    → For landslide/erosion events: update DEM where terrain changed
    → Use satellite DEM differencing (e.g., Copernicus GLO-30 pre/post)
    → Confidence <0.3 → flag for manual review
    → Return: dem_updated raster

generate_diff_report(pre_event_tiles, post_event_tiles)
    → Compare all attributes: buildings, roads, terrain, vegetation
    → Per-attribute deltas: count_added, count_removed, count_modified
    → Confidence summary: which attributes reliable post-event?
    → Return: diff_report.json with tile-level and area-level summaries
```

## Promotion to Live

```
promote_post_event_tiles(staging_version)
    → Bypass standard staging gate for post-event data
    → Reason: time-critical (first 24 hours critical for routing)
    → Require: manual sign-off from Post-Event Update Specialist
    → Metadata tag: post_event_v{N}, event_id, processing_time_minutes
    → Move staging/post_event/v{N}/ → live/post_event/v{N}/
    → Create new digital_twin_version merging post-event tiles

compute_cooling_progression(wildfire_event, thermal_imagery_series)
    → For wildfire: ingest multi-temporal thermal imagery (Sentinel-2, MODIS)
    → Track burn zone cooling: day 0 → day 7 → day 30
    → Estimate safe passage: when roads cool enough to allow evacuation returns
    → Update passability_timeline: [(time, passable_percent), ...]
    → Return: cooling_forecast for evacuation planning
```

## Function Reference

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| trigger_post_event_resurvey | Event context | Survey request queue | Initiate resurvey | Immediate |
| request_satellite_tasking | Bbox, priority | Request ID, ETA | Queue satellite | <15 min |
| request_aerial_survey | Bbox, platforms | Flight plan ID | Coordinate aircraft | <30 min |
| collect_user_damage_reports | Event, bbox, time window | Aggregated submissions | Ingest crowdsourced data | Continuous |
| flag_affected_tiles | Event bbox | Tile list | Identify work scope | <5 min |
| fast_track_alignment | New imagery, prior basemap | Aligned imagery | Register spatially | <2 hrs |
| extract_damage_assessment | Aligned imagery, event type | Damage raster + confidence | Classify severity | <4 hrs |
| update_building_status | Damage raster, prior buildings | Buildings with status | Mark destroyed/damaged | <1 hr |
| update_road_passability | Damage raster, prior roads | Roads with passability | Mark impassable | <1 hr |
| update_terrain_model | Satellite DEM diff, event type | Updated DEM | Adjust elevation | <2 hrs |
| generate_diff_report | Pre/post tile versions | Detailed deltas | Document changes | <1 hr |
| promote_post_event_tiles | Validated staging tiles | Live tiles | Release to production | <6 hrs |
| compute_cooling_progression | Thermal series, wildfire event | Cooling timeline | Track recovery | Ongoing |

## SLA and Prioritization

First post-event tile update: within 6 hours of event declaration.

Prioritization logic:
1. High population density areas (>2000/km²) first
2. Critical infrastructure (hospitals, fire stations, shelters)
3. Active evacuation routes
4. Secondary areas afterward

Update frequency during event:
- First 6 hours: every 1-2 hours if new data available
- 6-24 hours: every 4-6 hours
- 24-72 hours: daily
- 72+ hours: every 3 days (transition to standard refresh protocol)

## Transient vs. Persistent Flagging

All post-event updates tagged with event_id and timestamp. System automatically archives post-event tiles after event resolution (when all evacuation alerts cleared).

Persistent changes (damage to structures) retained in digital twin. Transient obstructions (water, debris) cleared when hazard resolves.

## Fallback: Manual Review

If automated extraction confidence <0.3 on damage severity:
- Flag for Base Map team manual review
- Photo-by-photo damage classification by expert
- Return confidence map with human review stamp
- SLA: <24 hours for critical areas

Integration: reviewed tiles replace auto-extracted tiles in live version.
