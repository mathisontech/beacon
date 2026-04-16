# World Base Map — Global Processing Pipeline

**Data sources processed worldwide in a single pass, rather than region by region**

## Build Guide for Claude Code

---

### How to Use This Guide

Each step is scoped to be a single Claude Code session — small enough that Claude can hold the full context and you can verify the output before moving on.

**Rules for you:**

- **Don't skip steps.** Each step's verification catches problems before they compound. If you skip verification on Step 3 and Step 7 breaks, you'll waste time debugging the wrong thing.
- **One step per session.** Start a fresh Claude Code session for each step. Paste the step description and tell Claude to reference this doc and the relevant layer doc for specs. Long sessions accumulate context drift and Claude starts making assumptions.
- **Verify before proceeding.** Each step has a "Verify" line. Run that check yourself. If it fails, tell Claude what went wrong in the same session — don't start a new one for the fix.
- **Commit after each step.** Git commit when verification passes. If a future step breaks something, you can always revert to the last good state.

**Rules for Claude:**

- **Read the companion docs first.** Before writing any code for a step, read the relevant processor/layer doc and the overview doc for schemas and paths. Don't rely on memory.
- **Write small functions, not monoliths.** Every function should do one thing. If a function is longer than ~40 lines, it should be split.
- **No clever abstractions early.** Write straightforward code first. Refactor later if patterns emerge. Premature abstraction is the #1 way AI coding goes wrong.
- **Print progress.** Every script should print what it's doing as it does it. Silent scripts are undebuggable.
- **Handle errors explicitly.** Try/except with specific error messages. Never silently swallow exceptions.

---

## Phase 0: Proof of Concept on a Few Tiles

Everything runs locally. No S3, no database. The goal is to prove every core transformation works correctly on a small sample before scaling to ~26,000 tiles. These scripts will later be refactored into the real processors, so write them cleanly.

---

### Step 0.1 — Project skeleton + download a few Copernicus tiles

Set up the repo structure and download 4 adjacent tiles so we have test data for everything that follows.

**Ask Claude:** "Set up a Python project for Beacon's Atlas world base map module. Create the folder structure from the Overview doc (fetchers/, processors/, etc). Then write a script that downloads 4 adjacent Copernicus GLO-30 tiles (N45W090, N45W089, N44W090, N44W089) from the AWS open data bucket to a local raw/ folder. Use boto3 with no-sign-request. Print progress per tile."

**Delivers:** Repo skeleton. 4 GeoTIFF tiles in raw/copernicus_dem/.

**Verify:** Open one tile in QGIS or run `gdalinfo`. Confirm it's a valid DEM with elevation data.

> *If download fails: the bucket is copernicus-dem-30m. Tiles are at Copernicus_DSM_COG_10_N45_00_W090_00_DEM/. Have Claude check the exact path.*

---

### Step 0.2 — Standardize tiles + build VRT

Clean the 4 raw tiles into consistent format and build a VRT that lets GDAL treat them as one seamless raster.

**Ask Claude:** "Write a standardize function that takes a raw Copernicus tile and: reprojects to EPSG:4326, sets nodata to -9999, converts to Float32, compresses as Cloud-Optimized GeoTIFF with LZW. Process all 4 test tiles. Then build a VRT index over the outputs using gdalbuildvrt. Use rasterio or GDAL Python bindings."

**Delivers:** 4 standardized COGs in processed/copernicus_dem/dem/. 1 global.vrt file.

**Verify:** `gdalinfo` on each tile: CRS is EPSG:4326, type is Float32, nodata is -9999. `gdalinfo` on the VRT: extent covers all 4 tiles. Open VRT in QGIS — seamless, no gaps between tiles.

---

### Step 0.3 — Slope, aspect, hillshade from VRT

Compute all three terrain derivatives. Read from the VRT so tile-boundary calculations are correct.

**Ask Claude:** "Write functions to compute slope (degrees), aspect (0-360, flat=-1), and hillshade (azimuth 315, altitude 45) from a VRT. Process our 4-tile VRT into per-tile outputs. Use gdaldem or rasterio. Read from the VRT, write per-tile outputs."

**Delivers:** slope/, aspect/, hillshade/ folders each with 4 tiles + their own VRT.

**Verify:** Open slope in QGIS: flat areas ~0, mountains steep. Aspect: color by direction. Hillshade: looks like shaded relief. Check a tile boundary pixel in slope — should be smooth, not an artifact.

---

### Step 0.4 — Generate 2D map tiles + view in browser

Turn the hillshade into a slippy map tile pyramid. First time seeing data in a web browser.

