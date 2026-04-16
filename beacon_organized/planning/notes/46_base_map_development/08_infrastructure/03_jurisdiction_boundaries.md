# Jurisdiction Boundaries

Police, fire, EMS, school, utility service areas. Critical for notifications, dispatch authority, mutual aid coordination.

## Data Sources

| Source | Boundary Type | Coverage | Accuracy | Recency |
|---|---|---|---|---|
| Census TIGER/Line | County, city, tract, block group | US complete | <100m | Annual |
| State GIS clearinghouses | Fire districts, police, school districts | Variable by state | <100m | Annual-biennial |
| Fire department records | Fire response zones | 100% coverage desired | <1km | Maintained by FD |
| Utility company maps | Service territories | 95%+ coverage | Variable | Annual |
| County assessor | County/municipal boundaries | US complete | <100m | Annual |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| load_census_boundaries(bbox) | Bounding box | County/city/tract polygon layer | jurisdiction.census_boundaries_loaded |
| load_fire_districts(state) | State code | Fire district polygon layer | jurisdiction.fire_districts_loaded |
| load_police_jurisdictions(bbox) | Bounding box | Police jurisdiction polygons | jurisdiction.police_jurisdictions_loaded |
| load_school_districts(state) | State code | School district boundary polygons | jurisdiction.school_districts_loaded |
| compute_jurisdiction_overlaps(all_boundaries) | All jurisdiction layers | Overlap analysis (nested polygons) | jurisdiction.overlaps_computed |
| identify_mutual_aid_boundaries(fire_dists, ems_zones) | Fire + EMS layers | Mutual aid agreement zones | jurisdiction.mutual_aid_identified |
| map_ems_response_zones(fire_stations, response_time) | Station locations + drive-time model | Response zone polygon | jurisdiction.ems_zones_mapped |
| flag_jurisdiction_conflicts(boundaries) | All layers | Unresolved boundary conflicts | jurisdiction.conflicts_flagged |

## Jurisdiction Types

| Type | Authority | Typical Area | Primary Use |
|---|---|---|---|
| County | County government | 500-5000 km² | Regional coordination |
| City/municipal | City government | 10-500 km² | Local emergency response |
| Fire district | Fire department | 50-1000 km² | Fire response, EMS |
| Police jurisdiction | Police department | 10-500 km² | Law enforcement dispatch |
| School district | School board | 100-2000 km² | School emergency plan |
| Utility service | Utility company | 100-5000 km² | Service outage coordination |
| Federal land | Land management agency | Variable | Special access rules |

## Data Storage

| Table | Schema |
|---|---|
| census_boundaries | bbox, county_fips, county_name, city_fips, city_name, tract, block_group |
| fire_districts | district_id, state, district_name, geometry, headquarters_location, chief_contact |
| police_jurisdictions | jurisdiction_id, state, agency_name, geometry, headquarters_location |
| school_districts | district_id, state, district_name, geometry, superintendent_contact |
| utility_service_areas | utility_id, service_type (power/water/gas), geometry, provider_contact |
| boundary_conflicts | conflict_id, bbox, overlapping_jurisdictions, issue_description |

## Redis Cache

```
fire_districts:{state} -> fire district polygon layer
police_jurisdictions:{bbox} -> police jurisdiction polygons
school_districts:{state} -> school district boundary polygons
ems_response_zones:{station_id} -> drive-time polygon
jurisdiction_overlaps:{bbox} -> nested jurisdiction analysis
mutual_aid_zones:{bbox} -> mutual aid agreement areas
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| jurisdiction.fire_district_identified | {district_id, location, name} | Per location query |
| jurisdiction.police_jurisdiction_identified | {agency_id, location, name} | Per location query |
| jurisdiction.mutual_aid_needed | {origin_district, neighboring_districts} | If mutual aid triggered |
| jurisdiction.ems_response_zone_assigned | {zone_id, estimated_response_time} | Per incident location |
| jurisdiction.boundary_conflict_detected | {location, conflicting_jurisdictions} | If overlap ambiguous |
| jurisdiction.jurisdiction_change_alert | {boundary_id, change_type} | If boundary edited by EMS |

## EMS Response Zone Mapping

Drive-time/distance-based zones from fire stations.

```
Algorithm:
  1. For each fire station, run Dijkstra routing
  2. Mark reachable cells within X minutes
  3. Boundaries = edges of coverage zones
  4. Handle overlaps with shared response protocol

Typical targets:
  - Urban: 4-minute response to 90% of calls
  - Suburban: 6-minute response to 85% of calls
  - Rural: 10-15 minute response acceptable
```

## Mutual Aid Agreements

Identify neighboring jurisdictions for automatic assistance.

| Agreement Type | Trigger | Notification |
|---|---|---|
| Automatic mutual aid | All-hands event (fire, hazmat) | Trigger automatic dispatch |
| Mutual aid on request | Large incident exceeding local capacity | Manual request via dispatch |
| Reciprocal aid agreement | Neighboring agreements | Can request support |

## Jurisdiction Conflict Resolution

When boundaries disagree or overlap.

| Conflict Type | Resolution Rule |
|---|---|
| TIGER/state GIS mismatch | Prefer state GIS (more recent) |
| Fire district splits city | Fire district boundary takes precedence for EMS |
| Utility overlaps jurisdictions | Multiple notifications required |
| Unincorporated area | County sheriff + county fire usually covers |

## Validation

- Cross-check TIGER boundaries against county/city official maps
- Validate fire district boundaries against fire marshal records
- Confirm police jurisdictions match agency dispatch maps
- Test mutual aid agreements against EMS protocols

## Accuracy Targets

| Metric | Target |
|---|---|
| Boundary positional accuracy | <100m |
| Jurisdiction overlap resolution | 100% (no ambiguous areas) |
| Response zone accuracy | ±1 minute drive-time |
| Mutual aid agreement accuracy | 100% |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Boundary conflict resolver | Auto-resolve overlapping boundaries | Manual conflict cases |
| Response zone predictor | Estimate EMS zones where station data unavailable | Historical response data |

## Performance

| Operation | Time (1 km²) |
|---|---|
| Boundary load | 2 sec |
| Overlap compute | 4 sec |
| Mutual aid identify | 2 sec |
| Response zone map | 30 sec (routing) |

## Dependencies

- fiona, shapely (vector geometry ops)
- numpy, scipy (overlay analysis)
- networkx (routing for response zones)
- osmnx (road network for drive-time)
- PostgreSQL (boundary database)
- Redis (caching)
- NATS (publishing)
