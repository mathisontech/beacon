// How each building attribute gets rendered across map modes

export interface RawDataField {
  key: string;
  label: string;
  format: string;
  bytes: string;
  notes: string;
}

export interface ShadingOverlay {
  id: string;
  label: string;
  source: string;
  colorScale: string;
  range: string;
  blendMode: string;
}

export interface IndicatorTag {
  id: string;
  label: string;
  icon: string;
  trigger: string;
  visibility: string;
  placement: string;
}

// Raw vector tile data format per building feature
export const rawDataFields: RawDataField[] = [
  { key: 'footprint', label: 'Footprint', format: 'POLYGON (WKB)', bytes: '~200-2000', notes: 'Compressed geometry ring, CCW winding' },
  { key: 'height_m', label: 'Height', format: 'float32', bytes: '4', notes: 'Meters AGL, drives extrusion in 3D/clay' },
  { key: 'floor_count', label: 'Floors', format: 'uint8', bytes: '1', notes: 'Clamped 1-255, fallback from height/3.2' },
  { key: 'roof_geometry', label: 'Roof Type', format: 'enum8', bytes: '1', notes: '0=flat 1=gable 2=hip 3=mansard 4=dome 5=shed' },
  { key: 'material_class', label: 'Material', format: 'enum8', bytes: '1', notes: '0=wood 1=masonry 2=concrete 3=steel 4=mobile 5=mixed' },
  { key: 'purpose', label: 'Purpose', format: 'enum8', bytes: '1', notes: 'Primary use class, drives default color' },
  { key: 'year_built', label: 'Year Built', format: 'uint16', bytes: '2', notes: 'Construction year, 0=unknown' },
  { key: 'area_m2', label: 'Area', format: 'float32', bytes: '4', notes: 'Footprint area, precomputed from geometry' },
  { key: 'confidence', label: 'Confidence', format: 'uint8', bytes: '1', notes: '0-100 scaled, overall data quality' },
  { key: 'vulnerability_vec', label: 'Vulnerability', format: 'uint8[5]', bytes: '5', notes: '[fire,seismic,flood,wind,tsunami] 0-100 each' },
  { key: 'occupancy_est', label: 'Occupancy', format: 'uint16', bytes: '2', notes: 'Max persons estimate' },
  { key: 'ada_flags', label: 'Access Flags', format: 'bitfield8', bytes: '1', notes: 'Bit0=ADA Bit1=parking Bit2=restroom Bit3=service_animal Bit4=multilingual' },
  { key: 'population_flags', label: 'Population Flags', format: 'bitfield8', bytes: '1', notes: 'Bit0=children Bit1=elderly Bit2=disabled Bit3=medical_dependent Bit4=non_english' },
  { key: 'facility_flags', label: 'Facility Flags', format: 'bitfield8', bytes: '1', notes: 'Bit0=shelter Bit1=hazmat Bit2=critical_infra Bit3=evacuation_point' },
  { key: 'exits_count', label: 'Exits', format: 'uint8', bytes: '1', notes: 'Entry/exit point count for routing' },
  { key: 'spacing_m', label: 'Neighbor Dist', format: 'uint8', bytes: '1', notes: 'Meters to nearest building, clamped 0-255' },
];

