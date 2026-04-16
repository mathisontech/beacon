# Vulnerable Populations

Identification and estimation of special-needs populations: children, elderly, mobility-impaired, incarcerated, homeless, non-English speakers. Critical for evacuation assistance, shelter capacity, medical resource planning.

## Vulnerability Categories

| Category | Sub-Types | Data Sources | Assistance Need |
|---|---|---|---|
| Children | <18 years | Schools, daycare, Census | Transport, supervision |
| Elderly | 65+ years | Nursing homes, Census, Medicare | Medical support, mobility |
| Mobility-impaired | Disability types | Hospitals, group homes, Census | Accessible transport, lifts |
| Incarcerated | Jails, prisons | State DOC records | Authority evacuation |
| Homeless | Shelters, encampments | HUD, local surveys | Basic services, ID |
| Non-English speakers | Primary language not English | Census language data | Multilingual alerts |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| estimate_vulnerable_population_by_category(category, bbox) | Vulnerability type + location | Population count by subtype | vulnerability.population_estimated |
| compute_evacuation_assistance_needed(vulnerability, mobility) | Vulnerability + transport ability | Assistance level (none/minor/major/complete) | vulnerability.assistance_needed |
| identify_special_needs_facilities(bbox) | Bounding box | Facility locations + capacity | vulnerability.facilities_identified |
| compute_medical_dependency(facility_type, patient_count) | Facility type + occupancy | Medical resource criticality | vulnerability.medical_dependency_computed |
| flag_high_vulnerability_zones(category_concentration) | Vulnerability density | High-need zone polygons | vulnerability.high_vulnerability_zones_flagged |
| locate_non_english_populations(language_data) | Census language spoken at home | Population by language cluster | vulnerability.non_english_located |

## Children (Daytime vs Nighttime)

| Type | Day Location | Night Location | Count Source | Summer Variation |
|---|---|---|---|---|
| School-age (5-17) | School building | Residential | School enrollment + Census | -60% (out of school) |
| Preschool (0-5) | Home or daycare | Home | Daycare enrollment + Census | ±30% variation |
| After-school programs | School/recreation | Residential | School records + Parks dept | Heavily used 3-6pm |

Children daytime exposure = (school_capacity * occupancy) + (daycare_capacity * occupancy) + (residential_pop_0_5 * 0.3)

## Elderly (65+)

| Facility Type | Capacity Type | Data Source | Population |
|---|---|---|---|
| Nursing homes | Bed count | State health dept licensing | Mandatory records |
| Assisted living | Unit count | State health dept licensing | Mandatory records |
| Independent senior housing | Unit count | County assessor + operator lists | Estimated 70% occupancy |
| In-home care (Census) | Age 65+ in Census | Census data | Block group basis |
| Skilled nursing | Bed count | CMS Medicare database | Mandatory records |

Elderly population = nursing_home_beds + assisted_living_units + (census_age_65_plus * (1.0 - assisted_fraction))

## Mobility-Impaired

| Subtype | Prevalence | Mobility Level | Transport Need |
|---|---|---|---|
| Wheelchair-bound | 0.5% of population | Cannot self-evacuate | Lifts, accessible vehicles |
| Cane/walker users | 2-3% of population | Very slow (0.5 mph) | Transport or sheltering in place |
| Temporary injury | 1-2% during events | Variable | Case-by-case |
| Cognitive disability | 1-2% of population | Varies widely | Supervision, simple routing |

Estimated in Census (ACS disability data) by block group. Supplemented by group home locations.

## Incarcerated Populations

| Facility Type | State Records | Authority | Evacuation Protocol |
|---|---|---|---|
| County jail | DOC database | Sheriff | Authority-managed evacuation |
| State prison | DOC database | State DOC | Authority-managed evacuation |
| Federal facility | BOP database | Federal | Federal authority |
| Locked group home | State licensing | Facility operator | Facility or guardians |

Population = known inmate counts (public records). These require authority coordination for evacuation.

## Homeless Populations

| Location Type | Seasonal | Census Method | Count |
|---|---|---|---|
| Shelter (indoor) | Variable by region | Facility bed count | Known counts |
| Encampment (outdoor) | High visibility during day | Street surveys, GPS tagging | Estimated, may move |
| Vehicle dwelling | Transient | Vehicle surveys, social services | Estimated 10-30% of homeless |
| Bus station / transit | Highly transient | 24-hour observation | Sample count |

Estimated from HUD Point-in-Time surveys + local agency reports. Updated annual or event-triggered.

## Non-English Speakers

Census language data (language spoken at home).

