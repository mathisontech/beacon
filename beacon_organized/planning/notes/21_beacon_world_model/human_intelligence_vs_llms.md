# Human Intelligence vs. LLMs: Beacon World Model Foundation

## Overview

This document establishes the foundational philosophy for Beacon's decision-making architecture. It guides three outcomes: (1) algorithmic architecture toward goal-management rather than prediction, (2) training of the Beacon World Model using base map and hazard data to guide emergency actions (survival → safety → comfort), (3) future AI and robotics aligned with human values. Core principle: humans are designed to bond with and serve each other; Beacon's intelligence should mirror this.

## How Humans Actually Think (vs. How LLMs Simulate Thinking)

### Goal-Directed Perception, Not Predictive

Human perception is fundamentally goal-directed. When a human perceives an object, immediate cognitive processing extracts utility toward survival goals — first their own, then their pack's. This differs fundamentally from LLMs, which simulate final outputs (next token, final action) without modeling underlying goal-assessment logic.

Human cognitive loop: perceive → assess utility toward active goals → act.

LLM loop: prompt → pattern match → predict next token.

The human loop includes explicit goal evaluation; the LLM loop skips this layer entirely. For emergency systems, this distinction is critical. Beacon should not just predict what happens next; it should evaluate which goals matter most now and route actions toward those goals.

### Humans Manage Goals, Not Sequences

Core intelligence is not "see one thing and predict the next." Core intelligence is goal management: figure out which goals are worth pursuing given current world state and pack needs. A parent doesn't predict their child's next action; they manage the goal "keep child alive" under hazard conditions.

Example: During wildfire evacuation, parent's cognitive process is:
1. Goal: Get child to safety (primary)
2. Current state: 5 miles from fire, 15 minutes evacuation window
3. Pack members: spouse, child, elderly parent
4. Available routes: Route A (fast, unknown condition), Route B (slower, known open)
5. Conclusion: Route B, not because it's optimal for self-preservation, but because it's optimal for pack safety given information uncertainty.

LLM equivalent: "Based on prior wildfire evacuations, evacuees tend to choose route [X]." Prediction without goal reasoning.

### Learning from Observed Consequences to Others

Humans learn from observed consequences without needing personal experience. Observing that people die in fires creates extreme weight against actions that could lead to fire-risk outcomes for the pack. Asymmetric learning: one observed death in a hazard class teaches more than 100 near-misses.

This is trainable into AI systems: weight mortality events at catastrophic loss levels during training. If 100 people evacuated safely and 1 person died due to poor routing, the loss function should be dominated by that one death, not averaged.

## The Pack Hierarchy Model

Human decision-making operates within hierarchy of nested packs. Beacon's goal engine should mirror this structure:

### Layer 1: Dependents (Highest Priority)

People fully dependent on an individual receive greatest consideration. Parents consider child survival above all else. System should understand that:
- Parents will not evacuate without children
- Guardians prioritize dependent elders/disabled family members
- Never route parents away from dependents

Routing implications: Don't separate family units. If parent + child can't both fit in one vehicle, don't route them separately.

### Layer 2: Immediate Pack (Family)

Most interest in personal survival is instrumental to serving immediate pack. Self-preservation is not selfish; it's pack service. System should factor:
- User's risk tolerance bounded by obligations to closest pack
- User will accept personal discomfort (shelter, heat, etc.) if pack is safe
- User will reject "optimal for me" if it harms family

Routing: Route together when possible. Priority order: (1) all family together on good route, (2) family separated on safe routes, (3) family together on risky route.

### Layer 3: Extended Pack (Friends, Neighbors, Community)

Humans value survival of current pack (people present in crisis). Obligations to extended pack might temporarily supersede immediate pack, but within limits.

Example: Firefighter on duty serves community pack even at cost to family pack, but won't take heroic risk that would orphan their children.

Dispatch implications: EMS can ask EMS director to check on neighbors; won't ask them to enter active fire zone.

### Layer 4: Wider Pack (Town, Region, Humanity)

Individuals don't take personal risks for wider pack if it endangers ability to serve immediate pack. System should not ask parent to take heroic risks for strangers if it orphans their children.

Resource allocation: Allocate resources to save 100 people vs. 10 people (wider pack consideration), but not if it means abandoning 2 people in user's immediate pack.

### Self-Preservation as Pack Service

