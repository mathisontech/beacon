# Beacon: Organized Project Structure

Reorganized from the original `beacon/` directory. Original files are untouched.

100 markdown files, 163 docx files, 11 prototype codebases.

---

## prototypes/

Working code prototypes and scripts.

| Directory | Description |
|---|---|
| beacon_admin/ | Next.js admin dashboard (Prisma, client management, atlas viewer) |
| beacon_api/ | Hono API server (auth, events, groups, alerts, spatial, realtime) |
| beacon_ems/ | React Native EMS app (Expo, dashboard, dispatch, map) |
| beacon_public/ | React Native public user app (alerts, community, map, status) |
| design_system/ | Shared design tokens, Tailwind config, component library |
| frontend_prototype/ | Early HTML/JSX mockups (login, dashboard, map, emergency feed) |
| wildfire_tracker/ | Full-stack wildfire prototype (FastAPI + React + React Native + ML) |
| tornado_evacuation_viz/ | Tornado evacuation visualization (React + Mapbox) |
| fire_spread_model/ | Fire spread model scripts |
| packages/ | Shared TypeScript types and utilities |
| maps/ | Map data (Lahaina LiDAR reference, note: .laz files not copied) |

---

## planning/

Architectural planning documents, organized by system component.

### System-Level

| Directory | Contents |
|---|---|
| 00_system_overview/ | Master notes (md + docx), module index, original notes transfer, production setup, future features |
| 01_pitch_and_business/ | Pitch deck PDF, presentation text |

### Hazard Models (02_hazard_models/)

| Directory | Contents |
|---|---|
| 00_hazard_framework/ | Standardized 12-module framework, hazard categories, AI surrogates analysis |
| 01_wildfire/ | Rothermel/FARSITE spread, VIIRS/MODIS, ember transport, burn-together groups + chat overview docx |
| 02_flood/ | HEC-RAS hydraulics, NWM, HAND method, flash flood guidance + chat overview docx |
| 03_tsunami/ | MOST/ComMIT propagation, DART buoys, physics-informed neural operators + inundation prediction doc + chat overview docx |
| 04_avalanche/ | SNOWPACK model, RAMMS runout, burial survival curves + chat overview docx |
| 05_earthquake/ | ShakeAlert EEW, GMPEs, Zhu liquefaction, ETAS aftershock forecasting + chat overview docx |
| 06_volcano/ | LAHARZ lahar, Ash3d dispersion, VDAP monitoring, InSAR + chat overview docx |
| 07_landslide/ | Newmark displacement, rainfall thresholds, post-fire debris flow + chat overview docx |
| 08_tornado/ | MDA mesocyclone detection, NEXRAD dual-pol, debris signatures + chat overview docx |
| 09_hurricane/ | NHC forecasts, SLOSH surge, Holland wind profile, compound flooding + chat overview docx |
| 10_winter_storm/ | Sperry-Piltz ice accretion, wind chill, road surface temp models + chat overview docx |
| 11_extreme_heat/ | WBGT, urban heat islands, mortality curves + chat overview docx |
| 12_extreme_cold/ | Wind chill, hypothermia staging, pipe burst risk + chat overview docx |
| 13_dust_storm/ | HRRR visibility, haboob detection, PM10 modeling + chat overview docx |
| 14_drought/ | PDSI, SPI, US Drought Monitor D0-D4 + chat overview docx |
| 15_air_quality/ | AirNow API, HYSPLIT smoke transport, PM2.5 thresholds + chat overview docx |
| 16_hazmat/ | ALOHA dispersion, CAMEO database, ERG distances + chat overview docx |
| 17_power_grid/ | Cascade failure modeling, restoration estimation, medical device dependency + chat overview docx |
| 18_dam_failure/ | Froehlich breach equations, NID data, inundation mapping + chat overview docx |
| 19_sinkhole/ | Karst susceptibility, InSAR subsidence, GPR indicators + chat overview docx |
| 20_liquefaction/ | Zhu et al. 2017 model, Vs30 mapping, PGA triggers + chat overview docx |
| 21_rip_current/ | NOAA forecast model, Lushine Scale, NDBC buoy data + chat overview docx |
| 22_backcountry/ | Multi-hazard overlay, SAR coordination, satellite SOS + chat overview docx |
| 23_amber_alert/ | NCMEC integration, geofenced alerts, LPR network + chat overview docx |
| 24_pandemic/ | SEIR models, wastewater monitoring, HHS Protect capacity + chat overview docx |
| 25_infrastructure_failure/ | NBI bridge ratings, ATC-20 assessment, cascading failures + chat overview docx |

### Data Pipeline (03_data_sources_and_pipeline/)

| Directory | Contents |
|---|---|
| 00_pipeline_overview/ | Master index (00_INDEX.md), tile standards, data source tables |
| 01_global_pipeline/ | Global processors (DEM, OSM, Sentinel-2, HydroSHEDS, coastal/tsunami, volcanic), dev plan |
| 02_national_pipeline/ | US-specific (3DEP LiDAR, NAIP satellite, street view, reference data), overview and architecture |
| 03_per_tile_pipeline/ | WorldCover and NLCD per-tile processing |
| 04_ml_model_training/ | ML model training plan (foundation models, task-specific, cross-modal fusion) |

