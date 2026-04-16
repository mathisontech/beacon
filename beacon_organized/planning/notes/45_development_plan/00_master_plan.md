# Beacon Development Plan - Master Index

**Mission:** Save lives and mitigate disasters with all that technology has to offer.

---

## File Index (28 Files)

| File | Path | Description |
|------|------|-------------|
| 00_master_plan.md | 45_development_plan/ | Index and system overview |
| 01_module_template.md | 45_development_plan/ | Standardized module structure |
| 02_agent_monitor_template.md | 45_development_plan/ | Agent monitoring framework |
| Hazard Framework | 02_hazard_models/00_hazard_framework/hazard_model_framework.md | Core hazard models and logic |
| Hazard Layer: Wildfire | 02_hazard_models/01_wildfire/ | Fire spread, containment, evac |
| Hazard Layer: Flood | 02_hazard_models/02_flood/ | Inundation, flow, timing |
| Hazard Layer: Earthquake | 02_hazard_models/03_earthquake/ | Shaking, aftershocks, structures |
| Hazard Layer: Tsunami | 02_hazard_models/04_tsunami/ | Wave propagation, coastal |
| Hazard Layer: Landslide | 02_hazard_models/05_landslide/ | Slope stability, debris flow |
| Hazard Layer: Hurricane | 02_hazard_models/06_hurricane/ | Wind, surge, rainfall |
| Hazard Layer: Tornado | 02_hazard_models/07_tornado/ | Vortex, detection, tracking |
| Hazard Layer: Volcano | 02_hazard_models/08_volcano/ | Eruption, ash, lava |
| Hazard Layer: Hail | 02_hazard_models/09_hail/ | Size, impact, climatology |
| Hazard Layer: Winter Storm | 02_hazard_models/10_winter_storm/ | Snow, ice, visibility |
| Hazard Layer: Drought | 02_hazard_models/11_drought/ | Water stress, agriculture |
| Hazard Layer: Wildfire Smoke | 02_hazard_models/12_wildfire_smoke/ | Air quality, visibility |
| Hazard Layer: Extreme Heat | 02_hazard_models/13_extreme_heat/ | Temperature, humidity, index |
| Data Pipeline | 03_data_sources_and_pipeline/00_pipeline_overview/ | 4-tier ingestion and fusion |
| Base Map System | 06_atlas_base_map/atlas_base_map_system.md | PMTiles, tiling, delta encoding |
| Routing Engine | 20_street_level_perception/ | Pathfinding, obstacles, timing |
| Notifications | 17_notifications_alerts/ | Alert distribution, SLA |
| Public Users | 08_public_user_features/ | Consumer app, donations, safety |
| Groups | 09_public_groups/ | Community features, sharing |
| Clients | 10_ems_client_groups/ | Emergency services integration |
| Agentic Planners | 33_agentic_planners/agentic_planners.md | LangGraph, 4-agent teams |
| System Lead Agent | 34_human_oversight_roles/ | Human-agent orchestration |
| World Model | 21_beacon_world_model/ | Real-time state synthesis |
| Brand Guidelines | 43_brand/brand_guidelines.md | Colors, typography, WCAG |

---

## System Dependency Graph

```
Base Map (PMTiles, 1km)
    ↓
Hazard Manager (14 models)
    ↓
Routing Engine (A*, obstacles)
    ↓
Notifications (15-min SLA)
    ├→ Public Users
    ├→ Groups
    └→ Clients (EMS)

Cross-Cutting Systems:
  - Data Pipeline (4 tiers)
  - Agentic Planners (LangGraph)
  - World Model (state synthesis)
  - Mesh Networking (offline)
  - Event Protocols (ICS/NIMS)
```

---

## Build Order - 5 Parallel Tracks

**Track 1: Foundation**
1. Base Map System (PMTiles, schema)
2. Hazard Framework (core interfaces)
3. Data Pipeline (tier 1-2)

**Track 2: Hazard Models**
1. Wildfire (priority 1)
2. Flood (priority 1)
3. Earthquake (priority 2)
4. Tsunami, Landslide, Hurricane (priority 2)

**Track 3: Core App**
1. Routing Engine
2. Notifications System
3. Public User Features

**Track 4: Enterprise**
1. EMS Client Groups
2. Evacuation Management
3. Agentic Planners

**Track 5: Infrastructure**
1. Data Storage (PostgreSQL, TimescaleDB, Redis, NATS)
2. Operating System (React Native, iOS 14+, Android 11+)
3. Event Protocols (auto/manual triggers)
4. Monitoring & Agents

---

## Standardized References

| System | Reference | Key Details |
|--------|-----------|-------------|
| **Hazard Framework** | 02_hazard_models/00_hazard_framework/hazard_model_framework.md | 14 core models, unified interface |
| **Loss Weighting** | 39_module_validation/module_validation.md | Wildfire 1000x, Flood 500x, Earthquake 100x |
| **Accuracy Targets** | 39_module_validation/module_validation.md | Wildfire 87% F1, Flood 82%, Earthquake 95% |
| **Data Storage** | 36_data_storage/data_storage.md | PostgreSQL+PostGIS, TimescaleDB, Redis, NATS, S3 |
| **OS Standards** | 32_operating_system/operating_system.md | React Native+Expo, iOS 14+, Android 11+ |
| **Event Protocols** | 37_event_protocols/event_protocols_overview.md | Auto/manual triggers, ICS/NIMS, 15-min SLA |
| **Brand** | 43_brand/brand_guidelines.md | Navy #0B0F2A, Teal #0097B2, Inter, WCAG 2.2 AA |
| **Tile Format** | 06_atlas_base_map/atlas_base_map_system.md | PMTiles, 1km, hash-based delta |
| **Agentic Arch** | 33_agentic_planners/agentic_planners.md | LangGraph, 4-agent teams, dual reporting |
| **Feature Extraction** | 03_data_sources_and_pipeline/00_pipeline_overview/feature_extraction_by_source.md | 14 sources, 6 cross-source patterns |
| **Legal** | 31_legal/legal_considerations.md | Good Samaritan, CCPA, CMMC L2, FedRAMP |
| **Pipeline** | 03_data_sources_and_pipeline/00_pipeline_overview/00_INDEX.md | 4 processing tiers |

---

## Account Types

| Type | Full Name | Role | Key Features |
|------|-----------|------|--------------|
| BE | Beacon Enterprise | Large emergency services agency | EMS client, custom integration, SLA 15-min |
| EA | Emergency Authority | Regional authority (fire, county) | Hazard acknowledgment, evac orders |
| ET | Emergency Team | Tactical response team | Real-time routing, mesh networking |
| DI | Dedicated Individual | Specialized responder | Premium features, offline mapping |
| SD | Self-Designated | Volunteer or independent | Limited data access, donation |
| PU | Public User | Consumer | Safety check-in, donations, shelter finding |

---

## Development Philosophy

- Break modules into separate files with descriptive names
- Minimize text; performance outputs use shortest wording
- Standardized 16-section module template for consistency
- Agent-driven monitoring with human oversight fallback
- Privacy-first: minimize PII collection and exposure
- Offline-first: all critical features work without internet
