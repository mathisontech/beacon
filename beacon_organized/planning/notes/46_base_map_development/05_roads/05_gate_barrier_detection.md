# Gate/Barrier Detection

Identify access control barriers: fences, walls, gates, and assess rammability.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| detect_gate_from_street_view | Mapillary images around road | Gate presence flag, lock type, owner info | CV + manual database |
| detect_fence_from_lidar | LiDAR height profile perpendicular to road | Fence presence, height, extent | Point cloud classification |
| classify_barrier_type | LiDAR profile + street-view image | Type (fence, wall, guardrail, hedge, boulder) | Visual + geometric classification |
| assess_fence_rammability | Barrier type, material, post spacing | Rammability score 0-1 (0=rammable, 1=not) | Material properties |
| detect_gate_lock_type | Street-view imagery | Lock type (padlock, electronic, bollard, chain) | CV classification |
| look_up_gate_owner_contact | Gate location, assessor parcel data | Owner name, phone, email | Private property database |
| compute_barrier_bypass_difficulty | Barrier array along road | Difficulty score 0-1 (bypass feasibility) | Cumulative barrier assessment |

## Data Storage

Barriers stored as separate GeoParquet line layer:

```
{
  "geometry": "LINESTRING(...)",
  "barrier_id": "string (UUID)",
  "barrier_type": "fence" | "wall" | "guardrail" | "hedge" | "boulder" | "gate" | "bollard",
  "height_m": float32,
  "material": "chain_link" | "wood" | "concrete" | "brick" | "metal" | "vinyl" | "hedge" | "other",
  "rammability_score": float32,
  "lock_type": "padlock" | "electronic" | "chain" | "bollard" | "swing_arm",
  "gate_owner_contact": string,
  "is_locked": boolean,
  "vehicle_penetration_difficulty": float32,
  "confidence": float32
}
```

## Fence Detection from LiDAR

**Target: >90% precision**

Algorithm:

1. For each road segment, extract perpendicular LiDAR cross-sections at 10m intervals
2. Identify linear features (consistent height for >1m horizontal extent)
3. Measure height (vertical extent of points)
4. Measure continuity (percentage of cross-section covered)
5. If height 0.5-2.5m AND continuity >70% → fence candidate

Classification:

- Solid fence (no gaps): wall or solid material fence
- Sparse fence (gaps visible): chain-link or rail fence
- Low fence (<1.5m): decorative or property boundary
- High fence (>1.8m): privacy or security barrier

Limitations:
- Cannot reliably detect short fences (<0.5m)
- Vegetation-covered fences may be misclassified
- Metal fences have sparse LiDAR return → lower confidence

## Street-View Gate Detection

For gates and access control:

1. Query Mapillary for images at road approach
2. Detect visual elements: gate hardware, signage, lock mechanism
3. Classify: automated (electric) vs. manual, lock type
4. Identify ownership signage if present

Model: Custom CNN trained on 500-image gate dataset.

Classes:
- Automatic gate (electric motor visible)
- Manual gate (swing/slide mechanism)
- Bollard (removable post)
- Chain across road
- Cattle guard (rattle gate)
- Open (no obstruction)

Confidence: 0.80-0.95 (high on clear signage, lower on partial/obscured gates).

## Material Classification

Material types by appearance:

| Material | Visual Signature | LiDAR Return | Rammability |
|---|---|---|---|
| Chain-link | Diamond grid pattern, see-through | Sparse points | Rammable (cut or force) |
| Wood | Boards or slats visible, grain | Dense vertical return | Partially rammable (splinters) |
| Concrete | Solid gray surface, monolithic | Solid return | Not rammable |
| Brick/stone | Individual units visible | Solid return | Not rammable |
| Metal (rail/beam) | Shiny, geometric shapes | Sparse points | Partially rammable (bend) |
| Vinyl | Smooth, uniform color | Medium return | Partially rammable (crack) |
| Hedge | Vegetation texture | Fuzzy return | Rammable but slow (thick) |
| Boulders | Irregular shapes | Clustered returns | Variable (depends on size/stability) |

## Rammability Assessment

Rammability = how easily emergency vehicle can breach barrier.

