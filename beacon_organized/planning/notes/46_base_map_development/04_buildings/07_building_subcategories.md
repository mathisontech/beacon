# Building Subcategories

Special-case buildings with distinct disaster relevance.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| classify_special_building | Building attributes, OSM tags, street-view CV | Subcategory label | Category classifier |
| tag_disaster_relevance | Subcategory | Disaster relevance tags array | Purpose-to-hazard mapping |
| compute_population_at_risk | Subcategory, capacity | Population estimate | Time-of-day occupancy model |
| flag_hazardous_buildings | Subcategory, location, inventory | Hazard flag array | Hazmat database crosswalk |

## Data Storage

Subcategories stored inline in building GeoParquet:

```
{
  "subcategory": string,
  "disaster_relevance_tags": [string],
  "population_at_risk": int32,
  "hazard_flags": [string],
  "special_facility_contact": string,
  "operational_status": "open" | "closed_temporarily" | "closed_permanently"
}
```

## Subcategory Definitions and Relevance

### Medical Facilities

**Categories:**
- Hospital (major surgery, ICU, ER)
- Urgent care / emergency clinic
- Pharmacy (standalone)
- Dialysis center
- Mental health facility

**Disaster Relevance:**
- Fragile population concentration (post-operative, chronic)
- Critical power dependency (ICU)
- Hazardous chemical storage (medications)
- Mutual aid potential (medical professionals)

**Data Sources:**
- CMS Medicare database (hospitals, certified beds)
- State health licensing (pharmacies, clinics, dialysis)
- Street-view CV (pharmacy signage)

**Key Attributes:**
- Bed count (if hospital)
- Department types (ER, ICU, trauma, NICU)
- Hazmat inventory (medications, anesthesia)
- Backup power capacity (hours)
- Evacuation-dependent population count

### Educational Facilities

**Categories:**
- K-12 school (all grades)
- University/college campus
- Community college
- Preschool/daycare

**Disaster Relevance:**
- High child concentration (daytime)
- Empty at night/weekends
- Shelter potential (gymnasiums)
- Community gathering space (after hours access)

**Data Sources:**
- State education dept (enrollment, staff)
- School district GIS
- OSM amenity=school tag
- Street-view CV (playground, sports fields)

**Key Attributes:**
- Enrollment count
- Staffing level
- Gymnasium availability (shelter capacity)
- Cafeteria/food storage
- Bus fleet (evacuation asset)
- On-site medical clinic

### Long-Term Care Facilities

