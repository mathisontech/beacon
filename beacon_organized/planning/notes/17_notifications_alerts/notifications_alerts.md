# Notifications and Alerts

## Overview

Beacon delivers time-critical emergency information through multi-channel push delivery. Alert system integrates IPAWS (Integrated Public Alert and Warning System) feeds, NWS products, fire dispatch systems, and user-generated reports. Five priority levels govern delivery, repeat frequency, and do-not-disturb override behavior.

## Priority Levels

### Level 1: Informational

Content: Weather updates, normal forecasts, non-urgent news, general guidance. Delivery: Standard push (respects user DND). No repeat. No SMS fallback. Delivery window: any time. Example: "Moderate wind expected Thursday evening."

### Level 2: Advisory

Content: Preparedness actions (clear gutters, check batteries), minor service disruptions, air quality alerts. Delivery: Priority push (overrides DND after 1 hour), single delivery. SMS if user opts in. Example: "Air quality reaching unhealthy levels by evening. Sensitive groups should limit outdoor activity."

### Level 3: Watch

Content: Potential hazard (strong wind expected, winter storm watch, Red Flag Warning). Delivery: High-priority push (10-min repeat if not acknowledged), DND override, SMS to opted-in users. Audible alert (1-sec beep). Example: "Red Flag Warning issued for your area. Extreme fire conditions expected 2-8pm. Clear defensible space."

### Level 4: Warning

Content: Imminent hazard (tornado warning, flash flood warning, hazardous materials release). Delivery: Urgent push (2-min repeat for 20 minutes), all DND overrides, SMS to all opted-in users, SOS banner on home screen. Audible: 3-sec siren alert. Example: "Tornado Warning. Seek shelter immediately in interior room on lowest floor. Stay away from windows."

### Level 5: Emergency

Content: Life-threatening hazard (evacuation order, extreme fire, dam failure, extreme wind > 80 mph). Delivery: Continuous push (every 30-sec), all contacts, SMS + SOS banner + local siren (via mesh), email to known emergency contacts. Audible: 5-sec siren (max volume). Example: "Evacuation Order Level 3. Leave immediately on Route 89 North. Proceed to Shelter 5 (coordinates). Do not use I-5."

## Alert Templates by Hazard

Each hazard type has pre-composed templates with variable slots filled at runtime (location, time, wind speed, etc.). Templates tested for clarity, brevity, and actionability.

Wildfire: "Evacuation Order [Level 1/2/3] for [area]. [Evacuation routes]. [Shelters nearby]. [Time to impact: X minutes]."

Tornado: "Tornado [Watch/Warning]. Seek shelter [immediately/soon] in [location guidance]. [Wind speed, direction, movement]."

Wind: "High Wind [Watch/Warning]. Expected gusts [X mph]. Secure outdoor items. Avoid being outdoors. [Duration]."

Flooding: "Flash Flood [Watch/Warning]. Avoid [areas], do not cross flooded roads. [Safe routes]. [Expected duration]."

Winter Storm: "Winter Storm [Watch/Warning]. [Snow/ice accumulation forecast]. [Road conditions]. Travel discouraged until [time]."

Utilities: "Outage: [Utility] affecting [area]. Estimated restoration [time]. [Outage extent]. Report outages at [link]."

Hazmat: "Hazardous Materials Release in [area]. Shelter in place or evacuate [direction]. Avoid contact. Report symptoms [number]. [Duration]."

EMS: "Medical Emergency Assistance: [location]. [Capability needed]. Trained responders wanted. [Hazard context]."

## IPAWS/WEA/CAP Integration

Beacon ingests IPAWS (Integrated Public Alert and Warning System) feeds via CAP (Common Alerting Protocol) XML. NWS issues tornado warnings, flash flood warnings, and selected watch products through IPAWS. Wireless Emergency Alerts (WEA) are sent via Verizon/AT&T/T-Mobile cell networks simultaneously.

CAP parsing: Beacon receives CAP feed every 2 minutes from NOAA servers. Parses incident_area (polygon geometry), severity (extreme/severe/moderate/minor), urgency (immediate/expected/future), onset (time), expires (time), headline, description, instruction, areaDesc (text description).

Deduplication: Beacon matches CAP alerts by areaDesc + severity + hazard type. Updates treated as repeat if same alert, update_note included if condition changes. Alerts expiring removed from active queue.

WEA echo: Beacon receives WEA delivery status (whether message delivered to carrier) to measure coverage gaps. If WEA fails for area, Beacon escalates to SMS + push delivery.

