# Event Protocols & Procedures

## ICS/NIMS Integration Requirements

Beacon integrates with Incident Command System (ICS) and National Incident Management System (NIMS) to enable seamless coordination with government emergency response.

**ICS Form Integration**
- ICS-201 (Incident Briefing): Beacon exports current hazard status, affected area, resource requests
- ICS-202 (Incident Objectives): Beacon provides situation analysis and recommended objectives
- ICS-205 (Communication Plan): Beacon provides contact information for EMS dispatch leads

**NIMS Alignment**
- Beacon operates in "support" role to incident commander (not as command center)
- Information flow: FEMA declares event -> Beacon activates monitoring -> Agents analyze -> Module lead provides briefing to incident commander
- Chain of command: Module lead reports to FEMA operations section chief
- Common terminology: Beacon uses NIMS standard terms (event, jurisdiction, resource request, etc.)

**Data Exchange Format**
- Events exported as GeoJSON features with ICS metadata
- API endpoint: `/api/v1/events/{event_id}/ics-export`
- Format: GeoJSON + custom properties (incident name, start time, hazard type, confidence)
- Frequency: Updated every 5 minutes during active event

## Event Trigger Thresholds Per Hazard Type

**Wildfire**
- Automatic trigger: USGS reports confirmed fire > 100 acres within jurisdiction
- Alternative trigger: 5+ independent reports of active fire within 5km radius
- Verification: Analysis agent validates against satellite imagery (Sentinel-2 hotspot detection)
- Publication threshold: Model confidence > 70%, affected area > 50 people

**Flood**
- Automatic trigger: USGS flood gauge reading > 90th percentile for location
- Alternative trigger: 3+ reports of standing water in normally dry areas
- Verification: Agent compares with weather radar, stream flow models
- Publication threshold: Model confidence > 65%, affected area > 30 people

**Earthquake**
- Automatic trigger: USGS earthquake magnitude > 4.0 within 30km
- Alternative trigger: Not applicable (USGS is authoritative)
- Verification: Analysis agent cross-references with multiple seismic networks
- Publication threshold: Confirmed by USGS, magnitude > 3.5

**Severe Weather**
- Automatic trigger: NWS issues Tornado Watch / Storm Warning
- Alternative trigger: NOAA radar shows rotation or > 60 mph winds
- Verification: Agent validates radar signature, ground reports
- Publication threshold: Model confidence > 80%, path predictability sufficient

## Automatic vs. Manual Event Declaration

**Automatic Declaration**
- Conditions: Hazard trigger threshold met + validation agent approves
- Timeline: Immediate publication (within 5 minutes of trigger)
- Human notification: Module lead notified, can override within 15 minutes
- Use case: Clear, unambiguous hazards (USGS earthquake, NWS tornado warning)

**Manual Declaration**
- Initiator: Module lead or EMS incident commander
- Timeline: Immediate publication (module lead assumes responsibility)
- Validation: Validation agent runs post-publication (flags anomalies within 30 minutes)
- Use case: Ambiguous situations (suspected arson, unconfirmed reports)

**Override Mechanisms**
- Module lead can suppress automatically triggered event within 15-minute window
- Must document reason (false alarm, duplicate, jurisdiction dispute)
- CTO can override module lead if suppression appears to hide legitimate hazard

## Data Recording During Active Events

**What Is Recorded**
- All hazard observations (location, magnitude, timestamp, source data)
- All agent outputs (analysis results, confidence scores, recommendations)
- All human decisions (approvals, rejections, modifications, timing)
- All EMS interactions (requests, acknowledgments, resource allocations)
- User data (location, hazard acknowledgments, evacuation route selections)

**Storage**
- Immutable append-only log (AWS S3 with object lock, write-once-read-many)
- Compression: Data compressed after 24 hours of inactivity
- Retention: 7 years minimum (compliance requirement)
- Access: Only authorized investigators (legal, auditors) can retrieve

**Encryption**
- AES-256-GCM encryption at rest
- TLS 1.3 for access to retrieval API
- Key management: Keys stored in AWS KMS, rotated annually

**Audit Trail**
- Log entries: Timestamp, user ID, action, data changed, reason/notes
- Examples: "Module lead approved evacuation alert", "Model confidence dropped below threshold"
- Searchable: Full-text search on audit trail for investigations

## Multi-Hazard Event Handling (Cascading Events)