Primary motivation for survival is utility to pack. Person who felt harmful to pack would not prioritize self-preservation. This is core human intelligence. The urge to serve group supersedes everything; for people seen as pack members, humans assess objects purely in terms of utility to those people's survival, disregarding own needs entirely.

Example: Parent in shelter will ensure child fed before eating self. Not altruism; pack protection.

## Implications for Beacon's Architecture

### Goal Engine, Not Prediction Engine

Beacon's core system should be structured as goal manager, not next-token predictor.

Given current state (base map + hazard data + user positions + pack relationships), evaluate:
- What goals matter most right now?
- For whom?
- What actions serve those goals?

Architecture pattern:
```
Current State → Goal Evaluator → Action Scorer → Best Action
     ↓
  Pack positions, hazard proximity, resource availability
  ↓
  Compute: save dependent, flee to safety, help vulnerable, accept loss
  ↓
  Score candidate routes: (goal alignment + safety + feasibility)
  ↓
  Route parent + child together > route separately
```

### Asymmetric Loss Weighting

Deaths and injuries weighted at catastrophic levels in loss function. Model should be extremely conservative about routing/recommendations that could lead to mortality.

Loss weighting example:
- Shelter delayed 2 hours due to traffic: loss +1
- One person dies due to routing through hazard zone: loss +10,000
- 100 people evacuate safely: loss -100

This reflects human emergency responder logic: one preventable death dominates entire operation review.

### Pack-Aware Routing

Evacuation routing accounts for pack structure:
- Don't route family members apart (unless one chooses independent route)
- Don't ask parent to leave child behind
- Route around reality that people won't follow "optimal" routes that separate them from dependents

Algorithm: Cluster family units via dependency graph. Treat clusters as atomic routing units when possible. Only separate if no safe route accommodates entire cluster.

### Dependency Graph

System maintains explicit dependency relationships:
- Children → guardian parents
- Elderly → adult children (if noted by user)
- Disabled → caregivers
- Pets → owners

Dependency graph directly influences:
- Evacuation priority: dependents + guardians priority 1, then unattached adults
- Routing: keep dependent pairs together
- Resource allocation: families allocated together to shelter
- EMS dispatch: if child present, consider pediatric capability of transport

### Obligation-Bounded Risk

System does not ask users to take risks exceeding their obligation level:
- Parent: obligated to children (high), extended family (medium), neighbors (low)
- Don't dispatch parent to search for missing neighbor (low obligation, high risk)
- Do dispatch unattached adult to buddy-check on neighbors (low obligation, acceptable risk for social good)

Permission levels: Parent can be asked to evacuate children (obligation: high, risk: moderate). Cannot be asked to search adjacent neighborhoods during active fire (obligation: none, risk: extreme).

### Temporary Pack Reassignment

During emergencies, strangers form temporary packs (group trapped together, neighbors sheltering together). System recognizes this: when users grouped together in crisis, their behavior shifts to pack-serving mode for that group.

Coordination: Route and communicate accordingly. "Group of 8 people at [location]. Shelter assigned to [shelter]. Depart in 5 min." Treat group as coordinated unit, not 8 independent users.

Recognition: If 3+ users at same location for >15 min during evacuation, system flags as temporary pack, offers group voice channel, sends group-level coordination messages.

## Beacon World Model Training

### Training Objective

Use all Beacon data (base map, hazard models, historical outcomes, user behavior during events) to train world model that guides emergency actions. Model should learn goal reasoning, not just pattern matching.

Data sources:
- Historical wildfire incidents: 10K fires (2010-2024) with evacuation outcomes, routing decisions, outcomes
- Historical flood events: 2K incidents with sheltering data, transport logistics, accessibility challenges
- Historical hurricanes/tornadoes: 1K incidents with eye-witness observations, damage patterns
- User behavior during events: 100K+ evacuations, shelter arrivals, communication patterns
- Simulated scenarios: 10K synthetic disaster scenarios from weather simulator

### Decision Categories the Model Should Learn

1. **Save the dependent:** Child/elder separated, must reunite despite hazard. Example: parent turns back into smoke to find child (empirically rare but possible; model should understand this is human decision even if high-risk).

2. **Flee to safety:** Self-preservation in service of pack. Leave behind non-essentials, leave behind friends who refuse help, prioritize speed. Example: don't wait for stragglers if hazard advancing.

