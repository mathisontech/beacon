## 1. Hazard Model Framework

## Still Needs Research
- Sensor signature differentiation for explosion vs. tornado lofting detection
- Battery drain pattern inference methodology for casualty prediction
- Arson detection algorithms and feature engineering
- Burn together group computation at different wind speeds
- Integration of secondary hazard chains with primary models
- Real-time update mechanisms for destruction/terrain changes during active events
- Model deployment performance thresholds for on-phone vs. server versions
- Cache management strategy per hazard type with battery constraints

---

Every hazard model follows this standardized structure. Each hazard model is its own development module with its own training environment, employee tracking, and visual component approval process (must adhere to style guide).

### 1.1 Modeling & Predictive Core

- **Analysis methodology:** Physics-based simulations + deep learning surrogates
- **Risk modeling:** General area risk models + adaptive models that update with incoming data
- **Evolution & pathing:** Hazard evolution over time and "path of disaster" trajectory modeling
- **Visibility & environment:** Indoor/outdoor visibility models; road condition models (car crashes, pile-ups)
- **Secondary effects:** Tree fall models, utility risk (including cell service loss), connected/cascading hazard chains
- **Base map adjustment predictions:** Account for destruction (structures burned/collapsed) and terrain changes (earthquake shifts elevation before tsunami arrives)
- **Fire survival tracking:** Track fire, smoke, heat, oxygen, and CO2 levels for survival assessment
- **Out of control burn point detector:** A single house fire under high enough winds can quickly get out of control. At some point the entire area is going to burn. Detect this inflection point.
- **Burn together groups:** Depending on high winds from main directions, calculate groups of buildings close together and flammable enough that if one burns, the entire group will likely burn. Server-side model recalculates adjustments based on current wind speed and direction. Guides where fire resources should focus.
- **Casualty prediction via battery drain:** Track battery drain patterns to infer potential casualties
- **Danger rating projection:** "If you leave in X minutes" danger rating — project risk over near-future timeframes
- **Traffic death cascade modeling:** A user dying in their car (being in the death zone — too much heat, too much smoke for too long) will block that entire line of traffic. Model should discourage routing that leads to this outcome.
- **Suspected arson detector**
- **Car crash / pile-up / plane crash detection**
- **Power outage detection**

### 1.1b Automatic Sensor-Driven Input (Beacon On)

Automatic detection triggers from phone sensors:

- Building collapse + sudden fall detection (or someone manually reports a building collapse — warn user if their region is not directly covered by EMS)
- Car crash / pile-up detection
- Stranded driver detection
- Extreme heat + stop of phone activity = needs help immediately
- Explosion / tornado lofting detection (may have similar sensor signatures — research needed)
- Shaking / earthquake detection
- Fire alarm sensing

### 1.2 Fire Spread Model (Wildfire Module)

- **Ignition by direct flame:** Contact duration threshold given heat/humidity/drought status
- **Radiant heat threshold:** Ignition distance given heat/humidity/drought status/direction
- **Ember intensity:** Being downwind of enough embers
- **Vegetation flammability layer:** Terrain fire pass-by rate (high for grass, low for structures, adjusted for drought)
- **Wind speed and direction integration**
- **Projected fatal zones over time:** Oxygen depletion, heat, smoke, and all lethal exposure vectors

### 1.3 Operational Protocols & Safety

- **Event triggering:** Defined thresholds for when to activate an event; protocols for data recording during events. Automatic thresholds trigger event and start data storage, adjust suggested map layers (e.g., show oxygen depletion, heat layers).
- **Default layers by region:** Areas prone to certain disasters should have default layers that account for regional risk profiles
- **Evacuation logic:** Criteria for evacuation vs. shelter-in-place decisions
- **Safe zone modeling:** Two layers: (1) "safer zone" layers per hazard baked into the base map, and (2) a model for predicted safety given active forecasts including phone sensor input and nearby sightings. Safe zones must be unburnable, won't overheat, and won't produce excessive smoke.
- **Recent burn zones as safe zones:** As burned areas cool down, they become safe zones. Track cooling progression.
- **Smoke survival advice:** Advise people to bring blankets for smoke protection
- **Lethality assessment:** Models for "ways people die" per hazard (suffocation, electrocution, radiant heat, crush, etc.)
- **In-building evacuation with no visibility:** Elaborate system using UWB to create a path that a person takes out of the building. When one person gets out, they confirm successful evacuation. GPS from outdoors marks the exit point and shifts the path, confirming to everyone still in the building that there is an evacuation route. Low visibility guidance relies on spoken guidance and the phone shaking more intensely when the user is oriented toward the evacuation route.
- **Beacon coverage check:** See if area is covered by Beacon emergency management. If it isn't, connect with 911.
- **Last resort evacuation locations:** Visible to EMS only for liability reasons. EMS can manually share or designate as shelters of last resort (as done during the Paradise fire).

### 1.4 Technical Reliability & Edge Cases

- **Validation specs:** Performance validation during real-time events + model training validation
- **Edge case resilience:** Risk of losing service (what to cache and when); update trackers for new or user-reported events
- **Deployment tiers:** Optimized "on-phone" compressed versions vs. high-compute "advanced" server versions
- **Hazard-specific caching:** Specify what should be cached on the phone given the active hazard type
- **Low intensity models:** Stripped-down model versions for no-service times
- **Outdated data warning:** Warn users that routing may be built on outdated data — use caution
- **Battery consciousness:** Entire system must be conscious of battery usage. Battery saver mode for emergencies.

### 1.5 Communications & UI

- **Hazard-specific icons and localized messaging**
- **Supporting party info** (e.g., tornado tracker feeds)
- **Pre-saved scenario info** for rapid deployment
- **Specialized controls** for specific users (e.g., ski patrol)
- **"Use at your own risk" banner:** Displayed at top of screen; user must swipe it off to acknowledge
- **Flame reporting reminder:** If the user sees flames not on the app, remind them to mark them on the map
- **Vehicle icons:** Icons showing people's locations should show the vehicle they are in (firetruck, helicopter, ambulance) and a number showing how many occupants
- **Map declutter system:** Fire sightings behind confirmed fire line can be minimized/removed. Users can contradict sightings and push to remove them. Users can add pictures showing things have changed. Most map icons should have a timeout feature.

### 1.6 Vulnerability & Assistance

- **At-risk populations:** Kids in school, hospitals, homeless, people with disabilities, elderly, nursing homes, jails/prisons, trailer parks, single-story homes, people without vehicles
- **Resource mapping:** What each user type needs for preparation and/or evacuation
- **Vulnerable populations data layer:** State health department licensing databases (nursing homes, assisted living, group homes, hospitals, dialysis centers), CMS (Medicare) facility databases, state education agencies (schools and licensed daycare), HUD (homeless shelter locations). Individual self-reporting or reporting loved ones is critical.
- **Pre-registered representatives:** Representatives for all schools and vulnerable populations should be in the contacts database before disasters. This is a major part of EMS setup.

---

