# Beacon Icon Manager — Layered Claude Code Prompt Plan

A sequential, round-by-round set of prompts to paste into Claude Code terminal sessions. Each round assumes prior rounds are complete. Keep files short, descriptively named, one function per file where reasonable. No decorative icons in code or logs. Terse output.

---

## HOW TO USE THIS

**Repo:** `beacon-monorepo` — an npm-workspaces monorepo with `apps/*` (beacon-client, beacon-dev, design_system) and `packages/*` (base-map, data-sources, event-engine, ui-primitives). The icon manager will live in a new workspace package: `packages/visualization-manager`.

**Where to open your first Claude Code terminal:**
```
cd /path/to/beacon
claude
```
Open the terminal at the **monorepo root** (the folder that contains `package.json` with `"name": "beacon-monorepo"` and the `workspaces` array). Not inside `packages/`, not inside `apps/`. Root. Every prompt below assumes that working directory.

**Preamble to paste before Prompt 1.1 (once, in your first window):**
> You are working in the beacon-monorepo root. It uses npm workspaces with `apps/*` and `packages/*`. You will create a new workspace package at `packages/visualization-manager` that contains an icon-manager module under `packages/visualization-manager/icon-manager/`. Use TypeScript. One function per file. Descriptive file names. No decorative icons in code, comments, or logs. Keep log and status output to the minimum words required. Do not edit files outside `packages/visualization-manager/` unless a prompt explicitly tells you to. After each prompt, print only the list of files created or changed — no summary, no explanation. If a prompt would produce more than ~250 lines across files, stop and ask me to split it. Before writing code for a category, re-read `packages/visualization-manager/icon-manager/TAXONOMY.md` so every icon id matches.

**Then paste Prompt 1.1.**

**Order:** do rounds 1 and 2 in one window, sequentially. After round 2 commits, round 3's 35 sub-rounds can be split across 4–6 parallel windows (each scoped to one category folder — see Parallelization Guide at the bottom). Rounds 4–7 go back to one window. Rounds 8–11 can parallelize in pieces.

**Per-window scoping preamble (paste at top of every parallel window):**
> Only create or modify files inside the exact folder I name in this prompt. Do not edit any `index.ts`, `registerAll.ts`, or app-level files outside that folder. I will wire things up in a later serial step.

---

## Round 1 — Foundation: taxonomy, schema, directory scaffolding — [W1, DONE]

### Prompt 1.1 — Taxonomy document
Create `packages/visualization-manager/icon-manager/TAXONOMY.md`. Organize the full category tree under two top-level branches:

**A. BASE MAP (static location / static features — do not decay, rarely severity-scaled)**
- ems-facilities (police, fire-station, hospital, ems-station, clinic)
- populations (general, at-risk-populations, elderly-concentration, school-age-concentration, medically-dependent)
- buildings
  - building-purpose (residential, commercial, industrial, government, critical-infrastructure, place-of-worship)
  - shelter-status-by-type (general-pop-shelter, medical-needs-shelter, pet-friendly-shelter, cooling, warming, reunification) — each with status open/full/closed/standby
  - building-collapse-risk (tiered 1..5)
- utilities-infrastructure (power-substation, water-treatment, lift-station, gas-regulator, comms-tower, fuel-depot)
- bridge-collapse-risk (tiered 1..5)
- hydrology (river, stream, lake, reservoir, dam, levee, flood-control-channel)
- terrain (static terrain markers)
- volcano-locations
- fault-line-locations
- vegetation (fuel types relevant to wildfire)
- passable-terrain (trails, unpaved access, 4wd-only)
- animal-populations (horse, livestock, kennel, stable, wildlife-refuge)
- elevation (high-ground-marker, evacuation-high-ground-site)
- schools (static locations)
- facilities-other (police-station, fire-station is under ems, airport, port, rail-yard)