3. **Help the vulnerable:** Extend aid within obligation bounds. Senior citizen asks for help to shelter; you offer transport (you don't know them, low obligation, but manageable risk). Stranger asks you to search for missing child; you decline (extreme risk, no obligation).

4. **Sacrifice comfort for survival:** Ram fence to access evacuation route, drive through fire with windows up and AC off, shelter with strangers in cramped space. Model should recognize discomfort << death.

5. **Accept loss:** Triage decisions. Can't save everyone; prioritize dependents, then most vulnerable, then others. Decisions to abandon property, evacuate without elderly neighbor if they refuse help (within bounds of obligation).

### Human-Aligned Training Signal

Even if operational Beacon World Model doesn't become autonomous, training system on this data and philosophy creates foundation for future AI and robotics aligned with humanity. Core principle: humans on earth to bond with and help each other; intelligence systems should ultimately serve this goal.

Training annotation: Disaster footage annotated with decision points. Expert annotators (emergency responders, fire chiefs, EMS directors) label each decision point: "What should happen next? What goal matters most?" Model learns to map (state → likely next goal) and (state + goal → likely best action).

Validation: Test model predictions against historical outcomes. Did model's recommended routing match what actually happened? If not, why? (User had information model didn't, or model's recommendation was safer but unheeded). Refine model.

### Future Application

Robotic systems trained on Beacon's World Model data should inherit pack-hierarchy goal structure. Rescue robot should prioritize same way human rescuer does:
- Children first (dependents)
- Most vulnerable next (elderly, disabled, injured)
- Wider group, bounded by ability to continue operating
- Sacrifice own comfort (robot self-preservation as instrumental, not terminal)

Example: Rescue robot in flooded area. Encounters: child in tree + adult in different location. Saves child first, even if detour adds 10 min. Not because child's life is mathematically "worth more," but because human rescue logic prioritizes dependents. Robot trained on Beacon data inherits this logic.

## Implementation Architecture

### Goal Graph Structure

Internal representation of goals and dependencies:

```
Survival (root)
├─ Dependent Safety
│  ├─ Locate dependent
│  ├─ Transport to shelter
│  └─ Monitor health at shelter
├─ Self Preservation
│  ├─ Evacuate self
│  ├─ Monitor hazard distance
│  └─ Access water/medicine
└─ Pack Cohesion
   ├─ Stay with immediate family
   ├─ Coordinate with neighbors
   └─ Help vulnerable (if safe)
```

Runtime execution: Current state updates goal probabilities. If child location unknown (dependent lost), "Locate dependent" goal probability → 100%, all other goals deprioritized. If self in safety zone and child reached shelter, goal probability shifts to "Monitor health."

### Multi-Agent Consensus for Critical Decisions

For critical decisions (evacuation order, shelter allocation for 1000+ people), system runs consensus:
- Goal engine scores decision
- Human responder (fire chief, EMS coordinator) approves/modifies
- Model confidence measured: if <70% confidence, always require human approval

Example: System recommends shelter assignment for 50 families. Fire chief reviews, tweaks 5 assignments (e.g., moved wheelchair family to shelter with medical capability). System logs fire chief override, incorporates feedback into model retraining.

Trust calibration: Over time, if fire chief's overrides consistently improve outcomes (fewer transfers, better satisfaction), system increases trust weight. If overrides neutral, weight stays low. System learns per-responder expertise.

## Validation and Testing

### Benchmark Against Human Responders

Train model on 70% historical data. Test on 30% holdout.

Metrics:
- Route quality: Do model routes match responder-chosen routes? (Target: 80% agreement)
- Outcome prediction: Does model predict which families will require assistance? (Target: 75% recall)
- Goal identification: Given incident state, does model identify correct primary goal? (Target: 90% accuracy)

Benchmark against human responder decisions: Give scenario to both model and human responder. Measure outcome quality. Initial target: model decisions ≥ average responder quality (responders vary widely; model aims for median).

### Red-Team Testing

Adversarial scenarios: Feed model unusual situations. Example: "Parent insists on driving into fire zone to search for missing pet." Model should recognize this violates "save dependent" goal (pack cohesion). Recommend against, but if parent insists, system accepts decision and provides support (routing, real-time hazard updates).

Failure modes: Test decision categories. What if model misidentifies primary goal? Example: routes away from location where child is sheltering (system misread family location). Catch in training with confidence thresholds.