**Categories:**
- Nursing home (skilled nursing)
- Assisted living
- Continuing care retirement (independent + assisted)
- Memory care (Alzheimer's specialty)

**Disaster Relevance:**
- Immobile/dependent population
- 24/7 staffing critical
- Medication dependency (refrigerated insulin, etc.)
- Evacuation-dependent concentration

**Data Sources:**
- CMS Medicare (certified beds)
- State health dept licensing
- Ombudsman databases (capacity)

**Key Attributes:**
- Resident count
- Mobility classification (% ambulatory vs. wheelchair)
- Medication cold-chain dependency
- Evacuation capability (bus/medical transport fleet)
- Backup generator capacity (hours)

### Correctional Facilities

**Categories:**
- County jail
- State/federal prison
- Juvenile detention
- Immigration detention

**Disaster Relevance:**
- Locked population (evacuation authority required)
- Security-constrained exit routes
- Mental health crisis risk
- High-value asset concentration

**Data Sources:**
- DOJ Bureau of Prisons
- State dept of corrections
- County sheriff databases

**Key Attributes:**
- Inmate count
- Custody levels (minimum, medium, maximum)
- Emergency protocols (evacuation authority hierarchy)
- Medical facility on-site
- Contact: warden, security chief

### Hazardous Material Facilities

**Categories:**
- Gas station / fuel depot
- Chemical manufacturing plant
- Ammunition storage
- Propane distributor
- Fertilizer storage

**Disaster Relevance:**
- Explosion/fire risk
- Toxin release downwind footprint
- Ground water contamination
- Evacuation zone dependent on incident

**Data Sources:**
- EPA FRS (facility registry)
- EPA RMP (risk management plans)
- Street-view CV (signage, storage tanks)
- PHMSA (pipeline routes)

**Key Attributes:**
- Chemical inventory (SARA Title III TRI reports)
- Worst-case release scenario (EPA RMP)
- Toxic endpoint distance (miles affected)
- Emergency contact (facility safety officer)

### Nuclear/Radiation Facilities

**Categories:**
- Nuclear power plant
- Medical/research reactor
- Radioactive waste storage
- Uranium enrichment plant

**Disaster Relevance:**
- Worst-case release: multi-state impact
- Complex evacuation zones (10-mile plume, 50-mile ingestion)
- Shelter-in-place critical
- Real-time radiation monitoring dependency

**Data Sources:**
- NRC (Nuclear Regulatory Commission) public database
- Facility emergency plans (public record)

**Key Attributes:**
- Reactor type + age
- Emergency planning zones
- On-site security/medical
- Radiation alert status (normal/advisory/alert)

### Mobile Home Parks

**Categories:**
- Trailer park (residential)

**Disaster Relevance:**
- Wind vulnerability (high tornado/hurricane risk)
- Evacuation-dependent concentration
- Limited access (single road, narrow streets)
- Infrastructure fragility (utilities)

**Data Sources:**
- Satellite imagery (regular grid layout, structures)
- County assessor (mobile home count by parcel)
- Street-view CV (trailer identification)

**Key Attributes:**
- Unit count
- Primary evacuation route
- Vulnerable population (elderly % from assessor)
- Evacuation time estimate
- Mutual aid potential (resource staging area)

### Large Commercial Facilities

**Categories:**
- Big box retail (Walmart, Target, Home Depot, Lowes)
- Supermarket / grocery anchor
- Shopping mall
- Movie theater / entertainment venue

**Disaster Relevance:**
- Collapse risk (wide-span roof)
- Shelter overflow potential
- Food supply asset (evacuation duration support)
- Crowd management challenge
- Post-disaster resource distribution hub

**Data Sources:**
- Street-view CV (logo + storefront detection)
- OSM building=retail tag
- County assessor use codes
- NAIP imagery (roof detection for loading dock staging)

**Key Attributes:**
- Floor area
- Roof span (collapse risk)
- Loading dock availability
- Parking lot capacity
- Food storage capacity
- Generator backup

### Religious Buildings

**Categories:**
- Church / cathedral
- Mosque / Islamic center
- Synagogue
- Temple / Buddhist temple
- Gurdwara (Sikh)

**Disaster Relevance:**
- Community gathering (trust + orientation for displaced)
- Sanctuary space (shelter potential)
- Multi-lingual outreach capability
- Volunteer network (faith-based mutual aid)
- Spiritual support for vulnerable populations

**Data Sources:**
- Street-view CV (cross, minaret, distinctive architecture)
- OSM amenity=place_of_worship tag
- Yellow pages / faith directories

**Key Attributes:**
- Seating capacity
- Sanctuary availability
- Kitchen/food preparation
- Multilingual congregation
- Emergency contact (pastor/imam)

### Historic Sites

**Categories:**
- Historic building (national register)
- Ancient structure / artifact
- Landmark building
- Archaeological site

**Disaster Relevance:**
- Irreplaceable cultural/scientific value
- Specialized preservation/evacuation requirements
- Insurance/disaster recovery policy complexity

**Data Sources:**
- National Register of Historic Places
- State historic preservation offices
- UNESCO world heritage listings
- OSM heritage tag

**Key Attributes:**
- Registration status
- Preservation value (replacement cost if destroyed)
- Specialized emergency contact (museum director, archaeologist)
- Evacuation constraints (artifact handling, climate control)

### Infrastructure Hubs

**Categories:**
- Transit station (bus, train, subway)
- Airport terminal
- Marine port / dock
- Emergency dispatch center (911)

**Disaster Relevance:**
- Evacuation asset/bottleneck
- Large transient population
- Operational continuity critical
- Command center potential

**Data Sources:**
- OSM public_transport tags
- State DOT databases
- Port authority records
- County emergency services GIS

**Key Attributes:**
- Passenger capacity
- Vehicle/equipment staging capacity
- Backup power (dispatch center)
- Water access (docks)
- Emergency contact (station manager, operations)

### Specialized Shelters

**Categories:**
- Homeless shelter
- Refugee center
- Migrant worker housing
- Disaster victim shelter (established)

**Disaster Relevance:**
- Already vulnerable population
- Shelter infrastructure in place
- Rapid integration into evacuation network

**Data Sources:**
- HUD homeless shelter database
- State health/social services directories
- NGO registries (Red Cross, local nonprofits)

**Key Attributes:**
- Current capacity
- Bed count by type (family, individual)
- Operating hours
- Food service
- Medical services on-site

## Data Aggregation

Aggregated queries per disaster event:

| Query | Use |
|---|---|
| All hospitals within 10km | Medical mutual aid coordination |
| All schools (enrollment sum) | Child welfare check-in |
| All nursing homes (resident count) | Evacuation priority planning |
| All hazmat sites (toxic endpoints) | Downwind shelter-in-place zones |
| All shelters (total capacity) | Evacuation demand planning |
| All transit hubs (staging capacity) | Vehicle/equipment deployment |

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| subcategories.classification.done | Tile complete | Per-tile |
| subcategories.hazmat_alert | Chemical inventory change | Weekly |
| subcategories.facility_contact_verified | Emergency contact confirmation | Monthly |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `subcategories:by_type:{type}:count` | 7 days | Count per category |
| `subcategories:population_at_risk` | 24 hours | Daytime vs. nighttime |
| `subcategories:hazmat_endpoints` | 30 days | Toxic release zones |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| CMS/state licensing database subscriptions | $100-200 |
| EPA FRS/RMP database queries | $50-100 |
| Street-view CV (facility classification) | $150-200 |
| Facility contact verification (100 facilities) | $200-300 |
| Manual audits (10 facilities per category) | $300-400 |
| **Total** | **$800-1,200** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Subcategory classification accuracy | >90% | 200-facility audit |
| Hospital bed count accuracy | ±5% | CMS validation |
| School enrollment match | ±10% | State education data |
| Hazmat inventory completeness | >95% | EPA RMP comparison |
| Facility contact validity | >95% | Phone verification |

## Success Metrics

| Metric | Target |
|--------|--------|
| Classification cycle | <30 days (US) |
| Database synchronization frequency | Weekly |
| Facility contact update cycle | Quarterly |
| Data freshness (last updated) | <6 months |
