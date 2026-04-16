# Road Network Extraction

Extract and validate road network topology from multiple sources.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| extract_osm_network | OSM vector data, tile extent | Road centerlines with tags | OSM parser |
| extract_tiger_network | TIGER/Line data, tile extent | Road centerlines with address ranges | TIGER parser |
| conflate_osm_tiger | OSM segments, TIGER segments | Conflated network (unified) | Spatial join, 10m tolerance |
| detect_road_from_lidar | LiDAR point cloud (bare earth) | Road surface raster | Point classification, morphology |
| detect_road_from_satellite | NAIP RGB-NIR imagery | Road segmentation mask | D-LinkNet model |
| build_routing_graph | Centerline network, turn restrictions | Directed graph (adjacency matrix) | Graph construction, one-way logic |
| compute_road_connectivity | Graph topology | Connectivity metrics per segment | Node degree, reachability |
| identify_dead_ends | Graph topology | Dead-end street list | Degree-1 nodes |
| identify_cul_de_sacs | Graph topology + geometry | Cul-de-sac loop list | Topology pattern matching |

## Data Storage

Road network stored in GeoParquet with schema:

```
{
  "geometry": "LINESTRING(...)",
  "segment_id": "string (UUID)",
  "tile_id": "string",
  "source_osm": boolean,
  "source_tiger": boolean,
  "source_lidar": boolean,
  "source_satellite": boolean,
  "conflation_confidence": float32,
  "road_type": "primary" | "secondary" | "tertiary" | "residential" | "service" | "private" | "track" | "unknown",
  "one_way": boolean,
  "one_way_direction": "forward" | "backward",
  "bridge": boolean,
  "tunnel": boolean,
  "width_m": float32,
  "lanes": int32,
  "surface_type": "asphalt" | "concrete" | "gravel" | "dirt" | "unknown",
  "condition": "good" | "fair" | "poor" | "impassable",
  "length_m": float32,
  "speed_limit_kmh": int32,
  "connectivity_degree": int32
}
```

## Primary Sources

### OpenStreetMap (Weekly Updates)

OSM road network includes:
- `highway=*` tags (motorway, trunk, primary, secondary, tertiary, residential, service, track, path)
- `lanes` attribute
- `surface` attribute (asphalt, concrete, gravel, dirt, paved_smooth, etc.)
- `oneway` attribute (yes/no, forward/backward)
- `bridge`, `tunnel` tags
- `name` and address range tags (in some regions)
- `maxspeed` tag

Coverage: Global, weekly updates. Uneven quality globally (dense US/Europe, sparse Africa/remote areas).

Confidence: 0.70-0.85 (varies by region, rural roads often missing).

### TIGER/Line (Annual, US Only)

TIGER/Line (Topologically Integrated Geographic Encoding and Referencing) from Census:
- Road centerlines with precise address ranges
- `MTFCC` code (feature type classification)
- Complete US coverage (primary through local roads)
- Authoritative for address geocoding

Confidence: 0.90-0.95 (official US standard, occasionally outdated for new subdivisions).

### LiDAR Bare Earth Detection

For areas with LiDAR coverage (US priority via 3DEP):

1. Filter point cloud to bare earth class (LAS classification 2)
2. Create bare-earth DEM (1m resolution)
3. Apply morphological opening (remove small features)
4. Detect depressions (valleys, roads) via flow direction
5. Extract road surface centerline (skeleton of road pixels)

Accuracy: High precision (<0.5m lateral error) but may miss small roads under tree canopy.

Coverage: US (3DEP), coastal areas (NOAA Digital Coast), limited elsewhere.

### Satellite Road Detection (D-LinkNet)

Model: D-LinkNet (Dilated LinkNet), trained on DeepGlobe road extraction.

Input: NAIP 4-band RGB-NIR (0.6m) or Sentinel-2 RGB (10m, global fallback)

Output: Binary road segmentation mask

Accuracy: 0.78 IoU on validation set.

Confidence: 0.65-0.75 (affected by shadows, vegetation overhang).

## Network Conflation

OSM and TIGER often represent the same road with slight positional offsets.

Algorithm:

1. Extract all OSM and TIGER centerlines in tile
2. Buffer each TIGER segment by 10m
3. For each OSM segment, find intersecting TIGER buffer
4. If intersection area >50% of OSM length → candidate match
5. Compute spatial offset vector (mean difference in vertices)
6. If offset <10m and length ratio 0.9-1.1 → conflate (merge)
7. Keep non-matched segments separately

Result: Single unified network with confidence:
- Both sources match: 0.95
- OSM only: 0.75
- TIGER only (US): 0.90
- Satellite only: 0.65
- LiDAR only: 0.80

## Routing Graph Construction

Build directed graph from conflated network:

1. Extract all centerline segments
2. Build node list from segment endpoints
3. Add direction info (one_way=yes → forward only)
4. Build adjacency matrix (sparse format)
5. Tag nodes: intersections, dead-ends, cul-de-sacs

Dead-end identification: Degree-1 nodes (only one connected segment).

Cul-de-sac identification: Loops with only 1-2 entry/exit points (topology pattern matching).

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| network.extraction.tile_done | Tile complete | Per-tile |
| network.conflation.osm_tiger_match_rate | Match statistics | Per 10-tile batch |
| network.osm_updated | New OSM data available | Weekly |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `network:tile:{tile_id}:segment_count` | 7 days | Road count per tile |
| `network:tile:{tile_id}:dead_ends` | 7 days | Dead-end street list |
| `network:graph:adjacency_matrix` | 30 days | Cached routing graph |
| `network:conflation_match_rate` | 30 days | OSM-TIGER agreement % |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| OSM data download + parsing (CPU) | $30-50 |
| TIGER/Line bulk acquisition | $50-100 |
| LiDAR centerline extraction (4× A100) | $150-200 |
| D-LinkNet road detection (8× A100, 30 days) | $400-500 |
| Network conflation (CPU, spatial joins) | $80-120 |
| Routing graph construction (CPU) | $50-80 |
| S3 storage (GeoParquet network layer) | $100-150 |
| **Total** | **$860-1,200** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Conflation match rate (OSM ↔ TIGER) | >85% | 1000-segment comparison |
| D-LinkNet road detection (IoU) | >0.78 | NAIP validation subset |
| LiDAR centerline accuracy | <0.5m lateral error | Field survey validation |
| Dead-end identification | >95% recall | Manual audit of 50-tile sample |
| Network connectivity validation | >99% connected components | Topology validation |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Conflation match rate per tile | >70% | Proceed, flag low-match tiles |
| D-LinkNet confidence mean | >0.65 | Proceed |
| Road type distribution plausible | >50% residential, <20% motorway | Flag skewed distributions |
| Graph connectivity ratio | >98% nodes reachable | Proceed, flag disconnected subgraphs |

## Success Metrics

| Metric | Target |
|--------|--------|
| Network extraction cycle | <30 days (US) |
| D-LinkNet inference latency per 1km tile | <3 seconds |
| Conflation latency per tile | <1 second |
| Mean network confidence | >0.80 |
| Routing graph construction latency | <0.5 seconds per tile |