**Event Cascade Scenarios**
- Earthquake triggers landslides and dam failures (wildfire, flood agents both activated)
- Wildfire causes air quality emergency (severe weather agent engaged)
- Flooding collides with active wildfire (containment zones updated dynamically)

**Detection & Activation**
- Coordinator agent (top-level) monitors all modules for cascade patterns
- Cascade detected: Second agent activated automatically
- Example: Earthquake event automatically activates flood analysis (landslide risk)
- Communication: NATS pub/sub notifies related modules of cascade

**Conflict Resolution**
- If two agents recommend conflicting evacuations: Coordinator agent merges zones
- Priority: Safety-first (union of zones, not intersection)
- Notification: Module leads immediately notified of merged event
- Documentation: Cascade decision logged with reasoning

**Resource Coordination**
- Single EMS coordinator manages resources across all hazard modules
- Resource request from one module is visible to others (prevent over-allocation)
- Example: Flood module requests helicopters; wildfire module notified of limited availability

## Post-Event Data Archival & Review

**Timeline**
- T+24 hours: Event declared "closed" (no new alerts, recovery phase)
- T+7 days: Initial data archival (compress and move to cold storage)
- T+30 days: After-Action Report (AAR) due from module lead
- T+90 days: Lessons learned incorporated into model retraining

**AAR Contents**
1. Timeline: Event trigger, escalations, key decisions
2. Performance: Accuracy metrics (precision, recall, lead time)
3. Challenges: False alerts, missed hazards, system issues
4. Recommendations: Model improvements, procedure changes, training needs
5. Lessons learned: What worked well, what should change

**Data Anonymization for Public Release**
- Remove individual user identities (user ID 123 becomes "user_session_456")
- Aggregate location data: Show only heatmaps, not individual coordinates
- Remove personal information: Phone numbers, addresses
- Retain: Timestamps, geographic areas, event progression

**Regulatory Submission**
- FEMA receives anonymized event data within 30 days
- Report includes: Event extent, model accuracy, human decisions, recommendations
- Use: Informs federal emergency management policy, funds future Beacon improvements

## EMS Notification Chain

**Notification Timing**
- T+0 min: Automatic alert sent to primary EMS contact (SMS + app push)
- T+2 min: Secondary contact notified if primary not acknowledged
- T+5 min: Operations manager at dispatch center notified
- T+10 min: Regional incident commander contacted

**Notification Content**
- SMS: "Beacon Alert: [Hazard Type] detected in [Jurisdiction]. Confidence: [%]. Affected area: [Polygon]"
- App: Rich notification with map preview, evacuation recommendation, affected population estimate
- Email: Detailed report with analysis, confidence intervals, data quality notes

**Acknowledgment**
- EMS must acknowledge within 30 minutes (app button or SMS reply)
- Failure to acknowledge: Escalates to next level (operations manager)
- Persistent notification: Remains in notification center until acknowledged

**Resource Request**
- EMS can request additional context: "Show flood extent", "Population in zone", "Road closure map"
- Beacon API provides dynamic responses within 1 minute

## Default Layer Activation Per Event Type

**Wildfire Event**
- Hazard layer: Fire extent (orange heatmap), confidence contours
- Secondary: Air quality index (PM2.5), wind direction overlay
- POI: Evacuation centers (green), firehose access points (red)
- Warning zone: 5km evacuation buffer around fire perimeter

**Flood Event**
- Hazard layer: Flood extent (blue polygon), depth estimates
- Secondary: Stream flow rates (arrows indicating direction), rain radar
- POI: Shelters (high ground areas), water distribution centers
- Warning zone: 1km upstream warning for dam failures

**Earthquake Event**
- Hazard layer: Epicenter (yellow circle), magnitude, depth
- Secondary: Liquefaction zones, aftershock probability (contours)
- POI: Hospital locations (red cross), emergency shelters (blue)
- Warning zone: USGS predicted shaking intensity (color-coded)

**Severe Weather Event**
- Hazard layer: Storm track (animated polygon), probability cone
- Secondary: Wind direction, hail/tornado indicators
- POI: Basement/shelter locations, warning sirens
- Warning zone: Path of storm (1-hour forecast)

**Multi-Hazard Event**
- Layer 1: Primary hazard (largest threat)
- Layer 2: Secondary hazard (secondary threat, semi-transparent overlay)
- Toggle: User can switch between hazard layers
- Combined zone: Union of all threat areas highlighted
