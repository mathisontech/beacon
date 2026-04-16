# Notifications & Alerts Module

## 1. Overview
Delivers time-critical emergency information through multi-channel push/SMS/mesh/satellite with 5-tier priority system. Integrates IPAWS, NWS, CAP feeds, fire dispatch, and user reports. Escalates unacknowledged alerts and overrides do-not-disturb for life-threat tiers.

## 2. Ownership
- Director: Alert Delivery Operations
- Leads: Alert Generation, Approval Workflow, Multi-Channel Delivery, EMS Integration, IPAWS/CAP Parser, Escalation Engine, Analytics

## 3. Parent Module
Public User Features + Emergency Services Integration. Consumed by all hazard modules.

## 4. Submodules
- Alert Generation Engine
- Approval Workflow
- Multi-Channel Delivery
- IPAWS/CAP Integration
- Escalation & Repeat Logic
- Analytics & Reporting

## 5. Goals
1. Deliver 95%+ push notifications within 10 seconds
2. Achieve 85%+ SMS delivery within 2 minutes
3. Escalate unacknowledged Level 4-5 alerts every 30-120 seconds
4. Override do-not-disturb for Level 4-5 alerts with 100% success
5. Support 100M+ potential recipients at 1M deliveries/min peak
6. Maintain <1% alert duplication rate

## 6. Functions

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| classify_alert_tier | Assign priority level (1-5) | Alert attributes | Tier (1-5) | 1ms | Tier rules |
| generate_alert_content | Create headline + instructions | Hazard data, template | Alert text | 5ms | Template engine |
| select_alert_template | Choose pre-composed template | Hazard type, conditions | Template ID | 2ms | Template library |
| fill_template_variables | Substitute location/time/values | Template, variables | Filled text | 2ms | Variable map |
| validate_alert_content | Check clarity + actionability | Alert text | Validation result | 5ms | Content rules |
| submit_for_approval | Route to human reviewer | Alert content, tier | Submission ID | 1ms | Approval queue |
| approve_custom_alert | Human review + release | Alert draft, reviewer_id | Approval status | 30s | User action |
| reject_custom_alert | Return draft for revision | Alert draft, feedback | Rejection logged | 5s | User action |
| target_recipients_geofence | Find users in alert zone | Polygon bbox, hazard_type | User ID set | 100ms | Geofence DB |
| exclude_muted_users | Remove opted-out recipients | User set, hazard_type | Filtered user set | 50ms | Preference DB |
| filter_by_preference | Respect user alert settings | User set, alert_tier | Filtered user set | 50ms | Preference DB |
| prepare_ios_notification | Format APNs payload | Alert content, user | APNs JSON | 2ms | APNs spec |
| prepare_android_notification | Format FCM payload | Alert content, user | FCM JSON | 2ms | FCM spec |
| deliver_push_batch | Send batch to APNs/FCM | Notification list | Delivery status | 10s | APNs/FCM API |
| retry_failed_push | Re-attempt failed delivery | Failed notification, retry_count | Retry status | 30s | Retry policy |
| fallback_to_sms | Escalate failed push | Failed notification | SMS sent status | 1m | SMS gateway |
| prepare_sms_message | Format SMS text | Alert headline, link | SMS text (160 chars) | 2ms | SMS spec |
| deliver_sms_batch | Send batch to Twilio | SMS list, carrier | Delivery status | 1m | Twilio API |
| retry_failed_sms | Re-attempt SMS delivery | Failed SMS, retry_count | Retry status | 2m | Retry policy |
| deliver_mesh_broadcast | Send via mesh network | Alert, TTL | Mesh delivery status | 5s | Mesh module |
| deliver_satellite_message | Send via Starlink/satellite | Alert, regions | Sat delivery status | 30s | Satellite API |
| trigger_local_siren | Sound emergency alarm | Alert tier, location | Siren status | 2s | Siren hardware |
| initiate_phone_call | Call with text-to-speech | Phone number, message | Call initiated | 5s | VoIP provider |
| request_ems_custom_alert | Create dispatcher-authored msg | EMS input, location | Draft alert | 10s | EMS form |
| auto_generate_from_hazard_model | Create from model prediction | Model output, confidence | Generated alert | 5ms | Model integration |
| escalate_unacknowledged | Repeat alert if not ack'd | Alert ID, tier, elapsed_time | Escalation sent | 5ms per cycle | Escalation config |
| check_acknowledgment_status | See if user tapped alert | Alert ID, user_id | Ack status + time | 1ms | Receipt log |
| record_user_acknowledgment | Log when user taps alert | Alert ID, user_id, timestamp | Recorded | 1s | Event log |
| override_dnd_for_emergency | Force through DND | User ID, alert_tier | DND disabled | 1ms | DND settings |
| frequency_cap_user | Enforce max alerts/hour | User ID, alert_count | Cap enforced | 5ms | Rate limiter |
| queue_excess_alerts | Buffer capped alerts | Alert queue | Queued count | 1ms | Queue buffer |
| deliver_capped_alerts | Release after hour boundary | Queued alerts | Delivered | 5ms | Queue store |
| parse_cap_feed | Parse CAP XML from IPAWS | CAP XML | Alert JSON | 10ms | CAP parser |
| match_cap_to_geometry | Extract polygon from CAP | CAP areaDesc | GeoJSON polygon | 20ms | Geo parser |
| deduplicate_cap_alerts | Ignore duplicate alerts | Alert stream | Unique alerts | 5ms | Dedup logic |
| detect_alert_update | Recognize alert modification | Old alert, new alert | Update flag | 5ms | Update rules |
| check_wea_delivery | See if WEA sent successfully | WEA status feed | Delivery % by carrier | 2s | Verizon/AT&T APIs |
| escalate_on_wea_failure | Switch to SMS if WEA fails | WEA failed delivery | Fallback initiated | 5s | Fallback policy |
| fire_dispatch_feed_ingest | Parse CAL FIRE incidents | Incident JSON | Alert template | 10ms | Fire API |
| ems_feed_ingest | Parse medical mutual aid requests | EMS JSON | Alert template | 10ms | EMS API |
| log_delivery_receipt | Audit all deliveries | Delivery event | Logged to audit trail | 1s | Audit DB |
| calculate_delivery_success_rate | Measure push/SMS % | Delivery log, time range | Success rate | 30s | Analytics |
| calculate_acknowledgment_rate | Measure user response % | Receipt log, time range | Ack rate | 30s | Analytics |
| calculate_mesh_broadcast_reach | Measure offline reach | Mesh delivery log | Reach % | 30s | Analytics |
| calculate_sms_deliverability | Measure SMS % per carrier | Delivery log, carrier | Carrier rates | 30s | Analytics |
| generate_alert_report | Summarize alert cycle | Alert ID, logs | Report JSON | 1m | Reporting engine |

