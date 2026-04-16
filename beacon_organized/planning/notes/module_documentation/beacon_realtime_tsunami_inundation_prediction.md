# Beacon Jupiter — Real-Time Tsunami Inundation Prediction System

## Overview

This system predicts where tsunami water will go, how deep it will be, and when it will arrive — and continuously refines that prediction as real sensor data streams in throughout the event. The architecture separates the problem into two pieces: open-ocean wave propagation (learned physics, running in real time) and nearshore inundation (precomputed high-resolution responses, driven by the propagation model's output). A sensor assimilation loop corrects the propagation model against observed wave behavior as the event unfolds.

The system handles the full complexity of real tsunamis: multiple waves arriving over hours, wave-wave interactions, harbor resonance, reflected waves returning from distant coastlines, and the critical reality that later waves are often the largest. It works for both local tsunamis (Cascadia — 15 minutes warning) and far-field tsunamis (Chile to Hawaii — 15 hours warning) through the same architecture.

### Why Two Pieces

A precomputed scenario library (earthquake parameters → inundation maps) was the original design. It breaks down in two ways:

**The far-field problem.** The Pacific Northwest can be hit by tsunamis from Cascadia, Alaska, Kamchatka, Chile, or Japan. Building source-specific libraries for every source-target combination is combinatorially prohibitive. A learned propagation model sidesteps this — it learns the physics of how waves travel through water, not specific source-target pairs.

**The multi-wave problem.** Tsunamis are wave trains, not single pulses. The second or third wave is often the largest. Each wave interacts with the state left behind by the previous ones — whether the coast has drained or is still flooded when the next crest arrives. A lookup system can't handle this because you only learn what the next wave looks like when sensors see it, by which point you need to know what the coast already looks like from the previous waves. The system needs something that maintains state — a running simulation, not a static lookup.

The two-piece split puts the learned simulation where it works best (smooth, nearly linear deep-ocean propagation) and keeps precomputed physics where it's still needed (violent, nonlinear nearshore flooding at meter-scale resolution).

---

## Architecture

```
Earthquake Parameters ──→ PROPAGATION MODEL (learned, real-time)
                                    ↕
DART / Sensor Data ────→ State Correction via Assimilation
                                    │
                                    ↓
                          Wave field at offshore boundaries
                          (height, period, direction, timing
                           for full wave train over hours)
                                    │
                                    ↓
                          NEARSHORE RESPONSE DATABASE
                          (precomputed, high-resolution)
                          Accounts for:
                          - Current coastal flooding state
                          - Multi-wave sequencing
                          - Harbor resonance buildup
                                    │
                                    ↓
                          Inundation Prediction
                          (depth, velocity, arrival time
                           per coastal grid cell)
                                    ↕
Tide Gauge Data ──────→ Validation / Discrepancy Detection
```

---

## Piece 1: Open-Ocean Propagation Model

### Purpose

Track the full tsunami wave field across the ocean in real time — from source to the offshore boundary of each coastal region — and continuously correct it against sensor observations. This model doesn't predict inundation directly. It predicts what wave characteristics will arrive at each coastline, from what direction, with what timing, across the entire multi-wave train.

### Why Learned Physics

A learned propagation model learns the physics — how waves travel through water of varying depth — not specific source-target pairs. Give it any initial seafloor deformation anywhere in the ocean basin, and it propagates the resulting wave field forward in time. An earthquake in Chile, Alaska, or Cascadia all go through the same model.

More critically, the propagation model maintains state. It tracks the full evolving wave field, including multiple crests and troughs propagating simultaneously, reflections from coastlines and seamounts, and wave-wave interactions. A lookup-based system can't do this because the state of the ocean depends on the full history of the event.

### Physics Being Learned

The deep-ocean tsunami propagation is governed by the 2D nonlinear shallow water equations:

- Conservation of mass: ∂h/∂t + ∇·(hv) = 0
- Conservation of momentum: ∂(hv)/∂t + ∇·(hvv) + g·h·∇η = -friction terms

Where h is water depth, v is depth-averaged velocity, η is water surface elevation, and g is gravitational acceleration. In deep water (>500m depth), these simplify substantially — the wave speed is approximately √(gh), the wave amplitude is small relative to water depth, and the physics is nearly linear. This is the regime where neural operators excel.

The inputs the model needs:
- Ocean bathymetry (GEBCO 2023, 15 arc-second global coverage — static, baked into the model during training)
- Initial seafloor deformation from the earthquake (computed via Okada model from fault parameters — event-specific forcing)
- Current state of the ocean surface (initialized from the deformation, then updated by assimilation)

The output at each timestep:
- Water surface elevation and velocity field across the entire ocean domain
- Extracted at offshore boundary arcs surrounding each coastal region of interest: wave height, period, direction, and phase at each boundary segment as a function of time

### Neural Operator Architecture

**Recommended approach: Physics-Informed Deep Operator Network (PI-DeepONet)**

The DeepONet architecture learns the solution operator — the mapping from initial conditions to solutions — rather than specific input-output pairs. The operator generalizes: once trained, it evaluates any new initial condition (any earthquake, anywhere in the domain) without retraining.

**Branch network:** Encodes the earthquake source. Input is the seafloor deformation field (a 2D spatial field representing the initial water surface displacement). Architecture: convolutional encoder that compresses the source field into a latent representation (~100–500 dimensional).

**Trunk network:** Encodes the query point in space-time. Input is (latitude, longitude, time, local bathymetric depth). Architecture: fully connected network with Fourier feature embedding to capture multi-scale wave behavior.

**Physics-informed training:** The loss function has three components:
1. Data loss: MSE between model predictions and physics simulation outputs from the training scenario library
2. PDE residual loss: the shallow water equations evaluated at collocation points throughout the domain — forces the network to produce solutions that satisfy conservation of mass and momentum even in regions with sparse training data
3. Boundary/initial condition loss: the initial deformation and open boundary conditions are satisfied

The PDE residual term is what makes this physics-informed rather than purely data-driven. It prevents the network from producing physically impossible solutions for events outside its training distribution.

**Time integration strategy:** Following the PITI-DeepONet approach, the network learns the instantaneous time derivative ∂η/∂t rather than predicting future states directly. This derivative is integrated forward using classical Runge-Kutta or Adams-Bashforth-Moulton schemes. This gives:
- Stability over long time horizons (hours of propagation without error accumulation)
- The ability to use finer timesteps during inference than during training
- Natural compatibility with data assimilation (correcting the state at any point and continuing forward)

**Resolution and domain:**

The propagation model operates on a relatively coarse grid — deep ocean doesn't need meter-scale resolution. A resolution of 1–2 arc-minutes (~2–4 km) is sufficient for deep-water propagation and is consistent with GEBCO bathymetric data resolution. For a Pacific basin domain, this is roughly a 5,000 × 3,000 grid = 15 million points. Large, but tractable for a neural operator on GPU hardware.

The model transitions to a finer buffer zone (~15–30 arc-seconds, ~500m–1km) on the continental shelf approaching each coastal region, down to the offshore boundary arc where it hands off to the nearshore model. The adaptive evaluation capability of DeepONets (the trunk network can be queried at any spatial resolution) handles this multi-scale structure.

### Training Data

The propagation model is trained on the scenario library — specifically, on the open-ocean portion of each simulation. For every scenario:

- Input: the initial seafloor deformation field
- Target: the time-evolving water surface elevation field across the ocean domain, extracted at regular time intervals and at all virtual gauge locations

Training data comes from all covered subduction zones combined. The propagation physics is generic — waves travel through deep water the same way regardless of origin. A model trained on Cascadia, Alaska, and Chile scenarios together learns better propagation physics than one trained on any single zone.

Additional validation data from historical events (2004 Indian Ocean, 2010 Chile, 2011 Tohoku) where DART observations provide ground truth.

### Fallback: GPU-Accelerated Physics Model

If the neural operator fails, produces unreliable results, or encounters a scenario far outside its training distribution, the system falls back to running Tsunami-HySEA directly on GPU hardware. For open-ocean propagation on a coarse grid, HySEA can produce results in minutes — fast enough for distant tsunamis (hours of warning) though tight for local events (minutes of warning). The neural operator's primary value is that it runs in seconds, preserving every possible second of warning time for near-field events.

---

## Piece 2: Nearshore Inundation Response Database

### Purpose

Predict the detailed flooding pattern on the coast at high resolution (meters), given the wave characteristics arriving at the offshore boundary. This piece handles the brutal nonlinear physics: wave steepening and breaking, runup onto land, wetting and drying, flow around buildings, harbor resonance amplification, and the interaction between successive waves where later arrivals flood onto land that hasn't yet drained from earlier ones.

### Why Precomputed Instead of Learned

The nearshore physics is where resolution and nonlinearity matter most. A 3m wave entering a narrow harbor mouth can amplify to 10m through resonance. A seawall 2m high completely changes the inundation pattern. A drainage channel creates a preferential flow path. Capturing this requires meter-scale resolution and robust wetting/drying algorithms.

No neural operator has been demonstrated at this resolution for real-world coastal geometry with operational accuracy. The nonlinear shallow water equations in the nearshore regime involve hydraulic jumps, turbulent bores, and wave breaking — phenomena where small errors in the learned physics compound rapidly. Traditional numerical solvers (Tsunami-HySEA, GeoClaw) handle these robustly.

The nearshore domain is also relatively small (a few hundred km of coastline per region), so high-resolution simulation is computationally tractable. The expensive part is running thousands of scenarios — but by parameterizing from boundary conditions rather than earthquake sources, the library is more compact and more reusable.

### Parameterization: What Varies

Each simulation is forced by a time-varying boundary condition along an offshore arc (defined at approximately the 200m depth contour for each coastal region). The boundary condition specifies water surface elevation and velocity as a function of position along the arc and time.

**Wave characteristics along the boundary:**

- Amplitude profile: how wave height varies along the boundary arc (captures source directivity — a Cascadia wave arrives differently than an Alaska wave). Represented as a smooth spatial function, discretized into ~20–50 boundary segments.
- Wave period: 5 to 60 minutes (shorter periods from nearby sources, longer from distant)
- Number of wave crests in the train: 1 to 10+ (captures the full multi-wave character)
- Amplitude progression: whether the wave train builds (each crest larger than the last), decays, or has a dominant middle crest
- Phase variation along boundary: whether crests arrive simultaneously along the full arc or sweep from one end to the other (captures approach angle)
- Leading polarity: leading elevation (crest first) vs. leading depression (trough first) — significantly affects initial flooding dynamics

**Coastal state:**

- Antecedent water level: is the coast dry, or already flooded from a previous wave cycle? Parameterized as residual flooding depth at a set of reference points.
- Tidal state: high tide vs. low tide can add 1–3m to effective inundation
- Co-seismic deformation: has the land dropped (subsidence) or risen (uplift) due to the earthquake? For local tsunamis from nearby faults, this can change coastal elevation by 1–3m. Parameterized as a spatial deformation field applied to the topography before the wave arrives.

### Multi-Wave Handling

This is the critical capability the precomputed library must support. Rather than parameterizing every possible multi-wave combination (combinatorially explosive), the approach is:

1. **Single-wave responses** across the full parameter range — these form the base library
2. **Focused multi-wave sequence simulations** (~500–1,000 per region) that capture the most important interaction effects:
   - Second wave arriving onto partially drained coast
   - Resonance buildup over 3–5 cycles in harbors and bays
   - Worst-case sequences where each wave is progressively larger
   - Wave-on-wave interaction where a second crest arrives while the first is still flooding inland
3. **During real-time operation**, combine single-wave responses with correction factors learned from the multi-wave simulations to approximate arbitrary wave train sequences

The multi-wave simulations also record drainage state at regular intervals — how the coast looks 10, 20, 30, 60 minutes after each wave. This allows the system to initialize subsequent wave interactions: after wave 1, record the actual drainage state from the best-matching simulation, then query the library for simulations whose initial flooding state matches the current coast AND whose boundary forcing matches the incoming second wave.

### Simulation Engine

Tsunami-HySEA on GPU with nested grids:
- Outer domain: 6 arc-seconds (~180m) covering the continental shelf
- Inner domains: 1 arc-second (~30m) for populated coastal areas
- High-priority zones: 1/3 arc-second (~10m) or finer where LiDAR DEMs are available from Atlas

Each simulation runs for 3–6 hours of simulated time to capture the full multi-wave sequence through multiple reflection cycles.

### Library Size

Using Latin hypercube or Sobol sequence sampling across the parameter space:

~10 amplitude levels × ~6 period bins × ~5 wave-train structures × ~8 directional profiles × ~3 tidal states × ~3 deformation states = ~21,600 base combinations

Physical constraints reduce the active library (a 30m wave with a 5-minute period from a far-field source doesn't happen) to perhaps 5,000–10,000 simulations per coastal region, plus the ~500–1,000 multi-wave sequence simulations.

**Compute per coastal region:** 5,000–10,000 simulations × 10–30 minutes each on GPU = ~800–5,000 GPU-hours. On a 32-GPU cluster: 1–6 days. Comparable to the scenario library approach but producing a more universal and reusable database.

### Outputs Stored Per Simulation

- Maximum inundation depth at every grid cell in the high-resolution domains
- Maximum flow velocity at every grid cell
- Inundation time series at a dense set of reference points (for animating flood progression)
- Arrival time at every grid cell (first exceedance of 0.2m threshold)
- Drainage state at regular intervals (10, 20, 30, 60 min post-wave — for initializing subsequent wave interactions)
- Wave amplification factors at harbor/bay locations (for detecting resonance)

### Real-Time Lookup and Interpolation

During an event, the propagation model delivers time-evolving wave characteristics at the offshore boundary. The system:

1. Characterizes the incoming wave train: amplitude profile along boundary, period, number of crests, progression pattern
2. Finds the nearest precomputed simulations in parameter space (k-nearest neighbors, k = 5–20)
3. Interpolates the inundation fields using inverse-distance weighting or Gaussian process regression on POD-compressed fields
4. As each wave in the train arrives and the coastal state evolves, updates the antecedent flooding state and re-queries the library for the next wave's interaction

If no close match exists in the library for a given wave-on-flooded-coast combination, the system falls back to the conservative assumption: coast fully flooded from previous wave + next wave amplitude from propagation model, producing a worst-plausible-case prediction.

---

## Sensor Assimilation Loop

### Purpose

The propagation model's prediction starts from earthquake parameters and improves as real sensor data comes in. The assimilation loop corrects the model's wave field state to be consistent with what sensors actually observe, then continues propagation from the corrected state. This is not retraining the model — it's adjusting the physical state the model is operating on.

### Data Sources

**DART Buoys (Deep-ocean Assessment and Reporting of Tsunamis)**

- ~40 stations globally, concentrated in the Pacific
- Bottom pressure recorders at 1,000–6,000m depth, detecting amplitude as small as 1cm in 6,000m water
- Event mode: 15-second sampling, data reaches warning centers in < 3 minutes via Iridium satellite
- 4th-generation DART (4G): positioned on the Cascadia margin and Alaska, with improved sensors capable of detecting the tsunami while the earthquake is still rupturing
- Each DART observation provides a direct measurement of the open-ocean wave field at a known point — exactly what the propagation model is predicting

**Cable-Based Ocean Bottom Sensors (Japan)**

- S-net: 150 inline stations along 5,700 km of cable on the Japan Trench, ~30 km spacing, 1-second sampling via fiber optic (zero satellite delay)
- DONET: 51 stations in the Nankai Trough, ~15–20 km spacing
- Densest tsunami observation networks in the world

**GNSS/GPS Stations**

- Real-time ground displacement constrains the earthquake source (how much slip, where on the fault)
- Complementary to DART: GNSS constrains the SOURCE, DART constrains the WAVE
- Available within seconds to minutes from networks like UNAVCO/EarthScope (US), GEONET (Japan)

**Coastal Tide Gauges**

- NOAA CO-OPS (~200 US stations), global IOC network (~2,000 stations)
- 1-minute or 6-minute sampling — too slow for early warning, but valuable for:
  - Validating that inundation predictions are correct (or wrong)
  - Detecting if nearshore amplification is stronger or weaker than the response database predicted
  - Updating predictions for subsequent waves based on observed first-wave behavior

**Future: SMART Cable Sensors**

- Sensors embedded in undersea telecom cables (ITU/WMO/UNESCO initiative)
- Would create thousands of ocean-floor measurement points globally
- Not yet operational, but the architecture is designed to ingest this data

### Assimilation Methods by Phase

**Phase 2 — Ensemble Scenario Weighting (simple, proven)**

Before the propagation neural operator is ready, the system assimilates sensor data using the precomputed scenario library directly:

1. When earthquake parameters arrive, identify the N closest scenarios in parameter space (N = 20–100)
2. Each scenario has precomputed wave time series at all DART locations (stored during scenario generation)
3. As DART data streams in, compute the likelihood of each scenario given the observations:
   ```
   likelihood_i ∝ exp(-0.5 × Σ_sensors Σ_timesteps [(predicted_i(t) - observed(t))² / σ²])
   ```
4. Update weights via Bayes' rule: weight_i = prior_i × likelihood_i / normalization
5. The current prediction is the weighted ensemble of the surviving scenarios' wave fields
6. As more data arrives, weights sharpen — fewer scenarios remain plausible, uncertainty narrows

This is conceptually identical to NOAA's SIFT system but using richer stochastic scenarios.

**Phase 3 — State Correction of the Propagation Model**

Once the neural operator is running:

1. The propagation model produces a predicted wave field across the ocean
2. At each DART location, compare predicted vs. observed wave height
3. Compute the innovation (observation minus prediction) at each sensor
4. Use an ensemble Kalman filter or optimal interpolation to spread the innovation across the wave field — correcting not just at sensor locations but in the surrounding ocean, weighted by spatial correlation
5. Continue forward propagation from the corrected state

DART buoys are sparse (40 stations across the Pacific), but tsunami wavelengths are long (100–500 km in deep water). A single DART observation constrains the wave field over a large area. The spatial correlation structure of the wave field errors (derived from the scenario library — run the propagation model on all training scenarios, compare to physics model outputs) determines how far each correction spreads.

**Phase 3 — Bayesian POD Coefficient Updating**

A complementary approach combining POD compression with real-time updating:

1. The scenario library's inundation fields are decomposed via POD into spatial modes and scenario-specific coefficients
2. Initial POD coefficients are estimated from earthquake parameters
3. As DART data arrives, Bayesian updating (following Nomura et al. 2022, Fujita et al. 2024) refines the coefficients
4. The Bayesian framework naturally provides uncertainty bounds that narrow with more data
5. Powerful for dense sensor networks (Japan); broader posteriors for sparse networks (Pacific DART)

**Phase 4 — Latent-Space Ensemble Filtering**

The Georgia Tech Latent-EnSF approach (ICLR 2025) uses a machine learning encoder to compress the high-dimensional wave field state into a compact latent space where the ensemble Kalman filter operates more efficiently. This reduces the computational cost of assimilation and is particularly valuable when the model state is high-dimensional (millions of ocean grid points).

### Assimilation Timeline During an Event

| Time Post-EQ | Data Available | Assimilation Action | Prediction State |
|-------------|---------------|-------------------|-----------------|
| 0–10 sec | Phone accelerometers | None — detect shaking, estimate local intensity | No wave prediction yet |
| 10–60 sec | ShakeAlert P-wave alert | Initialize propagation model with preliminary source estimate | Rough — estimated magnitude/location |
| 1–2 min | USGS preliminary parameters | Re-initialize propagation model with real parameters | Improved — real magnitude, location, depth |
| 2–3 min | GNSS displacement data | Refine source: actual ground displacement constrains slip distribution | Good source estimate → good initial wave field |
| 3–5 min | First DART reports (12–20 points per buoy) | First assimilation cycle: correct wave field at DART locations | First observationally validated prediction |
| 5–10 min | USGS finite fault, extended DART series | Re-initialize with detailed slip, continued assimilation | High confidence for first wave |
| 10–20 min | Dense DART time series, possibly first nearshore observations | Full assimilation, multi-wave train becoming apparent in data | Highest pre-arrival accuracy |
| 20–60 min | Tide gauge data from first wave arrival | Validate nearshore response, update subsequent wave predictions | Observationally confirmed, updating for wave 2+ |
| 1–6 hours | Full wave train observations at multiple sensors | Continuous assimilation, predicting remaining waves and reflections | Continuously improving |

### Handling Sensor Gaps

**No DART buoys in the region (Caribbean, Africa, most of Indian Ocean):**
- Propagation model runs from earthquake parameters alone, no open-ocean correction
- First observational data comes from coastal tide gauges — by which time the wave is arriving
- Conservative defaults: widen uncertainty bounds, present worst plausible case

**DART buoy damaged or reporting anomalous data:**
- Quality control: reject readings that change by >1m between consecutive 15-second samples (physically impossible for a real tsunami signal)
- Exclude anomalous buoys from assimilation, proceed with remaining sensors

**Conflicting observations (different sensors imply contradictory wave characteristics):**
- Usually indicates complex source geometry (multiple fault segments rupturing sequentially, triggered submarine landslide) or sensor issues
- Present the more dangerous interpretation to users
- Widen uncertainty bounds, flag for human review at warning centers

---

## Scenario Library: Supporting Infrastructure

The precomputed scenario library remains essential but its role is now supporting infrastructure rather than the real-time prediction system.

### Role 1: Training Data for the Propagation Neural Operator

The operator needs thousands of examples of "initial deformation → wave evolution" to learn the shallow water physics. Each scenario contributes:
- The initial seafloor deformation field (input)
- The full spatiotemporal wave field evolution (target output)
- Wave time series at virtual gauge locations (for validating sensor assimilation)

### Role 2: Source Data for the Nearshore Response Database

The scenario library's nearshore simulations inform the boundary-condition parameterization. By analyzing what wave characteristics actually arrive at the offshore boundary across thousands of source scenarios, the system learns the realistic ranges and correlations of boundary parameters — which combinations actually occur for each coastal region.

### Role 3: Fallback Prediction System

If the neural operator fails or is unavailable, the system falls back to direct scenario matching:
1. Match earthquake parameters to closest library scenarios
2. Weight scenarios by DART data if available
3. Serve the weighted ensemble of precomputed inundation maps

Less capable than the full system (no true real-time propagation, no multi-wave state tracking) but ensures the system never fails completely.

### Role 4: Validation Benchmark

Every improvement to the neural operator or nearshore response database is validated against the full-physics scenario library. If the learned system can't reproduce what HySEA/GeoClaw computed, it's not ready for deployment.

### Generation Specifications

**Simulation engine:** Tsunami-HySEA (GPU) primary, GeoClaw (CPU) fallback

**Stochastic source model:** von Kármán autocorrelation slip distributions following Goda et al. (2016) scaling relationships, with fault geometry from USGS Slab2.0. Per scenario: stochastically varied slip distribution, hypocenter, rupture velocity, rake. Each slip distribution checked against physical acceptance criteria (asperity locations consistent with coupled zone, moment consistent with target magnitude).

**Scenarios per subduction zone:** ~5,000–8,000 (200–500 per magnitude bin across Mw 7.0–9.2)

**Why this many:** Slip distribution is a ~260-dimensional space (each subfault's slip value). Scenarios aren't perturbations of each other — they represent fundamentally different events. Concentrated slip off Oregon produces a 20m wave at Newport; uniform slip produces 8m everywhere; a two-patch scenario creates interference patterns. Sampling density enables reliable interpolation and robust neural operator training.

**Simulation configuration per scenario:**
- Domain: basin-scale for open-ocean propagation, nested grids for nearshore
- Base grid: ~1 arc-minute (~1.8 km) open ocean
- Nested grids: 30 arc-seconds (~900m) continental shelf, 6 arc-seconds (~180m) nearshore, 1 arc-second (~30m) inundation zones, 1/3 arc-second (~10m) where LiDAR available from Atlas
- Duration: 2–6 hours (full wave train)
- Bathymetry: GEBCO 2023 global, NOAA coastal relief DEMs for US nearshore
- Co-seismic deformation: Okada model from stochastic slip distribution

**Outputs stored per scenario:**
- Maximum inundation depth and velocity at every coastal grid cell
- Wave arrival time (first 0.2m exceedance)
- Time series at 100–500 virtual offshore gauges (50–5,000m depth)
- Initial seafloor deformation field

**Compute budget:** ~1,000–5,000 GPU-hours per zone. On a 32-GPU cluster: 1–6 days per zone. Cloud cost: ~$2,000–$10,000 per zone.

**Priority zones:**

| Zone | Why First | Warning Window | Sensor Coverage |
|------|-----------|---------------|-----------------|
| Cascadia (Pacific NW) | Largest US local tsunami risk | 15–25 min | DART buoys offshore, limited coastal |
| Alaska-Aleutian | Threatens Hawaii and West Coast | 4–5 hr | Good DART coverage |
| Caribbean | Puerto Rico, USVI at risk | 5–20 min | Sparse — few DART buoys |
| Nankai Trough (Japan) | Expansion; densest sensors globally | 5–30 min | S-net, DONET, 150+ stations |
| South America | Pacific-wide threat | Variable | Moderate DART coverage |

---

## Implementation Phases

### Phase 1: Detection + Parametric Alerts (No ML)

Ship a life-saving alerting system with no ML dependency.

- USGS Earthquake API monitoring (continuous)
- ShakeAlert integration (US West Coast)
- Submarine earthquake detection (Natural Earth land polygon check)
- Magnitude-tiered elevation threshold alerts:
  - M7.0–7.4 → Watch
  - M7.5–8.0 → Alert below 15m within 1km of coast
  - M8.0–8.5 → Alert below 20m within 2km
  - M8.5–9.0+ → Alert below 30m within 3km
- Arrival time via deep-water wave speed: √(gh) × great-circle distance
- Alert delivery with user's elevation from cached Atlas DEM

**What users get:** "Tsunami warning. Estimated arrival 22 minutes. You are at 8m elevation. Move to higher ground." No inundation map, conservative thresholds. Fast, simple, saves lives.

### Phase 2: Scenario Library + Ensemble Matching + Nearshore Database

Add real inundation prediction via precomputed physics.

- Acquire and process bathymetry/topography for Cascadia region
- Set up Tsunami-HySEA on GPU infrastructure
- Implement stochastic source generation pipeline
- Generate ~5,000–8,000 scenarios for Cascadia
- Extract offshore boundary conditions from all scenarios to design the nearshore parameterization
- Generate nearshore response database (~5,000–10,000 boundary-forcing simulations)
- Build scenario matching system: earthquake params → top-N scenarios, weighted by similarity
- Build DART buoy data ingestion and tidal correction pipeline
- Implement Bayesian scenario weighting from DART observations
- Build nearshore lookup and interpolation engine
- Implement multi-wave sequencing logic (track coastal state between waves, re-query library)
- Validate against historical events (replay 2011 Tohoku, 2010 Chile DART data)
- Repeat for Alaska-Aleutian, Caribbean

**What users get:** Actual inundation depth map showing where water will reach and how deep, continuously refining as DART data arrives. Multi-wave predictions updated as the event unfolds.

### Phase 3: Learned Propagation Model + Sensor Assimilation

Replace scenario matching with real-time learned physics.

- Train PI-DeepONet on combined scenario library (all zones) for open-ocean propagation
- Validate propagation model against held-out scenarios AND historical DART records
- Implement state-correction assimilation (ensemble Kalman filter on the wave field state)
- Build GNSS displacement integration for real-time source refinement
- Connect propagation model output → nearshore response database input (automated boundary extraction)
- Implement continuous multi-wave tracking (propagation model maintains full ocean state)
- Build coastal tide gauge integration for nearshore validation
- Implement uncertainty quantification: ensemble spread at offshore boundary → confidence intervals on inundation depth
- Deploy propagation model on GPU server for real-time inference
- Retain scenario matching as automatic fallback

**What users get:** Same inundation predictions but faster (seconds instead of scenario-search time), more accurate (real-time physics instead of nearest-neighbor matching), with uncertainty bounds that narrow as data arrives. Far-field tsunamis from any source handled seamlessly.

### Phase 4: Full Learned Simulation + Global Expansion

Extend learned physics into the nearshore. Global coverage.

- Develop neural operator for nearshore regime (research frontier — handle nonlinear wetting/drying, wave breaking, structural interaction at meter-scale resolution)
- If successful: replace nearshore response database with real-time learned nearshore model, eliminating precomputation for new coastlines entirely
- If not yet reliable: retain hybrid architecture, continue improving
- Implement Latent-EnSF for efficient high-dimensional assimilation
- Expand to all global subduction zones
- Handle compound sources: earthquake + submarine landslide, volcanic flank collapse
- Handle non-seismic tsunamis: meteotsunamis, caldera collapse
- Integrate SMART cable data when available
- Partner with national tsunami warning centers for operational integration

**What users get:** Coverage of any coastline in the world. Predictions for novel event types not anticipated by the scenario library. Fully continuous simulation that tracks the tsunami lifecycle from source to inundation in real time.

---

## Deployment Architecture

| Component | Server | Phone (cached) | Phone (live) |
|-----------|--------|----------------|-------------|
| Propagation neural operator | GPU inference | No | Receives boundary predictions |
| Nearshore response database | Stored & indexed | Compressed local subset | Downloads during event |
| Scenario library (raw) | Stored for fallback | No (too large) | No |
| Scenario matching fallback | Yes | Simplified version (1–5 MB) | Receives updates |
| DART data ingestion | Yes | No | No |
| Assimilation engine | Yes | No | No |
| POD spatial modes for nearshore reconstruction | Yes | Yes (5–10 MB) | Receives refined coefficients |
| Earthquake parameter monitoring | Yes | Accelerometer fallback | Receives alerts |
| Local DEM for elevation lookup | Atlas tiles cached | Yes | Offline capable |

---

## Open Questions

**Partial-to-full rupture cascade:** A Cascadia earthquake might nucleate as an M8.0 on the southern segment and cascade to M9.0+ over 2–4 minutes. The wave generated by the initial rupture is already propagating while the fault is still breaking. The propagation model can handle this (re-initialize additional deformation onto the already-propagating wave field), but the nearshore response database needs to account for wave trains generated by a time-dependent source, not an instantaneous one.

**Bathymetry changes during the event:** Major earthquakes permanently alter the seafloor and coast. The 2011 Tohoku earthquake moved the seafloor ~50m horizontally and ~10m vertically. Co-seismic deformation models approximate this, but the actual post-earthquake bathymetry differs from the pre-event data the models were built on. The nearshore response database parameterizes deformation as an input, but only for known faults with pre-computed deformation scenarios.

**Validating for unprecedented events:** The last full Cascadia rupture was in 1700. Everything is trained/computed from synthetic scenarios, not observed data. Validation is inherently limited to comparing against physics models (themselves unvalidated at this scale for this specific geography) and analog events from other subduction zones (2011 Tohoku, 2004 Indian Ocean). The physics-informed approach helps — conservation laws must be satisfied regardless — but epistemic uncertainty for the largest events remains significant.

**Nearshore boundary matching:** The handoff from propagation model to nearshore response database occurs at the offshore boundary arc. The wave characteristics must be represented consistently across this interface. Any mismatch (the propagation model's wave at the boundary doesn't correspond to any parameterization in the nearshore database) degrades the prediction. This is non-trivial for complex wave trains where multiple crests cross the boundary simultaneously.

**Speed vs. accuracy for local events:** For Cascadia, spending more time on a better prediction means fewer seconds of evacuation. The Phase 1 parametric alert (instant) may save more lives than a Phase 3 precision inundation map (30 seconds slower) simply because those 30 seconds are 30 seconds of running. The system should always send the fast conservative alert first and refine it, never delay the initial alert for a better prediction.

**Communicating uncertainty to users:** A prediction of "5–15m inundation" is scientifically honest but operationally unhelpful. The system needs to translate uncertainty into actionable guidance — likely by defaulting to the worst plausible case for evacuation decisions while showing the full range for professional users.
