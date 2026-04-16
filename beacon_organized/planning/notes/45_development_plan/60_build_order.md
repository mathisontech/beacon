# 60. Build Order & Dependency Analysis

## Overview
5 parallel development tracks spanning 24 months from MVP to V2. Independence analysis identifies zero-dependency modules safe to build in isolation. Critical path driven by hazard models → notifications → public/EMS features. Each phase has clear scope, success criteria, and resource allocation.

## Ownership
- **Program Manager:** Development Lead
- **Reports to:** CTO + CEO
- **Governance:** Weekly sync across track leads

---

## Phase Overview

| Phase | Duration | MVP Scope | Target Users | Success Criteria |
|-------|----------|-----------|--------------|-----------------|
| **MVP** | Months 1-6 | Single-user wildfire app | 10K public users | Public app live + 10K DAU |
| **Beta** | Months 7-12 | Multi-hazard + groups | 100K users | EMS integration validated, 50K DAU |
| **V1** | Months 13-18 | Full EMS + evacuation | 500K users | CMMC L2 path, 100K DAU |
| **V2** | Months 19-24 | Enterprise + FedRAMP | 5M users | FedRAMP-ready, 1M DAU |

---

## 5 Parallel Tracks

### Track 1: Foundation (Blocks all other tracks)

| Module | Duration | Dependencies | Owner | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 |
|--------|----------|--------------|-------|-----|-----|-----|-----|-----|-----|
| 06_atlas_base_map (PMTiles, schema) | 1 month | None | GIS Eng | ███ | | | | | |
| 02_hazard_framework (core interfaces) | 2 weeks | 06 | ML Eng | ███ | | | | | |
| 03_data_pipeline (tier 1-2) | 3 weeks | 06 | Data Eng | ███ | ███ | | | | |
| 36_data_storage (PostgreSQL, TimescaleDB) | 2 weeks | None | DBA | ███ | | | | | |
| 32_operating_system (React Native, iOS/Android) | 4 weeks | None | Mobile Eng | ███ | ███ | | | | |
| **Track 1 Completion** | **6 weeks** | | | | ✓ | | | | |

### Track 2: Hazard Models (Starts after Track 1)

| Module | Duration | Dependencies | Owner | Q2 | Q3 | Q4 | Q5 | Q6 |
|--------|----------|--------------|-------|-----|-----|-----|-----|-----|
| 22_modeling_simulation (DL + physics) | 4 weeks | 02_framework | ML Eng | ███ | ███ | | | |
| 01_wildfire | 6 weeks | 22 | Physics Eng | | ███ | ███ | | |
| 02_flood | 6 weeks | 22 | Physics Eng | | ███ | ███ | | |
| 03_earthquake | 4 weeks | 22 | ML Eng | | | ███ | ███ | |
| 04-08_other_hazards (parallel) | 8 weeks | 22 | Multi-team | | | | ███ | ███ |
| **Track 2a MVP** | **16 weeks** | | (Wildfire only) | | | ✓ | | |
| **Track 2b Full** | **24 weeks** | | (All hazards) | | | | | ✓ |

### Track 3: Core App (Starts after Track 1)

| Module | Duration | Dependencies | Owner | Q2 | Q3 | Q4 | Q5 | Q6 |
|--------|----------|--------------|-------|-----|-----|-----|-----|-----|
| 20_routing_engine (A*, pathfinding) | 3 weeks | 06, 36 | Routing Eng | ███ | | | | |
| 17_notifications_alerts (15-min SLA) | 3 weeks | 20, 36 | Backend Eng | ███ | ███ | | | |
| 08_public_user_features (map, safety check-in) | 4 weeks | 17, 32 | Mobile Eng | | ███ | ███ | | |
| 09_public_groups (community features, sharing) | 3 weeks | 08 | Backend Eng | | | ███ | | |
| **MVP App Scope** | **10 weeks** | | | | ✓ | | | |
| **Beta Scope** | **16 weeks** | | | | | ✓ | | |

### Track 4: Enterprise (Starts Q3, after initial models)

| Module | Duration | Dependencies | Owner | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 |
|--------|----------|--------------|-------|-----|-----|-----|-----|-----|-----|
| 10_ems_client_groups (emergency services UI) | 5 weeks | 02_hazard, 17_alerts | EMS Eng | ███ | | | | | |
| 12_evacuation_management (zone drawing, routing) | 6 weeks | 10, 20_routing | Evac Eng | | ███ | ███ | | | |
| 33_agentic_planners (LangGraph agents) | 4 weeks | 02_hazard, 50_modeling | AI Eng | | ███ | | | | |
| 34_human_oversight (decision review UI) | 3 weeks | 33 | Backend Eng | | | ███ | | | |
| **Track 4 MVP** | **16 weeks** | | | | | ✓ | | | |
| **Track 4 Full** | **24 weeks** | | | | | | | ✓ | |

