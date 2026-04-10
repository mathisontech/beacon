# People & Community Module - Quick Reference Index

**Complete documentation:** MODULE_DOC.md (1760 lines, 64KB)

## Quick Navigation

### For Product Managers
- [Overview](#overview) - Strategic goals, market positioning
- [Sub-Modules](#sub-modules) - 4 distinct feature areas
- [Success Metrics](#section-2-product--strategy)

### For Architects
- [Core Architecture](#core-architecture) - System context, microservices
- [Technology Stack](#section-2-technical-architecture) - Languages, databases, frameworks
- [Database Schema](#database-schema) - PostgreSQL tables, indexes

### For Engineers
- [Development Blocks](#development-blocks) - 6 sequential implementation phases
- [Functionality Reference](#functionality-reference) - 40+ core functions with I/O specs
- [API Endpoints](#api-endpoints) - RESTful endpoints with examples

### For Admin/Operations
- [Admin Interfaces](#admin-interfaces) - 5 dashboards for account, group, help, animal rescue, ID verification
- [Audit & Compliance](#section-4-security-legal--compliance) - CCPA, HIPAA, Good Samaritan, CMMC

### For Designers/UX
- [Mobile UI Specifications](#mobile-ui-specifications) - 16 core screens, haptic feedback
- [Design System](#design-system-components) - Colors, typography, spacing, buttons

---

## Sub-Modules at a Glance

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **Public User Account Manager** | Account lifecycle, identity verification | Registration, ID verification, vehicle manager, emergency contacts, location sharing |
| **Groups Manager** | Coordinate 4 group types | Neighborhood, school, burn-together, evacuation convoys, location sharing, events |
| **People Helping People Manager** | Peer-to-peer mutual aid | Transport, evacuation confirmation, condition reporting, resource lending, photo assistance |
| **Animal Rescue Manager** | Animal coordination during disasters | Lost/found reporting, rescue workflow, shelter management, reunification, microchip lookup |

---

## Development Roadmap

| Block | Duration | Dependencies | Key Deliverables |
|-------|----------|--------------|------------------|
| 1. User Account | Weeks 1-4 | Auth (43) | Registration, ID verification, vehicle manager, location sharing |
| 2. Groups | Weeks 3-6 | Block 1, Location Sharing (44) | CRUD, messaging, discovery, event mode |
| 3. Help Requests | Weeks 5-8 | Block 1-2, EMS partial | Broadcasting, matching, geofencing, feedback |
| 4. Animal Rescue | Weeks 6-9 | Block 1, Mesh (basic) | Reporting, rescue workflow, shelter capacity, reunification |
| 5. Admin Dashboards | Weeks 8-12 | Blocks 1-4 | Account mgmt, group moderation, help triage, rescue board |
| 6. Mobile & Sync | Weeks 10-14 | Blocks 1-4, Mesh (30) | React Native UI, CRDT sync, mesh relay |

**Total Timeline:** 14 weeks (3.5 months) to MVP

---

## Key Database Tables

```
users
vehicles
groups
group_members
group_channels
group_messages
help_requests
animal_rescues
shelters
convoys
trusted_neighbors
location_events (TimescaleDB)
audit_logs
```

---

## Critical Design Decisions

1. **Identity Verification:** Face match (selfie vs. ID) + background check + sex offender registry
2. **Location Privacy:** 4 modes (off, group-only, EMS-only, public) × 4 granularities
3. **Help Request Liability:** Good Samaritan waiver, EMS oversight, kill switch, feedback loop
4. **Group Types:** Geographic (neighborhood) + institutional (school) + operational (burn, evacuation)
5. **Mesh Network:** E2E encryption, perfect forward secrecy, replay prevention, GPS pairing
6. **Offline-First:** Cached map tiles, queued help requests, CRDT message sync, mesh broadcast

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Account registration | p95 < 2s |
| Group discovery | p95 < 500ms |
| Help request broadcast | p95 < 2s |
| Location update | p95 < 5s |
| Map tile delivery | p95 < 200ms |
| Message delivery | p95 < 500ms |
| Help request acceptance rate | >50% |
| Group member retention @ 30 days | >70% |

---

## Compliance Checklist

- [ ] CCPA: Location data classification, user rights (access/delete), privacy notice
- [ ] HIPAA: N/A, but hospital reps need BAA
- [ ] ADA: WCAG 2.2 AA compliance, quarterly testing
- [ ] Good Samaritan: Legal review, insurance rider, volunteer vetting
- [ ] Child Safety (COPPA): <13 requires parental consent, no direct contact
- [ ] CMMC Level 2: 110 practices from NIST SP 800-171
- [ ] Encryption: TLS 1.3 in-transit, AES-256-GCM at-rest, ECDH for mesh
- [ ] Incident Response: 60-minute SLA, 4-hour customer notification

---

## Contact & Ownership

**Module Owner:** [To Be Assigned]
**Tech Lead:** [To Be Assigned]
**Product Lead:** [To Be Assigned]

For questions, refer to MODULE_DOC.md Section references above.

