# Beacon build plan

Branch: `beacon-client-v1`. Revert = `git checkout main`.
Style guide: `apps/design_system/tokens.ts`.
Reference for look: current live test account at `apps/beacon-dev/src/app/admin/dashboard/live-map` + `apps/beacon-dev/src/components/map/*`.

## Rules

- Smallest functional piece first. Ship it, verify it, then move on.
- One descriptive file per function. Short files. No icons in console output.
- Every checkpoint is its own commit so any one can be reverted.
- Bottom-up: data and logic before UI chrome. No placeholders left unverified.

## Current state (done — don't redo)

- `beacon-client-v1` branch exists, off `main`.
- Monorepo skeleton at repo root: root `package.json` with npm workspaces on `apps/*` + `packages/*`.
- Stub packages with `package.json` + `src/index.ts` + `README.md`:
  - `@beacon/event-engine`
  - `@beacon/data-sources`
  - `@beacon/base-map`
  - `@beacon/ui-primitives`
  - (`@beacon/design-system` already lives at `apps/design_system`)
- `apps/beacon-client` Next.js app scaffolded on port 3100 with a 4-tab shell (Map / Feed / Help / Community), Start Button, Notifications Bell.

### Commits on `beacon-client-v1`

- `C0` — `023cc0e` — monorepo scaffold baseline (pushed to origin).
- `C1` — `6c76edf` — public feed ingestions on thin map (local only — push manually).
- `C1.2` — (local) — overlay live feeds on beacon-dev LiveWorldMap, revert beacon-client map placeholder.
- `C1.3` — (local) — volcano layer playground inside beacon-dev at viz/hazards/volcanoes.
- `C1.4` — (local) — volcano detail side panel: overview, live USGS quakes, webcam link, deformation + threat.
- `C1.5` — (local) — volcano eruption history (VEI list, avg interval, time since last), plain-English eruption style + danger, "what's normal" baseline context for quakes and deformation.
- `C1.6` — (local) — multi-mode eruption styles (e.g. Yellowstone supervolcano vs. hydrothermal), "Recent eruptions" legend row + fly-out panel (last 12 months or ongoing), click a row → map flies to volcano + opens detail panel.

### Sandbox gotchas picked up this pass

- `.git/index.lock` comes back after every git write because the sandbox cannot unlink it. Cowork worked around this for C1 by using `GIT_INDEX_FILE=/tmp/beacon-index` for every write and copying the result back onto `.git/index` at the end. If you run a local git command and get "index.lock already exists", `rm -f .git/index.lock` clears it — same fix as the C0 pass.
- Workspace `node_modules` are not installed inside the sandbox (npm registry is 403-blocked). Typechecks ran by pointing `apps/beacon-client/node_modules` at `worldview_oss/node_modules` via a symlink (covered by `.gitignore`). Run `npm install` at repo root on your machine before the first `next dev`.

## Build order (Kristin's plan — pick up here)

### Client-side app

**C1 — Public data feed ingestions on a thin map — DONE (`6c76edf`)**
- `@beacon/data-sources` now ships 7 feeds across all 5 categories, one file each:
  - natural: `usgs-earthquakes` (M2.5+ past day), `nws-alerts`, `nifc-fires` (WFIGS points)
  - human: `gdelt-events` (GDELT geo GeoJSON, protest/attack/shooting query)
  - volcano: `usgs-volcanoes` (HANS elevated list)
  - cameras: `caltrans-d4-cams` (Bay Area CCTV)
  - travel: `opensky-flights` (sampled 300 live aircraft states)
- Every feed conforms to the `Feed` contract (`{ id, name, category, pollIntervalMs, fetch() }`) and returns `FeedEvent[]` with normalized `lat`, `lng`, `severity`, `timestamp`. Errors are caught per-feed so one bad source can't poison the whole view.
- `@beacon/event-engine/store/event-cache.ts` — process-level in-memory cache keyed by feed id, with `lastFetchedAt` and `lastError` per entry.
- `@beacon/event-engine/poll/` — `poll-one`, `poll-all`, `poll-stale`, `should-repoll`. `/api/events` in `beacon-client` calls `pollStale` so repeated client polls don't hammer upstreams.
- `beacon-client` map tab now renders `ThinMap` — no base tiles, plain equirectangular SVG grid with pins sized and colored by severity/category. A footer legend strip shows every registered feed id, its live pin count, and an `err` chip if its last fetch failed. Client refreshes on a 30s interval.
- Checkpoint verify (must run on your machine, sandbox has no network): `npm install && npm run dev:client`, open http://localhost:3100, Map tab. Expect pins for every green feed chip. Any red `err` chip means the upstream rejected or timed out — the feed file and the error are printed in the `/api/events` response for debugging.
- Known gaps to revisit: (a) NWS alerts currently skip zone-only alerts that have no geometry — the previous beacon-dev map resolved zone geometry on demand; that work lives in `apps/beacon-dev/src/lib/nws-alerts.ts` if we want to port it. (b) GDELT's tone-based severity is a rough proxy; revisit once we have a real event taxonomy. (c) The "cameras" slot only has Caltrans D4 as a starter — volcano/fire cams are a backlog item.