**B. HAZARD CONDITIONS (dynamic — severity-scalable and/or age-decay-applicable)**
- risk-level (pre-event tiered 1..5 per hazard)
- event-ongoing (active-fire, active-flood, active-shaking, active-eruption, active-wind, active-surge)
- post-disaster-condition (damage-reports tiered, structure-damaged, structure-destroyed, debris-field)
- road-conditions (passable, slow, impassable, flooded-road, iced, rockslide)
- road-blocks with nature subtypes (tree-down, flooded, collapsed, debris, active-fire, official-closure, locked-gate)
- utility-status (power-out, power-restored, water-unsafe, gas-leak, comms-down)
- utilities-crews (crew-deployed, crew-en-route, crew-on-scene)
- user-status (evacuating-moving, evacuating-stuck, sheltering-in-place, stuck-need-rescue-URGENT, safe-checked-in)
- demographic-need (elderly-assistance, mobility-impaired, child-alone, pet-rescue)
- infrastructure-needs (diapers, meds, blood-request, water, formula, oxygen, generator-fuel)
- mutual-aid (offering-help, requesting-help, resource-available, resource-needed)
- task-management (task-open, task-claimed, task-in-progress, task-complete, task-verified)
- vehicles (personal-vehicle, transport-bus, ambulance, fire-apparatus, utility-truck, helicopter, boat)
- shelter-dynamic-status (shelter-open, shelter-full, shelter-closing) — the live status overlay on the base-map shelter
- bridge-condition (live) (bridge-closed, bridge-damaged, bridge-monitored)
- hazard-path-mapping (projected-path-cone, projected-impact-building, confirmed-impact-building, category-tier e.g. hurricane-cat-1..5, tornado-ef-0..5) — projected vs confirmed must be visually distinct
- hazard-spottings (flames, embers, explosion, tornado, funnel-cloud, smoke-plume, lahar, rockfall, lightning-strike, storm-surge-visible)
- weather-conditions (rain-light/moderate/heavy, snow-light/moderate/heavy, hail, sleet, fog, high-wind, calm)
- visibility (good, reduced, poor, zero)
- ski-conditions (fresh-powder, packed, icy, slush, closed-run, avalanche-risk-tiered)
- fun-spottings (loch-ness, ufo, bigfoot, rainbow, double-rainbow) — system-flagged non-operational, never affect routing
- evacuation-meeting-points (preset-assembly-point, muster-point, family-reunification-point, bus-pickup, helicopter-lz)

**C. COLLABORATION (user-to-user — severity-scalable where counts matter, age-decay-applicable)**
- resource-ownership (skill-medical, skill-search-rescue, skill-ham-radio, skill-chainsaw, cert-cpr, cert-emt, cert-wilderness-first-aid, equip-tractor, equip-excavator, equip-4wd, equip-snow-tires, equip-chainsaw, equip-generator, equip-starlink, equip-boat, equip-atv, equip-horse-trailer) — user self-reports ownership/skill
- verified-neighbor-status (neighbor-safe, neighbor-unreachable, neighbor-needs-check, neighbor-verified-by)
- resource-sharing-offering (offering-shelter, offering-transport, offering-water, offering-food, offering-power, offering-childcare, offering-pet-care, offering-medical-skill)
- resource-sharing-requesting (mirror of offering list)
- user-status-report (evacuating, evacuated, sheltering, helping-neighbor, returning-home, safe) — social/status, distinct from the operational user-status in hazard-conditions
- user-condition-report (injured-minor, injured-serious, medical-emergency, well, out-of-supplies, low-battery, no-comms)
- map-layer-legend (symbols that only appear in legends)

For each leaf, list: id (kebab-case), display name, one-sentence purpose, branch (base-map | hazard-conditions), severity-scalable (y/n), age-decay-applicable (y/n), user-placeable vs system-only, whether the icon has a base-map counterpart it overlays (e.g. shelter-dynamic-status overlays shelter building). Keep under 300 lines. No prose beyond what's listed.

### Prompt 1.2 — Directory scaffold
Create this exact tree under `packages/visualization-manager/icon-manager/`:
```
src/
  registry/
  categories/
  severity/
  age-decay/
  rendering/
  validation/
  preview/
  types/
assets/
  svg/
tests/
```
Add an empty `index.ts` in each `src/*` subfolder that re-exports from its siblings. Add a root `index.ts` that re-exports registry, categories, severity, age-decay. No logic yet.