### Track 5: Infrastructure & Operations (Continuous)

| Module | Duration | Dependencies | Owner | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 |
|--------|----------|--------------|-------|-----|-----|-----|-----|-----|-----|
| 52_system_updates (EAS, rollback) | 2 weeks | 32_OS | DevOps | ███ | | | | | |
| 53_cybersecurity (TLS, CMMC path) | 4 weeks | 36_storage, 54_certs | SecEng | ███ | ███ | | | | |
| 37_event_protocols (ICS/NIMS, triggers) | 3 weeks | 17_alerts, 02_hazard | Compliance | | ███ | ███ | | | |
| 39_module_validation (A/B testing, metrics) | 2 weeks | 22_modeling | QA Eng | | ███ | | | | |
| 51_ui_design_system (components, WCAG) | 3 weeks | 32_OS, 43_brand | Designer | ███ | ███ | | | | |
| 43_brand (colors, typography) | 1 week | None | Designer | ███ | | | | | |
| Monitoring & Observability | 2 weeks/phase | All modules | DevOps | ███ | ███ | ███ | ███ | ███ | ███ |
| **Track 5 Coverage** | **Continuous** | | | | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Independence Analysis: Zero-Dependency Modules

| Module | Dependencies | Status | Can Build In Parallel | Start Date |
|--------|--------------|--------|----------------------|------------|
| 06_atlas_base_map | None | Parallel-safe | Yes (with Track 1) | Month 1 |
| 36_data_storage | None | Parallel-safe | Yes (with Track 1) | Month 1 |
| 32_operating_system | None | Parallel-safe | Yes (with Track 1) | Month 1 |
| 43_brand | None | Parallel-safe | Yes (with Track 5) | Month 1 |
| 02_hazard_framework | 06 | After 06 complete | Yes (start week 5) | Month 2 |
| 51_ui_design_system | 32, 43 | After both | Yes (start week 3) | Month 2 |
| 20_routing_engine | 06, 36 | After both | Yes (start week 7) | Month 2 |

---

## Critical Path Analysis

```
Start
  ├─ [Parallel] Track 1 Foundation (6 weeks)
  │   ├─ 06_atlas_base_map (1 week)
  │   ├─ 32_operating_system (4 weeks)
  │   ├─ 36_data_storage (2 weeks)
  │   └─ 02_hazard_framework (2 weeks) [blocks 22]
  │
  ├─ [Parallel] Track 2 Models (16 weeks MVP, 24 weeks full)
  │   ├─ 22_modeling_simulation (4 weeks, starts week 7)
  │   ├─ 01_wildfire (6 weeks, starts week 11)
  │   └─ 02_flood (6 weeks, starts week 11)
  │
  ├─ [Parallel] Track 3 App (10 weeks MVP)
  │   ├─ 20_routing_engine (3 weeks, starts week 7)
  │   ├─ 17_notifications (3 weeks, starts week 10)
  │   └─ 08_public_user (4 weeks, starts week 13)
  │
  └─ [Sequential] Critical Dependencies
      ├─ 22 blocks 01 (wildfire model depends on framework) [week 11]
      ├─ 01 + 02 block 03-08 (earthquake depends on wildfire validation)
      ├─ 02 blocks 10 (EMS features need flood model)
      ├─ 17 blocks 08 (notifications needed for alerts)
      └─ 08 blocks 09 (groups depend on public user app)

MVP Critical Path Length: 14 weeks (Foundation 6w + Models 4w + App 4w)
V1 Critical Path Length: 22 weeks (add Evacuation 6w)
```

---

## MVP (Months 1-6): Single-User Wildfire App

### Scope
- Public user can view live wildfire map
- Hazard extent layer (wildfire only)
- Evacuation routes (to nearest EMS marker)
- Safety check-in + location sharing
- No groups, no EMS accounts, no mesh, no multi-user

### Modules Complete
- Track 1: All 5 modules (atlas, OS, storage, hazard framework, design)
- Track 2: Wildfire + modeling simulation (DL surrogates tested)
- Track 3: Routing, notifications, public user features (basic)
- Track 5: System updates, security, UI design system

### Success Criteria
- 10K DAU by end of month 6
- <1s map load time on 4G
- Wildfire F1 score >85%
- <100ms tap response
- WCAG 2.2 AA compliance