### Map Layers (04_map_layers/)

| Directory | Contents |
|---|---|
| 00_layer_overview/ | 8 map layer conversation note files (global, source, LiDAR, national, fused, realtime, community, vehicle) |
| 01_terrain_elevation/ | DEM, slope, landcover, traversability, liquefaction, fault lines |
| 02_roads_transportation/ | Roads, lanes, width, gates, bridges, overpasses, transit, barriers, traffic |
| 03_structures_buildings/ | Building attributes, materials, purpose, subcategories, shelter viability |
| 04_hazard_risk/ | All hazard risk layers (earthquake, tornado, tsunami, fire, flood, atmospheric, radiation, traversability, survivability) |
| 05_explosive_hazardous/ | Gas stations, ammo stores, chemical plants, nuclear facilities |
| 06_jurisdictions/ | County, fire, police, utility jurisdictions, city lines, military bases |
| 07_utilities_infrastructure/ | Power lines, gas/water lines, fire hydrants, pools |
| 08_population/ | Population estimation, elderly, children, schools, disabled, time-of-day model |
| 09_imagery/ | Satellite and aerial imagery layers |
| 10_user_reported/ | User reports, pet evacuation, fatalities, sidewalk conditions, avalanche reports |
| 11_event_active/ | Live layers: oxygen, visibility, weather, "in the black", confirmed evac routes, fire alarm |
| 12_hydrology/ | Rivers, lakes, streams, dams, levees, watershed boundaries, gauge heights |

### Other Modules

| Directory | Contents |
|---|---|
| 05_cv_ml_systems/ | Map processing pipeline, CV model requirements, validation metrics |
| 06_atlas_base_map/ | Atlas architecture (3 docs), global base module, multi-source fusion |
| 07_sensor_systems/ | Sensor module architecture, polling tiers, flag tables, 35 trigger docs + 35 legal releases |
| 08_public_user_features/ | All public-facing features (groups, shelters, animal rescue, reporting, face ID, etc.) |
| 09_public_groups/ | Group creation, admin, parent-community, neighborhood groups |
| 10_ems_client_groups/ | EMS capabilities, dispatch, mutual aid, zone management |
| 11_special_designations/ | Invite codes, per-designation workflows (school, utility, plower, ski patrol, etc.) |
| 12_evacuation_management/ | Exodus overview, evacuation logic, UWB guidance, shelter-in-place |
| 13_mesh_networking/ | Delta encoding, DL compression, priority ordering, Starlink integration |
| 14_accounts_and_auth/ | Account types, special designations, Face ID, background checks |
| 15_contacts_stakeholder_db/ | Pre-registered reps, landowner contacts, bus companies, school reps |
| 16_vehicle_manager/ | Vehicle database, snow tires, ATVs, clearance specs |
| 17_notifications_alerts/ | Push notifications, alert priorities, multi-channel delivery |
| 18_ski_resort_module/ | Run mapping, avalanche risk, snowpack, ski patrol features |
| 19_normal_weather/ | Forecasts, simulator, watch/warning transitions |
| 20_street_level_perception/ | LiDAR-to-street reprojection, phone camera change detection |
| 21_beacon_world_model/ | Human intelligence vs LLMs, pack hierarchy, goal-engine architecture |
| 22_modeling_simulation/ | Server + compressed on-phone models, scenario running |

### Cross-Cutting Concerns

| Directory | Contents |
|---|---|
| 30_cybersecurity/ | CMMC Level 2, FedRAMP path, AES-256/TLS 1.3, zero trust, mesh security, SOC 2 Type II |
| 31_legal/ | Anthropic supply chain risk, FEMA contracts, Good Samaritan liability, CCPA + 35 sensor legal releases |
| 32_operating_system/ | React Native/Expo, iOS vs Android parity, background processing, Core ML vs TFLite, battery mgmt |
| 33_agentic_planners/ | LangGraph multi-agent per module, $250-331/month cost, Kubernetes deployment, human-in-the-loop |
| 34_human_oversight_roles/ | Org chart, hiring plan (MVP 5-8 to Launch 30+), QA workflows, on-call rotation, EMS training |
| 35_ui_design/ | Design system (Navy/Teal), WCAG 2.2 AA, emergency mode UX, haptics, map declutter, vehicle icons |
| 36_data_storage/ | PostgreSQL+PostGIS, TimescaleDB, Redis, NATS, PMTiles on S3, $45K/yr for 1M users |
| 37_event_protocols/ | ICS/NIMS integration, per-hazard triggers, auto vs manual declaration, cascading events, AAR |
| 38_location_sharing/ | 4 privacy modes, granularity levels, EMS emergency override, mesh relay, retention policies |
| 39_module_validation/ | Asymmetric loss (FN 10-1000x), F1 targets per module, A/B testing, digital twin simulation, drift detection |
| 40_system_updates/ | Expo EAS OTA, ML model versioning, tile deltas, force update policy, rollback procedures |
| 41_training_partnerships/ | Ring ($6M/yr), Starlink ($100K/mo), university partnerships ($1.1M/yr), FEMA training, $75M revenue by 2030 |
| 42_development_approach/ | Development methodology, shared skeleton, module environments |
| 43_brand/ | Colors (#0B0F2A navy, #0097B2 teal), fonts, style guide |