### Prompt 1.3 — Core types
In `src/types/` create one file per type, each exporting one type:
- `IconId.ts` — string brand
- `IconCategory.ts` — union of category ids from TAXONOMY.md
- `SeverityLevel.ts` — 1..5
- `AgeBucket.ts` — `fresh | recent | aging | stale | expired`
- `IconDefinition.ts` — id, category, svgPath, severityScalable, ageDecayApplicable, userPlaceable, legendLabel
- `IconInstance.ts` — iconId, lat, lon, severity?, reportedAt, reporterId?, notes?
Root `types/index.ts` re-exports all.

---

## Round 2 — Registry & asset loader — [W1, DONE]

### Prompt 2.1 — Registry
In `src/registry/` create:
- `createRegistry.ts` — returns `{ register, get, getAll, getByCategory }`
- `registerIcon.ts` — validates definition, stores it
- `getIcon.ts`, `getAllIcons.ts`, `getByCategory.ts` — one function each
- `registryErrors.ts` — `DuplicateIconId`, `UnknownIconId`
One function per file. No classes. Pure functions over a closed-over Map.

### Prompt 2.2 — SVG loader
In `src/rendering/` create:
- `loadSvg.ts` — reads from `assets/svg/<id>.svg`, returns raw string
- `svgToDataUri.ts`
- `svgCache.ts` — memoized loader
- `resolveIconAsset.ts` — given IconId + severity + ageBucket, returns final SVG string (composition applied later)

### Prompt 2.3 — Validation
In `src/validation/` create:
- `validateIconDefinition.ts` — required fields, id format
- `validateIconInstance.ts` — lat/lon bounds, severity in range, reportedAt not future
- `validateAssetExists.ts` — confirms SVG file present for every registered icon
Return `{ok: true}` or `{ok: false, errors: string[]}`.

---

## Round 3 — Category modules (parallel across 5 windows)

**Window plan.** You now open five additional Claude Code windows alongside your existing main window (**W1**). Each new window is pinned to a lane of categories and never edits anything outside its lane. W1 stays serial — it does not run any category prompts; it only runs the wiring step at the end of this round and continues with rounds 4+.

- **W1** — main/wiring (existing window, already used for rounds 1–2)
- **W2** — base-map: facilities & buildings (7 sub-rounds)
- **W3** — base-map: environment (5 sub-rounds)
- **W4** — hazard: core (7 sub-rounds)
- **W5** — hazard: ops (8 sub-rounds)
- **W6** — collaboration + extras (8 sub-rounds)

**FIRST-USE PREAMBLE — paste this ONCE at the top of each NEW window (W2–W6) before anything else:**

> You are working in the beacon-monorepo root. The repo uses npm workspaces with `apps/*` and `packages/*`. Rounds 1 and 2 of the icon manager at `packages/visualization-manager/icon-manager/` are already complete and typechecked. Use TypeScript. One function per file. Descriptive file names. No decorative icons in code, comments, or logs. Keep output to the minimum words required. After each prompt, print only the list of files created or changed — no summary, no explanation. Before writing icons for a category, read `packages/visualization-manager/icon-manager/TAXONOMY.md` and use the exact ids listed there. An `IconDefinition` requires: id, category, svgPath, severityScalable, ageDecayApplicable, userPlaceable, legendLabel, branch, baseMapCounterpart?. Import types from `../../../types` and the registry from `../../../registry`. **Scope rule — this window only edits files inside the category folders I name in each prompt, plus new SVGs under `packages/visualization-manager/icon-manager/assets/svg/`. Never edit any file outside those paths. Never edit any root `index.ts`, any `registerAll.ts`, any `tsconfig.json`, or anything in another category's folder.** If a prompt would touch a file outside scope, stop and report instead of editing. Do not run `git` commands.

**Per-sub-round prompt template** (each window uses the same shape, substituting the category name and folder):

> Sub-round: **<CATEGORY>** (branch: **<BRANCH>**). Re-read TAXONOMY.md to confirm the exact leaf ids for this category. In `packages/visualization-manager/icon-manager/src/categories/<BRANCH>/<CATEGORY>/`:
> - Create one `.ts` file per leaf id, each exporting a single `IconDefinition` that matches the TAXONOMY entry exactly (including branch and any baseMapCounterpart).
> - Create `index.ts` exporting an array `<category>Definitions` of all the definitions.
> - Create `register<Category>.ts` that takes a registry and registers each definition.
>
> Generate placeholder SVGs for any leaf id that does not yet have one at `packages/visualization-manager/icon-manager/assets/svg/<id>.svg` — flat, single-color (black fill on transparent), 24x24 viewBox, no gradients, clear silhouettes. Do not overwrite SVGs that already exist.
>
> After writing, run `npx tsc --noEmit -p packages/visualization-manager` from the repo root and report PASS/FAIL only. Print the list of files created. Do nothing else.