**Ask Claude:** "Generate a PNG tile pyramid (z0-12) from the hillshade VRT using gdal2tiles. Then create a minimal HTML page that loads these tiles in MapLibre GL JS as a raster overlay on top of OpenStreetMap. Serve locally with python -m http.server."

**Delivers:** tiles/2d/{z}/{x}/{y}.png. index.html with MapLibre.

**Verify:** Open localhost:8000 in browser. See hillshade tiles. Pan and zoom. Tiles load at multiple zoom levels.

> *gdal2tiles can be slow. Limit to z0-12 for this test. Full z0-14 range is for production.*

---

## Phase 1: Infrastructure

Now we know the transformations work. This phase builds the surrounding infrastructure: S3 storage, config management, logging, and the database. By the end, raw data is on S3 and we can process it at scale.

---

### Step 1.1 — Config module + S3 bucket structure

Create the configuration system and the S3 bucket with all folders from the storage overview.

**Ask Claude:** "Create a config module (config.py or config.yaml + loader) for the world base map pipeline. It should define all S3 paths from the Overview doc (raw/, staging/, archive/, quarantine/, update_logs/, and live paths per source). Also write a setup script that creates the S3 bucket and all top-level folders. Include a current_versions dict tracking the latest version number per source."

**Delivers:** config.py. setup_s3.py. S3 bucket with folder skeleton.

**Verify:** `aws s3 ls s3://beacon-atlas/world_base_map/` shows all folders. Config paths match the Overview doc.

---

### Step 1.2 — Processing log + telemetry writer

Every processor and fetcher will use this to write structured logs. Build it once, reuse everywhere.

**Ask Claude:** "Create a log_writer module. Function: write_processing_log(processor_name, version, status, telemetry_dict) that writes a JSON file to the update_logs/ path in S3. Include: start_time, end_time, wall_clock_seconds, input_version, output_path, status (pass/fail), and an arbitrary telemetry dict for processor-specific metrics. Also a write_validation_log variant. Print a summary line to stdout when writing."

**Delivers:** log_writer.py with write_processing_log() and write_validation_log().

**Verify:** Call with dummy data. Read the JSON from S3. All fields present and correctly formatted.

---

### Step 1.3 — PostGIS database with all table schemas

Create all tables from the Overview doc. Empty tables, correct types, foreign keys.

**Ask Claude:** "Write a SQL migration script that creates all database tables from the Overview & Storage doc. That means: roads, volcanic_hazard_zones, tsunami_inundation_zones, landslide_runout_zones (live tables), volcanic_systems, volcanic_vents, streams, stream_cell_index, lakes, global_cells, population_cells, landslide_susceptibility (reference tables), and staging variants of each live table. Use the exact field definitions from the Overview doc. Include a migrate.py runner."

**Delivers:** migrations/001_create_tables.sql. migrate.py.

**Verify:** Run migration. `\dt` lists all tables. `\d+ roads` shows correct columns and types matching the Overview doc.

---

### Step 1.4 — Copernicus fetcher (production version)

Upgrade the test download script into the real fetcher with parallel downloads, checksums, manifest, and logging.

**Ask Claude:** "Build the production Copernicus fetcher at atlas/world_base_map/fetchers/copernicus/copernicus.py. Reference the Copernicus DEM Layer doc for exact specs. Parallel downloads (configurable workers), SHA-256 checksum verification per tile, retry up to 3x on failure, writes manifest.json listing all tiles + checksums, uses log_writer for the fetch log. Downloads to raw/copernicus_dem/v{NNN}/ on S3. Has a --dry-run flag that checks for new versions without downloading."

**Delivers:** copernicus.py. validate.py (checks tile count, checksums, file integrity). README.md.

**Verify:** Run with --dry-run first. Then download a small subset (--limit 100 tiles) to test the full flow. Manifest is written. Checksums pass. Fetch log has telemetry.

> *Full download is ~26,000 tiles, ~120 GB, ~8-12 hours. Don't do this until everything else is verified. Run overnight when ready.*

---

### Step 1.5 — Standardize processor (production version)

Upgrade the test standardize script into the real processor with parallel processing, VRT building, 2D/3D tile generation, and structured logging.

**Ask Claude:** "Build copernicus_dem_standardize at processors/copernicus_dem_standardize/. Reference the Copernicus DEM Layer doc. Reads raw tiles from S3, processes in parallel (reproject, nodata, Float32, COG), builds global VRT, generates 2D hillshade PNG tiles (z0-14, BTS-RASTER spec) and 3D quantized-mesh terrain tiles (z0-15, BTS-TERRAIN spec). All output goes to staging/. Per-tile success/failure logging. Uses log_writer for processing log with full telemetry."