// Regional shading overlays applied across building clusters
export const shadingOverlays: ShadingOverlay[] = [
  {
    id: 'fire_risk',
    label: 'Fire Vulnerability',
    source: 'fire_vulnerability_score',
    colorScale: '#2d6a4f → #e63946',
    range: '0.0 – 1.0',
    blendMode: 'multiply over roof',
  },
  {
    id: 'seismic_risk',
    label: 'Seismic Vulnerability',
    source: 'seismic_vulnerability_score',
    colorScale: '#2d6a4f → #9d4edd',
    range: '0.0 – 1.0',
    blendMode: 'multiply over walls',
  },
  {
    id: 'flood_risk',
    label: 'Flood Vulnerability',
    source: 'flood_vulnerability_score',
    colorScale: '#caf0f8 → #023e8a',
    range: '0.0 – 1.0',
    blendMode: 'ground plane gradient',
  },
  {
    id: 'wind_risk',
    label: 'Wind Vulnerability',
    source: 'wind_vulnerability_score',
    colorScale: '#f0f9ff → #475569',
    range: '0.0 – 1.0',
    blendMode: 'directional streaks',
  },
  {
    id: 'shelter_capacity',
    label: 'Shelter Capacity',
    source: 'shelter_capacity_persons',
    colorScale: '#fef3c7 → #065f46',
    range: '0 – 500+',
    blendMode: 'ring radius around building',
  },
  {
    id: 'age_heat',
    label: 'Construction Age',
    source: 'year_built',
    colorScale: '#7f1d1d → #fef08a → #166534',
    range: 'pre-1940 → 2020+',
    blendMode: 'wall tint',
  },
  {
    id: 'occupancy_density',
    label: 'Occupancy Density',
    source: 'occupancy_estimate / area_m2',
    colorScale: '#f0fdf4 → #dc2626',
    range: '0 – 0.5 persons/m²',
    blendMode: 'fill opacity',
  },
];

// Tags rendered on or near buildings to indicate populations/conditions
export const indicatorTags: IndicatorTag[] = [
  {
    id: 'children_present',
    label: 'Children Present',
    icon: 'small-figure',
    trigger: 'population_flags & Bit0 OR purpose=public_school OR subcategory=daycare',
    visibility: 'mid + close zoom',
    placement: 'badge top-right of roof',
  },
  {
    id: 'elderly_present',
    label: 'Elderly Present',
    icon: 'cane-figure',
    trigger: 'population_flags & Bit1 OR subcategory=nursing_home',
    visibility: 'mid + close zoom',
    placement: 'badge top-right of roof',
  },
  {
    id: 'disabled_present',
    label: 'Disabled / Mobility-Limited',
    icon: 'wheelchair',
    trigger: 'population_flags & Bit2 OR ada_accessibility=true',
    visibility: 'mid + close zoom',
    placement: 'badge top-right of roof, ADA ramp marker at entry',
  },
  {
    id: 'medical_dependent',
    label: 'Medical-Dependent',
    icon: 'cross',
    trigger: 'population_flags & Bit3 OR subcategory=hospital OR subcategory=dialysis',
    visibility: 'all zoom levels',
    placement: 'persistent roof badge',
  },
  {
    id: 'non_english',
    label: 'Non-English Primary',
    icon: 'language',
    trigger: 'population_flags & Bit4',
    visibility: 'close zoom only',
    placement: 'entry marker tooltip',
  },
  {
    id: 'shelter_designated',
    label: 'Designated Shelter',
    icon: 'shield',
    trigger: 'facility_flags & Bit0',
    visibility: 'all zoom levels',
    placement: 'roof center, pulsing in active events',
  },
  {
    id: 'hazmat_present',
    label: 'Hazmat Present',
    icon: 'hazard-triangle',
    trigger: 'facility_flags & Bit1',
    visibility: 'all zoom levels',
    placement: 'roof badge + radius ring on ground',
  },
  {
    id: 'critical_infrastructure',
    label: 'Critical Infrastructure',
    icon: 'star',
    trigger: 'facility_flags & Bit2',
    visibility: 'all zoom levels',
    placement: 'outlined building border, always labeled',
  },
  {
    id: 'evacuation_point',
    label: 'Evacuation Rally Point',
    icon: 'arrow-up-circle',
    trigger: 'facility_flags & Bit3',
    visibility: 'all zoom levels',
    placement: 'ground marker adjacent to building',
  },
  {
    id: 'soft_story',
    label: 'Soft Story Risk',
    icon: 'warning',
    trigger: 'soft_story_flag=true',
    visibility: 'mid + close zoom',
    placement: 'first floor highlight band',
  },
  {
    id: 'service_animal',
    label: 'Service Animal Friendly',
    icon: 'paw',
    trigger: 'service_animal=true',
    visibility: 'close zoom only',
    placement: 'entry marker icon',
  },
];
