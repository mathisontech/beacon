# 55. Agentic Architecture & Human Oversight

## Overview
LangGraph-based multi-agent orchestration with 5-agent teams per hazard module. Teams comprise Quality/Research/Business/Compliance/Lead agents for human-aligned decision making. Running records + dual reporting. System cost ~$60/month steady state, ~$331/month during active events. Human-in-the-loop for critical decisions.

## Ownership
- **Module Lead:** AI/ML Engineer
- **Reports to:** CTO
- **Team Size:** 2 (1 LangGraph specialist, 1 agent operations)

## Parent/Submodules
- Parent: 33_agentic_planners, 34_human_oversight_roles
- Submodules: Monitor Agent, Analysis Agent, Recommendation Agent, Validation Agent, System Lead Agent

## Goals
- <5 minute end-to-end latency for hazard analysis (sensor → recommendation)
- <15 minute human review SLA for evacuation orders
- Cost per active module: ~$60/month (steady), ~$331/month (events)
- Agent confidence within 5% of actual accuracy
- Zero hallucinated recommendations

---

## Agent Functions

| Function | Agent | Purpose | Input | Output | SLA | Cost/Month |
|----------|-------|---------|-------|--------|-----|----------|
| ingest_hazard_feeds | Monitor | Consume USGS/NOAA feeds | API stream (USGS earthquakes, NOAA weather) | Structured observation | 10s | $3.20 |
| parse_sensor_data | Monitor | Extract signals from raw data | Raw sensor payload | Extracted features | 5s | Included |
| fuse_multimodal_data | Monitor | Combine multiple data sources | [Seismic, weather, satellite] | Fused state | <2s | Included |
| run_hazard_model | Analysis | Execute physics/DL surrogate | Fused state + model weights | Hazard extent + confidence | <2s | $22.50 |
| compute_hazard_extent | Analysis | Generate GeoJSON polygon | Model output + terrain | Extent polygon | <1s | Included |
| estimate_confidence | Analysis | Quantify uncertainty | Model output + historical variance | Confidence interval (0-100%) | <500ms | Included |
| flag_multi_hazard | Analysis | Detect cascade scenarios | Multiple hazard signals | Cascade flag + secondary hazards | <1s | Included |
| generate_alert_recommendation | Recommendation | Propose alert message/zone | Analysis output + population data | Recommended alert (message, zone, severity) | <2s | $33.75 |
| compute_evacuation_zone | Recommendation | Define at-risk area | Hazard extent + population density | Evacuation polygon + capacity | <3s | Included |
| estimate_population_at_risk | Recommendation | Count people in danger | Jurisdiction + hazard extent + time-of-day | Population estimate + demographics | <2s | Included |
| rank_alert_priority | Recommendation | Score alert by urgency | Hazard type + confidence + population | Priority score (1-100) | <500ms | Included |
| validate_recommendation | Validation | Check against thresholds | Recommendation + historical metrics | Validation result (approve/revise/halt) | <1s | $0.72 |
| compare_historical_patterns | Validation | Benchmark against past events | Current recommendation + historical DB | Pattern match score + anomaly flag | <2s | Included |
| flag_outliers | Validation | Detect unusual outputs | Recommendation vs baseline | Outlier confidence (0-100%) | <500ms | Included |
| escalate_to_human | Validation | Route to human reviewer | High-stakes recommendation | Human review ticket created | <30s | Included |
| human_review_hazard_alert | Lead | Manual approval workflow | Recommendation + context | Approved/rejected/modified alert | <15min | N/A (human) |
| log_decision_record | Lead | Create audit trail | Decision + reasoning + outcome | Logged in running record | <100ms | Included |
| publish_alert | Lead | Distribute to users/EMS | Approved alert | Alert published via API | <1s | Included |
| report_to_module_owner | Lead | Communicate results | Decision summary | Email + dashboard update | <5min | Included |
| aggregate_multi_module | System Lead | Synthesize across hazards | [Wildfire, Flood, Earthquake] outputs | System-level priority + action | <3s | $5/month |
| detect_cascade_events | System Lead | Trigger cross-module analysis | Multi-hazard signal | Secondary module alerts | <2s | Included |
| manage_resource_allocation | System Lead | Optimize EMS dispatch | All hazard zones + available resources | Resource assignment | <5s | $10/month |
| generate_audit_report | Lead | Post-event analysis | Event + all agent decisions | Comprehensive audit trail | <1hr | Included |