### Resource Allocation
- Mobile Engineers: 4 FTE
- Backend Engineers: 3 FTE
- ML/Physics Engineers: 2 FTE
- DevOps/Infrastructure: 1 FTE
- QA/Design: 1 FTE
- **Total: 11 FTE**

### Risk Registry
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| DL wildfire model accuracy miss | Medium | High | Parallel physics model fallback |
| Mobile app performance regression | Low | High | Weekly performance regression tests |
| Apple/Google review delays | Medium | Medium | Submit binary 4 weeks early |
| Tile server outage | Low | High | CloudFront + local tile cache |

---

## Beta (Months 7-12): Multi-Hazard + Groups

### Scope
- Add flood, earthquake, hurricane models
- Groups for public users (family, friends)
- EMS client app (read-only hazard view + resource tracker)
- Agentic analysis agents for hazard detection
- Mesh networking foundation (iOS only, public beta)

### Modules Complete (from MVP)
- Track 2: Flood, earthquake, hurricane (14 weeks from MVP start)
- Track 3: Groups + EMS client UI
- Track 4: Agentic planners (foundation)
- Track 5: Cybersecurity CMMC L2 path (initial practices)

### New Dependencies Resolved
- Flood model depends on wildfire validation ✓ (month 6)
- Earthquake model depends on flood validation ✓ (month 9)
- EMS client depends on both models ✓

### Success Criteria
- 50K DAU by end of month 12
- 4 hazard models deployed (wildfire, flood, earthquake, hurricane)
- <2min hazard analysis latency (model → notification)
- Groups feature with 80%+ satisfaction
- CMMC L2 practices 40% complete

### Resource Allocation
- +2 EMS product specialists
- +1 AI/LangGraph engineer
- +2 mobile engineers (for mesh)
- **Total: 16 FTE**

---

## V1 (Months 13-18): Full EMS + Evacuation

### Scope
- Evacuation management system (draw zones, issue orders)
- EMS dispatch integration (real-time routing)
- Agentic human-in-the-loop (lead agent approval)
- Evacuation simulation (population flow, bottleneck detection)
- Multi-user EMS teams + dispatch

### Modules Complete
- Track 4: Evacuation management + human oversight
- Track 4: Full agentic planning + validation agents
- Track 2: All 14 hazard models
- Track 5: Event protocols (ICS/NIMS triggers)

### Success Criteria
- 100K DAU by end of month 18
- Evacuation routing <5s latency (simulate 100K population)
- EMS dispatch SLA: 15-min hazard notification → EMS ack
- CMMC L2 certification complete
- Agent confidence within 5% of actual accuracy

### Resource Allocation
- +2 EMS domain experts
- +2 infrastructure/database engineers (for scale)
- +1 compliance/legal specialist
- **Total: 21 FTE**

---

## V2 (Months 19-24): Enterprise + FedRAMP

### Scope
- FedRAMP JAB authorization path
- Custom EMS integrations (CAD systems, dispatch software)
- Regional deployment (multi-region failover)
- Enterprise features (audit, custom alerts, analytics)
- Advanced mesh networking (Android + specialized equipment)

### Modules Complete
- Track 4: Custom integrations + analytics
- Track 5: FedRAMP compliance + SOC 2 Type II audit
- Enhanced security: Zero trust + incident response playbook

### Success Criteria
- 1M DAU by end of month 24
- FedRAMP JAB ATO in progress (or achieved)
- SOC 2 Type II audit complete
- Zero critical CVE vulnerabilities in production
- System cost model validated at 1M scale

### Resource Allocation
- +3 enterprise solutions engineers
- +1 FedRAMP compliance officer
- +1 site reliability engineer (multi-region)
- **Total: 26 FTE**

---

## Resource Timeline

```
Phase  | Month | Track 1 | Track 2 | Track 3 | Track 4 | Track 5 | Total FTE |
-------|-------|---------|---------|---------|---------|---------|-----------|
MVP    | 1-6   | 2       | 2       | 4       | -       | 3       | 11        |
Beta   | 7-12  | -       | 3       | 3       | 2       | 8       | 16        |
V1     | 13-18 | -       | 4       | 3       | 6       | 8       | 21        |
V2     | 19-24 | -       | 3       | 3       | 8       | 12      | 26        |
```

---

## Budget Estimate (24-Month Total)

