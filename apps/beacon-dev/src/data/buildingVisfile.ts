// Visfile Protocol — Building Feature Definitions
// Two tiers:
//   GEOMETRIC — physically modeled on the building (shape, windows, doors, etc.)
//   DATA      — visualized as shading/tint/badge over the geometry, not modeled directly

export type FeatureTier = 'geometric' | 'data';
export type FeatureKind = 'geometry' | 'numeric' | 'categorical' | 'boolean' | 'bitfield' | 'text' | 'datetime';

export interface CategoryValue {
  value: string | number;
  label: string;
  color?: string;
  description?: string;
}

export interface VisfileFeature {
  key: string;
  label: string;
  group: string;
  tier: FeatureTier;
  kind: FeatureKind;
  wireFormat: string;
  bytes: number;
  description: string;
  vizRole: string;
  zoomMin: 'far' | 'mid' | 'close' | 'all';
  source: string;
  categories?: CategoryValue[];
  range?: string;
  unit?: string;
  lidarEnhanced?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GEOMETRIC FEATURES — rendered directly as 3D/2D geometry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const geometricFeatures: VisfileFeature[] = [

  // ── Footprint & Massing ──
  {
    key: 'footprint', label: 'Footprint Polygon', group: 'Footprint & Massing',
    tier: 'geometric', kind: 'geometry', wireFormat: 'POLYGON (WKB)', bytes: 0,
    description: 'Building outline. LiDAR gets exact roof-edge trace with overhangs and bays. Satellite-only gets simplified rectangle.',
    vizRole: 'Base extrusion shape in 3D/clay, outline in 2D',
    zoomMin: 'far', source: 'LiDAR + satellite fusion',
    lidarEnhanced: true,
  },
  {
    key: 'height_m', label: 'Height', group: 'Footprint & Massing',
    tier: 'geometric', kind: 'numeric', wireFormat: 'float32', bytes: 4,
    description: 'Building height in meters AGL. Drives vertical extrusion.',
    vizRole: 'Extrusion height',
    zoomMin: 'far', source: 'LiDAR DSM - DEM, shadow analysis, assessor',
    range: '1.0 – 300.0', unit: 'm',
    lidarEnhanced: true,
  },
  {
    key: 'floor_count', label: 'Floor Count', group: 'Footprint & Massing',
    tier: 'geometric', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Number of floors. Renders as horizontal lines on the extrusion at close zoom.',
    vizRole: 'Floor divider lines on walls',
    zoomMin: 'close', source: 'height / 3.2m or assessor',
    range: '1 – 255',
  },
  {
    key: 'shape_complexity', label: 'Shape Complexity', group: 'Footprint & Massing',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Footprint vertex complexity. Determines LOD mesh selection.',
    vizRole: 'LOD — box vs full polygon extrusion',
    zoomMin: 'far', source: 'computed from footprint vertex count',
    categories: [
      { value: 0, label: 'box', description: '4 vertices — rectangular approximation (no LiDAR)' },
      { value: 1, label: 'simple', description: '5-8 vertices — L/T/U shape' },
      { value: 2, label: 'moderate', description: '9-20 vertices — wings, setbacks, garages' },
      { value: 3, label: 'complex', description: '21+ vertices — full LiDAR trace with overhangs, bays, dormers' },
    ],
  },

  // ── Location & Orientation ──
  {
    key: 'centroid', label: 'Centroid', group: 'Location & Orientation',
    tier: 'geometric', kind: 'geometry', wireFormat: 'float64[2]', bytes: 16,
    description: 'Lon/lat center point. Used for label placement and spatial queries.',
    vizRole: 'Label anchor point',
    zoomMin: 'far', source: 'computed from footprint',
  },
  {
    key: 'orientation_deg', label: 'Orientation', group: 'Location & Orientation',
    tier: 'geometric', kind: 'numeric', wireFormat: 'uint16', bytes: 2,
    description: 'Primary facade bearing in degrees (0-359). Determines which face is "front."',
    vizRole: 'Front-face selection for door/window placement, label facing',
    zoomMin: 'mid', source: 'longest edge facing street, OSM road proximity',
    range: '0 – 359', unit: 'deg',
  },
  {
    key: 'elevation_m', label: 'Ground Elevation', group: 'Location & Orientation',
    tier: 'geometric', kind: 'numeric', wireFormat: 'float32', bytes: 4,
    description: 'Bare earth elevation at building location (DEM). Positions the building vertically on terrain.',
    vizRole: 'Vertical placement on terrain mesh',
    zoomMin: 'far', source: 'DEM',
    range: '-50 – 6000', unit: 'm ASL',
  },

  // ── Adjacency & Attachment ──
  {
    key: 'attached_sides', label: 'Attached Sides', group: 'Adjacency & Attachment',
    tier: 'geometric', kind: 'bitfield', wireFormat: 'bitfield8', bytes: 1,
    description: 'Which sides share a wall with a neighboring building (rowhouse, duplex, strip mall). Shared walls suppress windows and render as a continuous surface.',
    vizRole: 'Suppress windows/texture on shared walls, merge adjacent extrusions',
    zoomMin: 'mid', source: 'footprint proximity < 0.5m + parallel edge detection',
    categories: [
      { value: 0, label: 'north', description: 'Bit 0 — North-facing wall shared' },
      { value: 1, label: 'east', description: 'Bit 1 — East-facing wall shared' },
      { value: 2, label: 'south', description: 'Bit 2 — South-facing wall shared' },
      { value: 3, label: 'west', description: 'Bit 3 — West-facing wall shared' },
    ],
  },
  {
    key: 'spacing_m', label: 'Neighbor Spacing', group: 'Adjacency & Attachment',
    tier: 'geometric', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Distance to nearest non-attached building in meters. Affects shadow casting and fire spread.',
    vizRole: 'Gap rendering between buildings, shadow length',
    zoomMin: 'close', source: 'computed from footprint proximity',
    range: '0 – 255', unit: 'm',
  },

  // ── Roof ──
  {
    key: 'roof_geometry', label: 'Roof Shape', group: 'Roof',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Roof form. Directly generates the roof mesh in 3D/clay.',
    vizRole: 'Roof mesh generation',
    zoomMin: 'mid', source: 'LiDAR point cloud, satellite ML',
    lidarEnhanced: true,
    categories: [
      { value: 0, label: 'flat', description: 'No slope, parapet edges' },
      { value: 1, label: 'gable', description: 'Two slopes meeting at ridge' },
      { value: 2, label: 'hip', description: 'Four slopes meeting at ridge or point' },
      { value: 3, label: 'mansard', description: 'Four double-slope sides' },
      { value: 4, label: 'dome', description: 'Curved hemispherical' },
      { value: 5, label: 'shed', description: 'Single slope plane' },
      { value: 6, label: 'gambrel', description: 'Barn-style double-slope per side' },
      { value: 7, label: 'complex', description: 'Multi-section, mixed geometry (cross-gable, etc.)' },
    ],
  },
  {
    key: 'roof_material', label: 'Roof Material', group: 'Roof',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Roof surface material. Drives texture/color on the roof mesh.',
    vizRole: 'Roof texture in clay, tint in 3D',
    zoomMin: 'mid', source: 'satellite spectral, street view ML',
    categories: [
      { value: 0, label: 'asphalt_shingle', color: '#706060', description: 'Standard asphalt shingles' },
      { value: 1, label: 'metal', color: '#909898', description: 'Standing seam or corrugated' },
      { value: 2, label: 'tile', color: '#c07050', description: 'Clay or concrete tile' },
      { value: 3, label: 'concrete', color: '#989898', description: 'Flat concrete / built-up' },
      { value: 4, label: 'tar_gravel', color: '#585858', description: 'Tar and gravel flat' },
      { value: 5, label: 'synthetic', color: '#808080', description: 'Rubber, TPO, PVC membrane' },
      { value: 6, label: 'wood_shake', color: '#a08870', description: 'Cedar shake / wood shingle' },
      { value: 7, label: 'unknown', color: '#bbbbbb', description: 'Could not be determined' },
    ],
  },
  {
    key: 'roof_overhang', label: 'Roof Overhang', group: 'Roof',
    tier: 'geometric', kind: 'boolean', wireFormat: 'bit (in struct_flags)', bytes: 0,
    description: 'Whether roof extends past walls (eaves, soffits). Adds overhang geometry in close view.',
    vizRole: 'Extended roof mesh edges, soffit shadow',
    zoomMin: 'close', source: 'LiDAR edge detection',
    lidarEnhanced: true,
  },
  {
    key: 'roof_features', label: 'Roof Features', group: 'Roof',
    tier: 'geometric', kind: 'bitfield', wireFormat: 'bitfield8', bytes: 1,
    description: 'Additional geometry on the roof surface.',
    vizRole: 'Modeled features on roof mesh',
    zoomMin: 'close', source: 'LiDAR, satellite, street view',
    lidarEnhanced: true,
    categories: [
      { value: 0, label: 'chimney', description: 'Bit 0 — Chimney stack' },
      { value: 1, label: 'dormer', description: 'Bit 1 — Dormer window(s)' },
      { value: 2, label: 'solar_panels', description: 'Bit 2 — Rooftop solar array' },
      { value: 3, label: 'hvac_unit', description: 'Bit 3 — Rooftop HVAC equipment' },
      { value: 4, label: 'antenna', description: 'Bit 4 — Antenna / satellite dish' },
      { value: 5, label: 'skylight', description: 'Bit 5 — Skylight(s)' },
      { value: 6, label: 'parapet', description: 'Bit 6 — Raised parapet wall' },
    ],
  },

  // ── Walls & Material ──
  {
    key: 'material_class', label: 'Wall Material', group: 'Walls & Material',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Primary structural/facade material. Drives wall texture in clay mode.',
    vizRole: 'Wall texture and color',
    zoomMin: 'mid', source: 'street view ML, age inference, assessor',
    categories: [
      { value: 0, label: 'wood_frame', color: '#c8a87c', description: 'Wood siding, clapboard, shingle' },
      { value: 1, label: 'brick', color: '#b8886c', description: 'Exposed brick' },
      { value: 2, label: 'stucco', color: '#d4c8b0', description: 'Stucco / EIFS' },
      { value: 3, label: 'concrete', color: '#a0a0a0', description: 'Poured or precast concrete' },
      { value: 4, label: 'stone', color: '#9a9080', description: 'Natural stone facade' },
      { value: 5, label: 'steel_glass', color: '#8898a8', description: 'Steel frame with curtain wall' },
      { value: 6, label: 'metal_panel', color: '#8890a0', description: 'Corrugated or flat metal cladding' },
      { value: 7, label: 'vinyl_siding', color: '#c0c0b8', description: 'Vinyl or composite siding' },
      { value: 8, label: 'mobile', color: '#c0b898', description: 'Manufactured home materials' },
      { value: 9, label: 'unknown', color: '#cccccc', description: 'Could not be determined' },
    ],
  },

  // ── Windows ──
  {
    key: 'window_density', label: 'Window Density', group: 'Windows',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Approximate window coverage on facade. Drives how many window cutouts are placed on walls.',
    vizRole: 'Window count and spacing on wall faces',
    zoomMin: 'mid', source: 'street view ML, building type inference',
    categories: [
      { value: 0, label: 'none', description: 'Windowless (warehouse, utility)' },
      { value: 1, label: 'sparse', description: '<20% facade — small punched openings' },
      { value: 2, label: 'moderate', description: '20-50% facade — typical residential' },
      { value: 3, label: 'dense', description: '50-80% facade — commercial office' },
      { value: 4, label: 'curtain_wall', description: '>80% facade — full glass curtain wall' },
    ],
  },
  {
    key: 'window_type', label: 'Window Type', group: 'Windows',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Window style. Affects the modeled window shape on walls.',
    vizRole: 'Window shape geometry on wall faces',
    zoomMin: 'close', source: 'street view ML',
    categories: [
      { value: 0, label: 'single_hung', description: 'Standard single/double-hung rectangle' },
      { value: 1, label: 'casement', description: 'Side-hinged casement' },
      { value: 2, label: 'picture', description: 'Large fixed picture window' },
      { value: 3, label: 'arched', description: 'Arched top' },
      { value: 4, label: 'bay', description: 'Projecting bay window (adds wall geometry)' },
      { value: 5, label: 'sliding', description: 'Horizontal sliding' },
      { value: 6, label: 'storefront', description: 'Large commercial storefront glass' },
      { value: 7, label: 'unknown', description: 'Default rectangular' },
    ],
  },

  // ── Doors & Entries ──
  {
    key: 'entry_points', label: 'Entry Points', group: 'Doors & Entries',
    tier: 'geometric', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Number of distinct entry/exit doors. Rendered as door cutouts on the wall and ground markers.',
    vizRole: 'Door geometry on walls, entry markers on ground plane',
    zoomMin: 'mid', source: 'OSM, street view, floor plan extraction',
    range: '1 – 255',
  },
  {
    key: 'entry_type', label: 'Primary Entry Type', group: 'Doors & Entries',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Main entrance style. Affects door geometry and surrounding detail.',
    vizRole: 'Door model selection',
    zoomMin: 'close', source: 'street view ML, purpose inference',
    categories: [
      { value: 0, label: 'single_door', description: 'Standard single door' },
      { value: 1, label: 'double_door', description: 'Double doors' },
      { value: 2, label: 'revolving', description: 'Revolving door (commercial)' },
      { value: 3, label: 'garage', description: 'Garage door / roll-up' },
      { value: 4, label: 'loading_dock', description: 'Loading dock bay' },
      { value: 5, label: 'sliding_glass', description: 'Sliding glass (retail)' },
      { value: 6, label: 'recessed', description: 'Recessed entry / vestibule' },
      { value: 7, label: 'ramp_entry', description: 'ADA ramp entry' },
    ],
  },
  {
    key: 'has_porch', label: 'Porch / Canopy', group: 'Doors & Entries',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Covered entry structure. Adds overhang geometry above the door.',
    vizRole: 'Porch/awning/canopy mesh over entry',
    zoomMin: 'close', source: 'LiDAR, street view',
    lidarEnhanced: true,
    categories: [
      { value: 0, label: 'none', description: 'No covered entry' },
      { value: 1, label: 'porch', description: 'Open porch with columns' },
      { value: 2, label: 'covered_porch', description: 'Enclosed or screened porch' },
      { value: 3, label: 'awning', description: 'Fabric/metal awning over door' },
      { value: 4, label: 'canopy', description: 'Structural canopy (commercial)' },
      { value: 5, label: 'carport', description: 'Carport / porte-cochère' },
    ],
  },

  // ── Signs & Markings ──
  {
    key: 'signage', label: 'Signage', group: 'Signs & Markings',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Type of signage on or near the building. Rendered as sign geometry on facade.',
    vizRole: 'Sign model on building face or freestanding',
    zoomMin: 'close', source: 'street view ML, OSM',
    categories: [
      { value: 0, label: 'none', description: 'No visible signage' },
      { value: 1, label: 'wall_mounted', description: 'Flat sign mounted on facade' },
      { value: 2, label: 'projecting', description: 'Sign projecting perpendicular from wall' },
      { value: 3, label: 'monument', description: 'Ground-level freestanding sign' },
      { value: 4, label: 'pole', description: 'Tall pole sign (gas station, fast food)' },
      { value: 5, label: 'canopy_text', description: 'Text on awning or canopy' },
      { value: 6, label: 'roof_sign', description: 'Sign on roof' },
    ],
  },
  {
    key: 'address_visible', label: 'Address Visible', group: 'Signs & Markings',
    tier: 'geometric', kind: 'boolean', wireFormat: 'bit (in struct_flags)', bytes: 0,
    description: 'Whether a street address number is visible on the building.',
    vizRole: 'Address label rendered on facade at close zoom',
    zoomMin: 'close', source: 'street view OCR',
  },

  // ── Lot Features ──
  {
    key: 'fence_type', label: 'Fence Type', group: 'Lot Features',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Perimeter fencing. Rendered as fence geometry around the lot boundary.',
    vizRole: 'Fence mesh on lot perimeter',
    zoomMin: 'close', source: 'satellite ML, street view',
    categories: [
      { value: 0, label: 'none', description: 'No perimeter fencing' },
      { value: 1, label: 'chain_link', description: 'Chain link fence' },
      { value: 2, label: 'wood_privacy', description: 'Wood privacy fence' },
      { value: 3, label: 'picket', description: 'Picket fence' },
      { value: 4, label: 'concrete_wall', description: 'Concrete or masonry wall' },
      { value: 5, label: 'metal_security', description: 'Metal security fencing' },
      { value: 6, label: 'bollard', description: 'Bollard perimeter' },
      { value: 7, label: 'hedgerow', description: 'Vegetation hedge boundary' },
    ],
  },
  {
    key: 'parking_type', label: 'Parking', group: 'Lot Features',
    tier: 'geometric', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Parking arrangement. Rendered as surface markings or structure.',
    vizRole: 'Parking lot/garage geometry on lot',
    zoomMin: 'close', source: 'satellite ML, OSM',
    categories: [
      { value: 0, label: 'none', description: 'No dedicated parking' },
      { value: 1, label: 'driveway', description: 'Residential driveway' },
      { value: 2, label: 'surface_lot', description: 'Surface parking lot' },
      { value: 3, label: 'structure', description: 'Parking garage / structure' },
      { value: 4, label: 'underground', description: 'Underground parking' },
      { value: 5, label: 'street', description: 'Street parking only' },
    ],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA FEATURES — visualized as shading/tint/badges OVER geometry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const dataFeatures: VisfileFeature[] = [

  // ── Purpose & Use ──
  {
    key: 'purpose', label: 'Purpose', group: 'Purpose & Use',
    tier: 'data', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Primary building use class. Shaded as fill color over the entire building.',
    vizRole: 'Building fill color tint at all zooms',
    zoomMin: 'far', source: 'assessor, OSM, ML classification',
    categories: [
      { value: 0, label: 'residential_single', color: '#4ade80', description: 'Single-family home' },
      { value: 1, label: 'residential_multi', color: '#60a5fa', description: 'Apartments, condos, townhomes' },
      { value: 2, label: 'residential_high_rise', color: '#818cf8', description: 'High-rise residential' },
      { value: 3, label: 'commercial_retail', color: '#f59e0b', description: 'Shops, restaurants, strip malls' },
      { value: 4, label: 'commercial_office', color: '#f97316', description: 'Office buildings' },
      { value: 5, label: 'industrial', color: '#a78bfa', description: 'Factories, warehouses' },
      { value: 6, label: 'school', color: '#2dd4bf', description: 'K-12, university, daycare' },
      { value: 7, label: 'hospital', color: '#fb7185', description: 'Hospital, clinic, medical' },
      { value: 8, label: 'religious', color: '#e879f9', description: 'Church, mosque, temple' },
      { value: 9, label: 'government', color: '#38bdf8', description: 'City hall, courthouse, station' },
      { value: 10, label: 'mixed_use', color: '#94a3b8', description: 'Multiple use types' },
      { value: 11, label: 'utility', color: '#78716c', description: 'Power, water, telecom' },
      { value: 12, label: 'agricultural', color: '#a3e635', description: 'Barn, silo, greenhouse' },
      { value: 13, label: 'unknown', color: '#d1d5db', description: 'Could not classify' },
    ],
  },
  {
    key: 'purpose_confidence', label: 'Purpose Confidence', group: 'Purpose & Use',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Confidence of purpose classification. Low confidence desaturates the purpose color.',
    vizRole: 'Color saturation modifier on purpose tint',
    zoomMin: 'mid', source: 'pipeline',
    range: '0 – 100',
  },
  {
    key: 'subcategory', label: 'Subcategory', group: 'Purpose & Use',
    tier: 'data', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Detailed facility subtype. Shown in tooltip and triggers indicator tags.',
    vizRole: 'Tooltip detail, indicator tag trigger',
    zoomMin: 'close', source: 'assessor, OSM, permit data',
    categories: [
      { value: 0, label: 'none', description: 'No subcategory' },
      { value: 1, label: 'daycare', description: 'Childcare facility' },
      { value: 2, label: 'nursing_home', description: 'Assisted living / nursing' },
      { value: 3, label: 'dialysis', description: 'Dialysis center' },
      { value: 4, label: 'fire_station', description: 'Fire department' },
      { value: 5, label: 'police_station', description: 'Law enforcement' },
      { value: 6, label: 'emergency_ops', description: 'Emergency operations center' },
      { value: 7, label: 'shelter_designated', description: 'Designated emergency shelter' },
      { value: 8, label: 'hazmat_storage', description: 'Hazardous materials storage' },
      { value: 9, label: 'data_center', description: 'Data / telecom center' },
      { value: 10, label: 'fuel_station', description: 'Gas station / fuel depot' },
      { value: 11, label: 'water_treatment', description: 'Water / wastewater facility' },
      { value: 12, label: 'power_plant', description: 'Power generation' },
      { value: 13, label: 'prison', description: 'Correctional facility' },
      { value: 14, label: 'airport_terminal', description: 'Airport terminal' },
      { value: 15, label: 'other', description: 'Other' },
    ],
  },
  {
    key: 'operational_status', label: 'Operational Status', group: 'Purpose & Use',
    tier: 'data', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Current operational state. Dimmed or strikethrough for closed buildings.',
    vizRole: 'Opacity modifier — closed buildings dimmed, condemned get hatching',
    zoomMin: 'mid', source: 'OSM, business listings',
    categories: [
      { value: 0, label: 'open', description: 'Operating normally' },
      { value: 1, label: 'closed_temp', description: 'Temporarily closed' },
      { value: 2, label: 'closed_permanent', description: 'Permanently closed' },
      { value: 3, label: 'under_construction', description: 'Being built or renovated' },
      { value: 4, label: 'condemned', description: 'Condemned / do not enter' },
    ],
  },

  // ── Occupancy ──
  {
    key: 'occupancy_estimate', label: 'Occupancy Estimate', group: 'Occupancy',
    tier: 'data', kind: 'numeric', wireFormat: 'uint16', bytes: 2,
    description: 'Max estimated persons. Shown as density heat overlay.',
    vizRole: 'Density heat overlay, marker size',
    zoomMin: 'mid', source: 'area × density factor',
    range: '0 – 65535', unit: 'persons',
  },
  {
    key: 'unit_count', label: 'Unit Count', group: 'Occupancy',
    tier: 'data', kind: 'numeric', wireFormat: 'uint16', bytes: 2,
    description: 'Number of dwelling/commercial units.',
    vizRole: 'Tooltip, density calculations',
    zoomMin: 'close', source: 'assessor',
    range: '0 – 65535',
  },

  // ── Population Flags ──
  {
    key: 'population_flags', label: 'Population Flags', group: 'Population Indicators',
    tier: 'data', kind: 'bitfield', wireFormat: 'bitfield8', bytes: 1,
    description: 'Vulnerable population indicators. Rendered as badge icons on building roof.',
    vizRole: 'Roof badges — small-figure, cane, wheelchair, cross, language icons',
    zoomMin: 'mid', source: 'facility records, assessor, census overlay',
    categories: [
      { value: 0, label: 'children_present', description: 'Bit 0 — Children regularly present (school, daycare, family housing)' },
      { value: 1, label: 'elderly_present', description: 'Bit 1 — Elderly population (nursing home, senior housing)' },
      { value: 2, label: 'disabled_present', description: 'Bit 2 — Persons with disabilities (group home, ADA housing)' },
      { value: 3, label: 'medical_dependent', description: 'Bit 3 — Medical-dependent (dialysis, oxygen, home health)' },
      { value: 4, label: 'non_english_primary', description: 'Bit 4 — Primary language not English' },
      { value: 5, label: 'transient', description: 'Bit 5 — Transient population (hotel, shelter)' },
      { value: 6, label: 'incarcerated', description: 'Bit 6 — Incarcerated or detained' },
    ],
  },

  // ── Accessibility ──
  {
    key: 'ada_flags', label: 'Accessibility Flags', group: 'Accessibility',
    tier: 'data', kind: 'bitfield', wireFormat: 'bitfield8', bytes: 1,
    description: 'ADA and accessibility features. Rendered as overlay icons at entries.',
    vizRole: 'Wheelchair icon badge, ramp markers at entry points',
    zoomMin: 'mid', source: 'assessor, OSM, street view',
    categories: [
      { value: 0, label: 'ada_compliant', description: 'Bit 0 — Meets ADA standards' },
      { value: 1, label: 'accessible_parking', description: 'Bit 1 — Designated accessible parking' },
      { value: 2, label: 'accessible_restroom', description: 'Bit 2 — Wheelchair-accessible restrooms' },
      { value: 3, label: 'service_animal', description: 'Bit 3 — Accommodates service animals' },
      { value: 4, label: 'multilingual_signage', description: 'Bit 4 — Multilingual wayfinding' },
      { value: 5, label: 'elevator', description: 'Bit 5 — Elevator access' },
      { value: 6, label: 'ramp_entry', description: 'Bit 6 — Wheelchair ramp at entry' },
    ],
  },

  // ── Facility Flags ──
  {
    key: 'facility_flags', label: 'Facility Flags', group: 'Facility Indicators',
    tier: 'data', kind: 'bitfield', wireFormat: 'bitfield8', bytes: 1,
    description: 'Critical facility and hazard indicators. Persistent badges and ground rings.',
    vizRole: 'Persistent roof badges, ground rings, highlighted borders',
    zoomMin: 'all', source: 'FEMA, local EM, hazmat registries',
    categories: [
      { value: 0, label: 'designated_shelter', description: 'Bit 0 — Official emergency shelter (pulsing shield)' },
      { value: 1, label: 'hazmat_present', description: 'Bit 1 — Hazardous materials on-site (triangle + radius)' },
      { value: 2, label: 'critical_infrastructure', description: 'Bit 2 — Critical infra (bold border, always labeled)' },
      { value: 3, label: 'evacuation_point', description: 'Bit 3 — Evacuation rally point (ground arrow)' },
      { value: 4, label: 'triage_site', description: 'Bit 4 — Medical triage / staging' },
      { value: 5, label: 'supply_depot', description: 'Bit 5 — Supply distribution point' },
      { value: 6, label: 'comm_hub', description: 'Bit 6 — Communications hub' },
    ],
  },

  // ── Vulnerability ──
  {
    key: 'vulnerability_fire', label: 'Fire Vulnerability', group: 'Vulnerability',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Fire vulnerability 0-100. Red tint overlay on walls/roof.',
    vizRole: 'Red-tint shading on building surfaces',
    zoomMin: 'mid', source: 'material + spacing + vegetation model',
    range: '0 – 100',
  },
  {
    key: 'vulnerability_seismic', label: 'Seismic Vulnerability', group: 'Vulnerability',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Seismic vulnerability 0-100. Purple tint overlay on walls.',
    vizRole: 'Purple-tint shading on building surfaces',
    zoomMin: 'mid', source: 'material + age + soft-story + soil',
    range: '0 – 100',
  },
  {
    key: 'vulnerability_flood', label: 'Flood Vulnerability', group: 'Vulnerability',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Flood vulnerability 0-100. Blue gradient on ground plane.',
    vizRole: 'Blue ground-plane gradient around building',
    zoomMin: 'mid', source: 'DEM + FEMA + drainage model',
    range: '0 – 100',
  },
  {
    key: 'vulnerability_wind', label: 'Wind Vulnerability', group: 'Vulnerability',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Wind damage vulnerability 0-100. Directional streaks on roof.',
    vizRole: 'Directional streak lines on roof surface',
    zoomMin: 'mid', source: 'material + roof + height + exposure',
    range: '0 – 100',
  },
  {
    key: 'vulnerability_tsunami', label: 'Tsunami Vulnerability', group: 'Vulnerability',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Tsunami vulnerability 0-100. Wave-line on ground.',
    vizRole: 'Wave-line overlay on ground plane',
    zoomMin: 'mid', source: 'DEM + coast proximity + inundation model',
    range: '0 – 100',
  },
  {
    key: 'soft_story_flag', label: 'Soft Story', group: 'Vulnerability',
    tier: 'data', kind: 'boolean', wireFormat: 'bit (in struct_flags)', bytes: 0,
    description: 'Soft-story weakness. Yellow/red highlight band on first floor.',
    vizRole: 'First-floor highlight band overlay',
    zoomMin: 'mid', source: 'street view ML, assessor, retrofit registry',
  },

  // ── Construction & Age ──
  {
    key: 'year_built', label: 'Year Built', group: 'Construction & Age',
    tier: 'data', kind: 'numeric', wireFormat: 'uint16', bytes: 2,
    description: 'Construction year. Drives age heat-map shading.',
    vizRole: 'Age heat-map tint on walls (red=old, green=new)',
    zoomMin: 'close', source: 'assessor',
    range: '1800 – 2026', unit: 'year',
  },
  {
    key: 'building_code_era', label: 'Building Code Era', group: 'Construction & Age',
    tier: 'data', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Code generation the building was built under.',
    vizRole: 'Code-era color band, risk model input',
    zoomMin: 'close', source: 'computed from year_built + jurisdiction',
    categories: [
      { value: 0, label: 'pre_code', description: 'Before modern codes (pre-1940)' },
      { value: 1, label: 'early', description: 'Early codes (1940-1970)' },
      { value: 2, label: 'moderate', description: 'Moderate standards (1970-2000)' },
      { value: 3, label: 'modern', description: 'Modern codes (2000-2015)' },
      { value: 4, label: 'current', description: 'Current standards (2015+)' },
    ],
  },
  {
    key: 'seismic_retrofit', label: 'Seismic Retrofit', group: 'Construction & Age',
    tier: 'data', kind: 'boolean', wireFormat: 'bit (in struct_flags)', bytes: 0,
    description: 'Has been seismically retrofitted. Shown as info badge.',
    vizRole: 'Retrofit badge icon',
    zoomMin: 'close', source: 'assessor, permit records',
  },
  {
    key: 'material_confidence', label: 'Material Confidence', group: 'Construction & Age',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Confidence of material classification.',
    vizRole: 'Texture clarity / opacity modifier',
    zoomMin: 'close', source: 'pipeline',
    range: '0 – 100',
  },

  // ── Shelter ──
  {
    key: 'shelter_capacity', label: 'Shelter Capacity', group: 'Shelter & Safety',
    tier: 'data', kind: 'numeric', wireFormat: 'uint16', bytes: 2,
    description: 'Max sheltering persons. Ring radius proportional to capacity.',
    vizRole: 'Green ring radius around building',
    zoomMin: 'mid', source: 'facility records, area estimate',
    range: '0 – 65535', unit: 'persons',
  },
  {
    key: 'shelter_type', label: 'Shelter Type', group: 'Shelter & Safety',
    tier: 'data', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Best shelter option in this building.',
    vizRole: 'Shelter icon variant',
    zoomMin: 'close', source: 'facility records, structural analysis',
    categories: [
      { value: 0, label: 'none', description: 'Not suitable for sheltering' },
      { value: 1, label: 'basement', description: 'Below-grade basement' },
      { value: 2, label: 'interior_room', description: 'Windowless interior room' },
      { value: 3, label: 'reinforced_concrete', description: 'Reinforced concrete core' },
      { value: 4, label: 'bank_vault', description: 'Bank vault or safe room' },
      { value: 5, label: 'multi_story_interior', description: 'Interior of multi-story' },
    ],
  },
  {
    key: 'structural_durability', label: 'Structural Durability', group: 'Shelter & Safety',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Overall structural strength rating.',
    vizRole: 'Tooltip, shelter score calculations',
    zoomMin: 'close', source: 'material + age + code era + retrofit',
    range: '0 – 100',
  },

  // ── Data Quality ──
  {
    key: 'confidence', label: 'Overall Confidence', group: 'Data Quality',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Combined data quality score. High = solid outline, low = dashed.',
    vizRole: 'Outline style — solid vs dashed',
    zoomMin: 'far', source: 'pipeline',
    range: '0 – 100',
  },
  {
    key: 'height_confidence', label: 'Height Confidence', group: 'Data Quality',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Confidence of height estimate. Low = translucent extrusion.',
    vizRole: 'Extrusion opacity modifier',
    zoomMin: 'mid', source: 'pipeline',
    range: '0 – 100',
  },
  {
    key: 'height_source', label: 'Height Source', group: 'Data Quality',
    tier: 'data', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'Method used to determine height.',
    vizRole: 'Debug overlay — color by source method',
    zoomMin: 'close', source: 'pipeline',
    categories: [
      { value: 0, label: 'lidar', description: 'Direct LiDAR measurement' },
      { value: 1, label: 'shadow', description: 'Shadow analysis from satellite' },
      { value: 2, label: 'assessor', description: 'Assessor floor count × 3.2m' },
      { value: 3, label: 'fused', description: 'Multiple sources combined' },
    ],
  },
  {
    key: 'material_source', label: 'Material Source', group: 'Data Quality',
    tier: 'data', kind: 'categorical', wireFormat: 'enum8', bytes: 1,
    description: 'How material was determined.',
    vizRole: 'Debug overlay',
    zoomMin: 'close', source: 'pipeline',
    categories: [
      { value: 0, label: 'street_view', description: 'Street view ML classification' },
      { value: 1, label: 'age_inference', description: 'Inferred from year + region' },
      { value: 2, label: 'assessor', description: 'County assessor records' },
      { value: 3, label: 'lidar_reflectance', description: 'LiDAR intensity classification' },
    ],
  },
  {
    key: 'source_flags', label: 'Source Flags', group: 'Data Quality',
    tier: 'data', kind: 'bitfield', wireFormat: 'bitfield8', bytes: 1,
    description: 'Which data sources contributed.',
    vizRole: 'Debug overlay — color by source coverage',
    zoomMin: 'close', source: 'pipeline',
    categories: [
      { value: 0, label: 'lidar', description: 'Bit 0 — Has LiDAR data' },
      { value: 1, label: 'satellite', description: 'Bit 1 — Has satellite data' },
      { value: 2, label: 'osm', description: 'Bit 2 — Has OSM data' },
      { value: 3, label: 'assessor', description: 'Bit 3 — Has assessor records' },
      { value: 4, label: 'street_view', description: 'Bit 4 — Has street imagery' },
      { value: 5, label: 'shadow_analysis', description: 'Bit 5 — Height from shadow' },
      { value: 6, label: 'manual', description: 'Bit 6 — Manual annotation' },
    ],
  },
  {
    key: 'source_agreement', label: 'Source Agreement', group: 'Data Quality',
    tier: 'data', kind: 'numeric', wireFormat: 'uint8', bytes: 1,
    description: 'Number of sources agreeing building exists.',
    vizRole: 'Outline weight — more sources = thicker',
    zoomMin: 'close', source: 'pipeline',
    range: '1 – 7',
  },
  {
    key: 'last_updated', label: 'Last Updated', group: 'Data Quality',
    tier: 'data', kind: 'datetime', wireFormat: 'uint32 (epoch days)', bytes: 4,
    description: 'Most recent data update.',
    vizRole: 'Staleness indicator, tooltip',
    zoomMin: 'close', source: 'pipeline',
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EVOLVING STATUS — temporary/real-time building state
// These are NOT part of the base visfile tile but arrive
// via a separate real-time feed and overlay onto buildings.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EvolvingStatusField {
  key: string;
  label: string;
  wireFormat: string;
  bytes: number;
  description: string;
  vizRole: string;
}

export const evolvingStatusFields: EvolvingStatusField[] = [
  {
    key: 'gas_shutoff', label: 'Gas Shut Off',
    wireFormat: 'bool', bytes: 1,
    description: 'Owner has confirmed gas supply is turned off at the meter.',
    vizRole: 'Gas-off indicator badge, removes gas-leak risk shading',
  },
  {
    key: 'power_shutoff', label: 'Power Shut Off',
    wireFormat: 'bool', bytes: 1,
    description: 'Electricity disconnected at panel or by utility.',
    vizRole: 'Power-off indicator badge',
  },
  {
    key: 'water_shutoff', label: 'Water Shut Off',
    wireFormat: 'bool', bytes: 1,
    description: 'Water supply turned off at main valve.',
    vizRole: 'Water-off indicator badge',
  },
  {
    key: 'evacuated', label: 'Evacuated',
    wireFormat: 'bool', bytes: 1,
    description: 'All occupants confirmed evacuated.',
    vizRole: 'Green checkmark badge, dims occupancy overlay',
  },
  {
    key: 'occupied', label: 'Occupied / Sheltering In Place',
    wireFormat: 'bool', bytes: 1,
    description: 'People confirmed still inside during event.',
    vizRole: 'Red occupied badge, pulsing if in hazard zone',
  },
  {
    key: 'damage_level', label: 'Damage Assessment',
    wireFormat: 'enum8', bytes: 1,
    description: 'Post-event damage level: none, affected, minor, major, destroyed.',
    vizRole: 'Color overlay — green/yellow/orange/red/black',
  },
  {
    key: 'flood_depth_m', label: 'Flood Depth at Building',
    wireFormat: 'float32', bytes: 4,
    description: 'Current water depth at ground floor relative to first floor elevation.',
    vizRole: 'Blue water-line on building, height proportional to depth',
  },
  {
    key: 'on_fire', label: 'On Fire',
    wireFormat: 'bool', bytes: 1,
    description: 'Structure is currently burning.',
    vizRole: 'Fire animation overlay, red pulse',
  },
  {
    key: 'search_status', label: 'Search Status',
    wireFormat: 'enum8', bytes: 1,
    description: 'Search and rescue status: not_searched, in_progress, cleared, needs_return.',
    vizRole: 'SAR marking overlay (X-code)',
  },
  {
    key: 'structural_compromise', label: 'Structural Compromise',
    wireFormat: 'enum8', bytes: 1,
    description: 'Post-event structural integrity: safe, caution, unsafe, collapse_risk.',
    vizRole: 'Hatching overlay — yellow caution, red unsafe, skull collapse',
  },
  {
    key: 'access_blocked', label: 'Access Blocked',
    wireFormat: 'bool', bytes: 1,
    description: 'Cannot reach building due to debris, flood, or road damage.',
    vizRole: 'X badge on entry points',
  },
  {
    key: 'trapped_persons', label: 'Trapped Persons',
    wireFormat: 'uint8', bytes: 1,
    description: 'Known or estimated people trapped inside.',
    vizRole: 'Pulsing red person-count badge, priority highlight',
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const visfileFeatures: VisfileFeature[] = [...geometricFeatures, ...dataFeatures];

export function getGeometricFeatures(): VisfileFeature[] {
  return geometricFeatures;
}

export function getDataFeatures(): VisfileFeature[] {
  return dataFeatures;
}

export function getVisfileGroups(tier?: FeatureTier): string[] {
  const features = tier ? visfileFeatures.filter(f => f.tier === tier) : visfileFeatures;
  const seen = new Set<string>();
  const groups: string[] = [];
  for (const f of features) {
    if (!seen.has(f.group)) {
      seen.add(f.group);
      groups.push(f.group);
    }
  }
  return groups;
}

export function getFeaturesByGroup(group: string): VisfileFeature[] {
  return visfileFeatures.filter(f => f.group === group);
}