**C1.2 — Overlay live feeds on the real LiveWorldMap (beacon-dev) — DONE (local)**
- Kristin flagged that the C1 ThinMap in `beacon-client` was not the map she wanted. The "original Beacon app" is `apps/beacon-dev`, which already has the full `LiveWorldMap` (Cesium photo + clay + MapLibre lowdata), fire layer, NWS alert layer, view switcher, layers panel. The `beacon-client` map tab has been reverted to its pre-C1 placeholder — scaffold still exists, just out of the way.
- Plumbing reused from C1: `@beacon/data-sources`, `@beacon/event-engine`, the polling + cache + `pollStale` flow. No package changes.
- beacon-dev changes:
  - `package.json`: added `@beacon/data-sources: "*"` and `@beacon/event-engine: "*"` as workspace deps. `next.config.ts`: added both to `transpilePackages`.
  - `src/app/api/events/route.ts`: new, mirrors the beacon-client route — `pollStale()` then `{ at, poll, feeds, events }`.
  - `src/hooks/use-feed-events.ts`: polls `/api/events` on an interval, mirrors the `useActiveFires` pattern.
  - `src/components/map/feed-events-layer.tsx`: Cesium `CustomDataSource` with one `.entities.add({ point })` per event, colored by category+severity via `pin-color-for.ts`, sized by severity via `pin-size-for.ts`. Mirrors the fire-layer point-rendering pattern (camera snapshot + restore, `HeightReference.CLAMP_TO_GROUND`, per-feed gating). Only renders on Cesium views (`photo` + `clay`) — matches fire-layer / nws-alert-layer which both skip `lowdata`.
  - `src/components/map/live-world-map.tsx`: imports the new hook + layer + `ALL_FEEDS`, owns `liveFeedsEnabled` (master) and `feedsEnabled: Record<string, boolean>` (per-feed, all ON by default), renders `<FeedEventsLayer>` alongside the existing layers, and passes an `extraCategory` prop to `MapLayersPanel`.
  - `src/components/map/map-layers-panel.tsx`: new optional `extraCategory` prop. When provided, the panel renders that category at the top, expanded by default, using the same checkbox styling as the existing static categories but sourced from props instead of the internal local state. No static categories were removed or renamed — all existing toggles still work the same way they did before.