---

## Data Storage (Agent State & Logs)

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| agent_decisions | Agent recommendation log | decision_id, agent_id, input_state, recommendation, confidence, timestamp | 2 years |
| human_reviews | Human override log | review_id, decision_id, reviewer_id, action, modifications, rationale | 3 years |
| agent_metrics | Agent performance tracking | agent_id, metric_name, value, timestamp | 1 year |
| running_records | Event-level decision trail | event_id, all_agent_decisions, human_reviews, final_outcomes | 7 years |
| agent_errors | Failure/anomaly log | error_id, agent_id, error_type, input_data, error_message | 1 year |
| cost_tracking | Agent usage costs | month, agent_id, tokens_used, cost_usd | 2 years |

---

## Message Bus (NATS) - Agent Communication

| Channel | Publisher | Subscriber | Frequency | Payload |
|---------|-----------|------------|-----------|---------|
| agent.monitor.observation | Monitor Agent | Analysis Agent | Real-time | {observation_id, hazard_type, features, source} |
| agent.analysis.prediction | Analysis Agent | Recommendation Agent | On alert | {prediction_id, hazard_extent, confidence, model_version} |
| agent.recommendation.proposal | Recommendation Agent | Validation Agent | On alert | {proposal_id, alert_message, evacuation_zone, population} |
| agent.validation.result | Validation Agent | Lead Agent | On decision | {validation_id, status, confidence, anomaly_flag} |
| agent.lead.human_review | Lead Agent | Human Reviewer | On escalation | {ticket_id, recommendation, context_summary} |
| agent.lead.decision | Lead Agent | All subscribers | On publish | {decision_id, alert, status, timestamp} |
| system.lead.cascade | System Lead Agent | All hazard modules | On multi-hazard | {event_id, cascading_hazards, priority} |
| agent.audit.event | Lead Agent | Audit system | Per decision | {event_id, full_decision_trail_json} |

---

## Cache (Redis)

| Key Pattern | Purpose | TTL | Size | Update Freq |
|-------------|---------|-----|------|------------|
| agent:monitor:{module}:state | Monitor agent current state | 1min | 1MB | Continuous |
| agent:analysis:{module}:latest_prediction | Latest analysis output | 5min | 100KB | Per prediction |
| agent:confidence_calibration | Calibration lookup table | Permanent | 500KB | Weekly |
| model:inference_cache:{model_id} | Recent model outputs | 1hr | 10MB | Per inference |
| agent:human_review_queue | Pending human reviews | Until reviewed | 500KB | Per escalation |
| agent:cost_tracker:{month} | Month-to-date token costs | 1 month | 1KB | Continuous |

---

## External Integrations (LLM APIs)

| System | Model | Use | Cost/1M Tokens | Quota |
|--------|-------|-----|----------------|-------|
| Anthropic Claude API | Claude Haiku | Monitor (lightweight parsing) | $0.80 input, $2.40 output | Standard |
| Anthropic Claude API | Claude Opus | Analysis (complex reasoning) | $15 input, $60 output | Standard |
| Anthropic Claude API | Claude Opus | Recommendation (multi-turn) | $15 input, $60 output | Standard |
| Anthropic Claude API | Claude Haiku | Validation (pattern matching) | $0.80 input, $2.40 output | Standard |
| OpenAI API | GPT-4 (fallback) | If Claude overloaded | $3 input, $6 output | Optional |

---

## Agent Team Configuration

### Per-Module Agent Team (Wildfire, Flood, Earthquake, etc.)

