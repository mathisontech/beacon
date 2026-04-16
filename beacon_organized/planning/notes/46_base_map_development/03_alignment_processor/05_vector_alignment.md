# Vector Data Alignment

OpenStreetMap, TIGER/Line, Census, FEMA flood zones, NHD hydrology registration to 1km grid.

## Sources

| Source | Coverage | Update | Format | Use |
|--------|----------|--------|--------|-----|
| OpenStreetMap | Global | Weekly-monthly | Vector (PBF, shapefiles) | Roads, POIs, buildings, land use |
| TIGER/Line | US | Annually | Shapefiles | Address ranges, road centerlines, landmarks |
| Census boundaries | US | Decennial + ACS | Shapefiles | Tracts, block groups, places |
| FEMA NFHL | US | Annually | Shapefiles | Flood zone polygons, base flood elevation |
| NHD Plus | US | Every few years | Shapefiles | Stream network, flow direction, catchments |

## Functions

| Function | Input | Output | Algorithm |
|----------|-------|--------|-----------|
| `download_osm_extract` | Region + format | PBF file or GeoPackage | Geofabrik API or planet dump |
| `parse_osm_roads` | PBF | GeoParquet (linestrings) | GDAL/OGR PBF parser, extract highway tag |
| `parse_osm_buildings` | PBF | GeoParquet (polygons) | GDAL/OGR, extract building tag |
| `parse_osm_pois` | PBF | GeoParquet (points) | Filter amenity/shop/tourism/leisure tags |
| `download_tiger_roads` | State + county | Shapefiles | CENSUS FTP API |
| `conflate_osm_tiger` | OSM roads + TIGER roads | Matched pairs + confidence | Address interpolation matching |
| `validate_topology` | Linestring/polygon dataset | Topology report | Check connectivity, no dangles, no self-intersections |
| `snap_to_grid` | Vector (any type) | Vector aligned to 1km grid | Round vertices to nearest 1km cell boundary |
| `load_census_boundaries` | Shapefiles | GeoParquet polygons | Load tracts, block groups, places |
| `load_fema_flood_zones` | Shapefiles | GeoParquet polygons | SFHA, floodway, 100-year/500-year |
| `load_nhd_hydrology` | Shapefiles | GeoParquet (multi-type) | Streams, water bodies, watersheds |
| `version_osm_changeset` | OSM planet | Version metadata | Track which OSM version per tile |
| `detect_osm_vandalism` | OSM changeset history | Flagged edits | Suspicious deletions, extreme attribute changes |

## OpenStreetMap Ingestion

Download, parse, validate topology, snap to grid.

### Parsing Strategy

OSM data arrives as protocol buffers (PBF). Workflow:

```
1. Download continent PBF from Geofabrik
2. Parse with GDAL OGR or osmium
3. Extract by feature type:
   - Ways tagged highway=* → roads
   - Ways/relations tagged building=* → buildings
   - Nodes/ways tagged amenity=*, shop=*, tourism=*, leisure=* → POIs
   - Ways/relations tagged landuse=* → land use
4. Reproject to EPSG:4326
5. Snap vertices to 1km grid (round lat/lon to 0.001° = ~111m at equator, coarser at poles)
6. Validate topology
7. Write to GeoParquet per 1km tile
```

### Topology Validation

Check for invalid geometries:

| Check | Method | Action |
|-------|--------|--------|
| Self-intersecting linestrings | ST_IsValid | Reject or simplify |
| Dangling linestring ends | ST_Ends not snapped | Flag for manual review |
| Overlapping polygons | ST_Overlaps | Flag and separate |
| Unclosed polygon rings | ST_IsClosed | Reject |

### Attribute Parsing

Key OSM tags extracted:

| Feature Type | Tags |
|--------------|------|
| Roads | highway, lanes, surface, bridge, tunnel, speed_limit, oneway |
| Buildings | building, name, levels, material, address |
| POIs | amenity, shop, tourism, leisure, emergency, healthcare, name |
| Land use | landuse, natural, water, wetland |

## TIGER/Line Integration

US-specific authoritative road and address data.

### Conflation: OSM ↔ TIGER

Match OSM roads to TIGER roads for address assignment.

```
Per road segment:
1. Extract OSM way geometry + name
2. Find candidate TIGER segment(s) within 10m
3. If one candidate: compute address interpolation
   - TIGER provides left/right address ranges + odd/even assignment
   - Interpolate addresses along OSM geometry
   - Write to road attributes
4. If multiple candidates: flag for manual review
5. If no match: keep OSM-only with confidence 0.5
```

Output: OSM roads with TIGER address ranges merged in (where conflatable).

Confidence scoring:

| Match Quality | Confidence |
|---------------|-----------|
| Exact geometry match, name agreement | 0.95-1.0 |
| Geometry close (<1m), name agreement | 0.85-0.95 |
| Geometry close, name differs | 0.7-0.85 |
| OSM only, no TIGER match | 0.5 |
| TIGER only, no OSM match | 0.6 |

## Census Boundaries

Load census geography: tracts, block groups, places.

```
1. Download Census shapefiles (TIGER/Line)
2. Reproject to EPSG:4326
3. Snap to 1km grid
4. Write to PostGIS
5. Build spatial index (tile-based)
```

Use: population disaggregation, social vulnerability indexing, jurisdiction identification.

## FEMA Flood Zones

NFHL (National Flood Hazard Layer) ingestion.

| Layer | Type | Use |
|-------|------|-----|
| SFHA (Special Flood Hazard Area) | Polygon | 100-year flood zone |
| Floodway | Polygon | Fastest-flowing part of flood (highest velocity) |
| 100-year zone | Polygon | 1% annual exceedance probability |
| 500-year zone | Polygon | 0.2% annual exceedance probability |
| Base flood elevation | Point/line | Reference elevation for that zone |

