# Agent Monitor Framework - Template & Structure

All modules are monitored by a 5-agent team plus a System Lead Agent. This document defines the standardized structure and operating rules for agent monitors.

---

## Architecture Overview

**5 Module Agents (per module):**
1. Quality Agent
2. Research Agent
3. Business Agent
4. Compliance Agent
5. Lead Agent (orchestrator)

**System Level:**
- System Lead Agent (aggregates across all modules)
- Head Agent (Quality): Aggregates quality metrics
- Head Agent (Research): Aggregates data science metrics
- Head Agent (Business): Aggregates cost and usage
- Head Agent (Compliance): Aggregates legal and security

**Dual Reporting:**
Each module agent reports to:
1. **Module owner** (human) — for awareness and approval of actions
2. **Head agent** in their concern area — for cross-module patterns

---

## 1. Quality Agent

**Schedule:** Continuous (checks every hour)

**Data Sources:**
- CI/CD logs (GitHub Actions, deployment status)
- Monitoring system (Datadog, CloudWatch)
- Error tracking (Sentry, application logs)
- Code coverage metrics
- Test execution results

**Monitoring Checks:**

| Check | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| Build Success | % builds passing | < 95% | Alert owner; escalate if < 85% |
| Latency p95 | Response time | > 2x SLA | Alert owner; auto-rollback if > 5x |
| Error Rate | % 5xx errors | > 1% | Alert owner; escalate if > 5% |
| Test Coverage | % lines covered | < 70% | Alert owner; block merge if < 60% |
| Dependency Vulnerabilities | # high-risk CVEs | > 0 | Alert owner; escalate to compliance |
| Uptime | % availability | < 99.5% | Alert owner; page oncall |

**Output Format (Standardized Report):**
```
[MODULE] Quality Report [HH:MM]
Status: [HEALTHY/WARNING/CRITICAL]
- Build: [X passes, Y fails last 24h]
- Latency p95: [Xms] (SLA: [Ysm])
- Error rate: [X%] (Threshold: [Y%])
- Tests: [X% coverage]
- Vulnerabilities: [Count]
- Uptime: [X%]
Escalation: [None/Owner/Oncall]
```

**Escalation Rules:**

| Condition | Escalation | Timing |
|-----------|-----------|--------|
| Build < 85% | Module owner + Head Agent (Quality) | Immediate |
| Latency > 5x SLA | Module owner + Head Agent + Oncall | Immediate |
| Error rate > 5% | Module owner + Head Agent + Oncall | Immediate |
| Uptime < 99% | Module owner + Oncall | Within 1 hour |
| Test coverage < 60% | Module owner + Head Agent | Within 4 hours |
| Vulnerability present | Module owner + Compliance Head | Within 1 hour |

**Running Records:**

| What | Where | Retention |
|-----|-------|-----------|
| Hourly health checks | Time-series DB | 90 days |
| Build failures | PostgreSQL logs | 1 year |
| Performance baselines | Time-series DB | 2 years |
| Escalations | PostgreSQL audit | 1 year |

**Query Example (Head Agent Quality):**
```sql
SELECT module, date_trunc('day', check_time) as day,
  AVG(error_rate) as avg_error, MAX(error_rate) as peak_error,
  COUNT(*) FILTER (WHERE error_rate > 0.05) as critical_hours
FROM quality_checks
WHERE check_time > now() - interval '7 days'
GROUP BY module, day
ORDER BY day DESC, peak_error DESC;
```

**Autonomous Actions (No approval needed):**
- Send alert to owner Slack channel
- File issue in GitHub
- Tag relevant Head Agent
- Auto-rollback deployment if latency > 5x SLA

**Blocked Actions (Require human approval):**
- Disable feature flag
- Scale down infrastructure
- Delete data or logs
- Modify monitoring rules

---

## 2. Research Agent

**Schedule:** Daily (6 AM UTC), + continuous drift monitoring

**Data Sources:**
- Validation metrics (accuracy, precision, recall, F1)
- Model inputs and outputs (sample data)
- Real-world outcomes vs. predictions
- Feature distributions
- Training data quality

**Monitoring Checks:**

