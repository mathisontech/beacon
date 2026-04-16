## 10. EMS / Admin Capabilities

## Still Needs Research
- Zone drawing UI/UX for rapid polygon creation under stress
- Bottleneck detection and slowdown propagation algorithms
- All-terrain vehicle coverage area optimization
- Welfare check dispatch prioritization
- 911 call location accuracy and display confidence
- Resource manager asset tracking architecture
- Mutual aid agreement verification and bandwidth provisioning
- "Can A reach B" model implementation under dynamic road conditions
- EMS coverage area definition and Beacon customer onboarding
- Team visibility controls (hierarchy-based access)

---

### 10.1 Zone & Route Management

- Draw zones for team operations
- Confirm or deny safe zone predictions
- Set formal evacuation routes
- Send alerts to drawn area (polygon-based, shape changes based on source)
- Mark affected areas
- Redesignate traffic directions from dashboard (e.g., make a two-way road two lanes in one direction)
- Show slowed bottlenecks to all users so they can make their own decisions
- All first responders can write or confirm official evac routes as they open up (not dependent on a central figure to keep up)
- Assign meeting points in advance of emergency
- Water-based evacuation points
- Mass evacuation staging spots (safe during emergency, accessible after disaster passes)
- Designate road areas to keep clear for operational purposes

### 10.2 Resource & Team Management

- Manage team schedules
- Request resources
- Resource manager: vehicles of all kinds on hand, people on shift, link to backup manager
- Team vehicle manager
- Manage backup requests and issue visibility codes
- Generate codes for backup resources to see EMS view instead of public view
- Manually mark location of backup units or equipment not being automatically tracked

### 10.3 Backup & Mutual Aid

- Backup manager / who's in charge manager
- Shows mutual aid agreements
- Facilitates communications between all stakeholders
- Provides a list of backup resources
- Brings state, emergency, and federal stakeholders into the picture when an emergency is declared
- **Backup module:** Generate secure codes shared with other departments or non-Beacon users. Coded users temporarily join the effort; their location shown on the same map.

### 10.4 Intelligence & Reporting

- Ask public for help
- Confirm structures destroyed
- Geofence in real-time and ask users at that location to report conditions
- Admin can see next of kin / emergency contacts during emergencies
- **Can A reach B model:** Determine if resources can be connected with people who need them
- Utility crew tracking and repair processing queue
- EMS "unable to reach location" reporting
- Evacuation confirmation module: ask users if they plan on staying or have evacuated so EMS doesn't worry about empty houses. Layer shows if evacuator has retired fire/police designation.
- Beacon coverage check: if area not covered by Beacon, connect with 911
- Designate zones for limited all-terrain vehicles to cover when ambulances can't get around
- Dispatch public for welfare checks, driving people places, and other low-priority tasks when EMS is stretched
- Ask public for high-priority tasks if the ATV group can't reach people immediately
- Vehicle accessibility model: judge where vehicles can get at a given time given current conditions. Know where EMS can and can't reach so public users with 4WD/snow tires can fill the gap (Buffalo blizzard precedent: citizens coordinated 30+ rescues when EMS couldn't reach people)
- Track who is actively rescuing someone vs. who has no one coming (EMS triage priority)
- 911 call locations displayed prominently

### 10.5 EMS Help Manager (Public Assistance Request System)

Advanced system for EMS to push structured requests to the public. EMS sees accessibility of each person needing help by severity class. When professional resources can't reach someone, the system delegates to willing public volunteers.

**Category 1 — Transport and Welfare Checks:** When someone calls police requesting a welfare check and police can't reach them, the request goes to nearby users. A communication bridge opens between the caller's account and volunteers — the caller's contact info is shared so they can coordinate directly. The number of people who agreed to help is publicly visible until the request is fulfilled.

**Category 2 — Evacuation Status Confirmation:** Volunteers confirm locations are clear, report whether anyone is visible, confirm pets are secured, verify buildings are empty. Confirmations feed into the evacuation status tracker. The volunteer's location becomes public during the task and the building they confirm gets added to the confirmed-evacuated layer.

**Category 3 — Condition Reporting:** Area-specific condition reports. EMS geofences an area and asks users to report what they see with photos. Ties into fire sighting and arson detection workflows (see wildfire model Section 2b).

**Category 4 — Resource Lending:** EMS/police request specific equipment. People who registered equipment in their profile (excavator, boat, snowmobile, ATV, chainsaw) are matched to requests. Equipment owners opt in per-request. Example: Buffalo PD requests an ATV during a blizzard; a private owner lends theirs.

**Category 5 — Responder Needs Assistance:** The "I'm stuck" module for first responders. An officer stranded during a blizzard can request assistance and a nearby resident offers shelter. Higher priority than public requests.

**Category 6 — Suspect/Missing Person Photo Assistance:** Police request crowd-sourced photos of an area for suspect identification or Amber Alert support. Legally sensitive — built with a kill switch pending legal review. Geofenced photo requests go to nearby users.

---

