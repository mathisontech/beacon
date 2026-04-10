export interface BuildingAttribute {
  key: string;
  label: string;
  type: string;
  description: string;
}

export interface BuildingAttributeGroup {
  label: string;
  attributes: BuildingAttribute[];
}

export const buildingAttributeGroups: BuildingAttributeGroup[] = [
  {
    label: 'Geometry & Structure',
    attributes: [
      { key: 'footprint', label: 'Footprint', type: 'POLYGON', description: 'Building outline geometry from LiDAR + satellite fusion' },
      { key: 'area_m2', label: 'Area', type: 'float64', description: 'Footprint area in square meters' },
      { key: 'height_m', label: 'Height', type: 'float32', description: 'Building height in meters (LiDAR DSM - DEM)' },
      { key: 'height_confidence', label: 'Height Confidence', type: 'float32', description: 'Confidence score 0-1 for height estimate' },
      { key: 'height_source', label: 'Height Source', type: 'enum', description: 'lidar | shadow | assessor | fused' },
      { key: 'floor_count_estimated', label: 'Floor Count (Est)', type: 'int32', description: 'Estimated from height / typical floor height' },
      { key: 'floor_count_assessor', label: 'Floor Count (Assessor)', type: 'int32', description: 'From county assessor records' },
      { key: 'roof_geometry', label: 'Roof Geometry', type: 'string', description: 'Flat, gable, hip, mansard, dome, etc.' },
      { key: 'basement_presence', label: 'Basement', type: 'boolean', description: 'Whether building has a basement' },
      { key: 'dsm_max', label: 'DSM Max', type: 'float32', description: 'Digital Surface Model maximum elevation' },
      { key: 'dem_ground', label: 'DEM Ground', type: 'float32', description: 'Bare earth elevation at building location' },
    ],
  },
  {
    label: 'Material & Construction',
    attributes: [
      { key: 'material_class', label: 'Material Class', type: 'enum', description: 'wood_frame | masonry | concrete | steel | mobile_home | mixed' },
      { key: 'material_confidence', label: 'Material Confidence', type: 'float32', description: 'Confidence score 0-1' },
      { key: 'material_source', label: 'Material Source', type: 'enum', description: 'street_view | age_inference | assessor' },
      { key: 'roof_material', label: 'Roof Material', type: 'enum', description: 'asphalt_shingle | metal | tile | concrete | tar_gravel | synthetic | unknown' },
      { key: 'year_built', label: 'Year Built', type: 'int32', description: 'Construction year from assessor records' },
      { key: 'building_code_era', label: 'Building Code Era', type: 'string', description: 'Code era classification for structural standards' },
      { key: 'seismic_retrofit_status', label: 'Seismic Retrofit', type: 'boolean', description: 'Whether building has been seismically retrofitted' },
    ],
  },
  {
    label: 'Purpose & Occupancy',
    attributes: [
      { key: 'purpose', label: 'Purpose / Use Type', type: 'enum', description: 'residential_single_family | residential_apartment | commercial_retail | commercial_office | industrial | public_school | public_hospital | religious | mixed_use' },
      { key: 'purpose_confidence', label: 'Purpose Confidence', type: 'float32', description: 'Confidence score 0-1' },
      { key: 'subcategory', label: 'Subcategory', type: 'string', description: 'Detailed facility type (hospital, school, nursing home, etc.)' },
      { key: 'unit_count', label: 'Unit Count', type: 'int32', description: 'Number of dwelling/commercial units' },
      { key: 'occupancy_estimate', label: 'Occupancy Estimate', type: 'int32', description: 'Estimated max occupancy' },
      { key: 'typical_occupancy_day', label: 'Daytime Occupancy', type: 'float32', description: 'Typical occupancy during business hours' },
      { key: 'typical_occupancy_night', label: 'Nighttime Occupancy', type: 'float32', description: 'Typical occupancy overnight' },
      { key: 'typical_occupancy_weekend', label: 'Weekend Occupancy', type: 'float32', description: 'Typical occupancy on weekends' },
      { key: 'hours_of_operation', label: 'Hours of Operation', type: 'string', description: 'iCalendar format operating hours' },
      { key: 'operational_status', label: 'Operational Status', type: 'enum', description: 'open | closed_temporarily | closed_permanently' },
    ],
  },
  {
    label: 'Access & Exits',
    attributes: [
      { key: 'exits_entrances', label: 'Exits / Entrances', type: 'int32', description: 'Number of exit and entrance points' },
      { key: 'fence_details', label: 'Fence Details', type: 'string', description: 'Perimeter fencing type and condition' },
      { key: 'fence_rammability', label: 'Fence Rammability', type: 'boolean', description: 'Whether perimeter fence can be breached by vehicle' },
      { key: 'ada_accessibility', label: 'ADA Accessible', type: 'boolean', description: 'Meets ADA accessibility standards' },
      { key: 'accessibility_score', label: 'Accessibility Score', type: 'float32', description: 'Overall accessibility rating 0-1' },
      { key: 'accessible_parking', label: 'Accessible Parking', type: 'boolean', description: 'Has designated accessible parking' },
      { key: 'accessible_restrooms', label: 'Accessible Restrooms', type: 'boolean', description: 'Has wheelchair-accessible restrooms' },
      { key: 'service_animal', label: 'Service Animal', type: 'boolean', description: 'Accommodates service animals' },
      { key: 'multilingual_signage', label: 'Multilingual Signage', type: 'boolean', description: 'Has multilingual wayfinding signage' },
    ],
  },
  {
    label: 'Vulnerability & Risk',
    attributes: [
      { key: 'soft_story_flag', label: 'Soft Story', type: 'boolean', description: 'Building has soft-story structural weakness' },
      { key: 'soft_story_confidence', label: 'Soft Story Confidence', type: 'float32', description: 'Confidence score 0-1' },
      { key: 'fire_resistance_score', label: 'Fire Resistance', type: 'float32', description: 'Material-based fire resistance score 0-1' },
      { key: 'fire_vulnerability_score', label: 'Fire Vulnerability', type: 'float32', description: 'Overall fire vulnerability 0-1' },
      { key: 'seismic_vulnerability_score', label: 'Seismic Vulnerability', type: 'float32', description: 'Earthquake vulnerability 0-1' },
      { key: 'flood_vulnerability_score', label: 'Flood Vulnerability', type: 'float32', description: 'Flood vulnerability 0-1' },
      { key: 'wind_vulnerability_score', label: 'Wind Vulnerability', type: 'float32', description: 'Wind damage vulnerability 0-1' },
      { key: 'tsunami_vulnerability_score', label: 'Tsunami Vulnerability', type: 'float32', description: 'Tsunami vulnerability 0-1' },
      { key: 'overall_vulnerability_vector', label: 'Vulnerability Vector', type: 'float32[5]', description: 'Combined [fire, seismic, flood, wind, tsunami]' },
      { key: 'spacing_to_neighbors', label: 'Neighbor Spacing', type: 'float32', description: 'Distance to nearest adjacent building (meters)' },
    ],
  },
  {
    label: 'Shelter & Safety',
    attributes: [
      { key: 'structural_durability_score', label: 'Structural Durability', type: 'float32', description: 'Overall structural strength rating 0-1' },
      { key: 'shelter_capacity_persons', label: 'Shelter Capacity', type: 'int32', description: 'Maximum persons for sheltering' },
      { key: 'shelter_score_tornado', label: 'Shelter Score (Tornado)', type: 'float32', description: 'Suitability as tornado shelter 0-1' },
      { key: 'shelter_score_flood', label: 'Shelter Score (Flood)', type: 'float32', description: 'Suitability as flood shelter 0-1' },
      { key: 'shelter_score_earthquake', label: 'Shelter Score (Earthquake)', type: 'float32', description: 'Suitability as earthquake shelter 0-1' },
      { key: 'shelter_score_wildfire', label: 'Shelter Score (Wildfire)', type: 'float32', description: 'Suitability as wildfire shelter 0-1' },
      { key: 'shelter_score_radiation', label: 'Shelter Score (Radiation)', type: 'float32', description: 'Radiation shielding rating 0-1' },
      { key: 'preferred_shelter_type', label: 'Preferred Shelter Type', type: 'enum', description: 'basement | bank_vault | reinforced_concrete | multi_story | subway_station' },
      { key: 'hours_of_access', label: 'Shelter Access Hours', type: 'string', description: 'When building is accessible for sheltering' },
      { key: 'access_availability_factor', label: 'Access Availability', type: 'float32', description: 'Fraction of time building is accessible 0-1' },
    ],
  },
  {
    label: 'Special Facility Flags',
    attributes: [
      { key: 'disaster_relevance_tags', label: 'Disaster Relevance Tags', type: 'string[]', description: 'Tags for disaster-relevant characteristics' },
      { key: 'population_at_risk', label: 'Population at Risk', type: 'int32', description: 'Vulnerable persons count at this facility' },
      { key: 'hazard_flags', label: 'Hazard Flags', type: 'string[]', description: 'Active hazard indicators (hazmat, radiation, etc.)' },
      { key: 'special_facility_contact', label: 'Facility Contact', type: 'string', description: 'Emergency contact for facility management' },
    ],
  },
  {
    label: 'Data Quality & Provenance',
    attributes: [
      { key: 'building_id', label: 'Building ID', type: 'UUID', description: 'Unique identifier' },
      { key: 'tile_id', label: 'Tile ID', type: 'string', description: 'Processing tile reference (x_y format)' },
      { key: 'confidence', label: 'Overall Confidence', type: 'float32', description: 'Combined confidence score 0-1' },
      { key: 'source_agreement', label: 'Source Agreement', type: 'int32', description: 'Number of sources agreeing on this building' },
      { key: 'source_lidar', label: 'LiDAR Source', type: 'boolean', description: 'Has LiDAR-derived data' },
      { key: 'source_satellite', label: 'Satellite Source', type: 'boolean', description: 'Has satellite-derived data' },
      { key: 'source_osm', label: 'OSM Source', type: 'boolean', description: 'Has OpenStreetMap data' },
      { key: 'shadow_analyzed', label: 'Shadow Analyzed', type: 'boolean', description: 'Height estimated from shadow analysis' },
      { key: 'last_updated', label: 'Last Updated', type: 'datetime', description: 'Most recent data update timestamp' },
    ],
  },
];