| Check | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| Model Accuracy | F1 vs. target | < 95% of target | Alert owner; review data drift |
| Data Drift | Feature distribution shift | > 1 std dev | Alert owner; investigate root cause |
| False Negatives | Count in [period] | > expected ratio | Alert owner; review loss weighting |
| False Positives | Count in [period] | > expected ratio | Alert owner; review threshold |
| Training Data Quality | % missing/invalid | > 5% | Alert owner; flag for cleaning |
| Model Staleness | Days since retrain | > [schedule interval] | Alert owner; trigger retraining |
| Benchmark Regression | Performance vs. baseline | > 10% below | Alert owner; escalate to lead |

**Output Format:**

```
[MODULE] Research Report [Date]
Model Status: [HEALTHY/DRIFT/DEGRADED]
- Accuracy: [X%] (Target: [Y%])
- Precision: [X%], Recall: [X%], F1: [X%]
- Drift detected: [Yes/No] in features [...]
- False negatives: [X] (expected [Y])
- False positives: [X] (expected [Y])
- Training data: [X% valid]
- Last retrained: [Date]
Actions taken: [None/Retraining/Alert owner/Escalation]
```

**Escalation Rules:**

| Condition | Escalation | Timing |
|-----------|-----------|--------|
| Accuracy < 85% of target | Module owner + Head Agent (Research) | Same day |
| Data drift > 2 std dev | Module owner + Head Agent | Within 2 hours |
| False negatives > 3x expected | Module owner + Head Agent + Compliance | Immediate |
| Model outdated > 2 cycles | Module owner + Head Agent | Next business day |
| Benchmark regression > 10% | Module owner + Head Agent + Lead | Within 1 hour |

**Running Records:**

| What | Where | Retention |
|-------|-------|-----------|
| Daily accuracy scores | Time-series DB | 2 years |
| Drift detection events | PostgreSQL | 1 year |
| Retraining logs | PostgreSQL | 1 year |
| Sample predictions (anonymized) | S3 + PostgreSQL index | 90 days |

**Query Example (Head Agent Research):**
```sql
SELECT module, date_trunc('week', metric_date) as week,
  AVG(accuracy) as avg_f1, MIN(accuracy) as min_f1,
  COUNT(*) FILTER (WHERE drift_detected) as drift_events
FROM research_metrics
WHERE metric_date > now() - interval '12 weeks'
GROUP BY module, week
ORDER BY week DESC;
```

**Autonomous Actions:**
- Send metric report to owner
- Trigger retraining pipeline if schedule met
- File issue for data drift investigation
- Update monitoring thresholds based on new baselines

**Blocked Actions:**
- Modify model parameters or weights
- Change validation thresholds without owner sign-off
- Delete training data
- Retrain outside of schedule (requires owner approval)

---

## 3. Business Agent

**Schedule:** Daily (8 AM UTC), + weekly deep-dive

**Data Sources:**
- Feature usage analytics
- User count and engagement
- Cost metrics (compute, API calls, storage)
- Feature adoption rate
- User feedback (ratings, support tickets)
- Revenue/donation impact (if applicable)

**Monitoring Checks:**

| Check | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| Feature Usage | DAU/MAU | < 80% of forecast | Alert owner; investigate adoption |
| Cost per User | Cost ÷ active users | > 20% above budget | Alert owner; optimize or escalate |
| Support Tickets | # critical issues | > 5/week | Alert owner; prioritize fixes |
| User Satisfaction | NPS or rating | < 7/10 | Alert owner; review feedback |
| Donation/Revenue Impact | $revenue attributed | < forecast | Alert owner; review messaging |
| API Quota Usage | % of limit | > 85% | Alert owner; plan upgrade |

**Output Format:**

```
[MODULE] Business Report [Date]
Health: [HEALTHY/CAUTION/AT-RISK]
Usage:
  - DAU: [X] (forecast: [Y])
  - MAU: [X] (forecast: [Y])
  - Feature adoption: [X%]
Cost:
  - Total: $[X] (budget: $[Y])
  - Per-user: $[X]
Engagement:
  - NPS: [X/10]
  - Support tickets: [X] ([Y% critical])
  - User feedback themes: [...]
Revenue impact: $[X] (target: $[Y])
Actions: [Cost optimization/Feature prioritization/User outreach]
```

**Escalation Rules:**

