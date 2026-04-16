# Infrastructure Failure Hazard Model

## Risk Layer

National Bridge Inventory (NBI) database: 615,000 structures assessed on 0-9 condition rating scale. Condition rating C = 100 - (age_factor × deterioration_rate × load_multiplier). Critical thresholds: rating <4 (poor), <2 (critical). Building age correlation: constructed pre-1980 (non-ductile concrete 8.2x higher failure rate vs. modern code). Material risk: cast iron water pipes (100+ years old, 15-30 breaks/100km/year), wooden structures (fire risk). Utility infrastructure: natural gas mains (40+ year lifespan, 35% failure rate). Composite risk: R = (Age_Factor × Material_Risk × Traffic_Load × Inspection_Grade) / 100.

## Ongoing Hazard Model

ASCE Infrastructure Report Card grades track facility conditions (GPA system: A=excellent, D=poor). Real-time inspection data from state DOTs integrated via FHWA database (daily updates). NBI ratings refreshed every 2 years; trend analysis identifies deterioration. Building permit/code violation records from municipal databases. Water system SCADA (Supervisory Control and Data Acquisition) monitors pipe pressure (drops indicate leaks/breaks, <50 psi alert). Natural gas SCADA: pressure >20% deviation flags problem. Electrical grid: NERC real-time network model monitors generator/transmission status. Structural health monitoring (SHM) accelerometers deployed on critical bridges (10-50 sensors, 10 Hz sampling).

## Spread/Evolution

Bridge failure cascade: initial girder cracking (months-scale), progressive spalling (weeks), support corrosion (years), sudden collapse (minutes). Failure timeline: critical condition detected (alert), 1-4 week window to closure, 3-8 month repair. Water main failure: break ruptures at weak point, pressure surge propagates 0.5-1.5 km/min, secondary breaks trigger within 6-24 hours. Gas line rupture: overpressure jet ignites if combustible vapors present, flame propagation 100-200 m/s. Electrical line collapse: arc flash creates secondary fires, power restoration 4-12 hours. Building progressive collapse: initial local failure initiates domino effect (pancaking), full collapse 5-30 seconds.

## Lethality

Bridge collapse: 15-30 fatalities per event (loaded span failure). Mortality rate: 80% of occupants in direct collapse zone. Water system failure: disease outbreak potential (contamination), 1-5 deaths per 100,000 exposed in severe outbreaks. Gas explosion: 50-200 fatalities in dense urban block (Camby, MI 2009 event: 1 death, 80+ injuries). Electrical line electrocution: 4,000 deaths/year (USA). Building collapse fatality rate: 30-50% of trapped occupants, rescue extraction 10-30 min/person. Secondary effects (fire, flooding) add 10-25% mortality multiplier.

## Safe Zones

Structures post-1990 with seismic retrofit: 95% safety confidence. NBI rated 6-9 (good to excellent): safe occupancy. Modern concrete (proper reinforcement, adequate cover): 99% structural safety. Buildings with active SHM and green-light ratings: monitored safety. Open-span infrastructure away from structure zones (parks, plazas). Redundant utility design (dual gas mains, looped water supply): 98% continuity. Bridges with regular inspection (<2 year intervals) rated green. Newer electrical distribution (underground, insulted): low failure rate.

## Evacuation

Condition rating <3 trigger: post advisory, restrict vehicle weight/speed. Rating <2 critical: closure ordered, alternate routes established (4-24 hour timeline). Evacuation radius: 100-200m around failing bridge/structure. Water main break: boil-water order issued, bottled water distribution (72-hour procurement). Gas system pressure loss: customer shutoff, evacuation 200m radius, repair 1-3 weeks. Building damage assessment per ATC-20 (Rapid Building Safety Evaluation): yellow (caution), red (unsafe). Displaced residents: temporary housing coordination (24-48 hour window). Work schedule: 6-day 12-hour work week during emergency repairs.

## Vulnerability

Elderly/disabled in evacuation: 2.3x longer clearance time (transport constraints). Healthcare facilities on aging infrastructure: patient dependency critical (ICU, dialysis). Low-income neighborhoods: deferred maintenance higher, failure risk 1.8x. Schools built 1950-1980: 3.2x pre-code non-compliance. Critical infrastructure co-location (power + water at same bridge): single-point-of-failure risk. Immigrant communities: language barriers reduce evacuation comprehension (20-30% slower response). People with mobility limitations: 1.5-2x hours longer evacuation time.

## Secondary Effects

Cascading outages: bridge failure disrupts traffic, emergency response times increase 30-60%. Hospital power loss: backup generators provide 3-7 day capacity; long outages force patient evacuation. Water supply loss impacts 500k-2M person populations, sanitation collapse (disease vector increase 5-10x). Gas system rupture ignites secondary fires (property damage $10-200M, evacuation radius 400m+). Electrical grid instability: supply/demand imbalance triggers rolling blackouts (2-4 week recovery). Economic: construction delays, commerce interruption, insurance claims backlogs.

## Operational Protocols

Condition rating <4: schedule inspection within 90 days. Rating <3: declare structural monitoring requirement (quarterly inspections minimum). Rating <2 critical: issue closure order immediately, coordinate engineering assessment. Deploy structural engineer (PE-licensed) within 24-48 hours. Establish repair contract/timeline (days for emergency, weeks/months for major). Traffic management: lane closures, speed reductions, weight restrictions. Public notification: media briefing, website updates, push alerts. Utility coordination: mark lines, coordinate shutdown if necessary. Post-repair: load testing, inspection sign-off (ATC-20 clearance). Documentation: update NBI/permit records.

## Caching/Offline