Scoring (0 = easily rammable, 1 = not rammable):

| Material + Height | Score | Notes |
|---|---|---|
| Chain-link, <1.5m | 0.1 | Cut or force frame |
| Chain-link, >1.5m | 0.2 | Requires bolt cutters but feasible |
| Wood, <1.5m | 0.4 | Splinters, vehicle damage risk |
| Wood, >1.5m | 0.5 | Thick posts, difficult |
| Metal rail/beam | 0.3 | Can be bent (fire truck preferred) |
| Concrete/brick | 0.95 | Not rammable, requires demolition |
| Hedge (dense) | 0.6 | Slow penetration, clears gradually |
| Boulder | Variable (0.3-0.8) | Depends on size and stability |

Gate lock types bypass difficulty:

| Lock Type | Difficulty | Notes |
|---|---|---|
| Padlock | 0.2 | Bolt cutters effective |
| Chain | 0.2 | Bolt cutters through chain |
| Electronic | 0.5 | Requires power cut or override |
| Swing arm/bollard | 0.4 | May be removable or bendable |

Final rammability = material_base + lock_modifier.

## Gate Ownership Lookup

For private gates:

1. Identify parcel boundary using county assessor GIS
2. Lookup parcel owner (name, address, phone from public records)
3. Cross-reference with business database (commercial gates)
4. Store contact: gate_owner_contact = "Name | Phone | Email"

Data sources:
- County assessor parcel database (public, free or low-cost)
- USPS address lookup (verify contact)
- Business directory (for commercial properties)

Update frequency: Quarterly (assessor records update).

Contact use: EMS can call property owner to request gate opening.

## Cumulative Barrier Assessment

For roads with multiple barriers:

1. Extract all barriers along road (within 30m corridor)
2. Compute total bypass difficulty = mean(rammability_scores) if >1 barrier
3. Flag road as "access-constrained" if mean > 0.60

Example:
- Road has chain-link fence (0.1) and padlocked gate (0.2) → mean 0.15 (easily accessible)
- Road has concrete wall (0.95) and electronic gate (0.5) → mean 0.72 (highly constrained)

Evacuees need to avoid high-constraint roads; EMS may need tools/contacts.

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| barriers.detection.tile_done | Tile processed | Per-tile |
| barriers.gate_contact_updated | Owner contact refreshed | Quarterly |
| barriers.rammability_alert | High-constraint road flagged | Per region |
| barriers.access_blocked | Gate manually closed (EMS report) | Real-time event |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `barriers:tile:{tile_id}:fence_count` | 7 days | Fences per tile |
| `barriers:by_material:{material}:count` | 7 days | Count by material type |
| `barriers:gate_contacts` | 30 days | Cached owner contact info |
| `barriers:access_constrained_roads` | 24 hours | Roads with high bypass difficulty |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| LiDAR fence detection (CPU, cross-section analysis) | $80-120 |
| Street-view gate CV (Mapillary processing) | $150-200 |
| Material classification (trained CV model) | $100-150 |
| County assessor parcel lookup (data licensing) | $100-200 |
| Owner contact verification (phone/email validation) | $200-300 |
| Manual audit of 50 barriers | $100-150 |
| **Total** | **$730-1,120** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Fence detection precision | >90% | LiDAR vs. field survey |
| Material classification accuracy | >85% | Street-view expert audit |
| Rammability assessment agreement | >0.75 Kappa | EMS expert panel |
| Gate owner contact accuracy | >90% | Phone verification |
| Lock type detection accuracy | >85% | Field inspection |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| LiDAR fence detection confidence | >0.60 | Proceed, flag low-confidence |
| Street-view image availability | >60% per tile | Proceed, supplement with LiDAR |
| Gate owner contact completeness | >80% gated properties | Proceed |
| Rammability score distribution | <0.60 median | Proceed, review skewed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Detection cycle | <25 days (US) |
| LiDAR cross-section analysis latency | <0.05 sec per point |
| Gate contact database freshness | <3 months old |
| Rammability assessment reliability | >0.75 inter-rater agreement |
| Access constraint routing integration | Tested in 5 events |
