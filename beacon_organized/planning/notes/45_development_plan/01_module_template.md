# Module Template - 16-Section Standard

Use this structure for every module in Beacon. Adjust section names and depth based on module scope.

---

## 1. Module Metadata

**Team:** [Responsible team name and lead]

**Parent Module:** [If nested]

**Sub-Modules:** [If this is a parent]

**Goal:** [One-line objective]

**Mission Alignment:** [How this module supports "Save lives and mitigate disasters"]

**Owner:** [Name, role, contact]

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| **Input 1** | [System] | [JSON/Binary/etc] | [Real-time/Batch/On-demand] | [Schema ref or example] |
| **Input 2** | [System] | [JSON/Binary/etc] | [Real-time/Batch/On-demand] | [Schema ref or example] |
| **Output 1** | [Consumer] | [JSON/Binary/etc] | [Real-time/Batch/On-demand] | [Schema ref or example] |
| **Output 2** | [Consumer] | [JSON/Binary/etc] | [Real-time/Batch/On-demand] | [Schema ref or example] |

**Output Consumers:** [List systems that consume this module's output]

---

## 3. Function Breakdown

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `func_1()` | [What it does] | [Type] | [Type] | [Time] | [Module X] | [Accuracy/performance threshold] |
| `func_2()` | [What it does] | [Type] | [Type] | [Time] | [Module X] | [Accuracy/performance threshold] |
| `func_3()` | [What it does] | [Type] | [Type] | [Time] | [Module X] | [Accuracy/performance threshold] |

**Key Algorithms:** [Description of core logic, complexity, approximations]

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL, TimescaleDB, Redis, NATS, S3

### PostgreSQL + PostGIS

```sql
CREATE TABLE [table_name] (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  [field_1] [type] NOT NULL,
  [field_2] [type],
  [geom] GEOMETRY(Point, 4326)
);

CREATE INDEX idx_[table]_[field] ON [table_name]([field]);
CREATE INDEX idx_[table]_geom ON [table_name] USING GIST(geom);
```

### TimescaleDB (Time-Series)

```sql
CREATE TABLE IF NOT EXISTS [table_name] (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  [entity_id] [type] NOT NULL,
  [value] [type],
  [metadata] JSONB
);

SELECT create_hypertable('[table_name]', 'time', if_not_exists => TRUE);
CREATE INDEX idx_[table]_entity_time ON [table_name] (entity_id, time DESC);
```

### Redis

```
Key patterns: [module]:[entity_id]:[field]
TTL: [Duration]
Use cases: [Caching, session state, real-time counters]
```

### NATS Streams

```
Subject: [module].events.[event_type]
Retention: [Duration]
Consumers: [List of systems]
```

### S3

```
Bucket: beacon-[environment]
Prefix: /[module]/[entity_id]/
Retention: [Duration]
Access: [Private/Public/Signed URLs]
```

**Data Size Estimate:** [Rows/month or GB/month]

**Archival Strategy:** [How old data is handled]

---

## 5. UI Components

**Screens:** [Screen names or references]

**Buttons/Controls:**
- [Button name]: [Action, color from brand palette]
- [Button name]: [Action, color from brand palette]

**Map Layers:**
- [Layer name]: [Geometry type, color #0B0F2A or #0097B2, z-order, update freq]

**Notifications/Alerts:**
- [Alert type]: [Trigger, template, channel]

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A / teal #0097B2

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| [repo-name] | [Tech stack] | [Build cmd/process] | [Team/person] |

**Deployment:** [Docker/Kubernetes/Lambda/etc]

**CI/CD:** [GitHub Actions/GitLab/etc]

---

## 7. Lifecycle

**Milestones:**
1. [Months 1-2]: Requirements, design review
2. [Months 2-3]: Core implementation
3. [Months 3-4]: Integration testing
4. [Months 4-5]: Beta deployment
5. [Month 5+]: Production rollout

**Build Phases:**
- Phase 1: [Feature set]
- Phase 2: [Feature set]
- Phase 3: [Feature set]

**Test Coverage Targets:** [Percentage, breakdown by unit/integration/e2e]

**Deployment Strategy:** [Blue-green, canary, rolling]

**Monitoring Metrics:** [KPIs: latency p95, error rate, throughput]

**Improvement Research:** [A/B tests, user feedback, performance analysis]

---

## 8. Legal/Privacy/Security

**Applicable Regulations:**
- [CCPA, CMMC L2, FedRAMP, Good Samaritan, etc.]

**PII Handled:** [Name, location, phone, email, health data — specify yes/no]

**Encryption:**
- In-transit: TLS 1.3
- At-rest: AES-256-GCM
- Keys: [KMS/HSM/etc]

**Audit Trail:** [What is logged, retention, access control]

**Data Retention:** [Duration before deletion]

**Third-Party Integrations:** [Vendor, data sharing, DPA]

---

## 9. Mesh/Offline

**Offline-First Features:**
- [Feature 1]: Works without internet
- [Feature 2]: Works without internet

**Sync Strategy:** [Conflict resolution, ordering, retry logic]

**Cache Size:** [MB/GB estimate]

**Priority Queue:** [What syncs first when connectivity returns]

**Compression:** [Format, ratio target]

---

## 10. Update Protocols

**Update Frequency:** [Continuous/hourly/daily/weekly]

**Rollout Strategy:** [Staged percentage, affected users]

**Rollback Plan:** [If update fails, how to revert]

**User Notification:** [How users are informed of updates]

**Testing Before Release:** [Staging env, A/B duration, metrics to validate]

---

## 11. Cross-Module Dependencies

**Consumes:**
- [Module X]: [Data/service type]
- [Module Y]: [Data/service type]

**Provides:**
- [Module A]: [Data/service type]
- [Module B]: [Data/service type]

**Critical Path:** [Modules that must be built before this one can ship]

**Teams to Consult:**
- [Team X]: [Why]
- [Team Y]: [Why]

**Potential Conflicts:** [Cross-module issues to watch]

---

## 12. Cost Tracking

**Infrastructure (Monthly):**
- Compute: $[Amount]
- Storage: $[Amount]
- Network: $[Amount]
- Third-party APIs: $[Amount]

**Personnel (Monthly):**
- [Team lead]: [Hours/cost]
- [Developers]: [Hours/cost]

**Optimization Ideas:**
- [Idea 1]
- [Idea 2]

---

## 13. Agent Monitor Team

See `02_agent_monitor_template.md` for detailed structure.

**5 Agents:**
1. **Quality Agent:** Code, tests, latency, errors
2. **Research Agent:** Data quality, model drift, accuracy
3. **Business Agent:** Usage metrics, cost, user satisfaction
4. **Compliance Agent:** Legal, privacy, security audits
5. **Lead Agent:** Orchestrates other 4, escalates to human

**Reporting:** Each agent → (1) module owner + (2) head agent in their concern area

---

## 14. Validation Practices

**Accuracy Targets (from 39_module_validation):**
- [Metric 1]: [Target threshold]
- [Metric 2]: [Target threshold]

**Loss Weighting (from 39_module_validation):**
- False negative cost: [e.g., 1000x for wildfire]
- False positive cost: [e.g., 1x for false alarm]

**A/B Testing:**
- [Test 1]: [Hypothesis, duration, success metric]
- [Test 2]: [Hypothesis, duration, success metric]

**Drift Detection:**
- [Metric 1]: [How monitored, alert threshold]
- [Metric 2]: [How monitored, alert threshold]

**Validation Data:** [Source, size, refresh frequency]

---

## 15. Data Science Considerations

**Model Selection:** [Why this approach vs. alternatives]

**Training Data:**
- Source: [Where data comes from]
- Size: [Number of samples, date range]
- Features: [List or reference to feature extraction doc]

**Retraining Schedule:** [Weekly/monthly/quarterly]

**Benchmarks:** [Baseline, current performance, improvement target]

**Failure Cases:** [Known limitations, edge cases, how handled]

**Explainability:** [How outputs are explained to users/operators]

---

## 16. Software Engineering Considerations

**Technology Stack:** [Languages, frameworks, libraries]

**External Dependencies:** [Version pinning, security scanning]

**CI/CD Pipeline:**
- Lint/format checks
- Unit/integration/e2e tests
- Security scanning
- Performance benchmarks
- Deployment automation

**Technical Debt:** [Known issues, refactoring priorities]

**SLA & Runbooks:**
- Availability target: [e.g., 99.9%]
- Latency target: [e.g., p95 < 500ms]
- Error rate target: [e.g., < 0.1%]
- Oncall runbook: [Link or summary]

**Scalability:** [Expected growth, bottlenecks, mitigation]

---

## Notes

- Copy this template for each module
- Keep text minimal; use tables for structured data
- Cross-reference related modules using absolute paths
- Update lifecycle and metrics quarterly
- Agent monitors run continuously; escalate via human review