| Condition | Escalation | Timing |
|-----------|-----------|--------|
| Usage < 50% forecast | Module owner + Head Agent (Business) | Within 1 business day |
| Cost > 50% over budget | Module owner + Head Agent + Finance | Within 2 hours |
| NPS < 5/10 | Module owner + Head Agent + Lead | Within 1 business day |
| Critical tickets > 10 | Module owner + Head Agent + Lead | Immediate |

**Running Records:**

| What | Where | Retention |
|-------|-------|-----------|
| Daily usage stats | Time-series DB | 2 years |
| Cost logs | PostgreSQL | 2 years |
| User feedback | PostgreSQL | 1 year |
| Revenue attribution | PostgreSQL | 2 years |

**Query Example (Head Agent Business):**
```sql
SELECT module, date_trunc('week', metric_date) as week,
  SUM(dau) as total_dau, SUM(cost_usd) as total_cost,
  SUM(cost_usd) / NULLIF(SUM(dau), 0) as cost_per_user,
  AVG(nps) as avg_nps
FROM business_metrics
WHERE metric_date > now() - interval '12 weeks'
GROUP BY module, week
ORDER BY week DESC;
```

**Autonomous Actions:**
- Send usage/cost report to owner
- Alert owner to cost anomalies
- File feature request issues from user feedback
- Update forecasts based on trends

**Blocked Actions:**
- Disable features based on cost alone (requires owner + lead approval)
- Delete user feedback or historical data
- Change pricing or revenue model
- Modify budget allocations

---

## 4. Compliance Agent

**Schedule:** Continuous + daily summary

**Data Sources:**
- Data access logs (who accessed what)
- PII exposure detection
- Security scan results (SAST, DAST, dependency scanning)
- Policy violation logs
- Audit trail (schema changes, permission changes)
- Third-party vendor compliance status
- Encryption key rotation logs
- Legal/regulatory calendar (deadlines for certifications)

**Monitoring Checks:**

| Check | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| Unauthorized Access | Attempts blocked | > 10/hour | Alert owner; escalate if > 100/hour |
| PII Exposure | Records at risk | > 0 | Immediate alert + lock access |
| Security Vulnerabilities | High-risk CVEs | > 0 | Immediate alert to owner + Head |
| Policy Violations | Count | > 0 | Alert owner; block if critical |
| Audit Trail Completeness | % transactions logged | < 99% | Alert owner; investigate gap |
| Encryption Status | Keys rotated on schedule | No | Alert owner; flag for rotation |
| Vendor Compliance | % vendors compliant | < 100% | Alert owner; escalate if critical |
| Regulatory Deadlines | Days until expiration | < 30 | Alert owner; start renewal process |

**Output Format:**

```
[MODULE] Compliance Report [Date]
Status: [COMPLIANT/WARNING/VIOLATION]
Security:
  - Vulnerabilities: [Count] ([Severity breakdown])
  - Access violations blocked: [X]
  - PII at risk: [X records]
Privacy:
  - Data access auditable: [Yes/No]
  - Retention enforced: [Yes/No]
  - Encryption keys rotated: [Date]
Legal/Regulatory:
  - Pending certifications: [...]
  - Vendor compliance: [X% compliant]
  - Policy adherence: [Yes/No]
Actions: [None/Patch deployment/Access revocation/Remediation plan]
```

**Escalation Rules:**

| Condition | Escalation | Timing |
|-----------|-----------|--------|
| PII exposure detected | Module owner + Head Agent + Security team | Immediate |
| Critical vulnerability | Module owner + Head Agent + Security + CTO | Immediate |
| Policy violation | Module owner + Head Agent + Legal | Within 1 hour |
| Audit gap | Module owner + Head Agent | Within 4 hours |
| Vendor non-compliant | Module owner + Head Agent + Procurement | Next business day |
| Regulatory deadline < 30 days | Head Agent + Legal + Executive | Weekly |

**Running Records:**

| What | Where | Retention |
|-------|-------|-----------|
| Access logs | Immutable log store | 7 years (legal hold) |
| Vulnerability scans | PostgreSQL | 2 years |
| Policy violations | PostgreSQL audit | 7 years |
| Audit trails | Immutable log store | 7 years |
| Certification status | PostgreSQL | Ongoing until retired |