**Delivers:** copernicus_dem_standardize.py. Processing log with telemetry.

**Verify:** Run against the 100-tile subset from Step 1.4. Staging has standardized tiles, VRT, 2D tiles, 3D tiles. Spot-check 5 tiles with gdalinfo.

> *Quantized-mesh generation is the hardest part. If Claude struggles with it, build everything else first and add terrain tiles as a separate sub-step.*

---

## Phase 2: Validation + Orchestration

Data flows from source to staging. Now add the safety net. Nothing goes live without automated validation, and the orchestrator is the only thing that promotes data.

---

### Step 2.1 — Standardize validator

The validate.py for the standardize processor. Tests every check from the Copernicus DEM Layer doc.

**Ask Claude:** "Build validate.py for copernicus_dem_standardize. Reference the validation checks in the Copernicus DEM Layer doc. Check: tile count matches raw, no 100% nodata tiles, elevation range -500m to 9000m, CRS EPSG:4326 on all tiles, COG validation, VRT opens with correct extent, spot-check Everest/Dead Sea elevations if tiles are available, 2D tile pyramid completeness, per-tile file sizes in expected range. Returns a structured result (pass/fail + per-check details). Writes validation log."

**Delivers:** validate.py that returns pass/fail with detailed check results.

**Verify:** Run against known-good staging — pass. Corrupt one tile (truncate it) — fail with clear error naming the bad tile.

---

### Step 2.2 — Promote, archive, and quarantine scripts

The three operations that move data between lifecycle stages. Only the orchestrator calls these.

**Ask Claude:** "Build three utility scripts. promote.py: copies staging to live path, ensures two most recent versions are in standard S3. archive.py: moves superseded version to archive/ with correct Glacier Deep Archive storage class. quarantine.py: moves failed staging to quarantine/{processor}/v{NNN}_{timestamp}/ with the validation log. All three use config for paths and log their actions."

**Delivers:** promote.py, archive.py, quarantine.py.

**Verify:** Promote staging — live path exists. Archive old version — shows in archive/ with Glacier class. Quarantine — appears in quarantine/ with timestamp.

---

### Step 2.3 — Orchestrator

Runs the pipeline: processor -> validator -> promote or quarantine. Manual trigger for now.

**Ask Claude:** "Build orchestrate.py. Takes --processor and --version arguments. Flow: calls the processor, waits for exit. On processor success: runs validate.py from the processor's folder. On validation pass: runs promote, then archive for the previous version. On validation fail: runs quarantine, prints alert to console. Writes a run summary log. The processor never touches live data — it only writes to staging. The orchestrator is the only thing that promotes."

**Delivers:** orchestrate.py that enforces the staging gate.

**Verify:** Run for copernicus_dem_standardize with good data — promoted. Introduce a bug — quarantined. Live data is never corrupted by a failed run.

---

### Step 2.4 — Derivative processors (slope, aspect, hillshade)

Build all three as production processors with validators.

**Ask Claude:** "Build copernicus_dem_slope, copernicus_dem_aspect, and copernicus_dem_hillshade processors. Each reads from the live DEM VRT, writes per-tile outputs to staging, includes validate.py with checks from the Copernicus DEM Layer doc. Use the same structure as standardize: parallel processing, per-tile logging, log_writer telemetry. Build hillshade VRT in the hillshade processor."

**Delivers:** 3 processor folders, each with script + validator + README.

**Verify:** Run each through the orchestrator. All pass validation. Spot-check outputs in QGIS.

---

### Step 2.5 — HAND processor

Per-basin processing. Different pattern from the per-tile processors.

**Ask Claude:** "Build hydrosheds_hand processor. Reference the HydroSHEDS Layer doc. Reads from live DEM VRT, processes per HydroBASINS level 4-6 basin: breach depressions, D8 flow accumulation, compute HAND. Per-basin logging including peak memory (flag >50 GB). Include validate.py checking: all HAND >= 0, basin count matches expected, stream density reasonable."

**Delivers:** hydrosheds_hand processor folder with script + validator.

**Verify:** Run through orchestrator. Open a known floodplain (Mississippi River) — HAND values near the river should be low (0-5m).

> *Large basins need 20-50 GB RAM. Test on small basins first. Have Claude add a --basin-filter argument for testing.*

---

## Phase 3: Remaining Layers

The hard part is done. Each remaining layer follows the fetcher -> processor -> validator -> orchestrator pattern. These can be built in any order.

---

### Step 3.1 — Sentinel-2 fetcher + satellite tile processor

