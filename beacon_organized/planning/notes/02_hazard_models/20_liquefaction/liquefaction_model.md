# Liquefaction Hazard Model

## Risk Layer

Zhu et al. 2017 probabilistic model implemented at 1km grid. Liquefaction Potential Index (LPI) calculated: LPI = ∑(F × w(z)) where F = liquefaction factor per depth layer, w(z) = weighting function decaying from surface. Base data: USGS National Seismic Hazard Maps (NSHM), Vs30 velocity model (1000m resolution). Bayesian update with historical liquefaction events (CalEarthquake Database: n=340+ mapped events). Risk categories: None (LPI<5), Low (5-15), Moderate (15-30), High (>30).

## Ongoing Hazard Model

Real-time seismic moment tensor inversion via USGS Earthquake Hazards Program API. Triggered when Mw>4.5 within 150km. PGA (peak ground acceleration) predicted using Abrahamson et al. 2014 GMPE (ground motion prediction equation). PEER Next Generation Attenuation Database provides station-specific site response factors. Liquefaction triggering threshold: cyclic stress ratio (CSR) = (τ_max / σ'_v0) × (amax/g) × rd where rd = depth reduction factor, amax = peak acceleration.

## Spread/Evolution

Initial triggers: cyclic pore pressure generation over 10-30 seconds strong motion. Pore pressure builds as: Δu(t) = u_initial × (1 - exp(-t/τ)) where τ = 15-25 seconds for medium-dense sand. Excess pore pressure ratio reaches critical (r_u = 1.0) when shear strength = 0. Lateral spread develops on slopes >3 degrees at rate 1-5m over 30-60 seconds. Ground fissures propagate perpendicular to slope direction (empirical orientation distribution 67% perpendicular).

## Lethality

Direct collapse from bearing capacity failure: 8-15% occupancy mortality in residential buildings. Differential settlement >0.5m causes structural instability (20% additional collapse risk). Pipeline rupture fatalities: 1-3% if gas line fractures. Flood inundation (from broken water/levee systems) adds 5-12% if near waterbody. Historical (1995 Kobe): 6,500 deaths from liquefaction + fire spread. Calibrated injury rate: 18-25% of affected population.

## Safe Zones

Non-liquefiable bedrock (LPI=0): Mw>9 safety guaranteed. LPI<5 zones: safe if building design factor ≥1.5. Isolated concrete foundations on caissons or pilings (driven to non-liquefiable layer) rated safe. Elevation >50m above water table reduces risk by 85%. Buildings with dynamic isolation systems (friction pendulum, elastomeric bearers) maintain functionality post-event. Soil stabilization (grouting, stone columns) locally reduces LPI by 10-30%.

## Evacuation

Pre-event: relocate from LPI>20 zones in Mw≥7 forecast windows (72-hour notice). Post-event (Mw>6): 6-hour evacuation window before aftershock triggering. Evacuation radius: 500m from mapped liquefaction zones. Evacuation pace: 1.5 km/hour (accounting for damaged infrastructure). Assembly points: elevated ground (>5m relief). Capacity: 25-50 people per safe zone hectare. Route hazards: ground fissures (0.5-2m width), differential settlement, lateral spread scarps (0.2-1.5m height).

## Vulnerability

Elderly population: 2.1x risk (mobility + pre-existing structural vulnerability). Unreinforced masonry: 8.5x collapse risk vs. modern code. Manufactured housing on grade: 12x risk (no pilings). Buildings with poor soil conditions (e.g., bay fill, recent reclamation) 15-40x higher hazard. Critical facilities (hospitals, fire stations) in LPI>15 zones: 45% functional loss post-event.

## Secondary Effects

Water system failure cascades: pumping station collapse → 7-14 day supply loss (500k-person impact). Gas line ruptures ignite fires (30-40% probability if NG lines break). Electrical transmission tower foundering → regional blackouts (2-4 week recovery). Wastewater treatment fails if activated sludge basins crack. Bridge spans on liquefiable abutments: $50-200M repair costs, 6-18 month closure. Port facilities: $5-15B loss if wharves liquefy.

## Operational Protocols

Mw>6 event: activate USGS Rapid Earthquake Damage Estimation (REDE) system. Deploy structural engineers (ATC-20 certification) to survey tier-1 buildings within 24 hours. Coordinate with state geologist for soil liquefaction mapping updates. Use drone LiDAR to quantify differential settlement. Implement traffic restrictions on bridges (LPI>15) until geotechnical clearance. Establish temporary housing for displaced populations (est. 2-5% of footprint). No re-occupancy without engineer sign-off.

## Caching/Offline

Pre-cache Vs30 velocity model at 1km tiles covering entire service area. Store Zhu et al. coefficient lookup tables locally (JSON, 8MB). Cache Abrahamson et al. 2014 GMPE equation coefficients. Offline mode provides 14-day historical seismicity (USGS ComCat API daily snapshots). Background tiles at zoom 11-14 covering high-risk LPI zones. Timestamp all cached data; refresh on network recovery.

## Comms/UI

Alert (Mw6.5, 40km epicenter): "Major earthquake detected. Liquefaction risk HIGH in downtown area. Evacuate now. Safe zone: Central Park, 3km northwest." Push every 15-30 min during mainshock + 12-hour window. SMS gateway: state seismic network coordination. Web: real-time seismic shaking map (ShakeCast), LPI hazard overlay, building-level damage predictions. Voice: automated warning system (IPAWS integration, 8-language support).

## Sensor Input

Primary: USGS Earthquake Hazards Program seismic network (700+ stations, real-time). Secondary: strong-motion accelerometers (ShakeMaps, 10-30 second latency). Tertiary: USGS Vs30 velocity model from borehole/inversion database. Quaternary: geological maps showing Holocene liquefaction features (state surveys). App crowdsourcing: user-reported ground fissures, settlement observations (geotagged photos). Post-event: drone LiDAR for quantifying lateral spread extent.

## Probabilistic Assessment Framework

Annual probability of Mw7+ earthquake: 1-5% depending on region (Coulomb stress modeling). Conditional probability of LPI>20 at epicentral distance 30km: 45-65%. Liquefaction given strong motion (PGA>0.3g): 0.78 Bayesian posterior. Bayesian updating post-event: re-estimate parameters from observed damage patterns. Return period analysis: 475-year event corresponds to 10% probability exceedance in 50 years. Monte Carlo simulation: 10k event scenarios per polygon annually. Uncertainty quantification: spatial aleatory (soil variability) 15-30%, epistemic (model uncertainty) 20-40%.

## Zhu et al. 2017 Implementation

LPI formula expanded: LPI = ∫[0 to 20m depth] F(z) × w(z) dz. F(z) calculation from Vs30, SPT N-value, fines content via regression coefficients. Weighting function w(z) = exp(-0.02z) emphasizes shallow liquefaction. Bayesian network structure: (Magnitude) → (PGA) → (CSR) → (CRR) → (LPI). Prior distributions: Vs30 from Wills et al. (2000) California velocity classes. Update with borehole data when available (typically 1-5 per square km). Soil stiffness degradation: γ_cyc = γ_ref × (σ'/σ'_ref)^(-0.3) × (N_cyc)^(-0.1).

## Cascading Failure Modeling

Initial liquefaction zone propagation (0-10 seconds): excess pore pressure diffusion via Terzaghi equation. Lateral spread initiation (10-30 seconds): slope stability analysis LEM (limit equilibrium method) vs. FEM. Ground bridge integrity: intact soil islands between fissures support adjacent buildings temporarily. Bridge abutment settlement >0.5m triggers emergency closure. Port wharves: bearing capacity loss correlated with liquefaction depth integration (deeper deposits more critical). Critical infrastructure consequence matrix: hospital loss → surge capacity, fire station loss → response time +15 min, water treatment loss → supply deficit 1.5M gallons/day per facility.