## 7. Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| alerts | Alert registry | alert_id, hazard_type, severity, urgency, onset, expires, headline, instructions | 1 year |
| alert_recipients | Targeting by alert | alert_id, user_id, geofence_zone | 6 months |
| delivery_log | Multi-channel audit | alert_id, user_id, channel, delivered_at, attempt_count | 6 months |
| acknowledgment_log | User receipts | alert_id, user_id, acknowledged_at, ack_method | 6 months |
| escalation_log | Repeat delivery track | alert_id, user_id, escalation_time, tier | 6 months |
| approval_queue | Pending custom alerts | submission_id, alert_content, submitter_id, submitted_at | Until approved |
| approval_history | Audit trail for reviews | submission_id, reviewer_id, approved_at, reason | 2 years |
| user_preferences | Alert settings | user_id, hazard_type, channel_preference, dnd_hours | Indefinite |
| cap_ingestion_log | IPAWS feed history | cap_id, source, parsed_at, areaDesc, alert_count | 1 year |
| rate_limit_tracking | User frequency cap | user_id, hour, alert_count, capped | 7 days |

## 8. Message Bus (NATS)
- `alert.generated`: New alert created
- `alert.approved`: Alert released to delivery
- `alert.delivered`: Multi-channel delivery complete
- `alert.escalated`: Unacknowledged alert repeated
- `alert.acknowledged`: User tapped notification
- `cap.ingested`: CAP feed parsed
- `wea.status`: WEA delivery confirmation
- `ems.custom_alert.submitted`: EMS submitted custom alert

