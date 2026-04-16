## 11. Public User Features

## Still Needs Research
- Animal rescue verification and liability framework
- "I'm stuck" broadcast range and timeout management
- Shelter sharing liability and capacity management
- Charging station location database maintenance
- Evacuation confirmation tracking and follow-up
- Bluetooth beacon range optimization for search and rescue
- Go bag content recommendations per hazard type
- Watercraft evacuation procedures and boat capacity estimation
- Vehicle evacuation packing lists per hazard
- Geiger counter data aggregation and quality control
- Stories curation and moderation workflow
- Radiation exposure safety thresholds per vulnerability group
- Trusted neighbor matching algorithm and safety scores

---

### 11.1 Core Features

- Add images/reports to incidents
- Ask nearby public for help
- Regional alerts from EMS, NWS, other official sources
- Weather simulator: dial forward in time to see forecast progression
- Current weather display
- Official alerts display
- Status system: confirmed evacuation, stuck, needs help (with severity), notifications/triggers to ask user
- If you see flames not on the app, reminder to mark them on the map
- Contradict/dispute map sightings with evidence (photos)

### 11.2 Evacuation & Safety

- Evacuation routing (standard + low visibility)
- Routing to someone willing to take you in (tracking both locations + account activity for safety; abuse detection for the "ask for help" system)
- Shelter sharing: let people open their shelter to nearby users (tornado shelters etc.), report available capacity
- Charging station manager (phones are the lifeline)
- Vehicle evacuation through fire guidance (what to grab: axe, etc.)
- Go bag guidance
- Scanning all important documents guidance
- Water refuge guide
- Safe zone evacuation guide
- How to break down a fence
- Near a boat guidance and watercraft evacuation
- Route impassable propagation: user marks route impassable, propagated along mesh. User given guidance including driving backwards, u-turns, or k-turns when traffic allows (check road width and cars behind). Alert everyone behind to back up if someone in front needs to reverse.
- 2WD drivers routed to less obstructed paths
- Advise people without cars to go to streets where vehicles are evacuating
- Routing built on outdated data warning — use caution
- Encourage carpooling with strangers when lives are at stake. Make it clear it's to save lives.
- People on the side (out of the direct path of flame spread) take slower side routes so people closer to the fire can get away
- Count exit routes (standard routes, off-road but low risk, high risk) and route users to the route with fewest people relative to escape route bandwidth. In simulations, assume one less car on other routes so traffic moves faster.
- Allow pulling over on shoulder, illegal u-turns, and driving backwards in EXTREME life-threatening situations (e.g., tornado headed your way). Driving backwards is last possible option.
- Once users evacuate the disaster zone, system navigates them around it to emergency contacts

### 11.3 Animal Rescue Workflow

- User clicks on their home on the map and reports "my dog is in my apartment, can someone get them?"
- Include description, hide-a-key location, any access info
- Nearby verified users are alerted and can offer to help
- Dog owner sees the verified neighbor offering, accepts the offer
- Messaging opens for hide-a-key details
- Once offer is accepted, helper must share location automatically for a few hours or until animal is returned
- System reports if someone is attempting rescue, if animal is confirmed safe, where animal is, who has it

### 11.4 Blizzard & Shelter-in-Place Features

- Tagging specifically for sheltering in place and requesting resources
- Reporting visibility, road conditions, snow drift levels, wind levels
- **"I'm stuck" button:** Allows nearby users to offer shelter
- **"I'm stuck but safe" status:** Track people sheltering in a temporary location who can't get home
- Request basic help from neighbors or people near a location (e.g., let the dogs out while someone is stuck at work/hospital)
- Offer heat to neighbors who mark that they have no access to heat
- Carbon monoxide warnings: people die sheltering in cars when exhaust gets covered by snow, or burning materials indoors without understanding CO/air quality risks. User guides should be available.
- Power is critical: track who has power, who has a fireplace or alternative heat source
- Report sidewalk conditions and when driveways are cleared

### 11.5 Search & Rescue

- Send Bluetooth beacon to searchers in rubble piles
- Start beeping and displaying directional arrows when searcher is in Bluetooth range
- Directional guidance systems: internal evacuation guidance, search and rescue guidance, and standard outside GPS guidance (on-road vs off-road) should all be styled consistently. Related features and underlying path algorithms vary but the UI pattern is the same.

### 11.6 Radiation Event Features

- General radiation guidance for users
- Building radiation protection ratings: some buildings are safer than others
- Route to deepest subway stations if trains are still running
- Concrete building shelter-in-place guidance for smaller-scale events
- Accept Geiger counter readings from users who have them
- Radiation user guides (shielding, exposure limits, when to shelter vs. evacuate)

### 11.7 Social Features

- "Stories of people helping people"
- Events (need help — with severity levels; everyday needs like diapers, dog walk)
- Banner: "someone needs help" (e.g., old lady stuck)
- Contacts management

### 11.8 Navigation

- Map page
- Groups
- Contacts
- Help page
- Around the world hazards
- My people
- My saved locations

### 11.9 Interface Design

- Visual bar describing regional weather / emergency / natural disasters
- Within emergency view: evacuation module with routes and shelters
- Left-hand side menu: resource/team breakdown, messages
- "Use at your own risk" banner at top — user must swipe to dismiss

### 11.10 Vehicle Manager Module

A standalone module tracking all current vehicles on the market with sizes, capabilities, and turn radiuses:

- Auto-lookup from make/model/year for length, width, height, turn radius, seat count, 4WD capability, undercarriage clearance
- Manual input option for custom vehicles or if user doesn't know exact make/model (select a vaguely similar vehicle)
- Ask about snow tires, chains, or other special capabilities
- Includes all-terrain vehicles that police use (e.g., Buffalo NY police have special snow vehicles that respond to 911 calls when ambulances can't get through — they draw zones, split into groups, and patrol)
- Undercarriage clearance relevant for extreme scenarios (driving over recently burned brush areas that are still hot)
- Public users set default vehicles and presaved vehicles they might be in; asked to report which car when emergency notification fires
- EMS vehicle tracking feeds into resource manager (what equipment and vehicles are on hand)
- Plan to manage public and private transit in the base map with schedules: all bus stations, Greyhound terminals, cruise ship ports where large ships can dock, all transit hubs. After Katrina, people needed buses to evacuate — need to know where all transit options are.

### 11.11 Ski Resort Module

- Model to scan ski maps and determine runs
- Suggest boundary polygon for a ski area that can be adjusted by ski patrol
- Users tracked when they come down a run and asked how conditions were
- Users can report needing help to ski patrol
- Report if runs are open/closed
- Report avalanche-risky snow
- Ski patrol side: see predicted avalanche risk based on snowpack conditions
- Mark where they did explosions and how much runoff was triggered (indicating whether they got all the unstable snow)
- Ski patrol as special account with on-mountain coordination tools

### 11.12 Privacy & Location Controls

- Beacon stores user location at all times but only shares with government when something happens
- Explain to users exact parameters for data release (e.g., what constitutes a car crash)
- Dedicated page controlling the circumstances where government gets location (toggle on/off, link to legal releases)

---

