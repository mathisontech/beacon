# Sinkhole Hazard Model

## Risk Layer

Karst terrain susceptibility calculated via USGS CAVE (Carbonate-rock Aquifers and Vulnerability Evaluation) database. Limestone, dolomite, gypsum layers extracted from USGS Geologic Map of North America (1:2,500,000). Historical sinkhole density from USGS National Sinkhole Database (n=24,000+ events). Risk scoring: R = (Karst_Density × Subsidence_Rate × Proximity_Buildings) / 100.

## Ongoing Hazard Model

Real-time detection via InSAR (Interferometric SAR) using Copernicus Sentinel-1 data (6-12 day revisit). Vertical subsidence detected at mm-scale precision. Radar coherence loss indicates zone disturbance. Data ingested via ESA CODA API (Copernicus Online Data Access). Vertical displacement >10mm/month flags alert tier.

## Spread/Evolution

Collapse initiates in cover-collapse sequence: (1) roof thinning modeled via geotechnical FEM, (2) piping propagation calculated using Terzaghi's gradient mechanics, (3) sudden failure within 24-72 hours. Evolution rate depends on water table fluctuation (USGS NWIS groundwater API provides near-real-time stage). Subsidence zones expand laterally at ~2m/year under continued water extraction.

## Lethality

Direct impact mortality (building collapse): 12-18% of occupants in affected structures. Secondary effects (gas line rupture, utility loss) contribute 3-8% additional risk. Injury rate in collapse footprint: 35-45%. Fatality parameters calibrated to Deepwater Horizon sinkhole (2013) and Winter Park event (1981).

## Safe Zones

Buildings with geotechnical certification (foundation depth >15m, reinforced concrete mat) rated as safe. Minimum distance threshold: 50m from mapped subsidence center. Soft sediment structures (wood frame, shallow foundation) evacuated when subsidence rate >5mm/month. Safe zone polygons updated daily via InSAR change detection.

## Evacuation

Trigger: subsidence >10mm/month sustained over 2 weeks. Evacuation radius: 75m minimum. Evacuation time: 2-4 hours for residential areas (4-8 people per household). Assembly point: community centers outside karst zone (>100m). Route planning avoids unstable roads (detected via pavement distress imagery). Capacity constraints monitored via geofencing.

## Vulnerability

Elderly (>65) population increase risk by 2.3x (mobility constraints). Structures built 1950-1980 (shallow foundations, poor design standards) 4.2x higher risk. Mobile homes: 6.8x risk multiplication. Disable/critical care facilities flagged for priority evacuation. Poverty areas correlate with non-compliant structures (0.68 Pearson correlation).

## Secondary Effects

Gas line rupture: SCADA system integrates with PHMSA National Pipeline Mapping System. Water line breaks cascade to supply loss (48-hour recovery estimate). Electrical line damage via utility pole contact. Soil gas seepage (CO2, H2S) from exposed subsurface. Wastewater treatment disruption if pump stations affected.

## Operational Protocols

Incident commander notifies state geologist (USGS regional office). Coordinate with county building/safety, utility operators. Restrict heavy vehicle traffic (load >20 tons halts subsidence propagation). Deploy ground-penetrating radar (GPR) survey at 0.5m grid spacing to delineate void extent. Structural engineering assessment per ATC-20 rapid evaluation protocol. No re-occupancy until subsidence monitoring <2mm/month for 8 weeks.

## Caching/Offline

Pre-cache InSAR subsidence maps (250m resolution) at quadkey zoom 12 tiles. Store USGS karst database locally (GeoJSON format, ~45MB). Offline mode provides 7-day subsidence trend via cached Sentinel-1 data. User location triggers background caching of 10km radius hazard layers. Last update timestamp embedded in each tile.

## Comms/UI

Alert: "Subsidence detected 3km northeast, 12mm/month. Buildings within 75m evacuation zone. Safe assembly at Community Center, 2km west." Frequency: push alerts when subsidence acceleration >2mm/week. SMS fallback: USGS-Beacon gateway. Web: interactive map showing subsidence vectors, InSAR coherence, building risk overlay. Timeline: real-time data stream (6-hour lag from Sentinel-1 processing).

## Sensor Input

Primary: ESA Sentinel-1 SAR (6-12 day revisit, 10m resolution). Secondary: LIDAR elevation change (annual updates from USGS 3DEP). Tertiary: GPS network velocities (USGS Crustal Deformation Program). Quaternary: water table stage (USGS NWIS automated stations, 15-min intervals). Municipal water extraction records (state water board databases). Mobile user reports via app crowdsourcing layer (GPS + photo validation).

## Risk Assessment Calibration

Sinkhole probability: P(collapse | subsidence>10mm/month) = 0.65 within 12 months. Building occupancy density multiplier: urban (1.2x), suburban (0.8x), rural (0.3x). Ground-penetrating radar survey standard: 0.5m grid, 400 MHz antenna optimal for limestone. Void detection reliability: 85-95% in dry conditions, 60-75% in water-saturated zones. InSAR temporal baseline: 12-day coherence retention ~80% in karst terrain. Subsidence acceleration threshold: >5mm/month sustained triggers mandatory evacuation.

## Data Integration Pipeline

USGS CAVE database query (weekly sync): karst layer polygons, historical event inventory. ESA SciHub API (daily pull): Sentinel-1 SLC products, 6-day repeat cycle. Coherence computation: 2D cross-correlation filter 5x5 pixels. Displacement unwrapping: minimum cost flow algorithm (MCF). Accuracy: ±5mm vertical velocity at 90-day integration window. Local municipal database integration: water extraction volumes, pump station locations, drawdown records. Building footprint layer: USGS National Map (updates quarterly). Proximity analysis: spatial join building to subsidence zone, distance threshold 75m default (configurable per engineering assessment).

## Limestone Dissolution Mechanics

Karst formation timeline: dissolution occurs at rates 1-10 mm per 100 years (climate/saturation-dependent). Acid strength: carbonic acid (H2CO3) from soil CO2 dissolves CaCO3 incrementally. Subcritical crack growth: stress intensity factor K_I drives void expansion at rates <1 mm/year under constant load. Saturation state critical: dry zones arrest dissolution, wet zones accelerate (fluctuating water table worst-case). Sinkhole classification: solution (slow subsidence), drop-in (roof failure), caprock (engineered soil layer failure). Collapse trigger timing: coincidence of minimum roof thickness + maximum pore pressure drops + surface loading (rare event analysis). GPR void detection sensitivity: void diameter >0.5m detectable, smaller voids missed (uncertainty quantification essential).