**Ask Claude:** "Build the Sentinel-2 fetcher and sentinel2_satellite processor per the Sentinel-2 Layer doc. Fetcher downloads cloudless mosaic, processor generates JPEG tiles (BTS-IMAGERY: 256x256, RGB, quality 85, z0-14). Both with validators."

**Delivers:** Fetcher + processor + validators for Sentinel-2.

**Verify:** Satellite tiles visible in MapLibre. Zoom through levels. No black tiles. Landmarks recognizable.

---

### Step 3.2 — OSM fetcher + road topology processor

**Ask Claude:** "Build the OSM fetcher (downloads continent PBFs from Geofabrik) and osm_road_topology processor per the OpenStreetMap Layer doc. Processor imports into PostGIS staging, classifies highway tags, infers surface types, builds routable graph with pgr_createTopology. Validator checks connected graph, node integrity, segment counts."

**Delivers:** Fetcher + processor + validators for OSM.

**Verify:** Query a route between two cities using pgRouting on the roads table. It works. highway_class and surface fields populated.

---

### Step 3.3 — Volcanic processors (pyroclastic + lahar)

**Ask Claude:** "Build volcanic_pyroclastic and volcanic_lahar processors per the Volcanic Hazard Layer doc. Pyroclastic: energy cone per vent per scenario. Lahar: corridor modeling for glaciated/crater lake volcanoes. Both write to volcanic_hazard_zones staging table, swap through orchestrator."

**Delivers:** 2 processor folders with scripts + validators.

**Verify:** Query volcanic_hazard_zones. Every vent has 3 pyroclastic scenarios. Lahar corridors only for glaciated/crater lake volcanoes. Zones follow terrain in QGIS.

> *Need reference data in volcanic_systems and volcanic_vents tables first. Have Claude populate from GVP or a seed dataset before running.*

---

### Step 3.4 — Coastal tsunami processor

**Ask Claude:** "Build coastal_tsunami processor per the Coastal & Tsunami Layer doc. Flood-fill from coastal cells at 2m/5m/10m/20m wave heights. Calculate area, inland penetration, population exposed. Write to tsunami_inundation_zones staging table."

**Delivers:** Processor + validator.

**Verify:** Higher waves >= lower wave zones. Bangladesh 5m inundation looks geographically reasonable. population_exposed non-zero for populated coasts.

> *Need global_cells with is_coastal flags and population_cells populated first.*

---

### Step 3.5 — Landslide processor

**Ask Claude:** "Build copernicus_dem_landslide processor per the Copernicus DEM Layer doc. Traces debris runout from high/very-high susceptibility zones using angle-of-reach. Flags secondary hazards (debris dam, coast tsunami, lake wave). Write to landslide_runout_zones staging table."

**Delivers:** Processor + validator.

**Verify:** Runout paths trace downhill. Secondary hazard flags reference real streams/lakes/coast. No paths going uphill.

> *Need landslide_susceptibility, streams, lakes, and global_cells populated first.*

---

## Phase 4: Tile Serving + Map Pages

All data is processed and live. Now serve it to the frontend per the Beacon Tile Standards doc.

---

### Step 4.1 — CloudFront distribution for raster tiles

**Ask Claude:** "Set up a CloudFront distribution serving pre-rendered tile pyramids from S3. Configure Content-Type headers: image/png for hillshade (BTS-RASTER), image/jpeg for satellite (BTS-IMAGERY), application/vnd.quantized-mesh with Content-Encoding: gzip for terrain (BTS-TERRAIN). Set up CORS. Write a test script that fetches one tile from each endpoint and confirms headers."

**Delivers:** CloudFront distribution. Test script confirming headers.

**Verify:** curl a tile URL. Correct Content-Type. Correct CORS. Valid tile data.

---

### Step 4.2 — pg_tileserv for vector tiles

**Ask Claude:** "Install and configure pg_tileserv pointing at the PostGIS live tables. Set up endpoints: roads as BTS-VECTOR-ROAD (with zoom-level highway_class filtering), hazard zones as BTS-VECTOR-HAZARD. Configure connection pooling and CORS."

**Delivers:** pg_tileserv with endpoints for roads, volcanic zones, tsunami zones, landslide zones.

**Verify:** Open pg_tileserv preview UI. See roads. See hazard zones. Click features — properties in popup.

---

### Step 4.3 — MapLibre 2D map page

**Ask Claude:** "Build an HTML page compositing all layers in MapLibre GL JS v4.x per the Beacon Tile Standards doc. Satellite base (BTS-IMAGERY), hillshade overlay in multiply blend (BTS-RASTER), roads styled by highway_class (BTS-VECTOR-ROAD), hazard zones colored by type with graduated tsunami opacity (BTS-VECTOR-HAZARD). Layer toggle panel. Click popups."

