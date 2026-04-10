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