**Per-sub-round check prompt** (paste in the same window after the sub-round finishes):

> Quick check for the last sub-round. Do not modify any files. Report PASS/FAIL with one-line reasons:
> 1. Every leaf id for this category from TAXONOMY.md has a `.ts` file in its category folder.
> 2. Every `.ts` file in the folder exports exactly one `IconDefinition`.
> 3. Every definition's `branch` field matches the branch in the folder path.
> 4. Every definition's `category` field is a member of the `IconCategory` union.
> 5. Every id referenced has a corresponding `<id>.svg` in `assets/svg/`.
> 6. `register<Category>.ts` registers every id in the `index.ts` array.
> 7. `npx tsc --noEmit -p packages/visualization-manager` exits 0.

---

### W2 — base-map: facilities & buildings (7 sub-rounds)

All sub-rounds in this window use branch `base-map`. Run them in order. Category folder pattern: `src/categories/base-map/<category>/`.

3.W2.1 — `ems-facilities`
3.W2.2 — `schools-and-facilities-other` (combine schools + facilities-other into one folder; definitions for both)
3.W2.3 — `buildings` (building-purpose + building-collapse-risk leaves)
3.W2.4 — `shelters` (shelter-type static locations only — no live status here)
3.W2.5 — `utilities-infrastructure`
3.W2.6 — `bridges` (static bridge markers + bridge-collapse-risk)
3.W2.7 — `populations-and-at-risk` (populations + at-risk-populations leaves)

### W3 — base-map: environment (5 sub-rounds)

All branch `base-map`. Folder pattern: `src/categories/base-map/<category>/`.

3.W3.1 — `hydrology`
3.W3.2 — `terrain-and-access` (terrain + passable-terrain + elevation)
3.W3.3 — `volcanoes-and-faults` (volcano-locations + fault-line-locations)
3.W3.4 — `vegetation`
3.W3.5 — `animal-populations` (horse, livestock, stable, kennel, wildlife-refuge)

### W4 — hazard: core (7 sub-rounds)

All branch `hazard-conditions`. Folder pattern: `src/categories/hazard-conditions/<category>/`.

3.W4.1 — `risk-level`
3.W4.2 — `event-ongoing`
3.W4.3 — `post-disaster-condition`
3.W4.4 — `hazard-path-mapping` (projected-path-cone, projected-impact-building, confirmed-impact-building, hurricane-cat-1..5, tornado-ef-0..5 — projected vs confirmed visually distinct)
3.W4.5 — `hazard-spottings` (flames, embers, explosion, tornado, funnel-cloud, smoke-plume, lahar, rockfall, lightning-strike, storm-surge-visible)
3.W4.6 — `weather-and-visibility` (weather-conditions + visibility)
3.W4.7 — `ski-conditions`

### W5 — hazard: ops (8 sub-rounds)

All branch `hazard-conditions`. Folder pattern: `src/categories/hazard-conditions/<category>/`.

3.W5.1 — `user-status` (evacuating-moving, evacuating-stuck, sheltering-in-place, stuck-need-rescue-URGENT, safe-checked-in) — ensure `stuck-need-rescue-URGENT` has `isUrgent: true` and zIndex hint.
3.W5.2 — `road-conditions-and-blocks` (road-conditions leaves + road-blocks leaves incl. tree-down, flooded, collapsed, debris, active-fire, official-closure, locked-gate)
3.W5.3 — `utility-status-and-crews` (utility-status + utilities-crews)
3.W5.4 — `live-overlays` (shelter-dynamic-status + bridge-condition — set baseMapCounterpart fields)
3.W5.5 — `vehicles`
3.W5.6 — `evacuation-meeting-points`
3.W5.7 — `infrastructure-needs`
3.W5.8 — `demographic-need`

### W6 — collaboration + extras (8 sub-rounds)

