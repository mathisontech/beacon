## 13. Modeling & Simulation

## Still Needs Research
- Deep learning model compression techniques for on-phone deployment
- Physics simulation training data generation at scale
- Barometric pressure data quality and calibration
- Real-time phone sensor fusion algorithms
- Street-level perception model robustness in low-light conditions
- Regional risk calculator per-hazard score weighting
- Mass evacuation simulation population behavior modeling
- Traffic stuck detection triggers and threshold tuning
- Exit route optimization with dynamic congestion feedback
- Low-coverage flood tracking (GloFAS accuracy assessment)
- Sentinel-1 flood detection confidence scoring
- Storm chaser image triangulation accuracy
- Population density time-of-day models per building type
- Community access report credibility assessment

---

### 13.1 AI-Enhanced Offline Hazard Modeling

- Train deep learning models on physics-based simulations
- Compress models to work offline on phones
- Deployment tiers: on-phone (compressed) vs. advanced (server)

### 13.1b DL-ification Candidates (Hazard Models Best Suited for Deep Learning Surrogates)

Not all physics-based hazard models benefit equally from DL surrogates. The strongest candidates have: (a) expensive physics simulations that run too slowly for real-time use, (b) well-defined input/output relationships, (c) abundant training data from historical events or synthetic simulation runs.

**Tier 1 — Strongest candidates (physics is slow, DL speedup is massive):**
- Wildfire spread (Rothermel/FARSITE): single forward pass replaces iterative cell-by-cell fire propagation. Training data: thousands of historical fires with weather/terrain/fuel inputs. Speedup: 1000x+ over FARSITE for similar-quality perimeter predictions.
- Flood inundation (HEC-RAS 2D): hydraulic simulation of water flow over terrain is extremely compute-intensive. DL surrogate takes rainfall + terrain + soil as input, outputs flood depth map. Training data: synthetic HEC-RAS runs at varied return periods.
- Tsunami inundation (MOST/ComMIT): wave propagation + coastal run-up is a multi-hour simulation per scenario. Physics-informed neural operators (e.g., Fourier Neural Operator) can approximate in seconds. Training data: precomputed MOST runs for fault scenarios.
- Smoke/air quality dispersion (HYSPLIT): Lagrangian particle transport is slow for real-time plume tracking. DL takes fire location + weather + terrain, outputs PM2.5 concentration field. Training data: historical smoke events with AirNow ground truth.

**Tier 2 — Good candidates (moderate physics cost, meaningful speedup):**
- Earthquake ground motion (GMPE/ShakeMap): already fast but DL can incorporate site effects and building response in a single pass. Training data: strong motion databases (NGA-West2).
- Avalanche runout (RAMMS): granular flow simulation is moderately expensive. DL surrogate takes slope/snowpack/trigger as input, outputs runout polygon. Training data: historical avalanche paths + synthetic RAMMS runs.
- Storm surge (SLOSH): hurricane surge modeling is expensive per track. DL can interpolate between precomputed SLOSH basins. Training data: SLOSH MOM/MEOWs.
- Landslide runout: Newmark displacement + debris flow propagation. DL takes slope/soil/rainfall, outputs probability + runout distance.

**Tier 3 — Lower priority (physics is already fast or DL adds less value):**
- Earthquake EEW (ShakeAlert): already sub-second; DL doesn't help much.
- Wind chill / heat index: simple formulas, no DL needed.
- Rip current forecasting: empirical models are already fast.
- Drought indices (PDSI, SPI): statistical, not physics-based.

**General pattern:** Physics-based simulation → generate thousands of training scenarios → train DL surrogate → validate against holdout scenarios → compress (quantization, pruning, knowledge distillation) → deploy on-phone via TFLite/CoreML. Server retains full physics model for validation and edge cases where DL surrogate confidence is low.

### 13.2 Real-Time Sensor Integration

- User barometric pressure data
- Other phone sensors
- Update and enhance models for flooding, fire spread, etc.
- If communication lines stay open: maintain shared real-time understanding of disaster; who needs help, where
- **Street-level perception model:** Phone cameras compare live views against pre-computed aerial LiDAR priors to detect fallen trees, collapsed structures, flooding, and debris in real time (see Section 3.5)

### 13.3 Specific Models

- **Regional risk calculator:** Pre-computed per-hazard risk scores (earthquake: high, tsunami: high, etc.)
- **Mass evacuation simulation:** Individual navigation algorithms given time-of-day of event, number of people, open roads, available transit (buses, trains)
- **Mass evacuation planner:** Given X people, Y open roads, Z trains and buses — what is the outcome?
- **"People are dead" model:** Phone overheated / stopped transmitting, inference about casualties
- **Passability model:** What vehicles can traverse where, updated post-event
- **Can A reach B model:** Route feasibility between resources and people who need them
- **Population estimation:** Time-of-day aware (offices empty at night, schools empty on weekends)
- **Timeline manager:** Future hazard projections over time
- **Jupiter hazard models:** Weather forecasts, integrating sightings, models with projections. Low intensity versions for no-service times. Specify what should be cached on phone given the active hazard.
- **Traffic stuck detection:** Automatically sense where evacuees are getting stuck and which evacuees are most at risk
- **Exit route optimization:** Count possible exit routes (standard, off-road low risk, high risk). Route users to the path with fewest people relative to escape bandwidth. Consider gradient descent for routing.
- **Community access reports:** Communities can register changes in access ways (less weight than EMS confirmation)

### 13.4 Low-Coverage Worldwide Flood Tracking

- GloFAS as baseline: modeled flood forecasts for large river flooding (slow rise over days)
- Monitor Sentinel-1 for flood extent detection during events
- Integrate SWOT data as it becomes available (more detailed than other altimetry)
- Satellite altimetry (Sentinel-3, Jason-3, SWOT) only works on large rivers
- Flash flooding (hours): prediction only using rainfall + terrain + watersheds via NASA GPM
- Satellite-based river level estimation: compare visible terrain on satellite around rivers with underlying terrain model to gauge water level. Simulate satellite view at different water levels, find the image that matches closest, and refine with gauge data.

### 13.5 Storm Chaser Module

- Triangulate tornado locations from official storm chaser imagery + location data
- Cross-reference with radar data
- Account for all observers' positions and reports

---