export interface BuildingStyle {
  id: string;
  label: string;
  description: string;
  characteristics: string[];
  color: string;
}

export const buildingStyles: BuildingStyle[] = [
  {
    id: 'single-family',
    label: 'Single-Family Residential',
    description: '1-2 story wood frame homes',
    characteristics: ['1-2 floors', 'Wood frame', 'Gable/hip roof', '100-300 m²', 'Residential purpose'],
    color: '#4ade80',
  },
  {
    id: 'multi-family',
    label: 'Multi-Family Residential',
    description: 'Apartments, condos, townhomes',
    characteristics: ['2-5 floors', 'Wood/masonry', 'Flat/low-slope roof', '300-2000 m²', 'Multiple units'],
    color: '#60a5fa',
  },
  {
    id: 'high-rise-residential',
    label: 'High-Rise Residential',
    description: 'Tall apartment/condo buildings',
    characteristics: ['6+ floors', 'Concrete/steel', 'Flat roof', '500-3000 m²', 'Elevator access'],
    color: '#818cf8',
  },
  {
    id: 'commercial-retail',
    label: 'Commercial Retail',
    description: 'Shops, restaurants, strip malls',
    characteristics: ['1-2 floors', 'Masonry/steel', 'Flat roof', '200-5000 m²', 'Street-facing entrances'],
    color: '#f59e0b',
  },
  {
    id: 'commercial-office',
    label: 'Commercial Office',
    description: 'Office buildings and towers',
    characteristics: ['3-50+ floors', 'Steel/concrete', 'Flat roof', '500-10000 m²', 'Lobby access'],
    color: '#f97316',
  },
  {
    id: 'industrial',
    label: 'Industrial / Warehouse',
    description: 'Factories, warehouses, distribution centers',
    characteristics: ['1-3 floors', 'Steel/metal', 'Low-slope roof', '1000-50000 m²', 'Loading docks'],
    color: '#a78bfa',
  },
  {
    id: 'public-school',
    label: 'School / Education',
    description: 'K-12 schools, universities, daycare',
    characteristics: ['1-4 floors', 'Masonry/concrete', 'Flat roof', '500-10000 m²', 'Multiple wings'],
    color: '#2dd4bf',
  },
  {
    id: 'hospital',
    label: 'Hospital / Medical',
    description: 'Hospitals, clinics, urgent care',
    characteristics: ['2-15 floors', 'Concrete/steel', 'Flat roof', '2000-30000 m²', 'Emergency access'],
    color: '#fb7185',
  },
  {
    id: 'religious',
    label: 'Religious',
    description: 'Churches, mosques, synagogues, temples',
    characteristics: ['1-3 floors', 'Masonry/stone', 'Varied roof (steeple, dome)', '200-3000 m²', 'Large assembly space'],
    color: '#e879f9',
  },
  {
    id: 'mobile-home',
    label: 'Mobile Home',
    description: 'Manufactured housing and trailer parks',
    characteristics: ['1 floor', 'Metal/composite', 'Low-slope roof', '50-150 m²', 'High wind vulnerability'],
    color: '#fbbf24',
  },
  {
    id: 'government',
    label: 'Government / Civic',
    description: 'City halls, courthouses, fire/police stations',
    characteristics: ['1-5 floors', 'Masonry/concrete', 'Varied roof', '500-5000 m²', 'Public access'],
    color: '#38bdf8',
  },
  {
    id: 'big-box',
    label: 'Big Box / Large Commercial',
    description: 'Supermarkets, malls, entertainment venues',
    characteristics: ['1-2 floors', 'Steel frame', 'Flat roof', '5000-50000 m²', 'Large parking areas'],
    color: '#fb923c',
  },
];
