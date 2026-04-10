#!/usr/bin/env node
/**
 * Uploads Beacon reference docs to Google Drive via the beacon_admin API.
 * Requires: dev server running at localhost:3000, Google Drive connected.
 *
 * Usage:  node scripts/upload-docs-to-drive.mjs
 *
 * Creates a "Beacon Reference Docs" folder in Drive root, then two
 * sub-folders: "Base Map Layers" and "Hazard Models", and uploads
 * the relevant markdown files into each.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.resolve(__dirname, '..', '..', '..', '..', 'planning', 'notes');
const API = 'http://localhost:3000/api/admin/integrations/google/drive';

// ── helpers ──────────────────────────────────────────────────────────

async function createFolder(name, parentId) {
  const res = await fetch(`${API}/folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, folderId: parentId || undefined }),
  });
  if (!res.ok) throw new Error(`folder create failed: ${res.status}`);
  return (await res.json()).id;
}

async function uploadFile(filePath, folderId) {
  const buf = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  const blob = new Blob([buf], { type: 'text/markdown' });
  const form = new FormData();
  form.append('file', blob, name);
  if (folderId) form.append('folderId', folderId);

  const res = await fetch(`${API}/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`upload failed for ${name}: ${res.status}`);
  const data = await res.json();
  console.log(`  uploaded ${name}  (${data.id})`);
  return data;
}

// ── doc manifest ─────────────────────────────────────────────────────

const baseMapDocs = [
  { label: 'Downstream Dependencies', file: '46_base_map_development/01_downstream_dependencies.md' },
  { label: 'Base Map Overview',       file: '46_base_map_development/00_base_map_overview.md' },
  { label: 'Building Extraction',     file: '46_base_map_development/04_buildings/00_building_extraction_overview.md' },
  { label: 'Building Footprint Detection', file: '46_base_map_development/04_buildings/01_building_footprint_detection.md' },
  { label: 'Building Vulnerability',  file: '46_base_map_development/04_buildings/05_building_vulnerability_assessment.md' },
  { label: 'Road Network Overview',   file: '46_base_map_development/05_roads/00_road_extraction_overview.md' },
  { label: 'Road Passability Model',  file: '46_base_map_development/05_roads/07_passability_model.md' },
  { label: 'Terrain Overview',        file: '46_base_map_development/06_terrain/00_terrain_extraction_overview.md' },
  { label: 'Elevation Model',         file: '46_base_map_development/06_terrain/01_elevation_model.md' },
  { label: 'Drainage Hydrology',      file: '46_base_map_development/06_terrain/04_drainage_hydrology.md' },
  { label: 'Vegetation Overview',     file: '46_base_map_development/07_vegetation/00_vegetation_extraction_overview.md' },
  { label: 'Fuel Loading Estimation', file: '46_base_map_development/07_vegetation/03_fuel_loading_estimation.md' },
  { label: 'Infrastructure Overview', file: '46_base_map_development/08_infrastructure/00_infrastructure_overview.md' },
  { label: 'Population Overview',     file: '46_base_map_development/09_population/00_population_overview.md' },
  { label: 'Vulnerable Populations',  file: '46_base_map_development/09_population/02_vulnerable_populations.md' },
];

const hazardDocs = [
  { label: 'Hazard Framework',   file: '02_hazard_models/00_hazard_framework/hazard_model_framework.md' },
  { label: 'Hazard Categories',  file: '02_hazard_models/00_hazard_framework/hazard_categories.md' },
  { label: 'Wildfire Model',     file: '02_hazard_models/01_wildfire/wildfire_model.md' },
  { label: 'Flood Model',        file: '02_hazard_models/02_flood/flood_model.md' },
  { label: 'Tsunami Model',      file: '02_hazard_models/03_tsunami/tsunami_model.md' },
  { label: 'Avalanche Model',    file: '02_hazard_models/04_avalanche/avalanche_model.md' },
  { label: 'Earthquake Model',   file: '02_hazard_models/05_earthquake/earthquake_model.md' },
  { label: 'Volcano Model',      file: '02_hazard_models/06_volcano/volcano_model.md' },
  { label: 'Landslide Model',    file: '02_hazard_models/07_landslide/landslide_model.md' },
  { label: 'Tornado Model',      file: '02_hazard_models/08_tornado/tornado_model.md' },
  { label: 'Hurricane Model',    file: '02_hazard_models/09_hurricane/hurricane_model.md' },
  { label: 'Winter Storm Model', file: '02_hazard_models/10_winter_storm/winter_storm_model.md' },
  { label: 'Extreme Heat Model', file: '02_hazard_models/11_extreme_heat/extreme_heat_model.md' },
  { label: 'Extreme Cold Model', file: '02_hazard_models/12_extreme_cold/extreme_cold_model.md' },
  { label: 'Dust Storm Model',   file: '02_hazard_models/13_dust_storm/dust_storm_model.md' },
  { label: 'Drought Model',      file: '02_hazard_models/14_drought/drought_model.md' },
  { label: 'Air Quality Model',  file: '02_hazard_models/15_air_quality/air_quality_model.md' },
  { label: 'HazMat Model',       file: '02_hazard_models/16_hazmat/hazmat_model.md' },
  { label: 'Power Grid Model',   file: '02_hazard_models/17_power_grid/power_grid_model.md' },
  { label: 'Dam Failure Model',  file: '02_hazard_models/18_dam_failure/dam_failure_model.md' },
  { label: 'Sinkhole Model',     file: '02_hazard_models/19_sinkhole/sinkhole_model.md' },
  { label: 'Liquefaction Model', file: '02_hazard_models/20_liquefaction/liquefaction_model.md' },
  { label: 'Rip Current Model',  file: '02_hazard_models/21_rip_current/rip_current_model.md' },
  { label: 'Backcountry Model',  file: '02_hazard_models/22_backcountry/backcountry_model.md' },
  { label: 'Pandemic Model',     file: '02_hazard_models/24_pandemic/pandemic_model.md' },
];

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  // verify connection
  const status = await fetch(`${API.replace('/drive', '')}/status`);
  const { connected } = await status.json();
  if (!connected) { console.error('Google Drive not connected. Connect first in the dashboard.'); process.exit(1); }

  console.log('Creating folder structure...');
  const rootId = await createFolder('Beacon Reference Docs');
  const baseMapFolderId = await createFolder('Base Map Layers', rootId);
  const hazardFolderId = await createFolder('Hazard Models', rootId);

  console.log(`\nUploading ${baseMapDocs.length} base map docs...`);
  for (const doc of baseMapDocs) {
    const full = path.join(BASE, doc.file);
    if (!fs.existsSync(full)) { console.log(`  SKIP (not found): ${doc.file}`); continue; }
    await uploadFile(full, baseMapFolderId);
  }

  console.log(`\nUploading ${hazardDocs.length} hazard docs...`);
  for (const doc of hazardDocs) {
    const full = path.join(BASE, doc.file);
    if (!fs.existsSync(full)) { console.log(`  SKIP (not found): ${doc.file}`); continue; }
    await uploadFile(full, hazardFolderId);
  }

  console.log('\nDone! All docs uploaded to Google Drive under "Beacon Reference Docs".');
}

main().catch((e) => { console.error(e); process.exit(1); });