**Delivers:** index.html with complete 2D map.

**Verify:** Toggle each layer. Zoom global to street. Click road — see class/surface. Click hazard zone — see scenario/area.

---

### Step 4.4 — CesiumJS 3D globe page

**Ask Claude:** "Build an HTML page with CesiumJS v1.119+. Terrain from BTS-TERRAIN via CloudFront. Satellite draped on terrain. Hazard zone polygons clamped to terrain (GeoJSON from PostGIS). Road polylines clamped to terrain."

**Delivers:** globe.html with 3D view.

**Verify:** Tilt the globe. Mountains have depth. Hazard zones follow ground. Roads follow terrain. Zoom into a volcano — pyroclastic zones visible.

---

## Phase 5: Full Pipeline Automation

Everything works manually. Now automate.

---

### Step 5.1 — Scheduled fetcher checks

**Ask Claude:** "Add cron or EventBridge scheduled triggers for each fetcher. Copernicus: monthly. Sentinel-2: quarterly. OSM: monthly. Each logs the check and exits if no update. On new data: triggers orchestrator. Include a --force flag."

**Delivers:** Scheduled triggers. Check logs.

**Verify:** Check logs after scheduled run. "No update" logged when nothing's new.

---

### Step 5.2 — Full pipeline orchestrator

**Ask Claude:** "Upgrade orchestrate.py to run all four phases from the Overview doc. Phase 1: standardize. Phase 2: slope + aspect + hillshade + HAND (parallel). Phase 3: sentinel2 + osm (parallel). Phase 4: pyroclastic + lahar + tsunami + landslide (parallel). If any processor fails, downstream phases don't run."

**Delivers:** Full pipeline with phase dependencies.

**Verify:** Full run. All phases complete. All validators pass. Live data updated.

---

### Step 5.3 — Alerting on failure

**Ask Claude:** "Add Slack or email notifications on: validation failure (with which checks failed), quarantine events, pipeline completion summary. Include processing log URL in alert."

**Delivers:** Alert integration.

**Verify:** Break a validator deliberately. Alert arrives with useful detail.

---

## Step Summary

**Phase 0: Proof of Concept (4 steps)** — Local only. Prove every transformation works on test tiles.

| Step | What |
|------|------|
| 0.1 | Project skeleton + download test tiles |
| 0.2 | Standardize tiles + build VRT |
| 0.3 | Slope, aspect, hillshade from VRT |
| 0.4 | Generate 2D map tiles + view in browser |

**Phase 1: Infrastructure (5 steps)** — S3, config, logging, database, production fetcher and standardize.

| Step | What |
|------|------|
| 1.1 | Config module + S3 bucket structure |
| 1.2 | Processing log + telemetry writer |
| 1.3 | PostGIS database with all table schemas |
| 1.4 | Copernicus fetcher (production) |
| 1.5 | Standardize processor (production) |

**Phase 2: Validation + Orchestration (5 steps)** — Validators, promotion scripts, orchestrator.

| Step | What |
|------|------|
| 2.1 | Standardize validator |
| 2.2 | Promote, archive, quarantine scripts |
| 2.3 | Orchestrator |
| 2.4 | Derivative processors (slope, aspect, hillshade) |
| 2.5 | HAND processor |

**Phase 3: Remaining Layers (5 steps)** — Each follows the established pattern.

| Step | What |
|------|------|
| 3.1 | Sentinel-2 fetcher + satellite tiles |
| 3.2 | OSM fetcher + road topology |
| 3.3 | Volcanic (pyroclastic + lahar) |
| 3.4 | Coastal tsunami |
| 3.5 | Landslide |

**Phase 4: Tile Serving + Frontend (4 steps)** — CloudFront, pg_tileserv, MapLibre 2D, CesiumJS 3D.

| Step | What |
|------|------|
| 4.1 | CloudFront for raster tiles |
| 4.2 | pg_tileserv for vector tiles |
| 4.3 | MapLibre 2D map page |
| 4.4 | CesiumJS 3D globe |

**Phase 5: Automation (3 steps)** — Scheduling, full pipeline, alerting.

| Step | What |
|------|------|
| 5.1 | Scheduled fetcher checks |
| 5.2 | Full pipeline orchestrator |
| 5.3 | Alerting |

**22 steps total.** Each step is one Claude Code session. Each step has a verification check. Each step gets a git commit.

**To start:** Open Claude Code and say "Read the Global Pipeline development plan. I want to start Step 0.1. Also read the Overview doc and the Copernicus DEM Layer doc for reference."