| Language | Population Concentration | Alert Impact |
|---|---|---|---|
| Spanish | 60% of non-English speakers | Highest priority bilingual |
| Mandarin | Major metro areas | Secondary priority |
| Vietnamese | Specific regions | Secondary priority |
| Tagalog (Filipino) | Specific regions | Secondary priority |
| Korean, Japanese | Specific regions | Secondary priority |

Alert system: detect census language concentration -> trigger multilingual notifications in that language.

## Data Storage

| Table | Schema |
|---|---|
| schools | school_id, location, grade_levels, enrollment, capacity, after_school_programs |
| daycares | daycare_id, location, age_range, capacity, hours_of_operation |
| nursing_homes | facility_id, location, bed_count, occupancy_current, medical_specialties |
| assisted_living | facility_id, location, unit_count, independent_fraction, occupancy_current |
| group_homes | home_id, location, client_count, disability_types, 24hr_staffing |
| homeless_shelters | shelter_id, location, bed_count, current_residents, capacity_status |
| jails_prisons | facility_id, location, inmate_count, facility_type, authority |
| medical_dependency | facility_id, patient_count, oxygen_dependent, dialysis_dependent, ventilator_dependent |
| non_english_populations | block_group_id, primary_language, population_count, pct_non_english |

## Redis Cache

```
children:daytime:tile:{tile_id} -> child pop grid (daytime hours) |
children:nighttime:tile:{tile_id} -> child pop grid (night hours)
elderly:tile:{tile_id} -> elderly pop + facility locations
mobility_impaired:tile:{tile_id} -> impaired pop + facility locs
incarcerated:{state} -> jail/prison locations + inmate counts
homeless:shelters:{city} -> shelter locations + occupancy
homeless:encampments:{bbox} -> encampment locations (approximate)
non_english:block_group:{bg_id} -> language distribution
medical_dependency:{facility_id} -> oxygen/dialysis/vent counts
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| vulnerability.children_daytime_detected | {location, count, school_id} | Per school/daycare |
| vulnerability.elderly_facility_detected | {facility_id, bed_count, occupancy} | Per facility |
| vulnerability.mobility_impaired_count | {tile_id, count, assistance_level} | Per tile |
| vulnerability.incarcerated_facility | {facility_id, inmate_count, authority} | Per facility |
| vulnerability.homeless_shelter_detected | {shelter_id, bed_count, occupancy} | Per shelter |
| vulnerability.non_english_zone_detected | {block_group_id, primary_language, count} | Per language concentration |
| vulnerability.medical_dependency_critical | {facility_id, oxygen/dialysis/vent count, power_critical} | If power-dependent |
| vulnerability.high_need_evacuation_zone | {zone_id, category, pop_needing_assist} | If concentration >25th percentile |

## Evacuation Assistance Matrix

| Vulnerability | Mobility | Assistance Level | Resources Needed |
|---|---|---|---|
| Child (<18) | Independent | Minor | Supervision, transport |
| Child | Impaired | Major | Lifts, escort, accessible vehicle |
| Elderly (65+) | Independent | Minor | Transport offer, shelter assignment |
| Elderly | Impaired | Major | Lift, medical monitoring, medication |
| Mobility-impaired | Wheelchair | Major | Lift-van, accessible route |
| Mobility-impaired | Cane/walker | Minor-Moderate | Transport, accessible path |
| Medical-dependent | Oxygen | Major | Portable oxygen, generator |
| Medical-dependent | Dialysis | Major | Transport to dialysis center or temporary supply |
| Incarcerated | - | Complete | Authority transport, secure facility |
| Homeless | Variable | Complete | Shelter, documentation, medical screening |

## Validation

- Cross-check school enrollments against state education records
- Validate nursing home beds against state licensing records
- Confirm Census language data against neighborhood surveys (sampling)
- Verify jail/prison inmate counts against state DOC records
- Compare homeless estimates against Point-in-Time survey counts

## Accuracy Targets

| Metric | Target |
|---|---|
| School enrollment | Within ±5% of state records |
| Facility bed count | 100% of licensed facilities |
| Elderly pop (Census) | Within ±10% of Census block group |
| Mobility-impaired (Census) | Within ±20% of Census disability data |
| Non-English speakers | Within ±15% of Census language data |
| Incarcerated | 100% (public records) |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Homeless encampment detector | Identify outdoor encampments in satellite | Aerial imagery + local agency surveys |
| Vulnerability zone classifier | Predict high-vulnerability concentration | Census + facility locations |

## Performance

| Operation | Time (1 km²) |
|---|---|
| School/daycare locate | 2 sec |
| Facility load (all types) | 3 sec |
| Vulnerability aggregate | 2 sec |

## Dependencies

- fiona, shapely (facility geometry)
- numpy, pandas (population aggregation)
- Census API (demographic data)
- PostgreSQL (facility database)
- Redis (caching)
- NATS (publishing)
