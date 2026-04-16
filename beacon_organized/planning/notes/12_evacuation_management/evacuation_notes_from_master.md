## Still Needs Research
- Event triggering thresholds per hazard type
- Data recording format and retention during active events
- Default layer visibility configuration per region and hazard
- Safe zone prediction model confidence scoring
- Burn zone cooling rate estimation post-fire
- UWB range and accuracy specifications for indoor evacuation
- Exit point confirmation from multiple evacuation participants
- Low visibility spoken guidance content and TTS optimization
- Shelter-in-place vs. evacuation decision criteria per hazard
- Casualty count estimation from phone sensor data

---

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