- Sidebar toggle UX: inside the existing layers panel (top-right gear), there's a new "LIVE FEEDS" section at the top with a master toggle ("Master: Live Feeds") plus one checkbox per feed id (usgs-earthquakes, nws-alerts, nifc-fires, gdelt-events, usgs-volcanoes, caltrans-d4-cams, opensky-flights). Toggling master flips the whole layer on/off; toggling a feed id removes just that feed's pins.
- Caveats: (1) Feed pins render on Cesium views only. The `lowdata` (MapLibre 2D) view does not get them because the existing fire-layer and nws-alert-layer also skip it and the directive was to mirror those patterns. Adding MapLibre markers would require refactoring `maplibre-2d.tsx` to expose its map instance and is a future lift. (2) Sandbox typecheck for `beacon-dev` still shows 12 pre-existing errors in files I did not touch (`base-views/*.tsx`, `maplibre-2d.tsx`, `cesium-init.ts`, `pmtiles-setup.ts`) — all CSS-import / pmtiles-module / Cesium window-cast issues from before C1.2. My new/modified files are clean.
- Verify on your machine: `rm apps/beacon-client/node_modules` (removes the stale worldview_oss symlink the sandbox couldn't delete), then `rm -rf node_modules apps/*/node_modules packages/*/node_modules && npm install && npm run dev:dev`. Open http://localhost:3000 (or whatever beacon-dev binds to), land on the Map tab, click the layers button (top right), expand LIVE FEEDS, and you should see pins colored by category (red natural, orange human, dark-red volcano, purple cameras, blue travel) sized by severity. Toggle feeds on/off to confirm the cache-backed polling works.

**C1.3 — Volcano layer playground inside beacon-dev — DONE (local)**
- Kristin wanted a design playground for each hazard layer (mess with legends, icons, display components) living inside the beacon-dev admin interface. First layer: volcanoes.
- New sidebar entry: Visualization Manager → Hazards → Volcanoes (first item in the Hazards vizGroup, before Risk Layers). Uses the existing `Flame` lucide icon already imported in `apps/beacon-dev/src/app/admin/dashboard/layout.tsx`, so no new imports needed. Path: `/admin/dashboard/viz/hazards/volcanoes`.
- Added the volcanoes path to the layout's no-padding list (same list that already covers live-map and base-map/views) so the playground can fill the full content area.
- New directory: `apps/beacon-dev/src/app/admin/dashboard/viz/hazards/volcanoes/`, one short descriptive file per function (per Kristin's "short files, descriptive names" preference):
  - `types.ts` — `AlertLevel`, `Volcano`, `LevelMeta` types.
  - `volcano-data.ts` — 30 real US volcanoes matching USGS HANS shape (2 warning Hawaiian, 4 watch Aleutian, 7 advisory Cascades/Yellowstone/Long Valley, 17 normal).
  - `volcano-levels.ts` — `LEVELS` metadata (label + blurb) driving legend rows.
  - `make-pin-icon.ts` — Leaflet `divIcon` factory, typed against a minimal Leaflet surface so we don't pull `@types/leaflet` into the workspace.
  - `make-popup-html.ts` — popup card HTML string template.
  - `use-leaflet-cdn.ts` — client hook that injects the Leaflet 1.9.4 `<script>` + `<link>` from unpkg on first mount, resolves to the global `L` once loaded. Avoids bundling Leaflet as an npm dep.
  - `volcano-playground.tsx` — main `'use client'` component. Uses the CDN hook, initializes the Leaflet map in a ref, renders Esri World Imagery + CartoCDN dark_nolabels overlay, builds per-level `layerGroup`s, adds pins, tears down on unmount. Legend rows are React state-driven (`offLevels: Set<AlertLevel>`), toggling updates map visibility via a second effect.
  - `playground.css` — every one of the 7 TWEAK ZONES from the original standalone HTML, scoped under `.vp-root` so it can't leak into the rest of beacon-dev. Alert colors live in CSS variables (`--alert-warning`, `--alert-watch`, `--alert-advisory`, `--alert-normal`, `--alert-unknown`) so recoloring the whole layer is a one-line edit.
  - `page.tsx` — thin server wrapper that renders `<VolcanoPlayground />`.
- Also kept around: the standalone single-file HTML at `layer-playgrounds/volcano.html` from the earlier iteration. Useful as a reference for quick color/size tweaks without having to boot the Next dev server.
- Verify on your machine: `npm run dev:dev`, open http://localhost:3000, log in, expand Visualization Manager → Hazards → Volcanoes in the left nav. Satellite basemap + dimming overlay + 30 pins. Click a level in the legend to toggle. Click a pin for a popup card. Alert colors: red=warning, orange=watch, yellow=advisory, green=normal. Watch/warning pins pulse.
- Sandbox typecheck (`apps/beacon-dev/tsconfig.check.json`) is clean for every file I created — 0 new errors, same 28 pre-existing errors in prisma-typed / cesium-init / maplibre CSS files that were there before I started.
- Next layer ideas (same pattern per hazard): earthquakes, fires, severe weather, NWS alerts, flights/cameras.

**C1.4 — Volcano detail side panel — DONE (local)**
- Kristin asked: are the volcano icons wired to cameras? She wants to click a volcano and see recent quakes, ground uplift, and an overview.
- Answer re cameras: USGS observatories publish public webcams for most of these volcanoes (HVO/AVO/CVO/CalVO/YVO). We don't embed them directly — we link out to each observatory's webcam landing page. Live embeds would require per-cam URLs and probably iframe workarounds.
- Chosen layout: right-side slide-out panel over the map (380px wide, translateX animation). Map stays visible on the left. Close button in the header.
- Chosen data mode: live USGS earthquake API via a new server proxy at `apps/beacon-dev/src/app/api/volcano-quakes/route.ts`. Accepts `?lat&lng&radiusKm&days&minMag`, calls `https://earthquake.usgs.gov/fdsnws/event/1/query` with GeoJSON, normalises to `{id, mag, place, time, depthKm, lat, lng, url}`. Default: 20 km radius, 30 days.
- Panel sections (one file each under `detail-sections/`):
  - `overview-section.tsx` — paragraph blurb + 2-column stat grid (alert level chip, region, observatory, elevation, last eruption, lat/lng)
  - `quakes-section.tsx` — list of up to 20 recent quakes with a colored magnitude chip (green <2, yellow 2–4, red >4), place, depth, relative time ("3h ago"). Loading + error states.
  - `webcam-section.tsx` — card with a placeholder CAM icon + observatory name + "Open live cameras →" link to the USGS page.
  - `deformation-section.tsx` — USGS NVTA threat chip (Very High / High / Moderate / Low) + a short deformation note + hazard zone note + link to observatory deformation page.
- Per-volcano reference data in `volcano-details.ts`: 30 entries keyed by volcano id, each with overview blurb, threat rank (from USGS 2018 NVTA open-file report), webcam URL, webcam label, deformation URL, deformation note, hazard zone note. Plus a `DEFAULT_VOLCANO_DETAIL` fallback.
- Data fetching hook in `use-volcano-quakes.ts`: takes `(lat, lng, {radiusKm, days})`, fetches `/api/volcano-quakes`, returns `{quakes, loading, error, fetchedAt}`. AbortController for cleanup.
- `volcano-playground.tsx` changes: added `selected: Volcano | null` state, replaced `bindPopup` with `m.on("click", () => setSelected(v))`, mounted `<VolcanoDetailPanel>` at the bottom of `.vp-root`. `make-popup-html.ts` is now dead code — sandbox can't delete, will clean up later.
- CSS: new TWEAK ZONE 8 appended to `playground.css` with panel chrome, section headers, stat grid, quake list + magnitude chips, webcam placeholder, threat chip colors. Threat chips reuse the existing `--alert-*` CSS variables from Zone 2, so recoloring the alert scale also restyles the threat ranks.
- NVTA threat ranks are based on USGS open-file report 2018-1115. I used my best recollection — treat them as "approximately correct"; cross-check against the USGS source before publishing externally.
- Verify: pin click → panel slides in → quakes fetch from USGS → click a quake to open the USGS event page → close panel and pick another volcano. If you see "Error: HTTP 502" in the quakes section, the USGS API is unreachable from your network.
- Sandbox typecheck is clean: 0 new errors, same 28 pre-existing baseline errors.

**C1.5 — Eruption history + plain-English context — DONE (local)**
- Kristin's feedback on C1.4: (1) show past eruptions with VEI levels, (2) show average time between eruptions, (3) show how long it's been since the last eruption, (4) raw quake counts and uplift numbers are meaningless without knowing what's normal, (5) saying "Pavlof is a Strombolian volcano" is jargon — it's unclear whether that means slow Hawaiian lava flows or violent dangerous eruptions.
- New data file `volcano-history.ts`: 30 entries keyed by volcano id. Each entry has `eruptions: EruptionRecord[]` (year, display string like "2024" or "~1,000 years ago", VEI 0–8 or null, optional notes), `returnIntervalYears` + `returnIntervalNote`, `style` enum (`effusive | mixed | strombolian | explosive | dome | phreatic`), `styleDescription` in plain English, `danger` rank (`low | moderate | high | extreme`), `dangerExplanation`, `quakeBaseline` (what's normal), `deformationBaseline` (what's normal). Eruption data curated from Smithsonian Global Volcanism Program and USGS — cross-check before external publishing.
- Helpers in the same file: `yearsSinceLast(h, now)`, `formatYearsSince(years)`, `formatReturnInterval(years)` — handles small/large numbers and unknowns gracefully.
- New section `detail-sections/eruption-style-section.tsx`: style tag + colored danger chip + plain-English `styleDescription` + `dangerExplanation`. For Pavlof this reads: "Violent and unpredictable. Pavlof produces tall ash columns (often 8–15 km), fire fountains, hot rock avalanches, and occasional fast lava flows. This is NOT Hawaiian-style: eruptions start suddenly, often with little warning, and are dangerous to aircraft and nearby communities." Direct answer to Kristin's jargon complaint.
- New section `detail-sections/eruption-history-section.tsx`: two-cell tempo row (years since last / average interval), short return-interval note, full eruption list with VEI chips colored by level (vei-0 green through vei-5 purple), eruption category label, plus a footer legend explaining VEI.
- Modified `quakes-section.tsx` + `deformation-section.tsx`: each now accepts an optional `baseline` prop. Renders a "What's normal" callout above the live data. Kilauea reads "20–50 small M<2 quakes per day"; Yellowstone reads "1,000–3,000 quakes PER YEAR; swarms of hundreds in a week are normal" — directly addresses the "raw numbers are meaningless" feedback.
- `volcano-detail-panel.tsx` reordered: Overview → Eruption style (what to expect) → Eruption history (when, how often) → Recent quakes (with baseline) → Deformation + threat (with baseline) → Webcam. Baselines are passed in from `VOLCANO_HISTORY[volcano.id]` and gracefully fall through to undefined for unknown volcanoes.
- `playground.css` TWEAK ZONE 9 appended: style card, danger chips (danger-low/moderate/high/extreme reusing the --alert-* variables from Zone 2), tempo row, VEI chips with their own color scale, eruption list rows, VEI legend, and a blue-tinted baseline callout box.
- Sandbox typecheck: 0 new errors, same 28 pre-existing baseline errors. All new/modified files clean.
- Verify: click a volcano pin. Panel now opens with "What to expect when it erupts" near the top. Scroll to "Eruption history" for the VEI list + tempo. Scroll to "Recent earthquakes" — the "What's normal" line sets context before the live feed.

**C1.6 — Multi-mode eruptions + recent-eruptions fly-out — DONE (local)**
- Kristin flagged two things: (1) volcanoes that do more than one kind of eruption (supervolcano with tiny hydrothermal blasts AND rare civilization-scale collapse) should make that clear, and (2) the legend should have a "recent / ongoing eruptions" entry that opens a side list you can scroll and click to zoom to each volcano.
- C1.6 delivers the multi-style display + the recent-eruptions fly-out. C1.7 (next) will layer on clickable affected-regions with population, tourist counts, and hazard zone polygons for all 30 volcanoes.
- `volcano-history.ts` type additions (non-breaking): new `StyleFrequency = "usually" | "sometimes" | "rarely" | "historical"`, new `AltStyle = { kind, frequency, danger, description }`, optional `altStyles?: AltStyle[]` on `VolcanoHistory`. Also added three new `EruptionStyle` values: `"hydrothermal"`, `"caldera"`, `"lahar"` — lets us name modes that aren't eruptions in the usual sense.
- Six volcanoes now carry altStyles (hand-picked for where the multi-mode framing is the clearest):
  - **Kilauea** primary effusive + rare phreatic (1924 killed one at the crater rim).
  - **Yellowstone** primary explosive + usually hydrothermal (frequent small steam blasts) + historical VEI 8 caldera collapse.
  - **Long Valley** primary explosive + historical VEI 7 Bishop Tuff + usually Mammoth Mountain CO₂ gas.
  - **Mount Rainier** primary dome + sometimes lahar-without-eruption (35+ glaciers on weakened rock).
  - **Mount St. Helens** primary dome + rarely VEI 5 Plinian (1980 mode).
- `detail-sections/eruption-style-section.tsx` now stacks a primary style card plus one card per altStyle, each with a frequency heading chip ("Usually", "Sometimes", "Rarely", "Historical only"). Section header shows the mode count when there are alts.
- New file `get-recent-eruptions.ts`: `getRecentlyErupting(now?, windowYears = 1)` joins `VOLCANOES` with `VOLCANO_HISTORY` and returns entries where the most recent EruptionRecord is within 12 months, or the display label contains "present" (our convention for ongoing — e.g. `"2021–present"` on Great Sitkin), or the volcano's alert level is `"warning"`. Sorted ongoing-first, then by most recent year.
- New file `recent-eruptions-flyout.tsx`: scrollable list anchored just right of the legend (280px wide, slides in from the left edge, close X in the header). Each row shows a color-coded alert-level dot, volcano name, region, and an "Ongoing" badge or the eruption display string.
- `volcano-playground.tsx` changes:
  - New legend row below the four alert levels, separated by a divider. Styled with a diagonal gradient swatch (warning + watch) and a pulse halo. Shows the current count of recent volcanoes. Click to toggle the fly-out.
  - Extended the local `LMap` type with `flyTo(ll, z, opts?)`.
  - New `flyToVolcano(v)` handler: `map.flyTo([v.lat, v.lng], 8, { duration: 1.2 })` + `setSelected(v)`. Wired to the fly-out `onSelect`.
- `playground.css` TWEAK ZONE 10 appended: style-card frequency chip, stack spacing, legend divider + recent row with diagonal swatch, fly-out panel chrome (slide + fade transition), fly-out rows with alert-level dots.
- Sandbox typecheck: 0 new errors, 28 pre-existing baseline errors unchanged. All new/modified files clean.
- Verify: click a volcano pin for Yellowstone → detail panel shows 3 mode cards (explosive / usually hydrothermal / historical caldera). Click the "Recent eruptions" legend row → fly-out slides in from the left edge. Click a row → map flies to the volcano and the right-side detail panel opens for it.

**C1.7 — Clickable affected regions with hazard zones + population — TODO**
- Kristin also asked for: "any data on the affected regions of the last eruptions clickable/explorable in the eruption history. of the eruption hot spots, how many people will be affected by the potential different components of that volcanic eruption. please point out the local population, any mappings of hazard zones, tourist counts".
- Scope (per user decision): full GeoJSON hazard zones for all 30 volcanoes. Populations from USGS hazard assessments, tourist counts from NPS annual visitation. This will be split out as its own checkpoint since the data sourcing alone is substantial.

**C2 — User creation + contact management**
- Signup, login, profile.
- Contacts list, add/remove, request/accept.
- Lives in Community tab + Start Button cockpit.

**C3 — Group management**
- Groups inside user management.
- Create group, invite, roles, leave.
- Group types (family / friends / work / neighborhood / custom).

**C4 — People helping people**
- Requests, resource offers, task queue.
- Lives in Help tab.

**C5 — User reports**
- Sighting report form, verification status, attach photo.
- Feeds into the event store like public feeds do.

### Dev-side + deeper systems

**C6 — Base map builder**
- Real base map: 2D / Satellite / 3D Clay / 3D Google Tiles, layers manager.
- Replaces the thin map from C1.
- Lives in `@beacon/base-map` + Beacon Dev "Base Map Management" tab.

**C7 — Hazard risk models**
- Pre-event probability: risk of something happening that hasn't started.
- Static + dynamic risk layers.

**C8 — Hazard trigger conditions**
- Thresholds and rules that flip a risk into an active event.

**C9 — Hazard model trainer (Beacon Dev)**
- Dev-side surface for training and iterating on surrogate models.
- Dataset browser, training run manager, surrogate evaluator.

**C10 — Event manager**
- Joins related raw events into one cohesive larger event/topic.
- Campi Flegrei as canonical test case (quakes + uplift + gas + alert level → one topic).

**C11 — Personalized hazard alert logic**
- Per-user rules: scope, risk tolerance, mute list, quiet hours, budget.
- Produces the decision "alert this user / don't."

**C12 — Notification manager**
- Unified surface that mixes: user reports, official alerts, Beacon custom alerts, contact + group status updates, requests that require a response.
- Two related-but-distinct siblings:
  - **Event Status Overview manager** — per-event live state for everyone watching it.
  - **Person Location Status manager** — per-person live state for people watching them.

**C13 — Auto sensor manager**
- Ingests from device sensors (phone, wearable, home sensors).
- Feeds the hazard monitors, event manager, and alerts pipeline the same way public feeds and user reports do.

**C14 — Location sharing manager**
- Who sees whose location, when, at what resolution.
- Per-contact + per-group rules, timed shares, emergency override.

**C15 — User settings manager**
- One place for every preference.

**C16 — Legal releases manager**
- TOS, privacy, per-feature consents (location, sensors, notifications, data sharing), revision history, re-consent flow.

## Next action when context is cleared

1. Read this file.
2. Verify C1 locally: `rm -f .git/index.lock`, `npm install`, `npm run dev:client`, open http://localhost:3100 → Map tab, confirm pins render and the feed-status chips are green (one chip per feed id). Push the branch: `git push origin beacon-client-v1`.
3. Start C2 — user creation + contact management. Architectural decisions still owed (they were the reason Cowork stopped here):
   - Auth: NextAuth with email+password, or magic-link, or defer to a managed provider (Clerk / WorkOS)?
   - User store: Postgres via Prisma, SQLite for dev, or local JSON file until C2 is usable end-to-end?
   - Where does session state live (cookie + DB, JWT, etc)?
   Pick one option, write it in this section, then start building. `@beacon/ui-primitives` is the natural home for shared form/input components once C2 lands.
4. Design reference: `apps/design_system/tokens.ts`.
5. Live-map look reference: `apps/beacon-dev/src/components/map/live-world-map.tsx` + `apps/beacon-dev/src/app/admin/dashboard/live-map/page.tsx`.
