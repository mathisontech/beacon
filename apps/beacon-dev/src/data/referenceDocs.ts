export interface RefDocEntry {
  label: string;
  driveSearchTerm: string;
}

export interface ModuleRefDocs {
  module: string;
  docs: RefDocEntry[];
}

const referenceDocs: ModuleRefDocs[] = [
  {
    module: 'base-map',
    docs: [
      { label: 'Downstream Dependencies', driveSearchTerm: '01_downstream_dependencies' },
      { label: 'Base Map Overview', driveSearchTerm: '00_base_map_overview' },
      { label: 'Building Extraction', driveSearchTerm: '00_building_extraction_overview' },
      { label: 'Building Vulnerability', driveSearchTerm: '05_building_vulnerability_assessment' },
      { label: 'Road Network', driveSearchTerm: '00_road_extraction_overview' },
      { label: 'Road Passability', driveSearchTerm: '07_passability_model' },
      { label: 'Terrain Overview', driveSearchTerm: '00_terrain_extraction_overview' },
      { label: 'Elevation Model', driveSearchTerm: '01_elevation_model' },
      { label: 'Vegetation Overview', driveSearchTerm: '00_vegetation_extraction_overview' },
      { label: 'Fuel Loading', driveSearchTerm: '03_fuel_loading_estimation' },
      { label: 'Infrastructure Overview', driveSearchTerm: '00_infrastructure_overview' },
      { label: 'Population Overview', driveSearchTerm: '00_population_overview' },
      { label: 'Vulnerable Populations', driveSearchTerm: '02_vulnerable_populations' },
    ],
  },
  {
    module: 'event-management',
    docs: [
      { label: 'Hazard Framework', driveSearchTerm: 'hazard_model_framework' },
      { label: 'Hazard Categories', driveSearchTerm: 'hazard_categories' },
      { label: 'Wildfire Model', driveSearchTerm: 'wildfire_model' },
      { label: 'Flood Model', driveSearchTerm: 'flood_model' },
      { label: 'Earthquake Model', driveSearchTerm: 'earthquake_model' },
      { label: 'Hurricane Model', driveSearchTerm: 'hurricane_model' },
      { label: 'Tornado Model', driveSearchTerm: 'tornado_model' },
      { label: 'Tsunami Model', driveSearchTerm: 'tsunami_model' },
      { label: 'Landslide Model', driveSearchTerm: 'landslide_model' },
      { label: 'Winter Storm Model', driveSearchTerm: 'winter_storm_model' },
      { label: 'Volcano Model', driveSearchTerm: 'volcano_model' },
      { label: 'Extreme Heat Model', driveSearchTerm: 'extreme_heat_model' },
      { label: 'Extreme Cold Model', driveSearchTerm: 'extreme_cold_model' },
      { label: 'Dust Storm Model', driveSearchTerm: 'dust_storm_model' },
      { label: 'Drought Model', driveSearchTerm: 'drought_model' },
      { label: 'Air Quality Model', driveSearchTerm: 'air_quality_model' },
      { label: 'HazMat Model', driveSearchTerm: 'hazmat_model' },
      { label: 'Power Grid Model', driveSearchTerm: 'power_grid_model' },
      { label: 'Dam Failure Model', driveSearchTerm: 'dam_failure_model' },
      { label: 'Sinkhole Model', driveSearchTerm: 'sinkhole_model' },
      { label: 'Liquefaction Model', driveSearchTerm: 'liquefaction_model' },
      { label: 'Pandemic Model', driveSearchTerm: 'pandemic_model' },
    ],
  },
  {
    module: 'hazard-onset',
    docs: [
      { label: 'Hazard Framework', driveSearchTerm: 'hazard_model_framework' },
      { label: 'Hazard Categories', driveSearchTerm: 'hazard_categories' },
    ],
  },
  {
    module: 'condition-monitoring',
    docs: [
      { label: 'Fuel Loading Estimation', driveSearchTerm: '03_fuel_loading_estimation' },
      { label: 'Drainage Hydrology', driveSearchTerm: '04_drainage_hydrology' },
    ],
  },
  {
    module: 'risk-monitoring',
    docs: [
      { label: 'Hazard Framework', driveSearchTerm: 'hazard_model_framework' },
      { label: 'Vulnerable Populations', driveSearchTerm: '02_vulnerable_populations' },
      { label: 'Building Vulnerability', driveSearchTerm: '05_building_vulnerability_assessment' },
    ],
  },
  {
    module: 'event-triggers',
    docs: [
      { label: 'Hazard Categories', driveSearchTerm: 'hazard_categories' },
    ],
  },
  {
    module: 'operations',
    docs: [
      { label: 'Road Passability', driveSearchTerm: '07_passability_model' },
      { label: 'Infrastructure Overview', driveSearchTerm: '00_infrastructure_overview' },
      { label: 'Population Overview', driveSearchTerm: '00_population_overview' },
    ],
  },
];

export function getRefDocsForModule(module: string): RefDocEntry[] {
  return referenceDocs.find((r) => r.module === module)?.docs ?? [];
}
