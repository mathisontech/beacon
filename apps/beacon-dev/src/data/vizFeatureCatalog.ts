// Visualization Manager — Complete Feature Catalog
// Every feature type an employee can configure in Features or compose into Scenes.
// Each feature has: persistent base data fields + evolving status data fields.
// Primary buildings have a full visfile (buildingVisfile.ts) for geometric rendering.
// This catalog covers ALL feature types including structures, barriers, roads,
// water, vegetation, terrain, utilities, underground, vehicles, animals,
// sensors, signage, and hazard perimeters.

export interface DataField {
  key: string;
  label: string;
  format: string;       // wire format: float32, uint8, enum8, bool, WKB, etc.
  bytes: number;
  description: string;
}

export interface FeatureType {
  id: string;
  label: string;
  category: string;
  description: string;
  persistentBase: DataField[];
  evolvingStatus: DataField[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. STRUCTURES
//    All buildings, secondary structures, and critical facilities.
//    Primary building geometry uses buildingVisfile.ts.
//    Everything here is a physical structure on a property.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const structures: FeatureType[] = [
  // ── Land & Parcels ──
  {
    id: 'parcel',
    label: 'Parcel / Lot',
    category: 'Structures',
    description: 'Land boundary containing one or more structures.',
    persistentBase: [
      { key: 'boundary', label: 'Parcel Boundary', format: 'POLYGON (WKB)', bytes: 0, description: 'Legal lot line polygon' },
      { key: 'area_sqm', label: 'Lot Area', format: 'float32', bytes: 4, description: 'Total lot area in sq meters' },
      { key: 'address', label: 'Address', format: 'varchar', bytes: 0, description: 'Primary street address' },
      { key: 'zoning', label: 'Zoning Class', format: 'enum8', bytes: 1, description: 'residential, commercial, industrial, agricultural, mixed, public' },
      { key: 'owner_type', label: 'Owner Type', format: 'enum8', bytes: 1, description: 'private, corporate, government, trust, hoa' },
      { key: 'elevation_avg', label: 'Avg Ground Elevation', format: 'float32', bytes: 4, description: 'Mean DEM elevation across parcel' },
      { key: 'slope_pct', label: 'Average Slope', format: 'uint8', bytes: 1, description: '0-90 degrees average grade' },
      { key: 'fema_zone', label: 'FEMA Flood Zone', format: 'enum8', bytes: 1, description: 'A, AE, AH, AO, V, VE, X, D' },
      { key: 'structure_count', label: 'Structure Count', format: 'uint8', bytes: 1, description: 'Number of structures on parcel' },
    ],
    evolvingStatus: [
      { key: 'flood_depth', label: 'Current Flood Depth', format: 'float32', bytes: 4, description: 'Water depth on parcel in meters' },
      { key: 'fire_proximity', label: 'Fire Front Distance', format: 'float32', bytes: 4, description: 'Distance to nearest active fire perimeter' },
      { key: 'power_status', label: 'Power Status', format: 'enum8', bytes: 1, description: 'on, outage, partial, generator' },
      { key: 'access_status', label: 'Road Access', format: 'enum8', bytes: 1, description: 'open, blocked, flooded, debris, unknown' },
      { key: 'damage_level', label: 'Damage Assessment', format: 'enum8', bytes: 1, description: 'none, minor, major, destroyed, unknown' },
    ],
  },

  // ── Secondary Structures ──
  {
    id: 'shed',
    label: 'Shed / Outbuilding',
    category: 'Structures',
    description: 'Detached utility structure: tool shed, workshop, storage.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Outline' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Height in meters' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'wood, metal, plastic, concrete' },
      { key: 'roof_type', label: 'Roof Type', format: 'enum8', bytes: 1, description: 'flat, shed, gable' },
      { key: 'area_sqm', label: 'Floor Area', format: 'float32', bytes: 4, description: 'Interior area' },
      { key: 'contents_hazard', label: 'Hazardous Contents', format: 'bool', bytes: 1, description: 'Fuel, chemicals, propane stored' },
    ],
    evolvingStatus: [
      { key: 'damage', label: 'Damage Level', format: 'enum8', bytes: 1, description: 'none, minor, major, destroyed' },
      { key: 'on_fire', label: 'On Fire', format: 'bool', bytes: 1, description: 'Currently burning' },
    ],
  },
  {
    id: 'garage',
    label: 'Garage / Carport',
    category: 'Structures',
    description: 'Detached or semi-attached vehicle shelter.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Outline' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Height' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'attached, detached, carport' },
      { key: 'bays', label: 'Bay Count', format: 'uint8', bytes: 1, description: '1-4 vehicle bays' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'wood, metal, concrete, mixed' },
    ],
    evolvingStatus: [
      { key: 'damage', label: 'Damage Level', format: 'enum8', bytes: 1, description: 'none, minor, major, destroyed' },
      { key: 'blocked', label: 'Access Blocked', format: 'bool', bytes: 1, description: 'Door obstructed by debris/water' },
    ],
  },
  {
    id: 'pool',
    label: 'Swimming Pool',
    category: 'Structures',
    description: 'Residential or commercial swimming pool.',
    persistentBase: [
      { key: 'footprint', label: 'Outline', format: 'POLYGON (WKB)', bytes: 0, description: 'Pool perimeter' },
      { key: 'area_sqm', label: 'Surface Area', format: 'float32', bytes: 4, description: 'Water surface area' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'inground, above_ground, lap, kiddie' },
      { key: 'depth_max', label: 'Max Depth', format: 'float32', bytes: 4, description: 'Maximum depth in meters' },
      { key: 'fenced', label: 'Fenced', format: 'bool', bytes: 1, description: 'Safety fence present' },
      { key: 'volume_liters', label: 'Volume', format: 'float32', bytes: 4, description: 'Estimated water volume' },
    ],
    evolvingStatus: [
      { key: 'filled', label: 'Water Present', format: 'bool', bytes: 1, description: 'Pool has water (emergency water source)' },
      { key: 'contaminated', label: 'Contaminated', format: 'bool', bytes: 1, description: 'Flood/chemical contamination' },
      { key: 'debris', label: 'Debris Filled', format: 'bool', bytes: 1, description: 'Storm debris in pool' },
    ],
  },
  {
    id: 'pool_house',
    label: 'Pool House / Cabana',
    category: 'Structures',
    description: 'Small structure adjacent to a pool.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Outline' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Height' },
      { key: 'enclosed', label: 'Enclosed', format: 'bool', bytes: 1, description: 'Fully walled vs open-air' },
    ],
    evolvingStatus: [
      { key: 'damage', label: 'Damage Level', format: 'enum8', bytes: 1, description: 'none, minor, major, destroyed' },
    ],
  },
  {
    id: 'barn',
    label: 'Barn / Agricultural Building',
    category: 'Structures',
    description: 'Agricultural storage, livestock housing, or equipment barn.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Outline' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Peak height' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'wood, metal, pole_barn, concrete' },
      { key: 'purpose', label: 'Purpose', format: 'enum8', bytes: 1, description: 'livestock, hay, equipment, mixed' },
      { key: 'livestock_present', label: 'Livestock Present', format: 'bool', bytes: 1, description: 'Animals housed here' },
      { key: 'livestock_count', label: 'Livestock Count', format: 'uint16', bytes: 2, description: 'Estimated animal count' },
    ],
    evolvingStatus: [
      { key: 'damage', label: 'Damage Level', format: 'enum8', bytes: 1, description: 'none, minor, major, destroyed' },
      { key: 'animals_trapped', label: 'Animals Trapped', format: 'bool', bytes: 1, description: 'Animals unable to evacuate' },
      { key: 'on_fire', label: 'On Fire', format: 'bool', bytes: 1, description: 'Currently burning' },
    ],
  },
  {
    id: 'greenhouse',
    label: 'Greenhouse / Hoophouse',
    category: 'Structures',
    description: 'Glass or plastic growing structure.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Outline' },
      { key: 'material', label: 'Glazing', format: 'enum8', bytes: 1, description: 'glass, polycarbonate, polyfilm' },
      { key: 'area_sqm', label: 'Area', format: 'float32', bytes: 4, description: 'Floor area' },
    ],
    evolvingStatus: [
      { key: 'damage', label: 'Damage', format: 'enum8', bytes: 1, description: 'none, cracked, collapsed, destroyed' },
    ],
  },
  {
    id: 'mobile_home',
    label: 'Mobile Home / Manufactured',
    category: 'Structures',
    description: 'Manufactured home, trailer, or modular on a lot.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Outline' },
      { key: 'width_m', label: 'Width', format: 'float32', bytes: 4, description: 'Single-wide vs double-wide' },
      { key: 'length_m', label: 'Length', format: 'float32', bytes: 4, description: 'Length' },
      { key: 'anchored', label: 'Anchored/Tied Down', format: 'bool', bytes: 1, description: 'Properly secured to foundation' },
      { key: 'skirted', label: 'Skirted', format: 'bool', bytes: 1, description: 'Foundation skirting present' },
      { key: 'on_risers', label: 'On Risers', format: 'bool', bytes: 1, description: 'Elevated on piers or blocks' },
      { key: 'riser_height_m', label: 'Riser Height', format: 'float32', bytes: 4, description: 'Height above ground' },
    ],
    evolvingStatus: [
      { key: 'damage', label: 'Damage Level', format: 'enum8', bytes: 1, description: 'none, shifted, tipped, destroyed' },
      { key: 'displaced', label: 'Displaced', format: 'bool', bytes: 1, description: 'Moved from foundation by wind/flood' },
    ],
  },
  {
    id: 'tank',
    label: 'Tank / Silo',
    category: 'Structures',
    description: 'Propane tank, water tank, grain silo, fuel storage.',
    persistentBase: [
      { key: 'center', label: 'Center Point', format: 'POINT (WKB)', bytes: 0, description: 'Location' },
      { key: 'diameter_m', label: 'Diameter', format: 'float32', bytes: 4, description: 'Outer diameter' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Total height' },
      { key: 'contents', label: 'Contents', format: 'enum8', bytes: 1, description: 'propane, water, fuel, grain, chemical, unknown' },
      { key: 'capacity_liters', label: 'Capacity', format: 'float32', bytes: 4, description: 'Volume capacity' },
      { key: 'above_ground', label: 'Above Ground', format: 'bool', bytes: 1, description: 'Visible vs buried' },
    ],
    evolvingStatus: [
      { key: 'fill_level', label: 'Fill Level', format: 'uint8', bytes: 1, description: '0-100 percent full' },
      { key: 'leaking', label: 'Leaking', format: 'bool', bytes: 1, description: 'Compromised containment' },
      { key: 'damage', label: 'Damage', format: 'enum8', bytes: 1, description: 'none, dented, punctured, collapsed' },
    ],
  },
  {
    id: 'deck_patio',
    label: 'Deck / Patio',
    category: 'Structures',
    description: 'Outdoor living surface attached to or near a structure.',
    persistentBase: [
      { key: 'footprint', label: 'Outline', format: 'POLYGON (WKB)', bytes: 0, description: 'Perimeter' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'wood, composite, concrete, stone, pavers' },
      { key: 'elevated', label: 'Elevated', format: 'bool', bytes: 1, description: 'Raised deck vs ground-level patio' },
      { key: 'height_m', label: 'Deck Height', format: 'float32', bytes: 4, description: 'Height above ground if elevated' },
      { key: 'covered', label: 'Covered', format: 'bool', bytes: 1, description: 'Roof/pergola overhead' },
    ],
    evolvingStatus: [
      { key: 'damage', label: 'Damage', format: 'enum8', bytes: 1, description: 'none, minor, collapsed, burned' },
    ],
  },
  {
    id: 'patio_furniture',
    label: 'Outdoor Furniture / Fixtures',
    category: 'Structures',
    description: 'Tables, chairs, grills, trampolines, playground equipment — loose objects that become projectiles in wind events.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Approximate center' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'table_chairs, grill, trampoline, swing_set, hot_tub, umbrella, gazebo, playground, other' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'metal, wood, plastic, fabric, mixed' },
      { key: 'secured', label: 'Anchored/Secured', format: 'bool', bytes: 1, description: 'Bolted down or tethered' },
      { key: 'weight_class', label: 'Weight Class', format: 'enum8', bytes: 1, description: 'light, medium, heavy' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'in_place, displaced, missing, stowed' },
      { key: 'projectile_risk', label: 'Projectile Risk', format: 'bool', bytes: 1, description: 'Unsecured in high-wind event' },
    ],
  },
  {
    id: 'monument',
    label: 'Monument / Statue / Public Art',
    category: 'Structures',
    description: 'Permanent landmark, memorial, statue, or public art installation.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Center point' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Total height' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'stone, bronze, steel, concrete, mixed' },
      { key: 'footprint_m2', label: 'Footprint Area', format: 'float32', bytes: 4, description: 'Base area' },
      { key: 'landmark', label: 'Navigation Landmark', format: 'bool', bytes: 1, description: 'Useful as wayfinding reference' },
    ],
    evolvingStatus: [
      { key: 'damage', label: 'Damage', format: 'enum8', bytes: 1, description: 'none, minor, toppled, destroyed' },
    ],
  },
  {
    id: 'unusual_building',
    label: 'Unusual / Landmark Building',
    category: 'Structures',
    description: 'Museum, stadium, arena, dome, pyramid, or any non-standard geometry building requiring custom mesh.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Outline' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Max height' },
      { key: 'mesh_id', label: 'Custom Mesh ID', format: 'varchar', bytes: 0, description: 'Reference to hand-modeled 3D mesh' },
      { key: 'shape_class', label: 'Shape Class', format: 'enum8', bytes: 1, description: 'dome, pyramid, a_frame, geodesic, curved, cantilevered, spire, irregular' },
      { key: 'purpose', label: 'Purpose', format: 'enum8', bytes: 1, description: 'museum, stadium, arena, observatory, monument, theme_park, other' },
      { key: 'capacity', label: 'Capacity', format: 'uint32', bytes: 4, description: 'Max occupancy' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, event_active, closed, evacuating, damaged' },
      { key: 'occupancy', label: 'Current Occupancy', format: 'uint32', bytes: 4, description: 'People inside' },
      { key: 'damage', label: 'Damage', format: 'enum8', bytes: 1, description: 'none, minor, major, destroyed' },
    ],
  },

  // ── Critical Facilities (specialized building types) ──
  {
    id: 'shelter',
    label: 'Designated Shelter',
    category: 'Structures',
    description: 'Officially designated emergency shelter.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Facility location' },
      { key: 'capacity', label: 'Capacity', format: 'uint16', bytes: 2, description: 'Max persons' },
      { key: 'type', label: 'Shelter Type', format: 'enum8', bytes: 1, description: 'general, pet_friendly, medical, tornado, flood' },
      { key: 'ada', label: 'ADA Compliant', format: 'bool', bytes: 1, description: 'Wheelchair accessible' },
      { key: 'generator', label: 'Has Generator', format: 'bool', bytes: 1, description: 'Backup power' },
      { key: 'kitchen', label: 'Has Kitchen', format: 'bool', bytes: 1, description: 'Meal preparation capability' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'closed, open, full, damaged, evacuating' },
      { key: 'occupancy', label: 'Current Occupancy', format: 'uint16', bytes: 2, description: 'People currently sheltered' },
      { key: 'accepting', label: 'Accepting', format: 'bool', bytes: 1, description: 'Taking new arrivals' },
      { key: 'supplies_status', label: 'Supply Level', format: 'enum8', bytes: 1, description: 'adequate, low, critical, resupplied' },
    ],
  },
  {
    id: 'hospital',
    label: 'Hospital / Medical Facility',
    category: 'Structures',
    description: 'Emergency medical care location.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Facility location' },
      { key: 'beds', label: 'Bed Count', format: 'uint16', bytes: 2, description: 'Total beds' },
      { key: 'level', label: 'Trauma Level', format: 'enum8', bytes: 1, description: 'I, II, III, IV, V, none' },
      { key: 'helipad', label: 'Helipad', format: 'bool', bytes: 1, description: 'Helicopter landing' },
      { key: 'generator_hrs', label: 'Generator Hours', format: 'uint8', bytes: 1, description: 'Backup power duration' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, diverting, lockdown, evacuating, offline' },
      { key: 'bed_availability', label: 'Beds Available', format: 'uint16', bytes: 2, description: 'Open beds' },
      { key: 'er_wait_min', label: 'ER Wait', format: 'uint16', bytes: 2, description: 'Minutes' },
      { key: 'on_generator', label: 'On Generator', format: 'bool', bytes: 1, description: 'Running on backup' },
    ],
  },
  {
    id: 'fire_station',
    label: 'Fire Station',
    category: 'Structures',
    description: 'Fire department station house.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Station location' },
      { key: 'apparatus', label: 'Apparatus Count', format: 'uint8', bytes: 1, description: 'Engines, ladders, rescues' },
      { key: 'staffing', label: 'Normal Staffing', format: 'uint8', bytes: 1, description: 'Typical crew size' },
      { key: 'volunteer', label: 'Volunteer', format: 'bool', bytes: 1, description: 'Volunteer vs career' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'in_service, deployed, offline, damaged' },
      { key: 'units_available', label: 'Units Available', format: 'uint8', bytes: 1, description: 'Apparatus still at station' },
    ],
  },
  {
    id: 'ems_station',
    label: 'EMS Station',
    category: 'Structures',
    description: 'Ambulance or paramedic station.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Station location' },
      { key: 'units', label: 'Ambulance Count', format: 'uint8', bytes: 1, description: 'Number of units' },
      { key: 'als', label: 'ALS Capable', format: 'bool', bytes: 1, description: 'Advanced life support' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'in_service, deployed, offline' },
      { key: 'units_available', label: 'Units Available', format: 'uint8', bytes: 1, description: 'Ambulances at station' },
    ],
  },
  {
    id: 'police_station',
    label: 'Police Station',
    category: 'Structures',
    description: 'Law enforcement facility.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Station location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'headquarters, precinct, substation, dispatch' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, mobilized, evacuated, damaged' },
    ],
  },
  {
    id: 'school',
    label: 'School',
    category: 'Structures',
    description: 'Educational facility — potential shelter or population center.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Facility location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'elementary, middle, high, university, daycare' },
      { key: 'enrollment', label: 'Enrollment', format: 'uint16', bytes: 2, description: 'Student count' },
      { key: 'shelter_capable', label: 'Shelter Capable', format: 'bool', bytes: 1, description: 'Can function as shelter' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'open, closed, shelter_active, evacuated, damaged' },
      { key: 'occupancy', label: 'Current Occupancy', format: 'uint16', bytes: 2, description: 'People on site' },
    ],
  },
  {
    id: 'nursing_home',
    label: 'Nursing Home / Assisted Living',
    category: 'Structures',
    description: 'Residential care facility with vulnerable population.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Facility location' },
      { key: 'beds', label: 'Bed Count', format: 'uint16', bytes: 2, description: 'Licensed beds' },
      { key: 'generator', label: 'Has Generator', format: 'bool', bytes: 1, description: 'Backup power' },
      { key: 'evac_transport', label: 'Evac Transport', format: 'bool', bytes: 1, description: 'Has vehicles for evacuation' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, sheltering, evacuating, evacuated, damaged' },
      { key: 'residents', label: 'Current Residents', format: 'uint16', bytes: 2, description: 'People on site' },
      { key: 'on_generator', label: 'On Generator', format: 'bool', bytes: 1, description: 'Running on backup power' },
    ],
  },
  {
    id: 'government_building',
    label: 'Government Building',
    category: 'Structures',
    description: 'Municipal, county, state, or federal government facility.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Facility location' },
      { key: 'level', label: 'Level', format: 'enum8', bytes: 1, description: 'municipal, county, state, federal' },
      { key: 'eoc', label: 'EOC Present', format: 'bool', bytes: 1, description: 'Emergency operations center' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, eoc_activated, closed, damaged' },
    ],
  },
  {
    id: 'religious_institution',
    label: 'Religious Institution',
    category: 'Structures',
    description: 'Church, mosque, synagogue, temple — often community shelters.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Facility location' },
      { key: 'capacity', label: 'Seating Capacity', format: 'uint16', bytes: 2, description: 'Sanctuary capacity' },
      { key: 'kitchen', label: 'Has Kitchen', format: 'bool', bytes: 1, description: 'Meal prep capability' },
      { key: 'shelter_capable', label: 'Shelter Capable', format: 'bool', bytes: 1, description: 'Can serve as shelter' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, shelter_active, distribution_point, damaged' },
    ],
  },
  {
    id: 'animal_facility',
    label: 'Veterinary / Animal Shelter',
    category: 'Structures',
    description: 'Animal care or sheltering facility.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Facility location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'vet_clinic, animal_shelter, boarding, rescue' },
      { key: 'capacity', label: 'Animal Capacity', format: 'uint16', bytes: 2, description: 'Max animals' },
      { key: 'large_animal', label: 'Large Animal', format: 'bool', bytes: 1, description: 'Can handle horses/livestock' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, accepting, full, evacuating, damaged' },
      { key: 'occupancy', label: 'Animals On Site', format: 'uint16', bytes: 2, description: 'Current animal count' },
    ],
  },
  {
    id: 'airport_helipad',
    label: 'Airport / Helipad',
    category: 'Structures',
    description: 'Fixed-wing or rotorcraft landing area.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Field reference point' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'commercial, general_aviation, military, helipad, seaplane' },
      { key: 'runway_length_m', label: 'Longest Runway', format: 'uint16', bytes: 2, description: 'Meters (0 for helipad)' },
      { key: 'instrument', label: 'Instrument Approach', format: 'bool', bytes: 1, description: 'IFR capable' },
      { key: 'fuel', label: 'Fuel Available', format: 'bool', bytes: 1, description: 'Jet-A or Avgas on site' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'open, restricted, closed, damaged' },
      { key: 'ceiling_ft', label: 'Ceiling', format: 'uint16', bytes: 2, description: 'Cloud ceiling in feet' },
      { key: 'visibility_mi', label: 'Visibility', format: 'float32', bytes: 4, description: 'Statute miles' },
    ],
  },
  {
    id: 'port_marina',
    label: 'Port / Marina / Boat Ramp',
    category: 'Structures',
    description: 'Boat access point — rescue staging or evacuation.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Facility location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'commercial_port, marina, boat_ramp, ferry_terminal, kayak_launch' },
      { key: 'slips', label: 'Slip Count', format: 'uint16', bytes: 2, description: 'Boat slips or berths' },
      { key: 'ramp', label: 'Has Ramp', format: 'bool', bytes: 1, description: 'Boat launch ramp' },
      { key: 'draft_m', label: 'Max Draft', format: 'float32', bytes: 4, description: 'Maximum vessel draft' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'open, restricted, closed, damaged, surge_warning' },
      { key: 'tide_access', label: 'Tide Accessible', format: 'bool', bytes: 1, description: 'Sufficient water for launch' },
    ],
  },
  {
    id: 'staging_area',
    label: 'Staging Area',
    category: 'Structures',
    description: 'Designated emergency operations staging location.',
    persistentBase: [
      { key: 'footprint', label: 'Area', format: 'POLYGON (WKB)', bytes: 0, description: 'Usable area boundary' },
      { key: 'surface', label: 'Surface', format: 'enum8', bytes: 1, description: 'paved, gravel, grass, mixed' },
      { key: 'area_sqm', label: 'Area', format: 'float32', bytes: 4, description: 'Usable space' },
      { key: 'access_road', label: 'Heavy Vehicle Access', format: 'bool', bytes: 1, description: 'Can handle trucks/equipment' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'available, active, full, unusable' },
      { key: 'purpose', label: 'Current Use', format: 'enum8', bytes: 1, description: 'none, ems_staging, equipment, supply_depot, triage, base_camp' },
    ],
  },
  {
    id: 'water_tower',
    label: 'Water Tower',
    category: 'Structures',
    description: 'Elevated water storage for pressure and supply.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Tower base' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Total height' },
      { key: 'capacity_gal', label: 'Capacity', format: 'float32', bytes: 4, description: 'Gallons' },
    ],
    evolvingStatus: [
      { key: 'level_pct', label: 'Fill Level', format: 'uint8', bytes: 1, description: '0-100 percent' },
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, low, offline, damaged' },
    ],
  },
  {
    id: 'power_station',
    label: 'Power Station / Generator Facility',
    category: 'Structures',
    description: 'Electricity generation plant.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Plant location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'coal, gas, nuclear, hydro, solar, wind, diesel' },
      { key: 'capacity_mw', label: 'Capacity', format: 'float32', bytes: 4, description: 'Megawatts' },
      { key: 'customers_served', label: 'Customers', format: 'uint32', bytes: 4, description: 'Downstream customers' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'online, reduced, offline, emergency_shutdown, damaged' },
      { key: 'output_pct', label: 'Output', format: 'uint8', bytes: 1, description: '0-100 percent of capacity' },
    ],
  },
  {
    id: 'debris_basin',
    label: 'Debris Basin / Catch Basin',
    category: 'Structures',
    description: 'Engineered basin to capture debris flows and sediment.',
    persistentBase: [
      { key: 'footprint', label: 'Basin Outline', format: 'POLYGON (WKB)', bytes: 0, description: 'Basin boundary' },
      { key: 'capacity_cuyd', label: 'Capacity', format: 'float32', bytes: 4, description: 'Cubic yards' },
      { key: 'last_cleaned', label: 'Last Cleaned', format: 'datetime', bytes: 8, description: 'Date of last cleanout' },
    ],
    evolvingStatus: [
      { key: 'fill_pct', label: 'Fill Level', format: 'uint8', bytes: 1, description: '0-100 percent' },
      { key: 'overflowing', label: 'Overflowing', format: 'bool', bytes: 1, description: 'Debris flowing past basin' },
    ],
  },
  {
    id: 'transit_stop',
    label: 'Transit Stop / Station',
    category: 'Structures',
    description: 'Bus stop, train station, or transit hub.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Stop location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'bus_stop, bus_station, rail_station, ferry_dock, park_and_ride' },
      { key: 'routes', label: 'Route Count', format: 'uint8', bytes: 1, description: 'Number of routes serving stop' },
      { key: 'ada', label: 'ADA Accessible', format: 'bool', bytes: 1, description: 'Wheelchair accessible' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'active, suspended, evac_pickup, closed' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. BARRIERS & BOUNDARIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const barriers: FeatureType[] = [
  {
    id: 'fence',
    label: 'Fence',
    category: 'Barriers',
    description: 'Property boundary or security fence.',
    persistentBase: [
      { key: 'line', label: 'Line Geometry', format: 'LINESTRING (WKB)', bytes: 0, description: 'Fence path' },
      { key: 'type', label: 'Fence Type', format: 'enum8', bytes: 1, description: 'chain_link, wood_privacy, picket, wrought_iron, concrete_wall, metal_security, wire, electric' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Fence height' },
      { key: 'rammable', label: 'Vehicle Rammable', format: 'bool', bytes: 1, description: 'Can be breached by vehicle' },
      { key: 'gated', label: 'Has Gate', format: 'bool', bytes: 1, description: 'Gate present in segment' },
      { key: 'condition', label: 'Condition', format: 'enum8', bytes: 1, description: 'good, fair, poor, damaged' },
    ],
    evolvingStatus: [
      { key: 'breached', label: 'Breached', format: 'bool', bytes: 1, description: 'Fence broken/down' },
      { key: 'gate_open', label: 'Gate Open', format: 'bool', bytes: 1, description: 'Gate is open or removed' },
      { key: 'debris_against', label: 'Debris Piled', format: 'bool', bytes: 1, description: 'Debris accumulated against fence' },
    ],
  },
  {
    id: 'hedge',
    label: 'Hedge / Living Fence',
    category: 'Barriers',
    description: 'Dense planted vegetation forming a boundary or screen.',
    persistentBase: [
      { key: 'line', label: 'Line Geometry', format: 'LINESTRING (WKB)', bytes: 0, description: 'Hedge path' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Hedge height' },
      { key: 'width_m', label: 'Width', format: 'float32', bytes: 4, description: 'Hedge thickness' },
      { key: 'species', label: 'Species', format: 'enum8', bytes: 1, description: 'privet, boxwood, arborvitae, holly, mixed, unknown' },
      { key: 'density', label: 'Density', format: 'enum8', bytes: 1, description: 'sparse, moderate, dense, impenetrable' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'healthy, dry, burning, dead, removed' },
      { key: 'fire_fuel', label: 'Fire Fuel Risk', format: 'bool', bytes: 1, description: 'Dry enough to carry fire between structures' },
    ],
  },
  {
    id: 'rock_boulder',
    label: 'Rock / Boulder',
    category: 'Barriers',
    description: 'Natural rock formation, placed boulder, or riprap acting as barrier or landmark.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Center point' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'natural_outcrop, placed_boulder, riprap, decorative, retaining' },
      { key: 'size_class', label: 'Size', format: 'enum8', bytes: 1, description: 'small, medium, large, massive' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Above ground height' },
      { key: 'anchored', label: 'Stable/Anchored', format: 'bool', bytes: 1, description: 'Fixed vs rollable' },
    ],
    evolvingStatus: [
      { key: 'displaced', label: 'Displaced', format: 'bool', bytes: 1, description: 'Moved by flood/slide/quake' },
      { key: 'blocking', label: 'Blocking', format: 'enum8', bytes: 1, description: 'none, road, path, waterway, structure' },
    ],
  },
  {
    id: 'retaining_wall',
    label: 'Retaining Wall',
    category: 'Barriers',
    description: 'Structural wall holding back earth on a slope.',
    persistentBase: [
      { key: 'line', label: 'Wall Path', format: 'LINESTRING (WKB)', bytes: 0, description: 'Wall centerline' },
      { key: 'height_m', label: 'Exposed Height', format: 'float32', bytes: 4, description: 'Visible wall height' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'concrete, block, stone, timber, gabion, sheet_pile' },
      { key: 'length_m', label: 'Length', format: 'float32', bytes: 4, description: 'Total run' },
      { key: 'condition', label: 'Condition', format: 'enum8', bytes: 1, description: 'good, fair, poor, failing' },
    ],
    evolvingStatus: [
      { key: 'failing', label: 'Failing', format: 'bool', bytes: 1, description: 'Visible bulging, cracking, or leaning' },
      { key: 'overtopped', label: 'Overtopped', format: 'bool', bytes: 1, description: 'Earth/water flowing over wall' },
    ],
  },
  {
    id: 'levee',
    label: 'Levee / Flood Wall',
    category: 'Barriers',
    description: 'Engineered flood protection structure.',
    persistentBase: [
      { key: 'line', label: 'Centerline', format: 'LINESTRING (WKB)', bytes: 0, description: 'Levee path' },
      { key: 'crest_elev_m', label: 'Crest Elevation', format: 'float32', bytes: 4, description: 'Top elevation NAVD88' },
      { key: 'height_m', label: 'Height Above Grade', format: 'float32', bytes: 4, description: 'Effective protection height' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'earthen, concrete, sheet_pile, sandbag, combo' },
      { key: 'accredited', label: 'FEMA Accredited', format: 'bool', bytes: 1, description: 'Meets FEMA certification' },
      { key: 'protected_pop', label: 'Protected Population', format: 'uint32', bytes: 4, description: 'People behind this levee' },
    ],
    evolvingStatus: [
      { key: 'water_level_m', label: 'Water Level', format: 'float32', bytes: 4, description: 'Current water height against levee' },
      { key: 'freeboard_m', label: 'Freeboard', format: 'float32', bytes: 4, description: 'Remaining capacity before overtopping' },
      { key: 'seepage', label: 'Seepage Detected', format: 'bool', bytes: 1, description: 'Water seeping through base' },
      { key: 'breached', label: 'Breached', format: 'bool', bytes: 1, description: 'Levee has failed' },
      { key: 'sandbagged', label: 'Sandbagged', format: 'bool', bytes: 1, description: 'Temporary reinforcement in place' },
    ],
  },
  {
    id: 'dam',
    label: 'Dam',
    category: 'Barriers',
    description: 'Water impoundment structure.',
    persistentBase: [
      { key: 'line', label: 'Dam Crest', format: 'LINESTRING (WKB)', bytes: 0, description: 'Dam crest line' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Structural height' },
      { key: 'type', label: 'Dam Type', format: 'enum8', bytes: 1, description: 'concrete_gravity, arch, earthfill, rockfill, buttress' },
      { key: 'storage_acft', label: 'Max Storage', format: 'float32', bytes: 4, description: 'Reservoir capacity in acre-feet' },
      { key: 'hazard_class', label: 'Hazard Classification', format: 'enum8', bytes: 1, description: 'low, significant, high' },
      { key: 'spillway', label: 'Has Spillway', format: 'bool', bytes: 1, description: 'Controlled overflow present' },
      { key: 'downstream_pop', label: 'Downstream Population', format: 'uint32', bytes: 4, description: 'People in failure inundation zone' },
    ],
    evolvingStatus: [
      { key: 'pool_elev_m', label: 'Pool Elevation', format: 'float32', bytes: 4, description: 'Current water surface elevation' },
      { key: 'pct_capacity', label: 'Percent Capacity', format: 'uint8', bytes: 1, description: '0-100' },
      { key: 'spilling', label: 'Spilling', format: 'bool', bytes: 1, description: 'Water going over spillway' },
      { key: 'failure_risk', label: 'Failure Risk', format: 'enum8', bytes: 1, description: 'low, moderate, high, imminent' },
    ],
  },
  {
    id: 'berm',
    label: 'Berm / Earthwork',
    category: 'Barriers',
    description: 'Raised earth mound for noise, flood, or erosion control.',
    persistentBase: [
      { key: 'line', label: 'Centerline', format: 'LINESTRING (WKB)', bytes: 0, description: 'Berm path' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Crest height above surrounding grade' },
      { key: 'purpose', label: 'Purpose', format: 'enum8', bytes: 1, description: 'flood, noise, erosion, blast, landscaping' },
    ],
    evolvingStatus: [
      { key: 'overtopped', label: 'Overtopped', format: 'bool', bytes: 1, description: 'Water/debris flowing over' },
      { key: 'eroding', label: 'Eroding', format: 'bool', bytes: 1, description: 'Losing structural integrity' },
    ],
  },
  {
    id: 'guardrail_bollard',
    label: 'Guardrail / Bollard',
    category: 'Barriers',
    description: 'Road safety or vehicle exclusion barrier.',
    persistentBase: [
      { key: 'line', label: 'Line', format: 'LINESTRING (WKB)', bytes: 0, description: 'Barrier path' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'w_beam, cable, concrete_jersey, bollard, k_rail' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Barrier height' },
      { key: 'crash_rated', label: 'Crash Rated', format: 'bool', bytes: 1, description: 'Meets MASH crash rating' },
    ],
    evolvingStatus: [
      { key: 'damaged', label: 'Damaged', format: 'bool', bytes: 1, description: 'Hit by vehicle, compromised' },
      { key: 'displaced', label: 'Displaced', format: 'bool', bytes: 1, description: 'Moved from position' },
    ],
  },
  {
    id: 'seawall',
    label: 'Seawall / Bulkhead',
    category: 'Barriers',
    description: 'Coastal protection structure.',
    persistentBase: [
      { key: 'line', label: 'Centerline', format: 'LINESTRING (WKB)', bytes: 0, description: 'Wall path' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Top elevation above MHW' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'concrete, stone, sheet_pile, timber, riprap' },
      { key: 'condition', label: 'Condition', format: 'enum8', bytes: 1, description: 'good, fair, poor, failing' },
    ],
    evolvingStatus: [
      { key: 'overtopped', label: 'Overtopped', format: 'bool', bytes: 1, description: 'Waves/surge going over' },
      { key: 'breached', label: 'Breached', format: 'bool', bytes: 1, description: 'Structural failure' },
      { key: 'scour_depth_m', label: 'Scour Depth', format: 'float32', bytes: 4, description: 'Toe scour undermining' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. ROADS & TRANSPORTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const roads: FeatureType[] = [
  {
    id: 'road_segment',
    label: 'Road Segment',
    category: 'Roads',
    description: 'A section of road between intersections.',
    persistentBase: [
      { key: 'centerline', label: 'Centerline', format: 'LINESTRING (WKB)', bytes: 0, description: 'Road path' },
      { key: 'class', label: 'Road Class', format: 'enum8', bytes: 1, description: 'interstate, highway, arterial, collector, local, private, trail' },
      { key: 'lanes', label: 'Lane Count', format: 'uint8', bytes: 1, description: 'Total lanes both directions' },
      { key: 'width_m', label: 'Width', format: 'float32', bytes: 4, description: 'Pavement width' },
      { key: 'surface', label: 'Surface', format: 'enum8', bytes: 1, description: 'asphalt, concrete, gravel, dirt, sand, cobble' },
      { key: 'speed_limit', label: 'Speed Limit', format: 'uint8', bytes: 1, description: 'Posted limit in mph' },
      { key: 'one_way', label: 'One Way', format: 'bool', bytes: 1, description: 'Directional restriction' },
      { key: 'shoulder', label: 'Shoulder Type', format: 'enum8', bytes: 1, description: 'none, paved, gravel, grass' },
      { key: 'grade_pct', label: 'Grade', format: 'uint8', bytes: 1, description: 'Steepness in percent' },
      { key: 'evac_route', label: 'Evacuation Route', format: 'bool', bytes: 1, description: 'Designated evacuation route' },
    ],
    evolvingStatus: [
      { key: 'passable', label: 'Passable', format: 'enum8', bytes: 1, description: 'open, caution, restricted, closed, destroyed' },
      { key: 'flood_depth_m', label: 'Flood Depth', format: 'float32', bytes: 4, description: 'Water over road surface' },
      { key: 'debris', label: 'Debris', format: 'enum8', bytes: 1, description: 'none, minor, blocking_lane, impassable' },
      { key: 'ice_snow', label: 'Winter Condition', format: 'enum8', bytes: 1, description: 'clear, wet, icy, snow_covered, plowed' },
      { key: 'traffic_flow', label: 'Traffic Flow', format: 'enum8', bytes: 1, description: 'free, moderate, heavy, gridlock, contra_flow' },
    ],
  },
  {
    id: 'bridge',
    label: 'Bridge / Overpass',
    category: 'Roads',
    description: 'Structure carrying a road over water, valley, or another road.',
    persistentBase: [
      { key: 'line', label: 'Span Line', format: 'LINESTRING (WKB)', bytes: 0, description: 'Bridge path' },
      { key: 'length_m', label: 'Length', format: 'float32', bytes: 4, description: 'Total span' },
      { key: 'width_m', label: 'Width', format: 'float32', bytes: 4, description: 'Deck width' },
      { key: 'clearance_m', label: 'Vertical Clearance', format: 'float32', bytes: 4, description: 'Underpass clearance' },
      { key: 'weight_limit_t', label: 'Weight Limit', format: 'float32', bytes: 4, description: 'Tons' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'steel, concrete, timber, stone, composite' },
      { key: 'nbi_rating', label: 'NBI Condition Rating', format: 'uint8', bytes: 1, description: '0-9 structural condition' },
      { key: 'scour_critical', label: 'Scour Critical', format: 'bool', bytes: 1, description: 'Undermining risk' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'open, weight_restricted, one_lane, closed, collapsed' },
      { key: 'scour_active', label: 'Active Scour', format: 'bool', bytes: 1, description: 'Water undermining foundations' },
      { key: 'debris_jammed', label: 'Debris Jammed', format: 'bool', bytes: 1, description: 'Debris caught against piers' },
    ],
  },
  {
    id: 'intersection',
    label: 'Intersection',
    category: 'Roads',
    description: 'Junction where roads meet.',
    persistentBase: [
      { key: 'point', label: 'Center Point', format: 'POINT (WKB)', bytes: 0, description: 'Intersection center' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'signal, stop, yield, roundabout, uncontrolled' },
      { key: 'leg_count', label: 'Leg Count', format: 'uint8', bytes: 1, description: 'Number of approaches' },
      { key: 'turn_radius_m', label: 'Min Turn Radius', format: 'float32', bytes: 4, description: 'Tightest turn for large vehicles' },
    ],
    evolvingStatus: [
      { key: 'signal_status', label: 'Signal Status', format: 'enum8', bytes: 1, description: 'normal, flashing, dark, manual_control' },
      { key: 'blocked', label: 'Blocked', format: 'bool', bytes: 1, description: 'Impassable' },
    ],
  },
  {
    id: 'driveway',
    label: 'Driveway / Access Road',
    category: 'Roads',
    description: 'Private access from road to property.',
    persistentBase: [
      { key: 'line', label: 'Path', format: 'LINESTRING (WKB)', bytes: 0, description: 'Driveway path' },
      { key: 'surface', label: 'Surface', format: 'enum8', bytes: 1, description: 'paved, gravel, dirt, grass' },
      { key: 'width_m', label: 'Width', format: 'float32', bytes: 4, description: 'Driveway width' },
      { key: 'grade_pct', label: 'Grade', format: 'uint8', bytes: 1, description: 'Steepness' },
      { key: 'gated', label: 'Gated', format: 'bool', bytes: 1, description: 'Access gate present' },
    ],
    evolvingStatus: [
      { key: 'passable', label: 'Passable', format: 'enum8', bytes: 1, description: 'open, blocked, flooded, debris' },
    ],
  },
  {
    id: 'parking_area',
    label: 'Parking Lot / Structure',
    category: 'Roads',
    description: 'Vehicle parking area.',
    persistentBase: [
      { key: 'footprint', label: 'Outline', format: 'POLYGON (WKB)', bytes: 0, description: 'Parking boundary' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'surface, structure, underground, rooftop' },
      { key: 'capacity', label: 'Capacity', format: 'uint16', bytes: 2, description: 'Number of spaces' },
      { key: 'surface', label: 'Surface', format: 'enum8', bytes: 1, description: 'asphalt, concrete, gravel, grass' },
    ],
    evolvingStatus: [
      { key: 'usable', label: 'Usable', format: 'enum8', bytes: 1, description: 'open, flooded, debris, staging_area, triage' },
      { key: 'occupancy_pct', label: 'Occupancy', format: 'uint8', bytes: 1, description: '0-100 percent full' },
    ],
  },
  {
    id: 'rail_line',
    label: 'Rail Line',
    category: 'Roads',
    description: 'Railroad track.',
    persistentBase: [
      { key: 'line', label: 'Track', format: 'LINESTRING (WKB)', bytes: 0, description: 'Rail centerline' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'freight, passenger, light_rail, industrial, abandoned' },
      { key: 'tracks', label: 'Track Count', format: 'uint8', bytes: 1, description: 'Single or double track' },
      { key: 'electrified', label: 'Electrified', format: 'bool', bytes: 1, description: 'Overhead or third rail power' },
      { key: 'hazmat_route', label: 'Hazmat Route', format: 'bool', bytes: 1, description: 'Carries hazardous materials' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'active, suspended, blocked, derailment' },
      { key: 'crossing_blocked', label: 'Crossing Blocked', format: 'bool', bytes: 1, description: 'Train blocking road crossing' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. SIGNAGE & STREET FURNITURE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const signage: FeatureType[] = [
  {
    id: 'street_sign',
    label: 'Street Sign',
    category: 'Signage',
    description: 'Road name, traffic control, or wayfinding sign.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Sign position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'street_name, stop, speed, yield, warning, guide, evacuation, highway_marker' },
      { key: 'text', label: 'Text', format: 'varchar', bytes: 0, description: 'Sign content' },
      { key: 'height_m', label: 'Mount Height', format: 'float32', bytes: 4, description: 'Sign height above ground' },
      { key: 'reflective', label: 'Reflective', format: 'bool', bytes: 1, description: 'Retro-reflective material' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'readable, obscured, damaged, missing, down' },
      { key: 'temporary_override', label: 'Temp Override', format: 'varchar', bytes: 0, description: 'Temporary sign placed over (detour, road closed)' },
    ],
  },
  {
    id: 'traffic_light',
    label: 'Traffic Signal',
    category: 'Signage',
    description: 'Traffic control signal at intersection.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Signal position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'standard, pedestrian, flashing, arrow, railroad_crossing' },
      { key: 'backup_power', label: 'Backup Power', format: 'bool', bytes: 1, description: 'Battery or generator backup' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, flashing, dark, manual_control, damaged' },
    ],
  },
  {
    id: 'streetlight',
    label: 'Street Light',
    category: 'Signage',
    description: 'Road or area lighting fixture.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Light position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'led, sodium, metal_halide, solar' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Pole height' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'on, off, damaged, missing' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. SENSORS & CAMERAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const sensors: FeatureType[] = [
  {
    id: 'camera',
    label: 'Camera / CCTV',
    category: 'Sensors',
    description: 'Surveillance, traffic, or environmental monitoring camera.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Camera position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'traffic, security, wildfire, flood_gauge, weather, doorbell, dash' },
      { key: 'owner', label: 'Owner', format: 'enum8', bytes: 1, description: 'dot, city, private, utility, fire_agency, homeowner' },
      { key: 'ptz', label: 'PTZ Capable', format: 'bool', bytes: 1, description: 'Pan-tilt-zoom' },
      { key: 'fov_deg', label: 'Field of View', format: 'uint16', bytes: 2, description: 'Degrees of coverage' },
      { key: 'feed_url', label: 'Feed Available', format: 'bool', bytes: 1, description: 'Live feed accessible to beacon' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'online, offline, obstructed, damaged' },
      { key: 'recording', label: 'Recording', format: 'bool', bytes: 1, description: 'Actively recording' },
    ],
  },
  {
    id: 'weather_station',
    label: 'Weather Station',
    category: 'Sensors',
    description: 'Fixed weather observation point.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Station location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'asos, awos, cwop, personal, mesonet' },
      { key: 'sensors', label: 'Sensor Suite', format: 'bitfield8', bytes: 1, description: 'temp, wind, rain, pressure, humidity, solar, soil' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'reporting, stale, offline' },
      { key: 'temp_c', label: 'Temperature', format: 'float32', bytes: 4, description: 'Current temp in C' },
      { key: 'wind_mph', label: 'Wind Speed', format: 'uint8', bytes: 1, description: 'Sustained wind' },
      { key: 'wind_gust_mph', label: 'Wind Gust', format: 'uint8', bytes: 1, description: 'Peak gust' },
      { key: 'rain_rate', label: 'Rain Rate', format: 'float32', bytes: 4, description: 'Inches per hour' },
    ],
  },
  {
    id: 'river_gauge',
    label: 'River / Stream Gauge',
    category: 'Sensors',
    description: 'USGS or local water level monitoring station.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Gauge location' },
      { key: 'gauge_id', label: 'Gauge ID', format: 'varchar', bytes: 0, description: 'USGS or local ID' },
      { key: 'flood_stage_m', label: 'Flood Stage', format: 'float32', bytes: 4, description: 'Stage at which flooding begins' },
      { key: 'action_stage_m', label: 'Action Stage', format: 'float32', bytes: 4, description: 'Stage triggering response' },
    ],
    evolvingStatus: [
      { key: 'stage_m', label: 'Current Stage', format: 'float32', bytes: 4, description: 'Water level in meters' },
      { key: 'flow_cms', label: 'Flow Rate', format: 'float32', bytes: 4, description: 'Cubic meters per second' },
      { key: 'trend', label: 'Trend', format: 'enum8', bytes: 1, description: 'rising, steady, falling' },
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, action, minor_flood, moderate_flood, major_flood' },
    ],
  },
  {
    id: 'seismometer',
    label: 'Seismograph / Accelerometer',
    category: 'Sensors',
    description: 'Earthquake detection station.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Station location' },
      { key: 'network', label: 'Network', format: 'varchar', bytes: 0, description: 'USGS, CISN, etc.' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'online, triggered, offline' },
      { key: 'pga', label: 'Peak Ground Accel', format: 'float32', bytes: 4, description: 'g-force' },
    ],
  },
  {
    id: 'air_quality',
    label: 'Air Quality Monitor',
    category: 'Sensors',
    description: 'AQI / particulate matter sensor.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Sensor location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'epa, purpleair, agency, industrial' },
    ],
    evolvingStatus: [
      { key: 'aqi', label: 'AQI', format: 'uint16', bytes: 2, description: 'Air Quality Index 0-500' },
      { key: 'pm25', label: 'PM2.5', format: 'float32', bytes: 4, description: 'Micrograms per cubic meter' },
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'good, moderate, unhealthy_sensitive, unhealthy, very_unhealthy, hazardous' },
    ],
  },
  {
    id: 'tide_gauge',
    label: 'Tide Gauge / Ocean Buoy',
    category: 'Sensors',
    description: 'Coastal water level or offshore wave monitoring.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Gauge location' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'tide_gauge, wave_buoy, tsunami_buoy, coastal_station' },
    ],
    evolvingStatus: [
      { key: 'water_level_m', label: 'Water Level', format: 'float32', bytes: 4, description: 'Height above MLLW' },
      { key: 'wave_height_m', label: 'Wave Height', format: 'float32', bytes: 4, description: 'Significant wave height' },
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'reporting, stale, offline' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. UNDERGROUND STRUCTURES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const underground: FeatureType[] = [
  {
    id: 'basement',
    label: 'Basement / Cellar',
    category: 'Underground',
    description: 'Below-grade space under a building.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Extent below building' },
      { key: 'depth_m', label: 'Depth', format: 'float32', bytes: 4, description: 'Floor depth below grade' },
      { key: 'levels', label: 'Levels', format: 'uint8', bytes: 1, description: 'Number of below-grade floors' },
      { key: 'egress', label: 'Has Egress', format: 'bool', bytes: 1, description: 'Emergency exit to surface' },
      { key: 'sump_pump', label: 'Sump Pump', format: 'bool', bytes: 1, description: 'Active dewatering' },
    ],
    evolvingStatus: [
      { key: 'flooded', label: 'Flooded', format: 'bool', bytes: 1, description: 'Water in basement' },
      { key: 'water_depth_m', label: 'Water Depth', format: 'float32', bytes: 4, description: 'Flood water depth' },
      { key: 'trapped_persons', label: 'Trapped Persons', format: 'uint8', bytes: 1, description: 'People trapped below grade' },
    ],
  },
  {
    id: 'tunnel',
    label: 'Tunnel',
    category: 'Underground',
    description: 'Vehicle, pedestrian, or utility tunnel.',
    persistentBase: [
      { key: 'line', label: 'Path', format: 'LINESTRING (WKB)', bytes: 0, description: 'Tunnel centerline' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'vehicle, rail, pedestrian, utility, mine' },
      { key: 'length_m', label: 'Length', format: 'float32', bytes: 4, description: 'Total length' },
      { key: 'clearance_m', label: 'Clearance', format: 'float32', bytes: 4, description: 'Vertical clearance' },
      { key: 'ventilation', label: 'Ventilation', format: 'enum8', bytes: 1, description: 'natural, mechanical, none' },
      { key: 'egress_count', label: 'Emergency Exits', format: 'uint8', bytes: 1, description: 'Number of emergency exits' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'open, restricted, closed, flooded, collapsed' },
      { key: 'flooded', label: 'Flooded', format: 'bool', bytes: 1, description: 'Water in tunnel' },
      { key: 'air_quality', label: 'Air Quality', format: 'enum8', bytes: 1, description: 'good, poor, hazardous' },
    ],
  },
  {
    id: 'underground_parking',
    label: 'Underground Parking',
    category: 'Underground',
    description: 'Below-grade vehicle parking.',
    persistentBase: [
      { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: 0, description: 'Extent' },
      { key: 'levels', label: 'Levels', format: 'uint8', bytes: 1, description: 'Below-grade levels' },
      { key: 'capacity', label: 'Capacity', format: 'uint16', bytes: 2, description: 'Vehicle spaces' },
      { key: 'depth_m', label: 'Max Depth', format: 'float32', bytes: 4, description: 'Deepest level depth' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'open, flooding, closed, collapsed' },
      { key: 'water_depth_m', label: 'Water Depth', format: 'float32', bytes: 4, description: 'Flood water at lowest level' },
    ],
  },
  {
    id: 'storm_drain',
    label: 'Storm Drain / Culvert',
    category: 'Underground',
    description: 'Underground or surface water conveyance.',
    persistentBase: [
      { key: 'line', label: 'Path', format: 'LINESTRING (WKB)', bytes: 0, description: 'Pipe/channel run' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'pipe, box_culvert, ditch, channel, catch_basin' },
      { key: 'diameter_m', label: 'Diameter / Width', format: 'float32', bytes: 4, description: 'Pipe size' },
      { key: 'capacity_cms', label: 'Design Capacity', format: 'float32', bytes: 4, description: 'Max flow' },
    ],
    evolvingStatus: [
      { key: 'blocked', label: 'Blocked', format: 'bool', bytes: 1, description: 'Debris clogged' },
      { key: 'surcharging', label: 'Surcharging', format: 'bool', bytes: 1, description: 'Water backing up above inlet' },
    ],
  },
  {
    id: 'underground_tank',
    label: 'Underground Storage Tank',
    category: 'Underground',
    description: 'Buried fuel, chemical, or water tank.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Tank center' },
      { key: 'contents', label: 'Contents', format: 'enum8', bytes: 1, description: 'fuel, chemical, water, septic, unknown' },
      { key: 'capacity_liters', label: 'Capacity', format: 'float32', bytes: 4, description: 'Volume' },
      { key: 'depth_m', label: 'Burial Depth', format: 'float32', bytes: 4, description: 'Top of tank below grade' },
      { key: 'age_years', label: 'Age', format: 'uint8', bytes: 1, description: 'Years since installation' },
    ],
    evolvingStatus: [
      { key: 'leaking', label: 'Leaking', format: 'bool', bytes: 1, description: 'Containment breach detected' },
      { key: 'displaced', label: 'Displaced', format: 'bool', bytes: 1, description: 'Floated out of ground by high water table' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. WATER FEATURES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const water: FeatureType[] = [
  {
    id: 'river_stream',
    label: 'River / Stream',
    category: 'Water',
    description: 'Flowing water body.',
    persistentBase: [
      { key: 'centerline', label: 'Centerline', format: 'LINESTRING (WKB)', bytes: 0, description: 'Channel path' },
      { key: 'width_m', label: 'Bankfull Width', format: 'float32', bytes: 4, description: 'Normal channel width' },
      { key: 'depth_m', label: 'Normal Depth', format: 'float32', bytes: 4, description: 'Typical water depth' },
      { key: 'order', label: 'Stream Order', format: 'uint8', bytes: 1, description: 'Strahler stream order' },
      { key: 'name', label: 'Name', format: 'varchar', bytes: 0, description: 'Waterway name' },
      { key: 'floodplain', label: 'Floodplain Polygon', format: 'POLYGON (WKB)', bytes: 0, description: '100yr floodplain extent' },
    ],
    evolvingStatus: [
      { key: 'stage_m', label: 'Stage Height', format: 'float32', bytes: 4, description: 'Current water level' },
      { key: 'flow_cms', label: 'Flow Rate', format: 'float32', bytes: 4, description: 'Cubic meters per second' },
      { key: 'flood_category', label: 'Flood Category', format: 'enum8', bytes: 1, description: 'normal, action, minor, moderate, major' },
      { key: 'rate_of_rise', label: 'Rate of Rise', format: 'float32', bytes: 4, description: 'Meters per hour' },
      { key: 'crest_time', label: 'Forecast Crest Time', format: 'datetime', bytes: 8, description: 'When peak is expected' },
      { key: 'crest_stage_m', label: 'Forecast Crest', format: 'float32', bytes: 4, description: 'Predicted peak stage' },
    ],
  },
  {
    id: 'lake_pond',
    label: 'Lake / Pond / Reservoir',
    category: 'Water',
    description: 'Standing water body.',
    persistentBase: [
      { key: 'boundary', label: 'Shoreline', format: 'POLYGON (WKB)', bytes: 0, description: 'Normal pool boundary' },
      { key: 'area_sqm', label: 'Surface Area', format: 'float32', bytes: 4, description: 'Normal pool area' },
      { key: 'max_depth_m', label: 'Max Depth', format: 'float32', bytes: 4, description: 'Deepest point' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'natural, reservoir, retention, farm_pond, quarry' },
      { key: 'dam_controlled', label: 'Dam Controlled', format: 'bool', bytes: 1, description: 'Has outlet dam' },
    ],
    evolvingStatus: [
      { key: 'level_m', label: 'Water Level', format: 'float32', bytes: 4, description: 'Current surface elevation' },
      { key: 'pct_capacity', label: 'Capacity', format: 'uint8', bytes: 1, description: '0-100 percent of max storage' },
      { key: 'spilling', label: 'Overflowing', format: 'bool', bytes: 1, description: 'Water going over spillway or banks' },
    ],
  },
  {
    id: 'coastline',
    label: 'Coastline Segment',
    category: 'Water',
    description: 'Ocean or large lake shoreline.',
    persistentBase: [
      { key: 'line', label: 'Shoreline', format: 'LINESTRING (WKB)', bytes: 0, description: 'Mean high water line' },
      { key: 'type', label: 'Shore Type', format: 'enum8', bytes: 1, description: 'beach, cliff, marsh, mangrove, armored, dock' },
      { key: 'elevation_m', label: 'Bluff Elevation', format: 'float32', bytes: 4, description: 'Height above MHW' },
      { key: 'erosion_rate', label: 'Erosion Rate', format: 'float32', bytes: 4, description: 'Meters per year retreat' },
    ],
    evolvingStatus: [
      { key: 'surge_m', label: 'Storm Surge', format: 'float32', bytes: 4, description: 'Surge height above normal' },
      { key: 'wave_height_m', label: 'Wave Height', format: 'float32', bytes: 4, description: 'Significant wave height' },
      { key: 'tide_m', label: 'Tide Level', format: 'float32', bytes: 4, description: 'Current tide above MLLW' },
    ],
  },
  {
    id: 'wetland',
    label: 'Wetland / Marsh',
    category: 'Water',
    description: 'Saturated land area.',
    persistentBase: [
      { key: 'boundary', label: 'Boundary', format: 'POLYGON (WKB)', bytes: 0, description: 'Wetland extent' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'freshwater_marsh, saltwater_marsh, swamp, bog, mangrove' },
      { key: 'protected', label: 'Protected', format: 'bool', bytes: 1, description: 'Regulatory protection' },
    ],
    evolvingStatus: [
      { key: 'water_level', label: 'Water Level', format: 'enum8', bytes: 1, description: 'dry, saturated, shallow_flood, deep_flood' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. VEGETATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const vegetation: FeatureType[] = [
  {
    id: 'tree',
    label: 'Individual Tree',
    category: 'Vegetation',
    description: 'Single tree resolved from LiDAR or imagery.',
    persistentBase: [
      { key: 'point', label: 'Trunk Location', format: 'POINT (WKB)', bytes: 0, description: 'Base of trunk' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Tree height' },
      { key: 'crown_m', label: 'Crown Diameter', format: 'float32', bytes: 4, description: 'Canopy spread' },
      { key: 'species', label: 'Species Group', format: 'enum8', bytes: 1, description: 'conifer, hardwood_deciduous, hardwood_evergreen, palm, dead_standing' },
      { key: 'dbh_cm', label: 'Trunk Diameter', format: 'uint8', bytes: 1, description: 'Diameter at breast height in cm' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'healthy, stressed, burning, fallen, removed' },
      { key: 'blocking_road', label: 'Blocking Road', format: 'bool', bytes: 1, description: 'Fallen across road' },
      { key: 'on_structure', label: 'On Structure', format: 'bool', bytes: 1, description: 'Fallen onto building' },
      { key: 'on_powerline', label: 'On Powerline', format: 'bool', bytes: 1, description: 'Fallen onto power line' },
    ],
  },
  {
    id: 'vegetation_zone',
    label: 'Vegetation Zone',
    category: 'Vegetation',
    description: 'Continuous area of similar vegetation (forest, grassland, brush).',
    persistentBase: [
      { key: 'boundary', label: 'Boundary', format: 'POLYGON (WKB)', bytes: 0, description: 'Zone extent' },
      { key: 'type', label: 'Vegetation Type', format: 'enum8', bytes: 1, description: 'forest_conifer, forest_deciduous, forest_mixed, grassland, shrub, chaparral, agricultural, orchard, vineyard' },
      { key: 'canopy_pct', label: 'Canopy Cover', format: 'uint8', bytes: 1, description: '0-100 percent' },
      { key: 'avg_height_m', label: 'Avg Canopy Height', format: 'float32', bytes: 4, description: 'Mean tree height' },
      { key: 'fuel_model', label: 'Fire Fuel Model', format: 'enum8', bytes: 1, description: 'FBFM13 or FBFM40 classification' },
      { key: 'ladder_fuel', label: 'Ladder Fuel Density', format: 'enum8', bytes: 1, description: 'none, sparse, moderate, dense' },
    ],
    evolvingStatus: [
      { key: 'ndvi', label: 'Vegetation Health', format: 'float32', bytes: 4, description: 'NDVI value (-1 to 1)' },
      { key: 'fuel_moisture', label: 'Fuel Moisture', format: 'uint8', bytes: 1, description: '0-255 percent live fuel moisture' },
      { key: 'burning', label: 'Burning', format: 'bool', bytes: 1, description: 'Active fire in zone' },
      { key: 'burned_pct', label: 'Percent Burned', format: 'uint8', bytes: 1, description: '0-100' },
      { key: 'fire_intensity', label: 'Fire Intensity', format: 'enum8', bytes: 1, description: 'none, low, moderate, high, extreme' },
    ],
  },
  {
    id: 'garden_field',
    label: 'Garden / Field / Crop',
    category: 'Vegetation',
    description: 'Cultivated plot: home garden, farm field, orchard, vineyard, nursery.',
    persistentBase: [
      { key: 'boundary', label: 'Boundary', format: 'POLYGON (WKB)', bytes: 0, description: 'Plot extent' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'home_garden, community_garden, row_crop, hay, pasture, orchard, vineyard, nursery, fallow' },
      { key: 'irrigated', label: 'Irrigated', format: 'bool', bytes: 1, description: 'Irrigation present' },
      { key: 'fenced', label: 'Fenced', format: 'bool', bytes: 1, description: 'Perimeter fenced' },
      { key: 'area_sqm', label: 'Area', format: 'float32', bytes: 4, description: 'Plot area' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'growing, harvested, flooded, burned, damaged, fallow' },
      { key: 'crop_loss_pct', label: 'Crop Loss', format: 'uint8', bytes: 1, description: '0-100 percent damaged' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. TERRAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const terrain: FeatureType[] = [
  {
    id: 'terrain_cell',
    label: 'Terrain Cell',
    category: 'Terrain',
    description: 'Raster cell from DEM with derived attributes.',
    persistentBase: [
      { key: 'elevation_m', label: 'Elevation', format: 'float32', bytes: 4, description: 'Ground elevation NAVD88' },
      { key: 'slope_deg', label: 'Slope', format: 'float32', bytes: 4, description: 'Degrees from horizontal' },
      { key: 'aspect_deg', label: 'Aspect', format: 'float32', bytes: 4, description: 'Downhill direction 0-359' },
      { key: 'curvature', label: 'Curvature', format: 'float32', bytes: 4, description: 'Concave vs convex terrain' },
      { key: 'class', label: 'Classification', format: 'enum8', bytes: 1, description: 'flat, gentle, moderate, steep, cliff, ridgetop, valley' },
      { key: 'soil_type', label: 'Soil Type', format: 'enum8', bytes: 1, description: 'clay, silt, sand, loam, gravel, rock, organic, fill' },
      { key: 'permeability', label: 'Permeability', format: 'enum8', bytes: 1, description: 'high, moderate, low, impervious' },
    ],
    evolvingStatus: [
      { key: 'saturation', label: 'Soil Saturation', format: 'uint8', bytes: 1, description: '0-100 percent' },
      { key: 'landslide_risk', label: 'Landslide Risk', format: 'enum8', bytes: 1, description: 'low, moderate, high, active' },
      { key: 'liquefaction_risk', label: 'Liquefaction Risk', format: 'enum8', bytes: 1, description: 'none, low, moderate, high' },
      { key: 'snow_depth_m', label: 'Snow Depth', format: 'float32', bytes: 4, description: 'Snow accumulation' },
      { key: 'ground_temp_c', label: 'Ground Temperature', format: 'float32', bytes: 4, description: 'Permafrost/freeze monitoring' },
    ],
  },
  {
    id: 'sinkhole',
    label: 'Sinkhole',
    category: 'Terrain',
    description: 'Karst collapse or subsidence area.',
    persistentBase: [
      { key: 'point', label: 'Center', format: 'POINT (WKB)', bytes: 0, description: 'Sinkhole center' },
      { key: 'diameter_m', label: 'Diameter', format: 'float32', bytes: 4, description: 'Opening size' },
      { key: 'depth_m', label: 'Depth', format: 'float32', bytes: 4, description: 'Estimated depth' },
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'stable, growing, remediated, new' },
    ],
    evolvingStatus: [
      { key: 'expanding', label: 'Expanding', format: 'bool', bytes: 1, description: 'Actively growing' },
      { key: 'water_filled', label: 'Water Filled', format: 'bool', bytes: 1, description: 'Contains standing water' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. UTILITIES & INFRASTRUCTURE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const utilities: FeatureType[] = [
  {
    id: 'power_line',
    label: 'Power Line',
    category: 'Utilities',
    description: 'Overhead or underground electrical line.',
    persistentBase: [
      { key: 'line', label: 'Path', format: 'LINESTRING (WKB)', bytes: 0, description: 'Line route' },
      { key: 'voltage_kv', label: 'Voltage', format: 'float32', bytes: 4, description: 'Operating voltage in kV' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'transmission, distribution, service' },
      { key: 'underground', label: 'Underground', format: 'bool', bytes: 1, description: 'Buried vs overhead' },
    ],
    evolvingStatus: [
      { key: 'energized', label: 'Energized', format: 'bool', bytes: 1, description: 'Power flowing' },
      { key: 'damage', label: 'Damage', format: 'enum8', bytes: 1, description: 'none, sagging, broken, pole_down, arcing' },
      { key: 'vegetation_contact', label: 'Veg Contact', format: 'bool', bytes: 1, description: 'Tree/branch contacting line' },
    ],
  },
  {
    id: 'utility_pole',
    label: 'Utility Pole',
    category: 'Utilities',
    description: 'Pole carrying power/telecom.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Pole base' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Pole height' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'wood, steel, concrete, composite' },
      { key: 'carries', label: 'Carries', format: 'bitfield8', bytes: 1, description: 'power, telecom, cable, fiber, streetlight' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'standing, leaning, broken, down' },
    ],
  },
  {
    id: 'substation',
    label: 'Electrical Substation',
    category: 'Utilities',
    description: 'Power transformation or switching facility.',
    persistentBase: [
      { key: 'footprint', label: 'Fence Line', format: 'POLYGON (WKB)', bytes: 0, description: 'Facility boundary' },
      { key: 'capacity_mva', label: 'Capacity', format: 'float32', bytes: 4, description: 'MVA rating' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'transmission, distribution, switching' },
      { key: 'customers_served', label: 'Customers Served', format: 'uint32', bytes: 4, description: 'Downstream count' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, reduced, offline, damaged' },
      { key: 'flooded', label: 'Flooded', format: 'bool', bytes: 1, description: 'Water in facility' },
    ],
  },
  {
    id: 'water_main',
    label: 'Water Main',
    category: 'Utilities',
    description: 'Municipal water supply pipe.',
    persistentBase: [
      { key: 'line', label: 'Path', format: 'LINESTRING (WKB)', bytes: 0, description: 'Pipe route' },
      { key: 'diameter_in', label: 'Diameter', format: 'uint8', bytes: 1, description: 'Pipe diameter in inches' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'cast_iron, ductile_iron, pvc, concrete, asbestos_cement' },
      { key: 'pressure_psi', label: 'Normal Pressure', format: 'uint8', bytes: 1, description: 'Operating pressure PSI' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, low_pressure, break, shut_off' },
      { key: 'boil_advisory', label: 'Boil Advisory', format: 'bool', bytes: 1, description: 'Water quality compromised' },
    ],
  },
  {
    id: 'gas_pipeline',
    label: 'Gas Pipeline',
    category: 'Utilities',
    description: 'Natural gas transmission or distribution line.',
    persistentBase: [
      { key: 'line', label: 'Path', format: 'LINESTRING (WKB)', bytes: 0, description: 'Pipeline route' },
      { key: 'diameter_in', label: 'Diameter', format: 'uint8', bytes: 1, description: 'Pipe diameter inches' },
      { key: 'pressure_class', label: 'Pressure Class', format: 'enum8', bytes: 1, description: 'transmission, distribution, service' },
      { key: 'material', label: 'Material', format: 'enum8', bytes: 1, description: 'steel, plastic, cast_iron' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'normal, shut_off, leak, rupture' },
      { key: 'leak_detected', label: 'Leak Detected', format: 'bool', bytes: 1, description: 'Gas leak confirmed' },
      { key: 'evacuation_radius_m', label: 'Evac Radius', format: 'float32', bytes: 4, description: 'Evacuation distance if leaking' },
    ],
  },
  {
    id: 'cell_tower',
    label: 'Cell Tower / Antenna',
    category: 'Utilities',
    description: 'Wireless communications tower.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Tower base' },
      { key: 'height_m', label: 'Height', format: 'float32', bytes: 4, description: 'Tower height' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'macro, small_cell, rooftop, cow' },
      { key: 'backup_power_hrs', label: 'Backup Power', format: 'uint8', bytes: 1, description: 'Hours of backup' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'online, degraded, offline, damaged' },
      { key: 'on_backup', label: 'On Backup Power', format: 'bool', bytes: 1, description: 'Running on battery/generator' },
      { key: 'backup_remaining_hrs', label: 'Backup Remaining', format: 'float32', bytes: 4, description: 'Hours left' },
    ],
  },
  {
    id: 'fire_hydrant',
    label: 'Fire Hydrant',
    category: 'Utilities',
    description: 'Water supply point for fire suppression.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Hydrant position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'wet_barrel, dry_barrel, wall, underground' },
      { key: 'flow_gpm', label: 'Flow Rate', format: 'uint16', bytes: 2, description: 'Gallons per minute' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'available, in_use, frozen, damaged, dry' },
      { key: 'accessible', label: 'Accessible', format: 'bool', bytes: 1, description: 'Not blocked by debris/vehicles/snow' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. VEHICLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const vehicles: FeatureType[] = [
  {
    id: 'passenger_vehicle',
    label: 'Passenger Vehicle',
    category: 'Vehicles',
    description: 'Car, SUV, pickup, van, minivan.',
    persistentBase: [
      { key: 'point', label: 'Last Known Position', format: 'POINT (WKB)', bytes: 0, description: 'GPS position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'sedan, suv, pickup, van, minivan, sports, electric' },
      { key: 'color', label: 'Color', format: 'enum8', bytes: 1, description: 'Visual identification color' },
      { key: 'plate', label: 'Plate', format: 'varchar', bytes: 0, description: 'License plate if known' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'parked, moving, stalled, abandoned, submerged, burned, crushed' },
      { key: 'speed_mph', label: 'Speed', format: 'uint8', bytes: 1, description: 'Current speed' },
      { key: 'heading_deg', label: 'Heading', format: 'uint16', bytes: 2, description: 'Direction of travel' },
      { key: 'occupants', label: 'Occupants', format: 'uint8', bytes: 1, description: 'Estimated people inside' },
      { key: 'blocking', label: 'Blocking', format: 'enum8', bytes: 1, description: 'none, lane, road, intersection, evac_route' },
    ],
  },
  {
    id: 'commercial_vehicle',
    label: 'Commercial / Heavy Vehicle',
    category: 'Vehicles',
    description: 'Semi-truck, box truck, tanker, construction equipment.',
    persistentBase: [
      { key: 'point', label: 'Position', format: 'POINT (WKB)', bytes: 0, description: 'GPS position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'semi, box_truck, tanker, flatbed, dump, crane, excavator, bulldozer, forklift' },
      { key: 'weight_t', label: 'Weight', format: 'float32', bytes: 4, description: 'Gross weight in tons' },
      { key: 'length_m', label: 'Length', format: 'float32', bytes: 4, description: 'Total length' },
      { key: 'cargo_type', label: 'Cargo Type', format: 'enum8', bytes: 1, description: 'general, fuel, chemical, food, medical, construction, hazmat, empty' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'moving, parked, stalled, jackknifed, overturned, leaking' },
      { key: 'blocking', label: 'Blocking', format: 'enum8', bytes: 1, description: 'none, lane, road, bridge, intersection' },
      { key: 'hazmat_release', label: 'Hazmat Release', format: 'bool', bytes: 1, description: 'Cargo leak/spill' },
    ],
  },
  {
    id: 'emergency_vehicle',
    label: 'Emergency Vehicle',
    category: 'Vehicles',
    description: 'Fire engine, ambulance, police car, rescue unit.',
    persistentBase: [
      { key: 'point', label: 'Position', format: 'POINT (WKB)', bytes: 0, description: 'GPS position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'engine, ladder, ambulance, police, rescue, hazmat, command, utility' },
      { key: 'unit_id', label: 'Unit ID', format: 'varchar', bytes: 0, description: 'Radio designation' },
      { key: 'agency', label: 'Agency', format: 'varchar', bytes: 0, description: 'Owning department' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'available, enroute, on_scene, returning, out_of_service' },
      { key: 'speed_mph', label: 'Speed', format: 'uint8', bytes: 1, description: 'Current speed' },
      { key: 'heading_deg', label: 'Heading', format: 'uint16', bytes: 2, description: 'Direction' },
      { key: 'lights_sirens', label: 'Code 3', format: 'bool', bytes: 1, description: 'Lights and sirens active' },
      { key: 'assigned_incident', label: 'Incident', format: 'varchar', bytes: 0, description: 'Assigned incident ID' },
    ],
  },
  {
    id: 'bus',
    label: 'Bus / Transit Vehicle',
    category: 'Vehicles',
    description: 'Transit bus, school bus, charter bus.',
    persistentBase: [
      { key: 'point', label: 'Position', format: 'POINT (WKB)', bytes: 0, description: 'GPS position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'transit, school, charter, shuttle, paratransit' },
      { key: 'capacity', label: 'Capacity', format: 'uint8', bytes: 1, description: 'Max passengers' },
      { key: 'route_id', label: 'Route', format: 'varchar', bytes: 0, description: 'Assigned route' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'in_service, evac_duty, stalled, out_of_service' },
      { key: 'occupancy', label: 'Passengers', format: 'uint8', bytes: 1, description: 'Current passenger count' },
      { key: 'ada_deployed', label: 'ADA Ramp/Lift', format: 'bool', bytes: 1, description: 'Currently loading wheelchair' },
    ],
  },
  {
    id: 'boat',
    label: 'Boat / Watercraft',
    category: 'Vehicles',
    description: 'Rescue boat, civilian vessel, barge, kayak.',
    persistentBase: [
      { key: 'point', label: 'Position', format: 'POINT (WKB)', bytes: 0, description: 'GPS position' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'rescue_boat, fishing, sailboat, motorboat, barge, kayak, jet_ski, ferry, cargo' },
      { key: 'length_m', label: 'Length', format: 'float32', bytes: 4, description: 'Vessel length' },
      { key: 'capacity', label: 'Capacity', format: 'uint8', bytes: 1, description: 'Max persons aboard' },
      { key: 'draft_m', label: 'Draft', format: 'float32', bytes: 4, description: 'Below waterline depth' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'docked, underway, anchored, adrift, capsized, sinking, beached' },
      { key: 'persons_aboard', label: 'Persons Aboard', format: 'uint8', bytes: 1, description: 'Current count' },
      { key: 'distress', label: 'In Distress', format: 'bool', bytes: 1, description: 'Mayday/distress signal' },
    ],
  },
  {
    id: 'aircraft',
    label: 'Aircraft',
    category: 'Vehicles',
    description: 'Helicopter, fixed-wing, drone, air tanker.',
    persistentBase: [
      { key: 'point', label: 'Position', format: 'POINT (WKB)', bytes: 0, description: 'Current GPS' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'helicopter, fixed_wing, drone, air_tanker, medevac, recon, cargo' },
      { key: 'callsign', label: 'Callsign', format: 'varchar', bytes: 0, description: 'Radio callsign or tail number' },
      { key: 'capacity', label: 'Capacity', format: 'uint8', bytes: 1, description: 'Max passengers or payload' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'grounded, airborne, landing, on_mission, refueling, maintenance' },
      { key: 'altitude_ft', label: 'Altitude', format: 'uint16', bytes: 2, description: 'Feet AGL' },
      { key: 'speed_kts', label: 'Speed', format: 'uint16', bytes: 2, description: 'Knots' },
      { key: 'heading_deg', label: 'Heading', format: 'uint16', bytes: 2, description: 'Direction' },
      { key: 'mission', label: 'Mission', format: 'enum8', bytes: 1, description: 'search, rescue, medevac, recon, water_drop, retardant, transport, survey' },
    ],
  },
  {
    id: 'train',
    label: 'Train',
    category: 'Vehicles',
    description: 'Freight or passenger train.',
    persistentBase: [
      { key: 'point', label: 'Head Position', format: 'POINT (WKB)', bytes: 0, description: 'Locomotive GPS' },
      { key: 'type', label: 'Type', format: 'enum8', bytes: 1, description: 'freight, passenger, light_rail, hazmat_manifest' },
      { key: 'cars', label: 'Car Count', format: 'uint8', bytes: 1, description: 'Number of cars' },
      { key: 'length_m', label: 'Total Length', format: 'float32', bytes: 4, description: 'Train length' },
      { key: 'hazmat_cars', label: 'Hazmat Cars', format: 'uint8', bytes: 1, description: 'Cars carrying hazardous materials' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'moving, stopped, crossing_blocked, derailed' },
      { key: 'speed_mph', label: 'Speed', format: 'uint8', bytes: 1, description: 'Current speed' },
      { key: 'hazmat_release', label: 'Hazmat Release', format: 'bool', bytes: 1, description: 'Cargo spill or leak' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 12. ANIMALS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const animals: FeatureType[] = [
  {
    id: 'pet',
    label: 'Domestic Pet',
    category: 'Animals',
    description: 'Dog, cat, or other household pet — tracked for rescue/reunification.',
    persistentBase: [
      { key: 'point', label: 'Last Known Location', format: 'POINT (WKB)', bytes: 0, description: 'Last seen position' },
      { key: 'species', label: 'Species', format: 'enum8', bytes: 1, description: 'dog, cat, bird, reptile, rabbit, other' },
      { key: 'size', label: 'Size', format: 'enum8', bytes: 1, description: 'small, medium, large' },
      { key: 'chipped', label: 'Microchipped', format: 'bool', bytes: 1, description: 'Has identification chip' },
      { key: 'owner_contact', label: 'Owner Contact', format: 'bool', bytes: 1, description: 'Owner info on file' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'with_owner, lost, found, sheltered, injured, deceased' },
      { key: 'needs_rescue', label: 'Needs Rescue', format: 'bool', bytes: 1, description: 'Stranded and needs extraction' },
    ],
  },
  {
    id: 'livestock',
    label: 'Livestock / Farm Animal',
    category: 'Animals',
    description: 'Cattle, horses, pigs, sheep, goats, poultry — herd or individual.',
    persistentBase: [
      { key: 'point', label: 'Location', format: 'POINT (WKB)', bytes: 0, description: 'Herd/individual position' },
      { key: 'species', label: 'Species', format: 'enum8', bytes: 1, description: 'cattle, horse, pig, sheep, goat, poultry, llama, other' },
      { key: 'count', label: 'Head Count', format: 'uint16', bytes: 2, description: 'Number of animals' },
      { key: 'confined', label: 'Confined', format: 'bool', bytes: 1, description: 'In pen/barn vs free range' },
      { key: 'owner_contact', label: 'Owner Contact', format: 'bool', bytes: 1, description: 'Owner info on file' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'secure, loose, stranded, evacuated, injured, deceased' },
      { key: 'needs_rescue', label: 'Needs Rescue', format: 'bool', bytes: 1, description: 'Trapped or stranded' },
      { key: 'road_hazard', label: 'On Roadway', format: 'bool', bytes: 1, description: 'Animals loose on road' },
    ],
  },
  {
    id: 'wildlife',
    label: 'Wildlife',
    category: 'Animals',
    description: 'Wild animal sighting relevant to safety (bear, alligator, displaced animals, swarm).',
    persistentBase: [
      { key: 'point', label: 'Sighting Location', format: 'POINT (WKB)', bytes: 0, description: 'Where seen' },
      { key: 'species', label: 'Species', format: 'enum8', bytes: 1, description: 'bear, alligator, snake, coyote, deer, wild_boar, bee_swarm, bird_flock, marine_mammal, other' },
      { key: 'threat_level', label: 'Threat Level', format: 'enum8', bytes: 1, description: 'none, caution, danger' },
    ],
    evolvingStatus: [
      { key: 'status', label: 'Status', format: 'enum8', bytes: 1, description: 'sighted, displaced, aggressive, trapped, contained, cleared' },
      { key: 'last_seen', label: 'Last Seen', format: 'datetime', bytes: 8, description: 'Most recent sighting time' },
      { key: 'direction', label: 'Direction of Travel', format: 'uint16', bytes: 2, description: 'Heading if moving' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 13. HAZARD PERIMETERS (evolving-heavy features)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const hazards: FeatureType[] = [
  {
    id: 'fire_perimeter',
    label: 'Wildfire Perimeter',
    category: 'Hazards',
    description: 'Active fire boundary.',
    persistentBase: [
      { key: 'origin', label: 'Origin Point', format: 'POINT (WKB)', bytes: 0, description: 'Ignition point' },
      { key: 'cause', label: 'Cause', format: 'enum8', bytes: 1, description: 'lightning, human, powerline, unknown' },
      { key: 'start_time', label: 'Start Time', format: 'datetime', bytes: 8, description: 'Ignition time' },
    ],
    evolvingStatus: [
      { key: 'perimeter', label: 'Current Perimeter', format: 'POLYGON (WKB)', bytes: 0, description: 'Fire edge' },
      { key: 'acres', label: 'Acres Burned', format: 'float32', bytes: 4, description: 'Total area' },
      { key: 'containment_pct', label: 'Containment', format: 'uint8', bytes: 1, description: '0-100 percent' },
      { key: 'spread_rate', label: 'Spread Rate', format: 'float32', bytes: 4, description: 'Chains per hour' },
      { key: 'spread_direction', label: 'Spread Direction', format: 'uint16', bytes: 2, description: 'Degrees' },
      { key: 'structures_threatened', label: 'Structures Threatened', format: 'uint32', bytes: 4, description: 'Count' },
      { key: 'structures_destroyed', label: 'Structures Destroyed', format: 'uint32', bytes: 4, description: 'Count' },
    ],
  },
  {
    id: 'flood_extent',
    label: 'Flood Inundation Extent',
    category: 'Hazards',
    description: 'Current or projected flood water boundary.',
    persistentBase: [
      { key: 'source_feature', label: 'Source', format: 'varchar', bytes: 0, description: 'River/storm system' },
    ],
    evolvingStatus: [
      { key: 'extent', label: 'Flood Extent', format: 'POLYGON (WKB)', bytes: 0, description: 'Current water boundary' },
      { key: 'max_depth_m', label: 'Max Depth', format: 'float32', bytes: 4, description: 'Deepest point' },
      { key: 'velocity_ms', label: 'Flow Velocity', format: 'float32', bytes: 4, description: 'Water speed m/s' },
      { key: 'rising', label: 'Rising', format: 'bool', bytes: 1, description: 'Water still increasing' },
      { key: 'projected_24h', label: '24h Projection', format: 'POLYGON (WKB)', bytes: 0, description: 'Predicted extent in 24 hours' },
    ],
  },
  {
    id: 'tornado_path',
    label: 'Tornado Track',
    category: 'Hazards',
    description: 'Tornado position and damage path.',
    persistentBase: [],
    evolvingStatus: [
      { key: 'position', label: 'Current Position', format: 'POINT (WKB)', bytes: 0, description: 'Tornado center' },
      { key: 'path', label: 'Damage Path', format: 'LINESTRING (WKB)', bytes: 0, description: 'Track so far' },
      { key: 'width_m', label: 'Path Width', format: 'float32', bytes: 4, description: 'Damage swath width' },
      { key: 'ef_scale', label: 'EF Rating', format: 'enum8', bytes: 1, description: 'EF0-EF5' },
      { key: 'speed_mph', label: 'Forward Speed', format: 'uint8', bytes: 1, description: 'Storm motion' },
      { key: 'direction_deg', label: 'Direction', format: 'uint16', bytes: 2, description: 'Movement heading' },
    ],
  },
  {
    id: 'evacuation_zone',
    label: 'Evacuation Zone',
    category: 'Hazards',
    description: 'Area under evacuation order.',
    persistentBase: [
      { key: 'boundary', label: 'Zone Boundary', format: 'POLYGON (WKB)', bytes: 0, description: 'Zone perimeter' },
      { key: 'zone_id', label: 'Zone ID', format: 'varchar', bytes: 0, description: 'Official zone designation' },
      { key: 'population', label: 'Population', format: 'uint32', bytes: 4, description: 'Residents in zone' },
    ],
    evolvingStatus: [
      { key: 'order_level', label: 'Order Level', format: 'enum8', bytes: 1, description: 'advisory, warning, mandatory, shelter_in_place, all_clear' },
      { key: 'compliance_pct', label: 'Compliance', format: 'uint8', bytes: 1, description: '0-100 estimated completion' },
      { key: 'routes_open', label: 'Routes Open', format: 'uint8', bytes: 1, description: 'Open exit routes' },
    ],
  },
  {
    id: 'hazmat_plume',
    label: 'Hazmat / Chemical Plume',
    category: 'Hazards',
    description: 'Airborne or waterborne chemical release.',
    persistentBase: [
      { key: 'source', label: 'Source Point', format: 'POINT (WKB)', bytes: 0, description: 'Release location' },
      { key: 'chemical', label: 'Chemical', format: 'varchar', bytes: 0, description: 'Substance name/ID' },
    ],
    evolvingStatus: [
      { key: 'plume', label: 'Plume Extent', format: 'POLYGON (WKB)', bytes: 0, description: 'Current plume boundary' },
      { key: 'concentration', label: 'Peak Concentration', format: 'float32', bytes: 4, description: 'ppm at source' },
      { key: 'wind_dir', label: 'Wind Direction', format: 'uint16', bytes: 2, description: 'Plume drift direction' },
      { key: 'shelter_radius_m', label: 'Shelter Radius', format: 'float32', bytes: 4, description: 'Shelter-in-place distance' },
      { key: 'evac_radius_m', label: 'Evacuation Radius', format: 'float32', bytes: 4, description: 'Mandatory evacuation distance' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT: Complete catalog
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const VIZ_FEATURE_CATALOG: FeatureType[] = [
  ...structures,
  ...barriers,
  ...roads,
  ...signage,
  ...sensors,
  ...underground,
  ...water,
  ...vegetation,
  ...terrain,
  ...utilities,
  ...vehicles,
  ...animals,
  ...hazards,
];

// Category summary for Visualization Manager sidebar
export const FEATURE_CATEGORIES = [
  { id: 'structures',  label: 'Structures & Facilities', count: structures.length },
  { id: 'barriers',    label: 'Barriers & Boundaries',   count: barriers.length },
  { id: 'roads',       label: 'Roads & Transportation',   count: roads.length },
  { id: 'signage',     label: 'Signage & Street Furniture', count: signage.length },
  { id: 'sensors',     label: 'Sensors & Cameras',        count: sensors.length },
  { id: 'underground', label: 'Underground',               count: underground.length },
  { id: 'water',       label: 'Water Features',            count: water.length },
  { id: 'vegetation',  label: 'Vegetation',                count: vegetation.length },
  { id: 'terrain',     label: 'Terrain & Geology',         count: terrain.length },
  { id: 'utilities',   label: 'Utilities & Infrastructure', count: utilities.length },
  { id: 'vehicles',    label: 'Vehicles',                  count: vehicles.length },
  { id: 'animals',     label: 'Animals',                   count: animals.length },
  { id: 'hazards',     label: 'Hazard Perimeters',         count: hazards.length },
  // Primary building geometry is in buildingVisfile.ts — referenced but not duplicated
  { id: 'buildings',   label: 'Buildings (see visfile)',    count: 0 },
];
