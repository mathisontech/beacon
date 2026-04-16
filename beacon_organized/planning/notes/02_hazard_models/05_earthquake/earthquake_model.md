## Earthquake Hazard Model

### 1. Risk Layer

USGS National Seismic Hazard Map (NSHM 2023) provides 500-year probability of exceeding PGA/Sa(1s) thresholds. Logic tree approach combines 3 fault models + 4 ground motion prediction equations (GMPEs). Mmax per fault: Cascadia Mw 9.0, San Andreas Mw 8.3, Hayward Mw 7.5. Fault slip rates from geodetic (GPS) + paleoseismic (trench) data.

ShakeCast GIS integration: earthquake exposure analysis pre-computed for buildings within 50km of major faults. PGA hazard by zip code (1% PE in 50yr = ~500yr return period) compared to structure design code (ASCE 7-22). Soil-site amplification factor (Vs30 determination from USGS Shear Wave Velocity database). Liquefaction susceptibility (Zhu et al. 2017 logistic regression): P(liquefaction) = 1 / (1 + exp(-(w1×Vs30 + w2×magnitude + w3×depth + w4×fines_content + ... + bias))). Weights: w1 = -0.0012, w2 = 0.247, w3 = 0.0018, w4 = -0.0003.

Building fragility database from USGS: probability of exceeding damage state (slight/moderate/extensive/collapse) vs. spectral acceleration (Sa) at site. Residential wood frame: Sa > 1.2g → 50% collapse probability. Soft-story construction: Sa > 0.8g → 50% collapse probability. Pre-1974 masonry: Sa > 0.5g → 50% collapse probability.

### 2. Ongoing Hazard Model

USGS ShakeAlert Early Earthquake Warning system: M >= 3.0 earthquakes detected within 5-8 seconds of rupture using real-time seismic waveform data (2000+ stations). Hypocenter rapid location via the ElarmS algorithm (3-4 second decision time). Magnitude estimation: Mw from P-wave amplitude + frequency characteristics. Ground motion prediction: attenuation equations applied immediately (GMPE updated with incoming waveforms).

Real-time seismic stations (IRIS/USGS network, continuous data streams). ShakeMaps generated within 1-2 minutes post-rupture containing observed + predicted ground motion (shaking intensity map, 1km grid resolution). USGS Earthquakes Hazards Program API (earthquake.usgs.gov/earthquakes/events): M >= 4.5 events auto-ingested every 10 seconds.

Aftershock forecast via Gutenberg-Richter relationship: log10(N) = a - b×M. b-value = 1.0 (standard), a-value = 5.0-7.0 depending on mainshock size. Aftershock decay: Omori's law t_n = K / (t + c)^p where t = time since mainshock, K = rate constant, c ≈ 0.01 days, p ≈ 1.0. Peak aftershock rate occurs within 1 hour; 90% decay within 30 days.

### 3. Spread/Evolution Model

Ground motion propagation: wave-based approach via finite element method (GPU-accelerated) for high-frequency content (> 1 Hz). Low-frequency body waves handled via ray theory (straight-line rays in average velocity model). Surface wave (Rayleigh/Love) generation at fault rupture zone, particle motion ellipticity varies with depth.

Rupture directivity: unilateral rupture along fault favors along-strike direction. Directivity factor = 1 + (v_rupture / v_shear) × cos(θ) where θ = angle between rupture direction + receiver azimuth. V_rupture ≈ 0.7-0.9 × V_shear (80% of S-wave velocity typical). Maximum directivity amplification = 1.5x at receiver ahead of rupture propagation.

Topographic effects: hilltop amplification (2D ridge scattering) = 1.5-3.0x. Valley de-amplification = 0.5-0.8x. Empirical topographic shaking amplification curves from processed strong-motion networks. Liquefaction triggering: Cyclic Resistance Ratio (CRR) from laboratory testing (500+ test cases) vs. Cyclic Stress Ratio (CSR) from earthquake shaking. Factor of Safety = CRR / CSR. FS < 1.0 indicates liquefaction probability > 50%.

Soil column response: equivalent linear analysis (SHAKE91 or linear equivalent damping) for VS < 2 km/s (soft soils). Nonlinear analysis (FLAC, LS-DYNA) for very soft clays. Site response curves (amplification vs. frequency) vary 1-5x depending on soil type/thickness (soft bay mud = 4-6x amplification at 0.5 Hz, stiff clay = 1.5-2x).

### 4. Lethality Model

