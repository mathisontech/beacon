# Human Oversight & Organization

## Organizational Structure

**Executive Level**
- Founder/CEO: Overall strategy, government relations, fundraising
- Chief Technology Officer: Platform architecture, security compliance, hiring

**Per-Hazard Module** (4 modules: Wildfire, Flood, Earthquake, Severe Weather)
- Module Lead (Senior Domain Expert): Responsible for all outputs from module's agent team
  - Background: 5+ years emergency management or meteorology
  - Compensation: $120K-150K salary
  - Direct reports: 1-2 QA specialists (module-specific), on-call rotation coverage
  - Responsibilities: Alert approval, model validation, post-event review, team training

**Cross-Functional Teams**
- Platform Engineering (3-4 engineers): Infrastructure, API, mesh networking
- QA & Validation (2-3 specialists): Model accuracy testing, alert appropriateness, user feedback analysis
- Business/Operations (1-2 staff): Customer onboarding, government relations, compliance documentation

## Hiring Plan by Phase

**MVP Phase (Months 1-6)**
- Team size: 5-8 people
- Roles: Founder, CTO, 2 module leads (start with Wildfire + Flood), 1 platform engineer, 1 QA specialist
- Cost: ~$650K (salaries + benefits)

**Beta Phase (Months 7-18)**
- Team expansion to 15-20 people
- Add: 2 additional module leads (Earthquake, Severe Weather), 2 platform engineers, 2 QA specialists, 1 operations manager
- New hires: Domain experts in earthquake seismology, weather forecasting
- Cost: ~$2.4M annually

**Launch Phase (Months 19-36)**
- Scale to 30+ people
- Add: Sales engineer, government liaison, data scientist for model improvement
- Redundancy: Second on-call for each module (24/7 coverage during active events)
- Cost: ~$4.8M annually

## Per-Module Lead Responsibilities

**Alert Approval Authority**
- Lead reviews all Recommendation Agent outputs before publication
- Approval authority for evacuation orders; delegation to backup lead only if unavailable
- Escalation threshold: Alerts affecting 50K+ people require CTO co-signature
- SLA: 15-minute review window for critical alerts

**Model Quality & Accuracy**
- Monthly accuracy audit: Compare model predictions to observed outcomes
- Investigate false negatives (missed hazards) and false positives (incorrect alerts)
- Recommend model retraining if F1 score drops below module-specific threshold
- Post-event review: Root cause analysis within 48 hours of event conclusion

**Team Training & Development**
- Onboarding: 2-week ramp for new QA specialists (model outputs, alert criteria, domain knowledge)
- Weekly team sync: Review alert performance, discuss challenging cases
- Annual training: Update on new hazard research, regulatory changes

**EMS Coordination**
- Direct relationship with FEMA emergency operations center (during active events)
- Provide hazard briefings to EMS dispatch 2x daily during events
- Respond to EMS inquiries about alert accuracy, geographic extent

**Post-Event Documentation**
- After Action Report (AAR) due within 7 days: Performance of model, human decisions, areas for improvement
- Archive all alert decisions, reasoning, and outcomes for compliance audit
- Contribute to quarterly research report for continuous model improvement

## QA Workflows: Model Output Review, Map Accuracy, Alert Appropriateness

**Daily Model Output Review**
- QA specialist monitors agent outputs on dashboard
- Flag anomalies: Geographic extents outside expected bounds, confidence scores inconsistent with severity
- Automated checks: Model output schema validation, confidence bounds (0-100), geographic coordinates within valid range
- Manual review: 10% random sampling of alerts for domain plausibility
- Turnaround: Feedback to agents within 30 minutes of anomaly detection

**Map Accuracy Verification**
- Monthly audit of base map data (roads, buildings, water features)
- Comparison against satellite imagery (Google Earth, Sentinel-2)
- Update frequency: Quarterly refresh for static features (roads), real-time for dynamic features (floodwater extent)
- Validation: Hazard extent (GeoJSON) must align with map features within 50 meters

**Alert Appropriateness**
- Does hazard extent match severity level? Evacuation zone proportional to hazard extent
- Is alert timing appropriate? Published 2-4 hours before expected impact (allowing evacuation window)
- Message clarity: Alert language tested with non-expert users (via focus groups quarterly)
- Sensitivity check: Model tuning to avoid fatigue (suppress alerts within 6 hours of previous alert unless hazard level increases 2+ levels)

## On-Call Rotation During Active Events

**Coverage Model**
- Module lead: Primary on-call (24/7 during event, SLA 15 min response)
- Backup lead: Secondary (available if primary unavailable)
- Operations manager: Coordinates across modules, escalates to CTO
- Incident commander: External on-call engineer (handles infrastructure incidents)

**On-Call Schedule**
- MVP: Single module lead on-call during event (shared responsibility across both leads, alternating weeks outside events)
- Beta: Two module leads on-call during simultaneous events
- Launch: All four module leads on-call during major multi-hazard event (e.g., cascade event)

**Compensation**
- On-call pay: $500/week standby (expected to respond in 15 minutes)
- Event pay: $250/day during active event (additional, time worked)
- Incident bonus: $1K-5K for successful critical alert during high-impact event (discretionary CTO approval)

## Training Requirements for EMS Client Onboarding

**Initial Training (Day 1, 4 hours)**
- Beacon UI walkthrough: Map interface, alert types, filter controls
- Alert interpretation: Confidence levels, evacuation zone definition, limitations
- Mesh network: Coverage areas, offline capability explanation
- Hands-on: Simulator exercise with fictional hazard scenario

**Role-Specific Training**
- Dispatch: Alert routing workflow, dispatch integration, call-taking procedures (2 hours)
- Incident commander: Multi-hazard event coordination, resource allocation (3 hours)
- Field units: Mobile app usage, location sharing, emergency override procedures (1 hour)

**Quarterly Refresher**
- 1-hour webinar: New features, regulatory updates, accuracy improvements
- Case study: Review of recent events, lessons learned
- Attendance: Mandatory for lead responders, optional for field staff

**Certification**
- Knowledge assessment: 80% passing score required to use production Beacon
- Renewal: Annual recertification (online test, 30 minutes)
- Cost to EMS: Included in service agreement

## Internal Communications & Decision Authority

**Decision Thresholds**
- Module lead: Approve/reject individual alerts (within standing criteria)
- CTO: Override module lead if alert violates policy (rarely exercised)
- Founder/CEO: Final authority on policy changes, contract modifications
- Legal counsel: Approve language for all public communications during events

**Escalation Protocol**
- Alert affecting 100K+ people: CTO co-approval required
- Conflicting alerts from two modules: Coordinator agent or CTO resolves (rarely happens, documented cases)
- System failure during event: Incident commander leads response, CTO notified immediately

**Review Cadence**
- Daily standup (15 min): All module leads + platform engineer (during active events only)
- Weekly meeting (1 hour): Full team review of past week's alerts
- Monthly review (2 hours): Accuracy trends, hiring, roadmap
- Quarterly business review (3 hours): FEMA stakeholders, customer feedback, budget review