Pre-cache National Bridge Inventory (615k structures, GeoJSON, 50MB). Store building permit databases (city-level, 200-500MB per major city). Cache ASCE infrastructure ratings (grades and recommendations). Offline mode provides 1-year inspection history for critical facilities. Pre-cache ATC-20 rapid evaluation guidelines (reference document). Store utility infrastructure maps (gas, water, electrical networks, 30-50MB). Cache structural assessment coefficients/formulas. Background tiles: bridges, water mains, gas lines, power transmission (zoom 12-16). Timestamp inspection data; refresh weekly.

## Comms/UI

Alert (NBI <3): "Critical infrastructure alert: Interstate 80 Bridge north span rated POOR. Inspection required within 60 days. Structural assessment underway. No immediate closure planned. Monitor for updates." Push: triggered by condition rating change, weekly reminder during critical status. SMS: "Bridge alert I-80 north. Condition poor, inspections ongoing. Use I-40 alternate." Web: interactive infrastructure map showing NBI condition ratings (color-coded: green 6-9, yellow 4-5, red <4), inspection history timeline, repair timeline, traffic impacts. Building-level risk scores. Inspection report PDFs (public documents). Voice: municipal hotline (311 or city engineer).

## Sensor Input

Primary: National Bridge Inventory (FHWA database, 2-year refresh). Secondary: Building permits/code violations (municipal databases). Tertiary: SCADA systems (utilities: water, gas, electrical pressure/flow). Quaternary: Structural Health Monitoring (accelerometers on critical bridges, 10 Hz). Quinary: ASCE infrastructure ratings/reports (biennial). Mobile: citizen damage reports (photos, geotagged). Drone LiDAR: condition assessment (annual/post-event acquisition). Inspection reports (licensed engineers, quarterly minimum critical facilities). Weather data: freeze-thaw cycles, heavy precipitation (triggers inspections). Groundwater: subsidence/uplift monitoring (precision GPS/InSAR).

## Deterioration Rate Modeling

Concrete carbonation: depth growth d = k × √t where k = 0.5-2.0 mm/√year (climate-dependent). Corrosion initiation: Chloride diffusion Cl(x,t) = C_s(1 - erf(x/(2√(D×t)))) (de-icing salt exposure). Cover depassivation: critical chloride content 0.5-2.0% by concrete weight (varies per cement type). Rebar section loss: 20% cross-section loss after 20-30 years (high chloride zones), 5% in low-chloride. Structural capacity reduction: bending strength decreases 15-25% per 20% rebar loss. Load rating updates: NBI recalculation triggers closure at <100% legal load (common in 80+ year structures). Seismic vulnerability: pre-1970 design standards 5-8x higher collapse risk vs. modern code (non-ductile concrete).

## Water Infrastructure Asset Management

Cast iron pipe age distribution: 40% of mains >60 years old (1960s-1970s installation). Break rate correlation: 15-30 breaks per 100km per year in aged systems vs. 1-3 in modern HDPE. Trunk main failures: 200-1000 GPM leak rates (supply loss 0.5-2M gallons/day). Replacement prioritization: criticality scoring = (age × break_rate × service_population) / cost. Trenchless rehabilitation: pipe bursting (replacement without excavation) reduces disruption 80% vs. open-cut. Water loss audit: non-revenue water 20-30% in aged systems (leak + theft), target <10%. Pressure management: reduce system pressure 0.2-0.5 bar decreases break rate 10-15% (wear rate inverse proportional). SCADA optimization: automated valve control reduces surge events (water hammer) 40%.

## Utility Interdependency Cascades

Power grid failure: pumping stations offline → water outages (48-72 hours typical). Gas pressure loss: refrigeration plant offline → food spoilage, medical facility emergency. Water treatment plant flooding: multiple intake/treatment units offline → dual failure risk. Communication tower collapse: cellular backbone disruption → 911/emergency call loss (4-6 hour recovery). Gasoline/diesel supply: fuel depot flooding limits generator refueling (critical facility autonomy 3-5 days). Hospital lifeline interdependency: power + water + data all required simultaneously (single-failure propagation). Recovery resource constraint: 50-100 workers per major failure, shortage in multi-event scenarios. Mutual aid agreements: mutual aid agreements across utility systems enable resource sharing (reduce individual recovery time 30%).

## Probabilistic Life Cycle Assessment

Fragility curves: P(failure | demand) sigmoid function (capacity vs. demand). Demand parameters: load rating based on traffic/seismic, supply parameters from inspection/age. Condition rating to failure probability: rating 3 = 5%, rating 2 = 25%, rating <2 = 60%+ annual probability. Monte Carlo sampling: 10k iterations per structure annually. Time-dependent reliability: probability increases quadratically with age in deterioration phase. Inspection impact: 2-year interval reduces uncertainty 30%, 5-year interval 10%. Maintenance benefit: strategic repair extends life 10-20 years (20-30% cost of replacement). Risk acceptance threshold: municipal tolerance typically 0.5-1.0% annual failure probability per structure.

## Post-Event Response Sequence

Hour 0-6: Incident command activation, emergency assessment (ATC-20 trained inspectors), utility isolation if needed. Hour 6-24: Engineering design (temporary shoring, detour routing), material procurement, equipment mobilization. Day 2-7: Construction begins (emergency contractors pre-qualified), round-the-clock work scheduling. Week 2-4: Major repair progression, structural testing/load tests. Month 2-8: Full reconstruction (complex failures like bridge replacement 6-18 months typical). Reopening: load testing verification, inspection sign-off, public notification (>95% capacity threshold). Final cost: emergency failures $1-5M per event (minor), $5-100M moderate, >$100M major (bridge/building collapse).
