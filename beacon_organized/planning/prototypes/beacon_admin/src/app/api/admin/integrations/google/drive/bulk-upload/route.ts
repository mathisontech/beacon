import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/google/getToken';
import { createFolder, uploadFile } from '@/lib/google/drive';
import fs from 'fs';
import path from 'path';

const NOTES = path.resolve(process.cwd(), '..', '..', '..', 'planning', 'notes');

const baseMapFiles = [
  '46_base_map_development/01_downstream_dependencies.md',
  '46_base_map_development/00_base_map_overview.md',
  '46_base_map_development/04_buildings/00_building_extraction_overview.md',
  '46_base_map_development/04_buildings/01_building_footprint_detection.md',
  '46_base_map_development/04_buildings/05_building_vulnerability_assessment.md',
  '46_base_map_development/05_roads/00_road_extraction_overview.md',
  '46_base_map_development/05_roads/07_passability_model.md',
  '46_base_map_development/06_terrain/00_terrain_extraction_overview.md',
  '46_base_map_development/06_terrain/01_elevation_model.md',
  '46_base_map_development/06_terrain/04_drainage_hydrology.md',
  '46_base_map_development/07_vegetation/00_vegetation_extraction_overview.md',
  '46_base_map_development/07_vegetation/03_fuel_loading_estimation.md',
  '46_base_map_development/08_infrastructure/00_infrastructure_overview.md',
  '46_base_map_development/09_population/00_population_overview.md',
  '46_base_map_development/09_population/02_vulnerable_populations.md',
];

const hazardFiles = [
  '02_hazard_models/00_hazard_framework/hazard_model_framework.md',
  '02_hazard_models/00_hazard_framework/hazard_categories.md',
  '02_hazard_models/01_wildfire/wildfire_model.md',
  '02_hazard_models/02_flood/flood_model.md',
  '02_hazard_models/03_tsunami/tsunami_model.md',
  '02_hazard_models/04_avalanche/avalanche_model.md',
  '02_hazard_models/05_earthquake/earthquake_model.md',
  '02_hazard_models/06_volcano/volcano_model.md',
  '02_hazard_models/07_landslide/landslide_model.md',
  '02_hazard_models/08_tornado/tornado_model.md',
  '02_hazard_models/09_hurricane/hurricane_model.md',
  '02_hazard_models/10_winter_storm/winter_storm_model.md',
  '02_hazard_models/11_extreme_heat/extreme_heat_model.md',
  '02_hazard_models/12_extreme_cold/extreme_cold_model.md',
  '02_hazard_models/13_dust_storm/dust_storm_model.md',
  '02_hazard_models/14_drought/drought_model.md',
  '02_hazard_models/15_air_quality/air_quality_model.md',
  '02_hazard_models/16_hazmat/hazmat_model.md',
  '02_hazard_models/17_power_grid/power_grid_model.md',
  '02_hazard_models/18_dam_failure/dam_failure_model.md',
  '02_hazard_models/19_sinkhole/sinkhole_model.md',
  '02_hazard_models/20_liquefaction/liquefaction_model.md',
  '02_hazard_models/21_rip_current/rip_current_model.md',
  '02_hazard_models/22_backcountry/backcountry_model.md',
  '02_hazard_models/24_pandemic/pandemic_model.md',
];

export async function POST() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'Not connected' }, { status: 401 });
  }

  const log: string[] = [];
  try {
    log.push('Creating folder structure...');
    const root = await createFolder(token, 'Beacon Reference Docs');
    const baseMapFolder = await createFolder(token, 'Base Map Layers', root.id);
    const hazardFolder = await createFolder(token, 'Hazard Models', root.id);

    for (const rel of baseMapFiles) {
      const full = path.join(NOTES, rel);
      if (!fs.existsSync(full)) { log.push(`SKIP: ${rel}`); continue; }
      const buf = Buffer.from(fs.readFileSync(full));
      const name = path.basename(rel);
      const result = await uploadFile(token, buf, name, 'text/markdown', baseMapFolder.id);
      log.push(`uploaded ${name} (${result.id})`);
    }

    for (const rel of hazardFiles) {
      const full = path.join(NOTES, rel);
      if (!fs.existsSync(full)) { log.push(`SKIP: ${rel}`); continue; }
      const buf = Buffer.from(fs.readFileSync(full));
      const name = path.basename(rel);
      const result = await uploadFile(token, buf, name, 'text/markdown', hazardFolder.id);
      log.push(`uploaded ${name} (${result.id})`);
    }

    log.push('Done!');
    return NextResponse.json({ success: true, log });
  } catch (e) {
    log.push(`ERROR: ${e}`);
    return NextResponse.json({ success: false, log }, { status: 500 });
  }
}