```
Module: Wildfire Hazard Analysis

Monitor Agent (Haiku)
├─ Ingest: USGS feeds, NOAA weather, Sentinel-2 imagery, phone reports
├─ Process: Parse, validate, fuse multi-source
└─ Output: Structured observation {extent, confidence, sources}

Analysis Agent (Opus)
├─ Ingest: Monitor observations, historical fire data, terrain
├─ Process: Run DL/physics surrogate, compute extent, estimate confidence
└─ Output: Prediction {extent_polygon, confidence_0-100, lead_time}

Recommendation Agent (Opus)
├─ Ingest: Analysis prediction, population data, shelter availability
├─ Process: Generate alert message, evacuation zone, EMS request
└─ Output: Proposal {alert_text, evac_zone, severity, population_affected}

Validation Agent (Haiku)
├─ Ingest: Recommendation, historical accuracy, thresholds
├─ Process: Compare patterns, flag outliers, assess confidence
└─ Output: Validation {approve/revise/halt, confidence, anomaly_flag}

Lead Agent (Human in Loop)
├─ Ingest: Validation result, human decision if escalated
├─ Process: Route to human if <70% confidence, publish if approved
└─ Output: Decision {published_alert, audit_log, notifications}
```

---

## Costs Per Active Module (Steady State)

| Agent | Frequency | Tokens/Run | Runs/Month | Cost/Month |
|-------|-----------|-----------|-----------|-----------|
| Monitor (Haiku) | Continuous 10s | 2,000 | 260K/month | $3.20 |
| Analysis (Opus) | Per alert (5/day) | 8,000 | 150K/month | $22.50 |
| Recommendation (Opus) | Per alert (5/day) | 12,000 | 150K/month | $33.75 |
| Validation (Haiku) | Per alert (5/day) | 3,000 | 150K/month | $0.72 |
| **Subtotal per module** | | | | **$60.17** |
| **× 5 modules** | | | | **$300.85/month** |

---

## Costs During Active Event (10× Multiplier)

| Scenario | Duration | Peak Traffic | Cost/Month | Total |
|----------|----------|-------------|-----------|-------|
| Single module active (wildfire) | 10 days | 10x monitor, 20x analysis | $600 | $200 for event |
| Two modules active (wildfire + flood) | 10 days | 10x each | $1,200 | $400 for event |
| Multi-hazard cascade (3+ modules) | 10 days | 10x each | $1,800 | $600 for event |
| Major event (all 5 modules) | 10 days | 20x each | $3,300 | $1,100 for event |

---

## Human-in-the-Loop Escalation

| Situation | Trigger | Escalation Path | SLA | Outcome |
|-----------|---------|-----------------|-----|---------|
| High-confidence alert (>85%) | Analysis score >85% | Queued, human audit within 1hr | <1hr | Alert published, human notified async |
| Disputed output | Validation flags <70% | Routed to Lead Agent | <15min | Human review ticket created |
| Evacuation order | Recommendation severity=critical | Always human review | <30min | Lead Agent calls fire chief |
| Cascade event | System Lead detects secondary hazard | Multi-module coordination | <5min | Secondary module alerted, Lead notified |
| System anomaly | Agent error rate >1% | Escalate to CTO | <10min | Investigation initiated |

---

## Running Records & Audit Trail

For each decision event, record:

```json
{
  "event_id": "ev123",
  "timestamp": "2026-03-09T14:30:00Z",
  "hazard_type": "wildfire",
  "monitor_observation": {
    "agent_id": "monitor_wf_1",
    "input": {...},
    "output": {...},
    "tokens_used": 2000,
    "latency_ms": 450
  },
  "analysis_prediction": {
    "agent_id": "analysis_wf_1",
    "input": {...},
    "output": {...},
    "confidence": 0.87,
    "tokens_used": 8000,
    "latency_ms": 1200
  },
  "recommendation_proposal": {
    "agent_id": "recommendation_wf_1",
    "input": {...},
    "output": {...},
    "population_affected": 5000,
    "tokens_used": 12000,
    "latency_ms": 1800
  },
  "validation_result": {
    "agent_id": "validation_wf_1",
    "status": "approve",
    "confidence": 0.92,
    "tokens_used": 3000,
    "latency_ms": 300
  },
  "human_review": {
    "reviewer_id": "human_1",
    "action": "approved",
    "modifications": null,
    "review_time_ms": 600000,
    "notes": ""
  },
  "final_decision": {
    "alert_published": true,
    "alert_id": "alert123",
    "timestamp_published": "2026-03-09T14:45:00Z"
  },
  "total_cost": 0.0475,
  "total_latency_ms": 4350
}
```