**Query Example (Head Agent Compliance):**
```sql
SELECT module, violation_type, COUNT(*) as count,
  MAX(violation_time) as last_seen
FROM compliance_violations
WHERE violation_time > now() - interval '90 days'
GROUP BY module, violation_type
HAVING COUNT(*) > 0
ORDER BY count DESC;
```

**Autonomous Actions:**
- Send alert to owner Slack
- Log policy violation with details
- Block user access if PII at risk (auto-remediate)
- Alert security team to vulnerabilities
- Queue certification renewal tasks

**Blocked Actions:**
- Delete audit logs or access records
- Disable security scanning
- Approve data access exceptions
- Modify encryption or security policies
- Ignore regulatory deadlines

---

## 5. Lead Agent (Module Orchestrator)

**Schedule:** Continuous + 1x daily summary

**Data Sources:**
- Quality Agent reports
- Research Agent reports
- Business Agent reports
- Compliance Agent reports
- Module owner feedback (via dashboard/chat)
- Cross-module dependency status

**Responsibilities:**

1. **Aggregate state:** Synthesize the 4 agent reports into module health
2. **Detect conflicts:** Flag cases where (e.g.) cost pressure conflicts with quality requirements
3. **Route escalations:** Decide if escalation goes to module owner, head agent, or executive
4. **Coordinate action:** Ensure one agent's action doesn't conflict with another's
5. **Human override:** Present all options to module owner; execute their decision

**Module Health Scoring:**

```
Health = 0.3 × Quality + 0.2 × Research + 0.3 × Business + 0.2 × Compliance
Status:
  >= 0.8 = HEALTHY (green)
  0.6–0.8 = CAUTION (yellow)
  < 0.6 = AT-RISK (red)
```

**Daily Report Format:**

```
[MODULE] Daily Summary [Date]
Overall Health: [HEALTHY/CAUTION/AT-RISK] (Score: [X/10])

Quality: [SCORE] — [1 line summary of key metric]
Research: [SCORE] — [1 line summary of key metric]
Business: [SCORE] — [1 line summary of key metric]
Compliance: [SCORE] — [1 line summary of key metric]

Outstanding Issues:
  1. [Issue A]: Severity [HIGH/MED/LOW], Owner [Person/None]
  2. [Issue B]: Severity [HIGH/MED/LOW], Owner [Person/None]

Escalations Pending:
  - [Issue 1] → [Target] (due [time])
  - [Issue 2] → [Target] (due [time])

Recommended Actions:
  - [Action 1]: [Why] (owner decision needed)
  - [Action 2]: [Why] (autonomous if approved)

Dependencies at Risk:
  - [Module X]: [Status/issue]
```

**Conflict Detection Examples:**

| Conflict | Quality | Research | Business | Compliance | Resolution |
|----------|---------|----------|----------|-----------|-----------|
| Cost vs. Accuracy | Wants more tests | Model degrading | Reduce cost | No policy issue | Alert owner; options: (1) increase budget, (2) accept lower accuracy, (3) find optimizations |
| Speed vs. Correctness | Wants low latency | Model retraining needed | Feature launch deadline | Validation required | Suggest phased rollout: launch with current model, retrain offline |
| Growth vs. Privacy | Scale up | More data needed | Usage increasing | PII exposure risk | Implement privacy-preserving techniques (differential privacy, federated learning) |

**Escalation Matrix:**

| Condition | Target | Timing | Lead Action |
|-----------|--------|--------|------------|
| All 4 agents report CRITICAL | Owner + Head Agents | Immediate | Prepare options document; wait for owner decision |
| Conflict between agents (e.g., cost vs. quality) | Owner + relevant head agents | Within 1 hour | Document tradeoffs; recommend course of action |
| Owner unresponsive > 2 hours on CRITICAL | Escalation chain (manager/director) | Immediate | Present status; hand off to escalation chain |
| Cascade failure (module affects others) | System Lead Agent | Immediate | Trigger incident response; notify dependent modules |

**Autonomous Actions:**
- Coordinate between the 4 agents
- Send daily health report
- File meta-issues (e.g., "quality and compliance both flagging need for audit")
- Route reports to appropriate head agents

**Blocked Actions:**
- Make final decisions (module owner decides)
- Override agent recommendations without documentation
- Change escalation thresholds
- Disable other agents

