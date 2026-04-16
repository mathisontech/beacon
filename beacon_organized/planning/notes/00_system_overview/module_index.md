## 0. Development Module Index & Account Mapping

Each major system component maps to a development module with its own environment, team, and account-type relevance. This index shows which account types interact with each module.

### Account Types

- **Beacon Employee (BE):** Server-side map building, data pipeline management, model training, client management
- **EMS Admin (EA):** Emergency management leadership, zone drawing, event declaration, resource management
- **EMS Team Member (ET):** Field operations, route confirmation, condition reporting, resource deployment
- **Dispatch (DI):** Specialized dispatch layer, call management, resource coordination
- **Special Designations (SD):** School principal, utility rep, plower, tornado tracker, storm chaser, fire spotter — each with unique functions granted via invite code
- **Public User (PU):** Evacuation, reporting, help requests, location sharing, animal rescue

### Module Map

| Module | BE | EA | ET | DI | SD | PU | Notes |
|---|---|---|---|---|---|---|---|
| Atlas (Base Map) | Build | View | View | View | View | View (tiles) | Server-side build; 1km tile delivery |
| Hazard Models (per hazard) | Train/adjust | Configure | Use | Use | Use | Use (compressed) | Each hazard = own module + environment |
| Map Layers (static) | Build | Configure | View | View | View | View | Property lines, buildings, terrain, etc. |
| Map Layers (event) | Monitor | Draw/edit | Draw/edit | View | Report | Report | Evac routes, destruction, conditions |
| Mesh Networking | Build | Priority | Priority | Priority | Use | Use | EMS traffic first |
| Account & Auth | Manage all | Manage team | — | — | — | Self-manage | Invite codes, special designations |
| Contacts/Stakeholder DB | Populate | Use/update | Use | Use | — | — | Landowners, bus cos, school reps |
| Event Declaration | — | Declare/manage | Participate | Dispatch | Report status | Receive alerts | Auto-thresholds + manual |
| Evacuation Manager | — | Command | Execute | Coordinate | Report (schools etc.) | Follow routes | Routes, shelters, staging |
| Backup & Mutual Aid | — | Manage | Use codes | — | — | — | Secure codes for non-Beacon units |
| Modeling & Simulation | Build | Run scenarios | — | — | — | — | Server + compressed on-phone |
| Public Safety Features | — | Monitor | Monitor | — | — | Use | Shelter sharing, animal rescue, help |
| Vehicle Manager | Build DB | Use | Use | — | — | Set vehicles | Market specs + manual input |
| Notifications & Alerts | Build | Send custom | Receive | Dispatch | Receive | Receive | Automatic + custom from EMS |
| Ski Resort Module | Build | — | — | — | Ski patrol | Use | Runs, conditions, avalanche |
| Permissions & Legal | Build | Configure | — | — | — | Accept | Notices, agreements, ToS |
| Normal Weather Interface | Build | — | — | — | — | Use | Forecasts, simulator |
| Automatic Sensor Input | Build | Monitor | Monitor | — | — | Passive | Crash, collapse, quake, fire alarm |
| Street-Level Perception | Build | Monitor | Monitor | — | — | Camera input | LiDAR prior vs. phone camera |
| Beacon World Model | Train | Use | Use | Use | — | Guided by | Goal-engine for emergency decisions |

### Development Architecture Note

Start development with the shared skeleton. EMS accounts are special types of groups built on the same underlying public user functionality, with dispatch access, on-duty tracking, team-based interface, and additional features layered on top. The interface is the same core but EMS sees team locations, different icons, and dispatch markings.

### Special Designation Workflows

**School Principal (SD):** Receives invite code from EMS. Reports school evacuation status directly to EMS. Creates/joins parent-community group for trusted updates.

**Utility Representative (SD):** Confirmed by EMS or Beacon employee. Manually marks utility personnel locations, outage zones, and repair updates on the map.

**Plower (SD):** Activates "currently plowing" mode; map tracks plowed areas in real time. Can see other plowers' paths for coordination. Receives plow requests from EMS/police.

**Dispatch (DI):** Only dispatch members of an organization can mark on the dispatch layer. Coordinates resource deployment, call management.

**Tornado Tracker / Storm Chaser (SD):** Images triangulated against radar for tornado positioning. Reports rain-wrapped status and other conditions. EMS can request search and rescue from chasers. Chasers report S&R activity, hospital transport (EMS can call for victim status, escort, or alert hospital).

**Fire Spotter (SD):** Designated watchers. All fire personnel can manually draw fire line locations, mark water drops, and report conditions.

**Client Admin (SD):** Responsible for account setup and sending invite links to emergency personnel.

**Fire Chief / Police Chief (SD):** Designate their hierarchy, keep a resource manager, make it easy for volunteer fire to say they are responding.

**Ambulance/EMS (SD):** Field EMS with special dispatch coordination.

**State Emergency Rep (SD):** State-level emergency coordination.

**State Politician (SD):** Government official coordination during declared emergencies.

**Federal Emergency Rep (SD):** Federal-level emergency coordination with inventory of available resources.

**Hospital Rep (SD):** Any nurse or hospital staff can report what their hospital needs, available beds, supply shortages. Most useful for mass casualty events, pandemics, or post-hurricane resource coordination.

**Ski Resort Manager / Ski Patrol (SD):** Mark avalanches, manage run conditions, coordinate on-mountain rescue. See section 11.11.

**Note:** All special accounts should have a direct connection to the Beacon founder account so if they are having system issues or need to get a message out, they can get real-time support.

---

