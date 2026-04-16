### 4.4 Hazard Risk Layers

## Still Needs Research
- Soft story identification + liquefaction zone correlation model
- Building material + earthquake intensity damage predictions
- Avalanche modeling from snowpack and terrain data
- Landslide/mudslide initiation triggers and timing
- Tidal data integration for storm surge predictions
- Rip tide and shark warning sourcing and verification
- Flammability composite layer weighting (building vs. vegetation vs. terrain)
- Vegetation species identification from CV for drought vulnerability
- Fire spread rate calibration from historical fire data
- Smoke dispersion modeling under different atmospheric conditions
- Survivable zone time-series computation efficiency
- "In the black" area confidence scoring

**Earthquake & Geological:**
- Earthquake high-collapse risk (soft story buildings on liquefaction-prone soil, precomputed)
- Earthquake building safety predictions (which buildings are unlikely to collapse)
- Earthquake likelihood zone (per-hazard likelihood for each 1km grid square, part of overall hazard likelihood module)
- Avalanche/landslide/mudslide possible zones (slope + snowpack + rainfall derived)

**Tornado & Wind:**
- Tornado shelter ratings per building; storm shelter locations; walk-in freezer predictions
- Tornado-prone areas

**Tsunami & Coastal:**
- Tsunami shelter layer rating
- Tsunami risk layers (predetermined based on low-lying land relative to ocean)
- Tidal layer: tracks tides for ocean water levels, condition reports from counties/beaches, rip tide warnings, shark warnings. Alert users when they walk onto a beach. Lifeguards have a place to report conditions, similar to ski condition reporting on slopes.
- Distance to high ground along coastal regions (on foot + by car)

**Fire & Flammability:**
- Fire-prone areas
- **Heat prediction/detection layer**
- **Building flammability layer:** Per-building flammability based on building materials predictor
- **Terrain flammability layer:** Ground surface flammability based on landcover, drought conditions
- **Plant life flammability layer:** Vegetation flammability based on species, moisture, drought status
- **Flammability composite:** Combination of how flammable each mapped object is. The most flammable thing in the path of fire is the most likely to ignite and move the fire along next.
- Vegetation layer (type via CV + physical attributes + region; flammability rating; tree trunk thickness, height, species guessing model for drought/flammability predictions)
- **Bushes / transition fuel layer:** Brush and bushes that serve as transition fuel between terrain types
- **Flame pass-through rate layer:** Calculates how quickly a fire coming from each of the 8 major directions will spread through an area
- Certified fireproofed homes (self-reported by users)
- Fire speed spread point layers (simplified)
- Fire intensifier layer
- Known flammable objects layer
- Residential-to-woodland transition line (for fire spread model); individual homes in woodland areas
- Burn together groups layer (precomputed clusters of buildings likely to burn together under directional high winds; 8 main wind directions)
- Safe non-flammable regions (show high-certainty fire areas + flammability heatmap to let users decide — avoids liability)
- Parking lot layer (safe during fires)
- **"In the black" layer:** Areas predicted to have already stopped burning, based on objects in the area and whether satellite smoke readings have lowered in alignment with predicted burn time. Feeds into safe zone identification.
- **Fire alarm detection layer:** Where fire alarms going off have been detected

**Flood & Water:**
- Flood-prone areas (all types)
- **Flood susceptibility layer:** Based on terrain, drainage, proximity to water, ground saturation
- **Current risk layers based on historical weather:** Drought status, recent snowfall (flash flood risk from ground saturation, avalanche risk from snowfall, controlled avalanche status — locals can report if it looks like there was an avalanche overnight)

**Atmospheric & Smoke:**
- **Smoke model layer**
- **Oxygen pools/levels layer:** Areas of oxygen depletion (volcano, wildfire)
- **Visibility model layer:** For users (how far can you see) and for radio waves (signal propagation). Contains several sublayers.
- Snow drift levels (user-reported)
- Wind change prediction layer (stays non-visible until barometric measurements indicate current wind predictions are inaccurate or there is about to be a sudden shift)

**Radiation & Chemical:**
- Radiation safety layer: building radiation protection ratings, subway station depths, concrete building ratings for shelter-in-place, route to deepest subway stations if trains are running
- Explosive/hazardous materials locations
- Toxic/industrial hazards layer

**Traversability & Shelter:**
- **Walkable terrain layer** (derived from traversability)
- **Bikeable terrain layer** (derived from traversability)
- **2WD driveable terrain layer**
- **4WD driveable terrain layer**
- **Firetruck driveable terrain layer**
- **Helicopter landing layer:** Derived from roof features, open spaces, LiDAR clearance assessment
- **Barriers layer:** Fences, walls, guardrails, hedges, boulders — places people/cars can't pass through
- Flammability rating by material

**Survivability:**
- **Survivable zones over time layers:** Takes into account all possible danger layers combined. Shows projected safe areas at future time intervals.