| Category | MVP (6mo) | Beta (6mo) | V1 (6mo) | V2 (6mo) | **Total** |
|----------|-----------|-----------|----------|----------|-----------|
| **Team Costs** | | | | | |
| Engineers (11→26 FTE) | $1.2M | $1.8M | $2.4M | $3.2M | $8.6M |
| Operations/DevOps | $150K | $300K | $400K | $500K | $1.35M |
| **Infrastructure** | | | | | |
| AWS (compute, DB, CDN) | $300K | $600K | $1.2M | $3.6M | $5.7M |
| Security (pentesting, audit) | $50K | $100K | $150K | $300K | $600K |
| **Licensing** | | | | | |
| Expo/EAS, mapping, APIs | $100K | $150K | $200K | $300K | $750K |
| **Compliance/Legal** | | | | | |
| Legal review, compliance | $50K | $100K | $200K | $300K | $650K |
| **Contingency (15%)** | $255K | $450K | $675K | $1.08M | $2.46M |
| **Phase Total** | **$2.1M** | **$3.5M** | **$5.3M** | **$9.3M** | **$20.2M** |

---

## Risks & Mitigation

| Risk | Phase | Mitigation |
|------|-------|-----------|
| Model accuracy insufficient | MVP | Build physics fallback; demo with real fire data pre-launch |
| FedRAMP timeline delay | V2 | Start security audit in V1 Q4; engage FEMA early |
| EMS adoption risk | Beta | Pilot with 3-5 agencies; incorporate feedback before V1 |
| Data privacy lawsuit | V1 | CCPA/GDPR compliance from day 1; legal review monthly |
| Scaling to 1M users | V2 | Load testing at 500K in V1 Q3; auto-scale infrastructure |
| Team retention | Ongoing | Competitive salary, remote-first, clear promotion path |

---

## Success Metrics by Phase

| Metric | MVP | Beta | V1 | V2 |
|--------|-----|------|----|----|
| Daily Active Users | 10K | 50K | 100K | 1M |
| Retention Day 7 | 40% | 50% | 55% | 60% |
| Model F1 Score (wildfire) | >85% | >87% | >88% | >89% |
| App Crash Rate | <0.5% | <0.3% | <0.2% | <0.1% |
| Hazard Notification SLA | <5min | <3min | <1min | <1min |
| Security Incidents | 0 | 0 | 0 | 0 |
| CMMC L2 Practices | - | 40% | 100% | 100% |
| FedRAMP Readiness | - | - | In Progress | ATO |

---

## Go/No-Go Criteria

### MVP Launch Gate (End of Month 6)
- [ ] Wildfire model F1 > 85%
- [ ] App crash rate < 0.5% on iOS + Android
- [ ] 10K beta testers 7-day retention > 35%
- [ ] WCAG 2.2 AA compliance verified
- [ ] Legal review + ToS signed off

### Beta Launch Gate (End of Month 12)
- [ ] 4 models (wildfire, flood, earthquake, hurricane) deployed
- [ ] EMS pilot with 3 agencies complete + satisfied
- [ ] <2min hazard analysis latency demonstrated
- [ ] CMMC L2 practices 40%+ complete
- [ ] Zero critical security issues in 1-month security audit

### V1 Launch Gate (End of Month 18)
- [ ] Evacuation simulation tested with 100K population
- [ ] EMS dispatch SLA met in real-world pilot (50K jurisdiction)
- [ ] CMMC L2 certification complete
- [ ] Agent confidence calibration within 5%
- [ ] 100K DAU retention >50%

### V2 Launch Gate (End of Month 24)
- [ ] FedRAMP JAB ATO in hand (or advanced in process)
- [ ] SOC 2 Type II audit complete + passed
- [ ] 1M user load test successful (P95 latency <100ms)
- [ ] Enterprise integrations piloted with 5+ agencies
- [ ] Cost model validated at scale (proven <$50/active user/year)

---

## Implementation Notes

- **Parallel execution:** Tracks 1, 2, 3, 5 run simultaneously from month 1; Track 4 starts month 3 after model validation
- **Dependencies:** Hazard models (Track 2) and notifications (Track 3) are critical path; must complete before EMS features (Track 4)
- **MVP scope is ruthless:** Single hazard, no groups, no multi-user; goal is fast validation of core technology + user engagement
- **Beta adds complexity:** Multi-hazard, EMS read-only, agentic analysis; goal is enterprise readiness
- **V1 is production-grade:** Full EMS dispatch, evacuation management, human oversight; goal is CMMC L2 + deployment-ready
- **V2 is enterprise:** FedRAMP, multi-region, custom integrations; goal is government adoption at scale
- **Continuous security:** Security review every phase; CMMC L2 practices woven throughout all 24 months
