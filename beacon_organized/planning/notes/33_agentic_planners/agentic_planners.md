# Agentic Planners Architecture

## Multi-Agent Architecture: One Team Per Hazard Module

Beacon organizes AI agents into independent teams, each responsible for one hazard type (wildfire, flood, earthquake). This isolation reduces failure blast radius and allows independent scaling.

**Team Composition Per Hazard Module**
1. Monitor Agent: Ingests raw sensor data, USGS feeds, weather APIs
2. Analysis Agent: Evaluates hazard likelihood, geographic extent, confidence levels
3. Recommendation Agent: Proposes alerts, evacuation zones, resource allocations
4. Validation Agent: Reviews recommendations against historical accuracy, flags outliers

**Inter-Team Communication**
- Central coordinator (top-level agent) detects multi-hazard scenarios (cascade events)
- Example: Earthquake triggers landslides; coordinator alerts both teams
- Message queue (NATS) enables asynchronous team coordination without coupling

**Advantages**
- Independent monitoring: Each team operates on different data sources, failure isolated
- Scaling: Add new hazard module (e.g., tornado prediction) without refactoring core architecture
- Accountability: Human lead directly responsible for one team's outputs

## LangGraph Framework

LangGraph is recommended over CrewAI or AutoGen due to superior control flow and cost efficiency.

**LangGraph Benefits**
- Explicit state management: Agent state persisted between steps, enabling resumption
- Streaming responses: Partial results available in real-time (critical for time-sensitive alerts)
- Conditional branching: Different reasoning paths based on hazard type
- Cost efficiency: Pay per token used; unused branches don't incur costs

**Comparison**
- CrewAI: Simpler syntax, but higher token overhead (~15% more per run due to verbose orchestration)
- AutoGen: More flexible multi-turn conversation, but slower (not suitable for <5-minute response window)
- LangGraph: Explicit DAG definition allows precise cost accounting and optimization

**Beacon LangGraph Workflow Example**
```
1. InputNode: Fetch latest sensor data
2. AnalysisNode: Evaluate hazard probability
   - Branch A (High confidence): Route to Recommendation
   - Branch B (Low confidence): Request additional sensors
3. RecommendationNode: Propose alert parameters
4. ValidationNode: Compare against thresholds
5. HumanReviewNode: Present to human lead for approval
6. OutputNode: Publish alert or archive for review
```

## Agent Roles & Responsibilities

**Monitor Agent**
- Ingests: USGS earthquake feeds, NOAA weather, local radar, satellite imagery
- Outputs: Structured hazard observations (location, confidence, magnitude)
- Runs: Continuous (kafka consumer polling every 10 seconds)
- Cost: ~$10/month (Claude Haiku for lightweight parsing)

**Analysis Agent**
- Ingests: Monitor observations, historical event patterns, terrain data
- Outputs: Hazard extent (GeoJSON polygons), severity scores (0-100), confidence intervals
- Runs: Triggered by Monitor observations, typically <2 minutes per cycle
- Cost: ~$80/month (Claude Opus for complex spatial reasoning)

**Recommendation Agent**
- Ingests: Analysis outputs, current population density, existing alerts
- Outputs: Proposed alert message, evacuation zone, EMS resource request
- Runs: Triggered by Analysis alerts
- Cost: ~$120/month (Multi-turn reasoning, cost per successful recommendation)

**Validation Agent**
- Ingests: All previous agents' outputs, historical accuracy metrics
- Outputs: Approval (with confidence score), request for revision, or halt
- Runs: Final gate before human review
- Cost: ~$40/month (Haiku for pattern matching against thresholds)

**Cost Per Active Module**: ~$250/month in steady state, ~$331/month during active events (10x traffic multiplier).

## Cost Estimation

**Pricing Assumptions**
- Claude Haiku: $0.80 per 1M input tokens, $2.40 per 1M output tokens
- Claude Opus: $15 per 1M input tokens, $60 per 1M output tokens
- Monitor Agent uses Haiku; Analysis/Recommendation use Opus

**Monthly Breakdown (Steady State)**
- Monitor (continuous ingestion): 50 analyses/day × 2K tokens = 3M tokens/month Haiku = $3.20
- Analysis (triggered alerts): 5 alerts/day × 8K tokens = 1.2M tokens/month Opus = $22.50
- Recommendation (per alert): 5/day × 12K tokens = 1.8M tokens/month Opus = $33.75
- Validation (per alert): 5/day × 3K tokens = 450K tokens/month Haiku = $0.72
- Total: ~$60/month per module (steady state)

**Active Event Multiplier**
- During wildfire: Monitor 10x ingestion, Analysis 20x triggering
- 10-day active event: ~$331 for that module
- Peak: All 4 modules active simultaneously = $1,324 for 10 days

**Budget**: $5K-10K per year for all modules.

## Human-in-the-Loop for Critical Decisions

**Escalation Thresholds**
- Evacuation orders: Always human review (module lead approval required)
- High-confidence alerts (>85%): Published immediately, human audit within 1 hour
- Disputed outputs: Validation Agent flags, routed to human before publication
- System anomalies: Agent detects deviation from baseline, escalates to CTO

**Workflow**
1. Recommendation Agent proposes alert
2. Validation Agent checks against thresholds
3. If high-confidence: Alert queued; human notified asynchronously
4. Human lead reviews alert within 30 minutes
5. Human can approve, modify severity, or reject
6. Approval routes alert to EMS/FEMA API

**SLA**: Critical alert human review within 15 minutes; EMS notification within 30 minutes.

## Research Agents for Continuous Improvement

Separate agent team (not real-time) runs nightly to analyze model performance and propose improvements.

**Research Agent Tasks**
- Compare daily predictions to observed outcomes
- Calculate precision, recall, F1 by event type
- Flag systematic biases (e.g., over-prediction in coastal areas)
- Propose model retraining parameters
- Suggest new data sources if model drift detected

**Output**: Weekly report to hazard team leads; triggers retraining if F1 drops below threshold.

**Cost**: ~$10/month (runs once per day on historical data, uses Haiku for analysis).

## Deployment: Containerized Per-Module, Kubernetes Orchestration

**Container Structure**
- Each hazard module (wildfire, flood, etc.) runs as independent Docker container
- Container includes: Python runtime, LangGraph framework, Claude SDK, data dependencies
- Container size: ~500MB (base Python + libraries)

**Kubernetes Setup**
- EKS cluster (AWS managed Kubernetes)
- Persistent storage: Kubernetes ConfigMaps for model configurations, Secrets for API keys
- Scaling: Horizontal Pod Autoscaling based on queue depth (NATS subscriptions)
- Load balancing: Service mesh (Istio) for canary deployments during model updates

**Resource Allocation**
- Monitor Agent: 1 CPU, 512MB RAM (continuous, low compute)
- Analysis Agent: 2 CPU, 2GB RAM (burst during events)
- Recommendation Agent: 2 CPU, 2GB RAM (interactive)
- Validation Agent: 1 CPU, 1GB RAM (low latency)
- Total per module: ~6 CPU, 5.5GB RAM in steady state

**Cost**: EKS cluster ~$730/month (1 node), scales to 3-4 nodes during active events (~$2,190/month).

**Deployment Strategy**
- Canary: New model deployed to 10% of traffic first
- Rollback: Automatic if error rate exceeds 5% or latency exceeds 5 seconds
- Version control: Git tags for each model version, stored in ECR (AWS Elastic Container Registry)
