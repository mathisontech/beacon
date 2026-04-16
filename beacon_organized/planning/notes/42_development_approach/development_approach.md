## 17. Development Approach

### 17.1 Agentic Team Development Planning

1. Start by categorizing major components into as distinct of units as possible
2. Move a layer down and do the same thing, and so on until the smallest functions are identified
3. Break it down as much as possible
4. Each agent should identify how each appendage on the lowest level is connected
5. File paths and other functions that might not have been created yet should go at the top of the code file
6. File paths can be initialized in code; overview sentence for the function and other custom functions referenced should be documented

### 17.2 Major Development Modules

Sections to develop separately (each is its own module/team):

- **Base Map Builder:** Everything for updating and maintaining the base map. Map developer on Beacon employee side, pushed to users.
- **Hazard Modeler:** Each hazard developed independently. Each hazard has: risk layer that evolves, model for ongoing hazard, shelter/evacuate layers, resource layers for EMS. General pattern: physics-based models → DL surrogates → compressed for low-bandwidth/offline use.
- **Mesh Networking:** Including emergency traffic access and Starlink partnership
- **Permissions Module**
- **Legal Notices Module**
- **Vehicle Manager Module:** Market vehicle database + user vehicle management + EMS resource tracking
- **User Accounts / Trusted Neighbors**
- **ID Verification Module:** Face verification, background checks, sex offender registry
- **Location Calculator**
- **Evacuation Engines:** Routing — mass, individual, inside building, outside (low visibility)
- **Search & Rescue Functions**
- **Notifications:** Automatic alerts + custom alerts from EMS
- **Simulators:** Disaster simulation + evacuation simulation
- **Normal Weather Interface:** Forecasts, weather simulator
- **User Input Module:** Manual reporting + automatic sensor input
- **Ski Resort Module:** Run mapping, condition reporting, avalanche tracking
- **Special Accounts Module:** All designation types and their unique functions
- **Event Manager Module:** Automatically creates events for designated hazards, gives EMS control
- **Beacon World Model:** Goal-engine trained on base map + hazard data + historical outcomes to guide emergency actions using pack-hierarchy logic (see Section 19)

### 17.3 MVP: Public User Wildfire Application

The first build targets a single public user with no EMS, group, or mesh functionality. Core experience: user is alerted to a fire in their region and shown safe routes out.

**MVP Scope:**
- Full base map (all static layers) + simplified map (emergency mode with minimal layers)
- Hazard layers: fire risk, flammability composite, burn-together groups, terrain traversability
- Server-side fire spread model (Rothermel/FARSITE) feeding the user real-time updates as she marks that she sees flames
- User can report flame sightings with GPS + photo. System processes photo through fire/smoke CV model to add veracity score. Server ingests sighting and re-runs spread model incorporating the new ignition point.
- Evacuation routing to safe zones (no EMS-drawn routes in MVP — all algorithmic)
- Danger rating projection: "if you leave in X minutes, danger = HIGH"
- Offline mode with cached tiles + simplified spread model
- No Beacon mesh networking in MVP
- No group functionality
- No EMS/admin interface
- No special designations

**Fire Spread Model — User Interaction Loop:**
1. User receives alert: fire detected in region (VIIRS/MODIS or fire camera network)
2. Map shows fire perimeter + spread prediction + safe zones + evacuation route
3. User marks "I see flames here" on map (with optional photo)
4. Server validates sighting (photo CV + spatial plausibility), updates spread model
5. Updated spread prediction pushed to user within 60 seconds
6. Route dynamically adjusts if fire crosses current evacuation path
7. Cycle repeats as user evacuates

This MVP establishes the core value proposition — a single user saving their own life during a wildfire — before layering on social, EMS, and mesh features.

### 17.4 Company Standards

- **File naming:** Descriptive file names. The goal is to be able to follow the codebase.
- **Company mission:** Save lives, and ideally mitigate disasters with the assistance of all that technology has to offer.
- **Documentation standards:** Standards for documenting modules (standard file to be added)
- **Package question:** Should Beacon make its own package like numpy but with Beacon functions? TBD on whether there is real benefit.

---