PGA lethality thresholds: 0.4g = light injuries begin, 0.8g = widespread serious injuries, 1.5g = life-threatening injuries. Collapse probability model: fragility curve fitting log-normal distribution to survey data (N=10,000+ buildings). Median collapse capacity = Sa(T1) where 50% collapse probability, dispersion β = 0.4-0.6.

Debris impact: structural collapse probability × occupant location × crushing zone extent. Buried occupant estimate: building collapse volume × occupant density × survival space (voids beneath rubble). Dislocation injury: ground displacement from earthquake surface rupture (< 3m typical, San Francisco 1906 = 6m). Falling object hazard from unsecured furniture/equipment (file cabinets, bookcases). Entrapment lethality: trapped occupants require rescue within 72 hours (biological viability); rescue rate 70% if rescuers arrive within 24 hours, 10% after 72 hours.

Fire following earthquake: ruptured gas lines + ignition sources (stove pilots, downed power lines) trigger building fires. Fire-earthquake combined hazard multiplies lethality: 1995 Kobe (M 7.3) → 6,400+ deaths, 50% from fire. Liquefaction-induced foundation failure: differential settlement > 1 ft triggers utility breaks (gas line rupture probability = 0.02 per km of pipeline per 1g PGA).

### 5. Safe Zone Layer

Earthquake-safe zones: open fields > 100m from buildings (collapse risk radius = building height + debris scatter 1.5x height). Structural frame parks (engineered for seismic design). Not safe: under freeway overpasses (collapse risk), next to tall unreinforced masonry, near dams (potential failure). Parking lots: asphalt integrity check required if liquefaction occurred.

Safe building criteria: structure design year >= 1980 (California building code seismic provisions), or post-2000 (modern codes). Soft-story detection flag: ground floor < 50% wall area = unsafe. Unreinforced masonry identification from assessor records. Seismic retrofit status: foundation bolting, cripple wall bracing, soft-story shear walls installed (USGS retrofit database).

Time-dependent safe zone: immediately post-earthquake (< 1 hour), open fields safest (aftershocks may trigger additional collapses). After 24 hours, inspected buildings can be re-occupied if damage < level 2 (moderate). Tsunami check: if earthquake M >= 7.0 + coastal location, tsunami safe zone takes priority over ground-shaking safe zone.

### 6. Evacuation Layer

Evacuation decision framework: M >= 7.0 within 25km → immediate evacuation. Strong shaking (ShakeAlert intensity VI+) → check building safety first, then decide. Damaged buildings (visible cracks, door frame misalignment, non-load-bearing wall collapse) → evacuate immediately. Undamaged buildings in soft-soil zones with liquefaction risk → monitor for progressive settlement.

Evacuation zones: designated safe assembly areas (parks, large parking lots) outside collapse radius. Route selection: avoid bridges (potential failure from liquefaction support loss), use surface streets, prefer elevated terrain (tsunami precaution). Post-earthquake traffic control: traffic lights inoperable (assume 4-way stop), intersection congestion multiplier = 10x, evacuation ETA +200% vs. normal conditions.

Aftershock considerations: continued occupancy of damaged structures risky (aftershock probability = 5-10% chance of M+1 magnitude within 3 days). Temporary shelter staging: community centers, schools outside hazard zones. Medical facility access: hospital triage based on injury severity (life-threatening priority over moderate injuries per START protocol).

### 7. Vulnerability Layer

Hospital patient safety: M >= 6.0 → immobilize critical patients (cardiac, ventilator-dependent) during shaking. Nursing homes/assisted living: evacuation assistance ratio 2 staff per 10 patients, transport time 45-120 minutes. Incarcerated populations: coordinate with facility managers for controlled evacuation vs. in-place sheltering decisions.

Embedded medical devices: pacemakers, implantable defibrillators generally unaffected by earthquakes, but surgical trauma from impacts can cause device dislocation (symptoms: syncope, palpitations, shortness of breath). Dialysis patients: treatment interruption < 1 week feasible if mobile dialysis trucks deployed; > 1 week mortality risk increases.

Schools: earthquake drills mandate 30-second duck-cover-hold protocol. Student injury during earthquake = 0.1-0.3% of student body (Northridge 1994 survey). Elderly (65+) fall-related injury rate = 5-8% in moderate-large earthquakes. Isolated populations (rural, islands): rescue delay 12-48 hours, medical evacuation may not be feasible.

### 8. Secondary Effects