Branch `hazard-conditions` for the first two; branch `collaboration` for the rest; `map-layer-legend` branch stays `hazard-conditions` (or its own branch if TAXONOMY lists it that way).

3.W6.1 — `mutual-aid-and-tasks` (mutual-aid + task-management) — branch: hazard-conditions
3.W6.2 — `fun-spottings` — branch: hazard-conditions (must set `operational: false` flag or equivalent)
3.W6.3 — `resource-ownership` — branch: collaboration
3.W6.4 — `resource-sharing-offering` — branch: collaboration
3.W6.5 — `resource-sharing-requesting` — branch: collaboration
3.W6.6 — `verified-neighbor-status` — branch: collaboration
3.W6.7 — `user-status-and-condition-reports` (user-status-report + user-condition-report; injured-serious and medical-emergency flagged urgent) — branch: collaboration
3.W6.8 — `map-layer-legend` — use branch from TAXONOMY

---

### Prompt 3.WIRE — [Window W1, serial, AFTER all W2–W6 sub-rounds finish and commit]

Paste in W1:

> Wire all category registrations. Create `packages/visualization-manager/icon-manager/src/categories/registerAll.ts` that imports every `register<Category>` function from every category folder under `src/categories/base-map/`, `src/categories/hazard-conditions/`, and `src/categories/collaboration/`, and calls each with a passed-in registry. Also update `src/categories/index.ts` to re-export `registerAll` and every category's `index.ts` contents. Do not modify any files inside individual category folders. After, run `npx tsc --noEmit -p packages/visualization-manager` and report PASS/FAIL. Print the list of files changed.

### Prompt 3.WIRE-CHECK — [W1]

> Verify the wiring. Do not modify files. Report PASS/FAIL:
> 1. `registerAll.ts` imports from every subfolder under `src/categories/base-map/`, `src/categories/hazard-conditions/`, and `src/categories/collaboration/`.
> 2. Calling `registerAll(registry)` with an empty registry results in a registry whose `getAllIcons()` length equals the number of leaf ids in TAXONOMY.md.
> 3. No duplicate ids across all categories (collect all ids and check uniqueness).
> 4. `npx tsc --noEmit -p packages/visualization-manager` exits 0.

### Prompt 3.URGENT — [W1]

> Create `src/categories/urgent/getUrgentIcons.ts` that queries the registry and returns all icons whose definition has `isUrgent: true` OR whose id is one of: `stuck-need-rescue-URGENT`, `injured-serious`, `medical-emergency`. Export from `src/categories/urgent/index.ts`. Add the re-export to the root `index.ts`. Report files changed.

---

## Round 4 — Severity scaling system — [W1, serial]

### Prompt 4.1 — Severity rules  [W1]
In `src/severity/` create:
- `SeverityStrategy.ts` — type: `repeat | stack | size | color-ramp`
- `getSeverityStrategy.ts` — given IconCategory, returns strategy
- `applyRepeat.ts` — renders N copies of the base SVG horizontally within a bounded cluster glyph
- `applyStack.ts` — vertical stack variant
- `applySize.ts` — scales 1.0..1.6 across severity 1..5
- `applyColorRamp.ts` — tints from neutral to alarm red
- `composeSeveritySvg.ts` — dispatcher: picks strategy, returns final SVG string
Default strategy: `repeat` for countable things (people-needing-X, road-blocks), `size` for single-point facilities, `color-ramp` for risk-level.

### Prompt 4.2 — Severity tests  [W1]
In `tests/severity/` add one test file per strategy. Verify: severity 1 returns base glyph unchanged; severity 5 produces the maximum transformation; invalid severity throws.

### Prompt 4.CHECK  [W1]
> Verify Round 4. Do not modify files. Report PASS/FAIL: (1) all six severity files exist in `src/severity/`; (2) `composeSeveritySvg` dispatches on strategy; (3) `getSeverityStrategy` returns a valid `SeverityStrategy` for every `IconCategory` union member; (4) `npx tsc --noEmit -p packages/visualization-manager` exits 0; (5) severity tests pass.

---

## Round 5 — Age decay system — [W1, serial]