## 9. Cache (Redis)
- `alert:{alert_id}`: Current alert state
- `user_prefs:{user_id}`: User alert preferences (channel, DND, hazard filters)
- `rate_limit:{user_id}:{hour}`: Alerts delivered this hour
- `recent_alerts:{zone_id}`: Last 24h alerts for geofence
- `ack_status:{alert_id}:{user_id}`: Acknowledgment timestamp

## 10. External Integrations
- IPAWS/NOAA CAP feed (every 2 minutes)
- Apple Push Notification service (APNs)
- Firebase Cloud Messaging (FCM)
- Twilio SMS gateway (premium routes)
- Verizon/AT&T/T-Mobile WEA status
- CAL FIRE dispatch API
- Local EMS dispatch systems
- Mesh network (for offline delivery)
- Starlink satcom (for remote areas)
- Siren manufacturer API (local emergency sirens)
- VoIP provider (text-to-speech calls)

## 11. API Contracts
Consumed by: All hazard modules, Public User Features, EMS Client
Provides: submitAlert(), getAlertStatus(), acknowledgeAlert(), getUserPreferences()
Endpoints: `/api/v1/alerts`, `/api/v1/alerts/{id}/acknowledge`, `/api/v1/user/alert-preferences`

## 12. UI Components
- Alert notification card (Navy bg #0B0F2A, Teal border #0097B2)
- Tier indicator (Level 1: gray, Level 2: yellow, Level 3: orange, Level 4: red, Level 5: dark red)
- SOS banner (full-width, animated, Level 4-5 only)
- Alert detail screen with map
- Acknowledgment button (prominent, Teal #0097B2)
- Escalation countdown timer (for unacknowledged Level 4-5)
- Custom alert submission form (EMS only)
- Delivery channel selector (push, SMS, mesh, satellite, siren)

## 13. Offline & Mesh Behavior
- Offline users receive alert bundle on mesh sync
- Mesh nodes cache recent alerts (24 hours)
- High-priority alerts broadcast to all nodes within 10 miles
- Mesh relay with TTL=5 (max 5 hops), <5 min latency target
- Do-not-disturb overridden during Level 4-5 mesh delivery
- Standard pre-composed messages compressed for mesh bandwidth
- Escalation logic works on mesh-connected devices

## 14. Cost Breakdown
- APNs/FCM: ~$2K/yr (volume-based)
- Twilio SMS: ~$8K/yr (US premium routes)
- IPAWS/CAP feed: Free (NOAA)
- CAL FIRE API: Free
- Siren hardware integration: ~$5K (one-time)
- VoIP text-to-speech: ~$3K/yr
- Analytics infrastructure: ~$2K/yr
- Starlink/satellite premium: TBD

## 15. Monitoring & Metrics

| Agent | Metrics |
|-------|---------|
| Quality | Push delivery success rate (target 95%), SMS delivery rate (target 85%), ack rate, mesh broadcast reach, escalation repeat latency |
| Research | CAP parsing accuracy, auto-generation from models, tone/clarity scoring, new delivery channels (satellite, enhanced mesh) |
| Business | Cost per delivered message, SMS cost per carrier, APNs/FCM efficiency, alert volume trend, peak load capacity |
| Compliance | IPAWS compliance audit, audit trail completeness, user preference enforcement, do-not-disturb override audit, delivery confirmation rate |
| Lead | Daily alert summary, delivery SLA status, escalation queue depth, approval workflow backlog, channel availability |

## 16. Cross-Module Dependencies
- Consumes: Hazard model outputs (wildfire, flood, wind, earthquake, etc.), CAP feeds, EMS dispatch status
- Provides: Alert delivery confirmation to hazard modules, delivery metrics, user acknowledgment signals
- Dependencies: Base Map (for geofencing), Mesh Networking (offline delivery), Public User Features (preferences), EMS Client (custom alerts)