Landslide triggers: slope stability index (Newmark displacement, critical acceleration) via Zhu et al. 2017 framework. Critical acceleration = g × sin(φ) - (friction × cos(φ)) / (seismic_coefficient). If earthquake acceleration > critical_acceleration for sustained duration, landslide probability > 50%. Co-seismic landslides (during earthquake): probability proportional to PGA^2.5. Cascade probability: large earthquake → many landslides → damming of rivers → backup lake → rupture of natural dam. Secondary tsunami generation rare but possible (1964 Alaska M 9.2).

Dam failure risk: hydrodynamic pressure on dam face increases during earthquake. Concrete gravity dam safety margin = (shear_strength - earthquake_shear_stress) / shear_stress. Earth dams: pore pressure ratio increase (Δu/σ0) triggers liquefaction if excess > 0.5. USACE dam inspection post-earthquake mandatory. Failure probability = 0.01-0.05 for aged earth-fill dams in strong shaking zones.

Utility disruption cascades: power outage (transformer failure, transmission line rupture) → water supply failure (pump stations down) → sewage system backup (gravity-fed systems OK). Natural gas system: pipeline breaks at expansions/bends. Rupture probability = 0.005-0.02 per km of pipeline per 1g PGA. Fire-earthquake combined hazard critical in dense urban areas (95% of Kobe fires post-earthquake vs. 5% during shaking).

### 9. Operational Protocols

Event trigger: ShakeAlert intensity VI+ (significant shaking, potential for injuries) OR USGS ShakeMap release within 2 min of M >= 5.0 event. Automatic data capture: earthquake parameters (hypocenter, magnitude, mechanism), ShakeMap grid (1km resolution), building damage estimates (USGS PAGER model predicts casualties + economic loss), aftershock forecast (Omori-law decay extrapolation).

Event coordination: state emergency operations center notified, USGS ShakeCast liaison, SAR (search and rescue) resource activation for M >= 6.5 in populated areas. Disaster declaration triggers federal aid (state governor request). Building damage assessment: USGS ATC-20 protocol (no entry/limited entry/safe) within 72 hours. Casualty tracking: hospital surge capacity monitoring (normal = 80% occupancy; earthquake surge = 300-500% peak demand within 6 hours).

### 10. Caching/Offline

Pre-computed ShakeMap hazard curves (PGA 10%/50%/90% exceedance) for 100km × 100km tiles. Soil-site amplification factors (Vs30) rasterized at 100m resolution. Building fragility curves (residential/commercial/soft-story) lookup tables (500 KB). Liquefaction susceptibility map (Zhu 2017 model coefficients cached). Safe assembly area locations (parks, parking lots) + capacities for 100km tile.

Offline earthquake model: simplify GMPE to 3-parameter attenuation (ln(Sa) = a + b×M - c×log(r)), precompute PGA grid from M/hypocenter input. Aftershock forecast: Omori law lookup table (K, c, p values pre-fit per 50km² region). Battery mode: disable continuous ShakeCast polling, rely on initial ShakeAlert alert only.

### 11. Comms/UI

Shaking intensity map overlay (Modified Mercalli scale: I-V pastel, VI-VII orange, VIII-IX red). PGA/Sa(1s) contour lines with numeric labels. Damage probability pop-up: "Soft-story building, 45% collapse probability at ShakeMap intensity". Aftershock forecast graph: "90% of aftershocks within 20 km; largest probable Mw 6.2; decay to background in 30 days".

Shelter capacity indicator: "Safe Zone: City Park (200m away), 5000-person capacity, 300 occupants reported". Utility status layer: "Power outage extent (gray zone), water service disrupted (red line), gas leaks reported (yellow pins)". Hospital triage status: "Regional Hospital - CRITICAL (100+ patients, 40 beds available)".

### 12. Sensor Input

Phone accelerometer detects earthquake P-wave (low-amplitude, high-frequency) + S-wave (higher amplitude). Acceleration threshold detection: > 0.05g = earthquake detected. Intensity estimation: PGA = sqrt(N^2 + E^2) from 3-axis acceleration integration. GPS error increases during/after earthquake (multipath scattering from building collapse). User manual reports: building damage photos (specify damage type: cracking, tilting, partial collapse), utility damage (gas smell, water spray, downed power line).

Building occupancy crowdsourcing: "How many people in this building?" + "Are they injured?" Shelter registration: "I am sheltering at [location], [number] people with me". Battery drain correlation: sustained 0.3-0.5g shaking for > 1 minute elevates phone temperature 5-10°C, increases power draw 20-30%, useful for shake duration estimation.