---

## Dual Reporting Structure

```
Lead Agent (per module)
├─ Reports to: Module Owner (fire chief, flood manager, etc.)
├─ Communication: Daily summary email + dashboard
└─ Escalation: Direct call for P1 incidents

System Lead Agent
├─ Reports to: CTO + FEMA liaison
├─ Communication: Hourly update during events, daily otherwise
└─ Coordination: Cross-module cascade detection, resource allocation
```

---

## LangGraph Implementation Pattern

```python
# Define graph nodes
class MonitorNode:
    def run(self, state) -> state:
        # Ingest feeds → output observation
        return {...observation...}

class AnalysisNode:
    def run(self, state) -> state:
        # Prediction logic
        if state.observation.confidence < 0.3:
            return route_to_request_additional_sensors(state)
        else:
            return {...prediction...}

class RecommendationNode:
    def run(self, state) -> state:
        # Generate alert + zone
        return {...proposal...}

class ValidationNode:
    def run(self, state) -> state:
        # Check thresholds
        if state.proposal.confidence < 0.7:
            return route_to_human_review(state)
        else:
            return state

class LeadNode:
    def run(self, state) -> state:
        # Publish or hold
        return {...decision...}

# Build graph
builder = StateGraph()
builder.add_node("monitor", MonitorNode().run)
builder.add_node("analysis", AnalysisNode().run)
builder.add_node("recommendation", RecommendationNode().run)
builder.add_node("validation", ValidationNode().run)
builder.add_node("lead", LeadNode().run)

# Add edges
builder.add_edge("monitor", "analysis")
builder.add_conditional_edges("analysis", route_on_confidence)
builder.add_edge("recommendation", "validation")
builder.add_conditional_edges("validation", route_on_validation)
builder.add_edge("lead", END)

graph = builder.compile()
```

---

## Monitoring (5-Agent Team Meta-Level)

| Agent | Role | Frequency | Key Metrics | Escalation |
|-------|------|-----------|-------------|-----------|
| Quality | Agent accuracy vs ground truth | Daily | Precision, recall, F1 per agent | Any metric drop >5% |
| Research | Token efficiency, cost trends | Weekly | Tokens/decision, cost per event | Cost spike >20% |
| Business | Agent uptime, response SLA | Daily | Availability, latency P95 | Latency >5s, availability <99% |
| Compliance | Decision audit trail completeness | Daily | Records logged, human review logged | Missing audit entry |
| Lead | Overall system health | Per event | All agents functioning, escalations handled | Any agent failure |

---

## Dependencies

| Module | Dependency | Type | Criticality |
|--------|-----------|------|------------|
| 02_hazard_models | Physics models, DL surrogates | Hard | Critical |
| 50_modeling_simulation | Evacuation simulation output | Soft | Medium |
| 54_data_storage | Running records DB, audit logs | Hard | Critical |
| 17_notifications_alerts | Alert publication | Soft | High |
| 33_agentic_planners | LangGraph framework, Claude API | Hard | Critical |

---

## Implementation Notes

- **LangGraph over CrewAI:** Explicit state graph allows precise cost tracking; streaming responses for real-time alerts; conditional branching based on confidence
- **Token optimization:** Monitor uses Haiku (lightweight parsing); Analysis/Recommendation use Opus (complex reasoning); Validation uses Haiku (pattern matching)
- **Confidence calibration:** Track reported confidence vs actual accuracy; adjust thresholds monthly; target: reported = actual ±5%
- **Human-in-the-loop:** Escalate recommendations <70% confidence; require human approval for evacuation orders; log all human decisions for learning
- **Cascade detection:** System Lead Agent monitors all hazard modules; if wildfire triggers evacuations, checks if flood inundation overlaps → alerts both teams
- **Cost tracking:** Log tokens per agent, per decision; aggregate monthly; correlate with event magnitude; budget $5K-10K/year for all agentic operations