### Prompt 5.1 — Age buckets  [W1]
In `src/age-decay/` create:
- `ageBuckets.ts` — thresholds: fresh <15min, recent <1h, aging <6h, stale <24h, expired >=24h. Export `getAgeBucket(reportedAt, now)`.
- `ageOpacity.ts` — maps bucket to opacity 1.0, 0.85, 0.65, 0.45, 0.25
- `ageDesaturate.ts` — maps bucket to desaturation 0..0.8
- `applyAgeDecay.ts` — mutates SVG string with opacity + desaturation filter
- `shouldHideExpired.ts` — category-level policy (urgent never hides; facilities never decay; reports always decay)

### Prompt 5.2 — Per-category policy  [W1]
In `src/age-decay/policy.ts`, map each IconCategory to `{decay: boolean, hideOnExpire: boolean}`. Rule: every `base-map/*` category defaults to `{decay:false, hideOnExpire:false}` — static features never decay. Every `hazard-conditions/*` category defaults to `{decay:true, hideOnExpire:true}` except urgent (stuck-need-rescue) which is `{decay:false, hideOnExpire:false}`. Live overlays (shelter-dynamic-status, bridge-condition, utility-status) decay but do not hide — stale live-status must remain visible as stale rather than disappear. Hazard-path-mapping: projected paths decay on forecast-update cadence (override default), confirmed impacts decay slowly and never auto-hide. Hazard-spottings, weather-conditions, visibility, ski-conditions: decay fast (fresh <5min, expired >=2h). User-condition-report (injured-serious, medical-emergency): treat as urgent — no decay, no hide. Fun-spottings: decay normally but are excluded from any operational layer and only render when the user toggles them on. Collaboration/resource-ownership: decay slow (fresh <24h, expired >=30d) since skills/equipment ownership is durable. Map-layer-legend: no decay.

---

### Prompt 5.CHECK  [W1]
> Verify Round 5. Report PASS/FAIL: (1) all age-decay files exist; (2) `policy.ts` has an entry for every `IconCategory`; (3) base-map entries have `decay:false`; (4) urgent entries have `decay:false, hideOnExpire:false`; (5) live overlays have `decay:true, hideOnExpire:false`; (6) typecheck exits 0.

---

## Round 6 — Final composition pipeline — [W1, serial]

### Prompt 6.1 — Composer  [W1]
In `src/rendering/composeIconSvg.ts` implement the single entry point:
```
composeIconSvg({iconId, severity?, reportedAt?, now?}) -> string
```
Order: load base SVG → applySeverity (if applicable) → applyAgeDecay (if applicable) → return string. One function, delegates to helpers.

### Prompt 6.2 — Map-ready output  [W1]
In `src/rendering/composeIconMarker.ts` return `{svg, anchor:[x,y], size:[w,h], zIndex}` suitable for handing to the map layer. Urgent gets zIndex 1000.

### Prompt 6.CHECK  [W1]
> Verify Round 6. Report PASS/FAIL: (1) `composeIconSvg` and `composeIconMarker` exist; (2) composer order is loadSvg → severity → age-decay; (3) urgent markers return zIndex 1000; (4) typecheck exits 0; (5) calling `composeIconMarker` on 5 random registered ids returns valid shapes.

---

## Round 7 — Preview / Icon Manager UI inside Visualization Manager — [W1, serial]

### Prompt 7.1 — Preview data  [W1]
In `src/preview/` create:
- `buildPreviewMatrix.ts` — for every registered icon, returns rows of {iconId, severityVariants:[1..5 rendered SVGs], ageVariants:[bucket→rendered SVG]}
- `buildCategoryPreview.ts` — grouped by category
No UI yet. Pure data.

### Prompt 7.2 — UI shell  [W1]
In the existing Visualization Manager app (find it under `apps/` or `packages/`), add an `IconManagerPanel` route/tab. Three views: by-category, by-severity-matrix, by-age-matrix. Each cell shows the rendered SVG, id, and a toggle to enable/disable that icon. Keep the component under 150 lines; extract cells and grid into sibling components.

### Prompt 7.3 — Approval state  [W1]
Add a `src/preview/approvalState.ts` with `approve(iconId)`, `reject(iconId, reason)`, `listPending()`. Persist to local JSON at `packages/visualization-manager/icon-manager/state/approvals.json`. This is how I signal which icons I accept.