Local integration: Fire dispatch (CAL FIRE incidents), police (traffic, lockdown), EMS (medical mutual aid) generate local CAP feeds for Beacon ingestion. Timestamp alignment to within 1 minute.

## Mesh Network Delivery

Offline users receive alerts via mesh relay when reconnected. Mesh nodes cache recent alerts (past 24 hours). When a user comes online, they receive alert bundle for their geometry since they last synced.

Mesh broadcast: High-priority alerts (Level 3+) are broadcast to all mesh nodes within 10 miles. Nodes relay to offline users on device. Ensures widespread notice even if carrier networks congested.

Relay optimization: Mesh prioritizes alert delivery over other data. Alert retransmission on every hop, TTL=5 (max 5 hops). Payload compressed (300 bytes avg). Delivery latency target: <5 min from alert issuance to offline user mesh sync.

Fallback: If mesh unreachable, alerts re-queued for delivery on next connectivity (WiFi, LTE, SMS).

## Push Notification Delivery

Primary transport: Apple Push Notification service (APNs) for iOS, Firebase Cloud Messaging (FCM) for Android. Batch delivery every 10 seconds (max 1000 notifications per batch).

Failure handling: If APNs/FCM delivery fails (network, rate-limit), immediate fallback to SMS. SMS sent from Beacon's Twilio account, includes alert headline + link to Beacon app (deep link to alert detail).

Retry logic: APNs failure → retry up to 3 times over 30 min. FCM failure → retry up to 5 times over 60 min. Then escalate to SMS on final failure.

Frequency cap: Users receive max 20 push notifications per hour (all alerts combined). Excess queued and delivered after hour boundary. Doesn't apply to Level 5 (Emergency) alerts, which always deliver immediately.

User control: Users can mute push notifications entirely (SMS delivery only), disable SMS (push only), or subscribe to specific hazard types only (wind, flood, etc.).

## Escalation Logic and Auto-Repeat

Escalation: If alert remains unacknowledged after 5 minutes, system escalates delivery:
- Watch (Level 3): repeat every 5 min for 30 min, add SMS
- Warning (Level 4): repeat every 2 min for 45 min, add SMS + phone call
- Emergency (Level 5): repeat every 30 sec indefinitely, SMS + call + push + mesh broadcast

Acknowledgment: User taps alert notification, or opens alert detail in app. Acknowledgment recorded per user; escalation pauses for that user but continues for others (unacknowledged users).

Call delivery: For Level 4+ alerts, system initiates automated phone calls (text-to-speech) if SMS delivery fails. Calls do not block line; user can hang up immediately. Message: "[Alert type]. [Main instruction]. Reply STOP to opt out."

Repeat logic: Same alert (by areaDesc + hazard type) does not repeat if user already acknowledged. New alert (different area, new hazard type) triggers new escalation sequence.

Frequency for active events: During multi-hour events (e.g., sustained evacuation), system sends status updates every 30 minutes (e.g., "Evacuation ongoing. Shelter 5 capacity: 80%"). Users can opt to receive hourly summaries instead.

## SMS and Fallback Delivery

SMS primary use: Fallback for push delivery failures, and for devices without data connectivity (basic phones). Sent via Twilio, premium routes (high deliverability), carrier agreement for direct short codes.

Message format: "BEACON [ALERT TYPE] - [Location]. [Main action]. [Details]. [Link to Beacon]"

Character limits: SMS 160 chars per segment. Beacon alerts compressed: ~120 chars for hazmat, ~100 chars for wind. Links shortened (bitly).

Delivery latency: SMS target <2 min from alert issuance to handset receipt. Actual latency 30-90 sec in normal conditions.

Undeliverable: If SMS fails (invalid number, carrier reject), no retry. System logs undeliverable users for post-event outreach.

## Implementation Notes

Database schema: Alerts table (id, areaDesc, hazard_type, severity, urgency, onset, expires, headline, instructions, source, delivered_at). DeliveryLog table (alert_id, user_id, channel, delivered_at, acknowledged_at, attempt_count).

Rate limiting: Per-user push max 20/hour (except Emergency), per-area max 200 alerts/day (prevents alert spamming in high-incident areas).

Analytics: Alert delivery success rate, acknowledgment rate, mesh broadcast reach, SMS deliverability by carrier. Targets: 95% push delivery, 85% SMS delivery.

Scale: Beacon targets 100M potential recipients across western US. Alert infrastructure supports 10K concurrent alerts. Peak load: 1M deliveries per minute (during major multi-state fire event).
