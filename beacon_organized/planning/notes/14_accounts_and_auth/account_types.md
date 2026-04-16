## 7. Account Types & Hierarchy

## Still Needs Research
- 911 auto-bridging liability implications and legal framework
- Invite code generation and management system
- Retired emergency personnel credential verification process
- Trusted neighbor vetting and background check procedures
- Sex offender registry integration and update frequency
- Emergency contact invitation workflow and opt-in requirements
- Special designation revocation procedures
- Multi-family account hierarchies and access control
- Group admin capability scoping
- Account deactivation and data retention policies

---

### 7.0 Free vs. EMS-Integrated Versions

The app is separated into a free public version and functionality that unlocks when the EMS of a town/county/region starts using the system. Goal: make it easy for users to advocate to whoever runs their local budget that they want EMS integration. The free version provides weather, hazard awareness, personal safety features, and community help. EMS integration unlocks official evacuation routes, real-time EMS coordination, dispatch layers, and the full stakeholder system.

**User-reported hazard liability concern:** When a user reports something like a building collapse, other users should NOT assume EMS is on it. If the region is not directly covered by an EMS Beacon account, the app must warn the reporting user that EMS may not have received this report. Beacon should NOT automatically bridge to 911 (e.g., auto-texting 911) because: (1) EMS could hold Beacon accountable for bad information, and (2) EMS might not pay for Beacon services if they get reports for free. This needs careful design — the user should be guided to call 911 themselves if EMS is not on Beacon.

### 7.1 Beacon Super Admin

- Atlas access: all layers, all alerts, all versions, all code
- Version history / update history
- Beacon employee management
- Client management
- User/public management
- Event records

### 7.2 Beacon Employee / Account Manager

- Assigned to client accounts
- Access to client usage stats, setup tracking
- Authorization to update map for clients
- Authorization to view all map data
- Can confirm special designation accounts

### 7.3 Client Accounts (EMS / Government / Agencies)

Set up by Beacon admin. Each standard EMS account has all functionality of public user accounts (so they can check on their families during emergencies). The interface is the same core skeleton but EMS sees team locations, different icons, dispatch markings, and additional tools. Includes:

- **EMS Admin:** Full emergency management leadership, event declaration, zone drawing, resource management
- **EMS Team Member:** Field operations, route confirmation, condition reporting
- **Hierarchy manager:** Mirror client org structure (e.g., police hierarchy)
- **Mutual aid agreements:** Cross-jurisdiction resource sharing with controlled visibility
- **Team management:** Scheduling, overtime announcements, tracking
- **Call-up systems:** Call all off-duty police/fire; call all retired police/fire
- **Setup link sent to client for onboarding**

### 7.4 Special / Partner Accounts

Granted via invite code from EMS or Beacon employee. Each gets a special designation with unique functions:

- **Utilities:** Can draw coverage zones, place infrastructure on map, mark personnel locations, post outage and repair updates
- **Transportation:** Buses, trains, planes, helicopters, boats
- **Plowers:** "Currently plowing" mode with real-time tracking, see each other's paths for coordination, receive plow requests from EMS/police
- **National Guard / .gov agencies**
- **Tornado trackers / storm chasers:** Image triangulation against radar, rain-wrapped reporting, search and rescue on request from EMS, report S&R activity and hospital transport
- **Retired fire, law enforcement, EMS, CERT**
- **Dispatch:** Special account; only dispatch members can mark on the dispatch layer
- **Fire spotter:** Designated watchers; all fire personnel can draw fire lines, mark water drops, report conditions
- **School principal:** Report school evacuation status to EMS, create/join parent-community group for trusted updates. Secondary contact collected in case primary isn't available.
- **Other vulnerable population representatives:** Similar to school principal workflow for nursing homes, daycare, special needs homes, etc.
- **Client admin:** Responsible for account setup and sending invite links to emergency personnel
- **Fire chief / police chief:** Designate their hierarchy, keep a resource manager, make it easy for volunteer fire to say they are responding
- **State emergency rep**
- **State politician**
- **Federal emergency rep:** Has an inventory of available resources
- **Hospital rep:** Any nurse or staff can report hospital needs, available beds, supply shortages. Useful for mass casualty events, pandemics, post-hurricane coordination.
- **Ski resort manager / ski patrol:** Mark avalanches, manage run conditions (see section 11.11)

### 7.5 Public / User Accounts

- Profile: name, forward-facing photo
- Car: type, year, make, model (feeds into vehicle manager database: length, width, height, turn radius, number of seats, 4WD capability). Users can manually input vehicle dimensions or select a vaguely similar vehicle if they don't know exact make/model. Should ask about snow tires or other capabilities. Public users and police set default and presaved vehicles; asked to report which car they're in when an emergency notification fires.
- Home location + saved locations (also used for precaching; if someone spends a lot of time at a location where a known sex offender lives, they should not be eligible to pick up someone's kids in an emergency)
- Emergency contacts (import contacts, invite to Beacon)
- Disabilities, elderly status, children, animals
- Retired fire/police/EMS/CERT/plower self-identification
- **Trusted neighbors system:** Users can put out a request to their building that they need someone they can trust for help in an emergency. Loved ones can select a trusted neighbor to help evacuate their grandma. Users can designate contacts as trusted neighbors. Include EMS accounts.
- Trust contact requests for assisting elderly
- Location sharing settings (with legal agreements)
- Easy "share location" with specific EMS personnel (like sharing with a contact)
- ID verification module (verify ID matches reported address)
- Next of kin / emergency contacts visible to admin in emergencies
- Battery level sharing (low battery warning so loved ones don't worry when someone stops responding)
- Equipment and skills: snow plow, excavator, bulldozer, bolt cutters, ladder, surfboard, swimming ability, boat access
- Car model specs automatically looked up from make/model for routing and evacuation calculations
- Vehicle without (ask users when collecting disability/household info)

### 7.6 Groups

- Group manager for public
- Suggested groups module
- Private family group that works simultaneously with EMS account (see family locations, check if loved ones are safe)

---