### Prompt 7.4 — Swap workflow  [W1]
In the Icon Manager UI, each icon cell has a "replace SVG" button that lets me drop a new file into `assets/svg/<id>.svg` and live-reload the preview matrix. Document in `REPLACING_ICONS.md`.

### Prompt 7.CHECK  [W1]
> Verify Round 7. Report PASS/FAIL: (1) preview data builders exist and compile; (2) IconManagerPanel route/tab is reachable in the running app; (3) approvalState reads/writes `state/approvals.json`; (4) replace-SVG path is documented; (5) typecheck exits 0.

---

## Round 8 — Map legend & layer integration — [W1 serial for 8.1; 8.2 safe to run in W2 while 8.1 is in W1]

### Prompt 8.1 — Legend builder  [W1]
In `src/rendering/buildLegend.ts` given an array of active layer ids, produce an ordered legend entries list `{iconId, label, severityLadder?:boolean, ageLadder?:boolean}`. One function.

### Prompt 8.2 — Layer-to-icon binding  [W2]
Create `src/categories/layerBindings.ts` mapping each map layer id (use existing beacon_map_layers.docx names) to the icon categories it displays. Validate at startup that every binding resolves.

### Prompt 8.CHECK  [W1]
> Verify Round 8. Report PASS/FAIL: (1) buildLegend handles 0, 1, and many active layers; (2) every binding in layerBindings resolves to a known category; (3) typecheck exits 0.

---

## Round 9 — QA, accessibility, contrast — [parallel across 3 windows]

### Prompt 9.1 — Contrast check  [W2]
In `src/validation/checkContrast.ts` verify every icon against light basemap and dark basemap backgrounds. Fail icons below WCAG AA for non-text graphics (3:1). Output a report `state/contrast-report.json`.

### Prompt 9.2 — Colorblind simulation  [W3]
In `src/validation/simulateColorblind.ts` render each icon under deuteranopia, protanopia, tritanopia filters and flag pairs that become confusable. Output `state/colorblind-report.json`.

### Prompt 9.3 — Semantic distinctness  [W4]
In `src/validation/semanticDistinctness.ts`, for each category, require a minimum shape-diversity score so that silhouette alone (no color) remains readable. Flag failures.

### Prompt 9.CHECK  [W1, after W2/W3/W4 finish]
> Verify Round 9. Report PASS/FAIL: (1) all three validator files exist; (2) each produces a JSON report in `state/`; (3) typecheck exits 0.

---

## Round 10 — Hazard-specific overlays — [W1 serial]

### Prompt 10.1 — Hazard tagging  [W1]
Add `hazards: HazardId[]` to IconDefinition. Populate based on existing beacon_per_hazard_layers.docx. An icon can apply to multiple hazards.

### Prompt 10.2 — Hazard filter  [W1]
Add `getIconsForHazard(hazardId)` to the registry. Icon Manager UI gets a hazard selector that filters the preview matrix.

### Prompt 10.CHECK  [W1]
> Verify Round 10. Report PASS/FAIL: (1) every IconDefinition has a `hazards` array (empty allowed); (2) `getIconsForHazard('hurricane')` returns non-empty; (3) hazard selector visible in UI; (4) typecheck exits 0.

---

## Round 11 — Lock-in — [W1 serial]

### Prompt 11.1 — Snapshot  [W1]
Create `state/approved-icon-set-v1.json` containing every approved icon id, category, severity strategy, age policy, hazards, and SVG sha256. This is the frozen canonical set.

### Prompt 11.2 — Drift detector  [W1]
Add `scripts/detect-icon-drift.ts` that diffs current registry against the snapshot and fails CI if an approved icon was changed without a version bump.

### Prompt 11.CHECK  [W1]
> Verify Round 11. Report PASS/FAIL: (1) snapshot JSON has an entry for every registered icon; (2) every SVG hash matches the file; (3) drift detector exits 0 on a clean tree; (4) drift detector exits non-zero if an SVG is modified.

---

## Usage notes

Run one prompt at a time. After each, have Claude Code print only the list of files created/changed — nothing else. If a prompt produces more than ~250 lines across files, stop and split it before accepting. When a round finishes, open the Icon Manager UI and visually approve before moving on.