---

## System Lead Agent

Operates at the org level. Aggregates data from all module Lead Agents.

**Schedule:** Continuous + weekly summit

**Data Sources:**
- All module Lead Agent reports
- Head Agent reports (Quality, Research, Business, Compliance)
- Incident logs
- Cross-module dependency status

**Responsibilities:**

1. **Global health snapshot:** What's the overall system status?
2. **Cascade detection:** If module X fails, who else is affected?
3. **Resource allocation:** Where should we focus effort?
4. **Roadmap alignment:** Are we on track to mission?
5. **Executive reporting:** Summarize for leadership

**Weekly Report Format:**

```
System Status [Week of DATE]
Overall Health: [HEALTHY/CAUTION/CRITICAL] (Score: [X/10])

Top 3 Risks:
  1. [Module/issue]: Impact [# users affected or business cost]
  2. [Module/issue]: Impact [...]
  3. [Module/issue]: Impact [...]

Cascade Warnings:
  - If [module] fails, [N] other modules affected

Resource Allocation (Recommended):
  - Engineering: [X hours] on [priority 1]
  - Data Science: [Y hours] on [priority 2]
  - Compliance: [Z hours] on [priority 3]

Progress vs. Roadmap:
  - On schedule: [X% of planned features]
  - At risk: [Y% of planned features]
  - Blocked: [Z% of planned features]

Executive Summary:
  [2-3 sentences on system health and key decisions needed]
```

**Escalation to Leadership:**

| Condition | Escalation | Who |
|-----------|-----------|-----|
| System health < 0.5 | Immediate | VP Engineering + VP Product + CEO |
| 2+ modules in cascade failure | Immediate | CTO + VP Engineering |
| Critical compliance gap | Immediate | Chief Legal Officer |
| Regulatory deadline at risk | Same day | General Counsel |
| Roadmap slip > 2 weeks | End of week | VP Product + VP Engineering |

---

## Running Records (Organization-Level)

| What | Where | Retention | Access |
|------|-------|-----------|--------|
| Module health scores (daily) | Time-series DB | 2 years | All agents + module owner |
| Escalation history | PostgreSQL audit | 7 years | Compliance + Executive |
| Agent decisions (logs) | PostgreSQL | 1 year | System Lead + Head Agents |
| Incident records | Incident tracking system | 3 years | On-call + SRE |
| Agent performance (did they call it right?) | PostgreSQL | 1 year | Head Agents only |

---

## Cross-Module Dependencies & Coordination

**Dependency Graph Query (System Lead):**
```sql
SELECT a.module as module_a, b.module as module_b,
  relationship_type, criticality
FROM module_dependencies
WHERE criticality = 'CRITICAL'
  AND status = 'ACTIVE'
ORDER BY module_a;
```

**Pre-Deployment Coordination:**
- Lead Agent for Module A queries dependencies
- For each dependent module B: check if B's Compliance and Quality agents approve
- System Lead Agent confirms no cascade risks
- Proceed if all green; escalate if any red

**Incident Coordination:**
- Incident detected in module A
- A's Lead Agent notifies B's, C's, D's Lead Agents
- Each dependent module's Quality Agent runs health check
- System Lead Agent triggers incident response playbook
- All module Lead Agents keep continuous sync until resolved

---

## Notes & Best Practices

1. **Dual reporting:** Every module agent reports to owner + head agent. Owner is final decision-maker for module; head agent sees cross-module patterns.

2. **Escalation hierarchy:** Module owner → Head agent → System Lead Agent → Executive (CTO/VP). Each level has max response time.

3. **No hero culture:** Agents don't bypass escalation. If lead agent thinks owner is wrong, document and escalate; don't override.

4. **Audit everything:** All agent decisions logged. Every escalation has reason, timing, outcome.

5. **Continuous learning:** Head agents weekly review: Did we call it right? When did we miss something? Adjust thresholds quarterly.

6. **Transparency:** Daily health reports public to module team; weekly reports shared across org.

7. **Privacy-first:** Agent logs never include PII. Sample predictions anonymized. User data accessed only with audit trail.

8. **Autonomy within bounds:** Agents move fast on routine checks (alerts, reports, minor file creation). Pause and escalate on anything affecting users, data, or budget.