Load into GeoParquet per 1km tile. Join to buildings for flood risk assessment.

## NHD Hydrology

Stream network, flow direction, catchments.

| Feature | Type | Use |
|---------|------|-----|
| Streams | Linestring | Stream network topology, flow routing |
| Water bodies | Polygon | Lakes, reservoirs, wetlands |
| Watersheds | Polygon | Catchment delineation |
| Flow direction | Vector field (per cell) | Downstream routing |
| Sink zones | Point | Outlets, pour points |

Integration: streams align with DEM flow accumulation. Cross-check for consistency.

## Databases

**osm_roads** — Road network from OSM + TIGER conflation.

| Field | Type | Notes |
|-------|------|-------|
| osm_id | VARCHAR | OpenStreetMap way ID |
| geom | LINESTRING | Road centerline |
| tile_id | INT | Primary 1km cell |
| highway_class | VARCHAR | motorway, trunk, primary, secondary, etc. |
| lanes | INT | Number of lanes (NULL if unknown) |
| surface | VARCHAR | asphalt, concrete, gravel, dirt, unknown |
| bridge | BOOLEAN | Is this a bridge |
| tunnel | BOOLEAN | Is this a tunnel |
| speed_limit | INT | km/h if tagged (NULL if unknown) |
| address_left | VARCHAR | TIGER address range, left side |
| address_right | VARCHAR | TIGER address range, right side |
| osm_version | INT | OSM changeset version |
| confidence | FLOAT | 0-1, based on conflation quality |

**osm_buildings** — Buildings from OSM.

| Field | Type | Notes |
|-------|------|-------|
| osm_id | VARCHAR | OpenStreetMap ID |
| geom | POLYGON | Building footprint |
| tile_id | INT | Primary 1km cell |
| levels | INT | Story count if tagged |
| material | VARCHAR | brick, wood, concrete, etc. |
| name | VARCHAR | Name/address if tagged |
| building_type | VARCHAR | residential, commercial, industrial, etc. |
| confidence | FLOAT | 0-1, often 0.3-0.6 for OSM buildings (unverified) |

**census_boundaries** — Census geography.

| Field | Type | Notes |
|-------|------|-------|
| geom | POLYGON | Boundary |
| level | ENUM | tract, block_group, place, county |
| geoid | VARCHAR | Census FIPS code |
| name | VARCHAR | Name |
| population | INT | From latest Census/ACS |

**fema_flood_zones** — Flood hazard zones.

| Field | Type | Notes |
|-------|------|-------|
| geom | POLYGON | Zone boundary |
| tile_id | INT | Primary 1km cell |
| zone_type | ENUM | sfha, floodway, 100yr, 500yr |
| base_flood_elev | FLOAT | Meters NAVD88 if available |
| confidence | FLOAT | 1.0 (authoritative) |

**nhd_streams** — Stream network.

| Field | Type | Notes |
|-------|------|-------|
| geom | LINESTRING | Stream centerline |
| tile_id | INT | Primary 1km cell |
| stream_order | INT | Strahler order (1=headwater, higher=larger) |
| discharge_cms | FLOAT | Mean discharge m³/s if gauged |
| name | VARCHAR | Stream name from NHD |

## Topology Validation

All vector data validated before promotion to live.

| Check | Standard | Tool |
|-------|----------|------|
| Valid geometries | OGC Simple Features | PostGIS ST_IsValid |
| No self-intersections | OGC | ST_IsSimple |
| Polygon rings closed | OGC | ST_IsClosed |
| No dangles (roads) | Custom | ST_Ends analysis |
| Attribute completeness | Feature-specific | COUNT NULL checks |

## Versioning

OSM changeset version tagged per tile. If OSM updated between tiles, version recorded.

```
Per-tile metadata:
  osm_version: 123456789
  fetch_timestamp: 2026-03-01T14:30:00Z
  changeset_timespan: 2026-02-01 - 2026-02-28
```

Later, can track which OSM version was used for each tile.

## Vandalism Detection

Flag suspicious OSM edits (mass deletions, impossible attributes).

| Suspicious Pattern | Score | Action |
|--------------------|-------|--------|
| Bulk road deletion (>50 ways per hour) | 0.9 | Flag |
| Building marked with invalid level (>500) | 0.95 | Flag |
| Rapid coordinate changes (>100m shift) | 0.7 | Flag for review |
| Name tag injection (suspicious characters) | 0.6 | Flag |

Flagged edits quarantine tile until human review.

## Integration with Alignment

Vector data does NOT drive geometric alignment (insufficient coverage globally). Instead:

1. **Validation:** Vector topology checked against raster alignment (buildings align with satellite, roads with LiDAR)
2. **Enrichment:** OSM/TIGER provide attributes (names, addresses) merged with raster-detected features
3. **Conflation:** OSM-to-TIGER matching produces authoritative road network for address assignment

Vector sources are *confirmatory* (confirm satellite/LiDAR detections) and *enriching* (add attribute detail), not *primary* for geometric alignment.

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Topology valid | 100% | Reject if invalid |
| Address conflation success | >70% (US roads) | Flag remainder for review |
| OSM timestamp recency | <6 months | Flag if older |
| Attribute completeness | >80% key fields | Flag if sparse |
| Vector-to-raster alignment | <5m offset | Flag if exceeded |

## Cost Estimates

| Component | Cost |
|-----------|------|
| OSM download + parse (monthly) | $20-30 |
| TIGER conflation (one-time) | $50-100 |
| Census boundary processing | $10-20 |
| FEMA flood zone processing | $15-25 |
| NHD hydrology (one-time) | $30-50 |
| PostGIS storage + indexing | $50-100 |
| **Total monthly** | **$50-100** (amortized) |
